import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './env.js';
import { GENERIC } from './words.js';
import { families as familiesOf, domains as domainsOf, conflicts } from './fit.js';

const ALL = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'resources.json'), 'utf8')).resources;

/* The catalog writes the same topic two ways — "agent studio" and "agent_studio",
 * "compliance & risk" and "compliance_risk" — so everything is flattened to words before
 * it is compared. */
/* Generic words are stripped before anything is compared: every resource we have is
 * about agents automating a workflow for an enterprise customer, so those words match
 * everything and therefore place nothing. */
const words = (s) => String(s).toLowerCase().split(/[^a-z0-9]+/)
  .filter((w) => w.length > 2 && !GENERIC.has(w));
const bag = (xs) => new Set((xs ?? []).flatMap(words));
const overlap = (a, b) => [...a].filter((w) => b.has(w)).length;

/* What a partner can hand to a client alongside the case study. Case studies are proof;
 * guides, playbooks and product pages are what a buyer reads next — so after the first
 * pick we stop choosing more case studies and go looking for the other kinds. */
const KIND = { guide: 'Guide', playbook: 'Playbook', product_page: 'Product', solution_page: 'Solution', report: 'Report', case_study: 'Case study', tool: 'Tool', story: 'Story' };
const USEFUL = new Set(Object.keys(KIND));

/* A product page or a tool describes the platform, so the product name alone is enough to
 * place it. Everything that claims to be about the *work* has to match the work: one
 * shared word between "HR" and "manufacturing automation" is a coincidence, and a
 * coincidence is what put a CHRO guide under a factory workflow play. Nothing about the
 * work gets in on the product name alone. */
const ON_PRODUCT = new Set(['product_page', 'tool']);
const TELLS_A_STORY = new Set(['case_study', 'story']);

/* The library is tagged by department, in the same vocabulary a card names its buyer in,
 * and that is a far better signal than word overlap with a headline: "it operations" is
 * one tag, not two coincidental words. Where a card's department is not a tag, this says
 * which tags cover it. */
const FUNCTION_TOPICS = {
  'it operations': ['it operations', 'operations'],
  operations: ['operations'],
  'field service': ['operations', 'it operations'],
  'service desk': ['it operations', 'customer service'],
  procurement: ['procurement', 'supply chain'],
  'supply chain': ['procurement', 'operations'],
  security: ['compliance & risk', 'it operations'],
  compliance: ['compliance & risk', 'compliance_and_governance'],
  legal: ['compliance & risk'],
  risk: ['compliance & risk'],
  'customer service': ['customer service'],
  support: ['customer service'],
  finance: ['finance'],
  accounting: ['finance'],
  hr: ['human resources', 'human_resources'],
  'human resources': ['human resources', 'human_resources'],
  people: ['human resources'],
  sales: ['revenue & sales', 'revenue'],
  'revenue operations': ['revenue & sales', 'revenue'],
  marketing: ['marketing'],
  engineering: ['engineering'],
  'software delivery': ['engineering'],
  product: ['product', 'engineering'],
  'data': ['research & strategy'],
};
const tagsFor = (fn) => new Set(FUNCTION_TOPICS[String(fn ?? '').toLowerCase().trim()] ?? []);
const norm = (t) => String(t).toLowerCase().replace(/[_&]/g, ' ').replace(/\s+/g, ' ').trim();

/* The department it is filed under, or two words of real overlap with the work. With the
 * generic vocabulary stripped out, a single shared word is usually a coincidence of
 * phrasing, and a coincidence is what put a mentorship case study under a field service
 * card. A product page is placed by the product name as well, since that is what it is
 * about. */
const qualifies = (type, onWork, onProduct, onFunction) =>
  (ON_PRODUCT.has(type) ? onWork * 2 + onProduct + onFunction >= 2 : onFunction >= 1 || onWork >= 2);

/* `topics` is the work this play is about, `industries` is where the partner sells. A
 * resource that matches the work travels; one that only matches the industry is a page
 * about the right sector and the wrong problem, so it ranks below and never alone. */
export function relatedTo({ topics = [], products = [], industries = [], functions = [], families = [], domains = [], exclude = [] } = {}, n = 3) {
  const wantFamilies = new Set(families);
  const wantDomains = new Set(domains);
  const work = bag(topics);
  const tags = new Set([...functions].flatMap((f) => [...tagsFor(f)]).map(norm));
  const sector = bag(industries);
  const product = bag(products);
  if (!work.size && !product.size && !tags.size) return [];
  const skip = new Set(exclude);

  const scored = ALL
    .filter((r) => USEFUL.has(r.type) && r.url && !skip.has(r.id))
    .map((r) => {
      const t = bag(r.topics);
      const onWork = overlap(t, work);
      const onProduct = overlap(t, product);
      const onSector = overlap(t, sector);
      const onFunction = (r.topics ?? []).filter((x) => tags.has(norm(x))).length;
      /* Clearing the floor on sector alone is how an unrelated page gets in on the word
       * "healthcare", and clearing it on the product name alone is how a media case study
       * gets in on the word "studio". */
      if (!qualifies(r.type, onWork, onProduct, onFunction)) return null;
      /* The department tag got it this far. These two decide whether it is about the same
       * kind of work, in a business the partner's clients are in. A telecom order
       * automation story reached an Infor regression card on a department tag alone. */
      const text = `${r.title} ${r.blurb ?? r.teaser ?? ''} ${(r.topics ?? []).join(' ')}`;
      if (conflicts(wantDomains, domainsOf(text))) return null;
      const fam = familiesOf(text);
      const onFamily = [...fam].some((f) => wantFamilies.has(f));
      /* A product or platform page describes a capability rather than a piece of work, so
       * it is placed by the product name and is not asked to name a process. */
      if (wantFamilies.size && fam.size && !ON_PRODUCT.has(r.type) && !onFamily) return null;
      /* A case study or a story says "we have done this". That is a claim about the work,
       * so it has to be about this work: it needs a positive match, not merely the absence
       * of a conflict. Otherwise anything vague enough to classify as nothing travels
       * everywhere, which is how a page about an investment round was being sent with
       * three unrelated plays. */
      if (TELLS_A_STORY.has(r.type) && wantFamilies.size && !onFamily) return null;
      /* Same work first, then the same work in their sector too, then the platform page.
       * Priority only breaks ties, and a case study is nudged down because the play
       * already carries one. */
      const score = onWork * 10 + onFunction * 7 + onSector * 4 + onProduct * 2
        + (r.priority ?? 0) - (r.type === 'case_study' ? 4 : 0);
      return { r, score, onWork, onSector, onFunction };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const out = [];
  const seenType = new Set();
  const take = (r) => {
    out.push({ id: r.id, kind: KIND[r.type] ?? 'Resource', title: r.title, blurb: r.blurb ?? r.teaser ?? '', url: r.url });
    seenType.add(r.type);
  };
  for (const { r } of scored) {
    /* One of each kind before a second of any kind: three case studies in a row is a
     * reading list, not a sales kit. */
    if (seenType.has(r.type)) continue;
    take(r);
    if (out.length >= n) break;
  }
  /* Short on variety, go back for a second of a kind already used, but only as far as two
   * links. Padding the third slot with another page of the same kind is what makes a kit
   * look assembled rather than chosen, and two good links beat three. */
  for (const { r } of scored) {
    if (out.length >= Math.min(2, n)) break;
    if (out.some((x) => x.id === r.id)) continue;
    take(r);
  }
  return out;
}
