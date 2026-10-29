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

/* Three jobs a resource can do for a partner, because a reader wants different things at
 * different moments: something to look at, something to build from, and something to put
 * in front of a client. A kit that mixes them reads as a reading list. */
/* The library is tagged in a taxonomy of its own, and that taxonomy says what a resource
 * is about far more reliably than its title does: "Account Research Agent Built for a
 * Global BPM Company" reads as nothing in particular, and its topics say revenue & sales.
 * Without this map a hundred and one of the hundred and seventy four resources classified
 * as no kind of work at all, and since a case study has to match positively, none of them
 * could ever be sent with anything. */
const TOPIC_FAMILY = {
  'responsible ai': 'governance', responsible_ai: 'governance',
  'compliance & risk': 'governance', compliance_and_governance: 'governance',
  'compliance & governance': 'governance', compliance: 'governance', security: 'governance',
  trust: 'governance', legal: 'governance', opencontroller: 'governance',
  'hallucination manager': 'governance', hallucination_manager: 'governance',
  madison: 'governance', madison_grc: 'governance',
  'customer service': 'support', customer_service: 'support',
  'human resources': 'people', human_resources: 'people',
  procurement: 'ordering',
  'revenue & sales': 'outreach', revenue: 'outreach', revenue_and_sales: 'outreach',
  jazon: 'outreach', marketing: 'outreach', skott: 'outreach', dwight: 'outreach',
  kathy: 'analytics', 'research & strategy': 'analytics', finance: 'analytics',
  'it operations': 'incident', it_operations: 'incident',
  'it & platform': 'incident', it_and_platform: 'incident',
  engineering: 'engineering', gitagent: 'engineering',
  'knowledge base': 'documents', knowledge_base: 'documents',
  'knowledge graph': 'documents', knowledge_graph: 'documents',
  'ai agent memory': 'documents', ai_agent_memory: 'documents',
  workflow_automation: 'integration', ai_and_automation: 'integration',
  'ai & automation': 'integration', 'agentic os': 'integration', agentic_os: 'integration',
  'orchestration as a service': 'integration', orchestration_as_a_service: 'integration',
  'agents as a service': 'integration', agents_as_a_service: 'integration',
  'sovereign ai': 'infrastructure', sovereign_ai: 'infrastructure',
  'lyzr optimus': 'infrastructure', lyzr_optimus: 'infrastructure',
  'agent blocks': 'embedding', agent_blocks: 'embedding',
};

/* Everything a resource is about: what its words say, plus what its tags say. */
export function familiesIn(r) {
  const out = familiesOf(`${r.title} ${r.blurb ?? r.teaser ?? ''}`);
  for (const t of r.topics ?? []) {
    const f = TOPIC_FAMILY[String(t).toLowerCase().trim()];
    if (f) out.add(f);
  }
  return out;
}

/* Pages about the platform in general. A partner evaluating Lyzr wants them; the client
 * they are about to forward something to does not. They were being chosen, filling a
 * shelf, and then dropped by the verifier, so the slot went to nothing at all. */
const PLATFORM_PAGE = /\b(docs? (and|&) api|api (reference|overview)|developer docs|get started|find the right agent|platform overview|pricing|what is lyzr|about lyzr|knowledge base overview|agent studio overview|architect overview)\b/i;

const SHELF = {
  product_page: 'see', tool: 'see',
  guide: 'build', playbook: 'build', solution_page: 'build',
  case_study: 'sell', story: 'sell', report: 'sell',
};
export const shelfOf = (type) => SHELF[type] ?? 'build';
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
/* A page written for one industry, in front of a partner who sells into that industry,
 * is placed by the industry. That is the whole point of it.
 *
 * Everything else still has to match the work, because "clears the floor on sector alone"
 * is how a healthcare case study lands on a marketing card. The difference is the
 * `by_industry` tag: it marks a page whose subject *is* a sector, and we only carry those
 * because somebody decided that sector deserved a page. Without this the manufacturing
 * library sat in the file unreachable, and a manufacturing ERP partner was sent a product
 * brochure instead. */
const qualifies = (type, onWork, onProduct, onFunction, onSector = 0, isSectorPage = false) =>
  (ON_PRODUCT.has(type)
    ? onWork * 2 + onProduct + onFunction >= 2
    : onFunction >= 1 || onWork >= 2 || (isSectorPage && onSector >= 1 && onProduct >= 1));

/* `topics` is the work this play is about, `industries` is where the partner sells. A
 * resource that matches the work travels; one that only matches the industry is a page
 * about the right sector and the wrong problem, so it ranks below and never alone. */
/* One approved resource by id. A product play names its own reading, which is better than
 * anything a topic match would find for it. */
export function resourceById(id) {
  const r = ALL.find((x) => x.id === id);
  return r && r.url ? { id: r.id, kind: KIND[r.type] ?? 'Resource', shelf: shelfOf(r.type), title: r.title, blurb: r.blurb ?? r.teaser ?? '', url: r.url } : null;
}

/* Grouped for the kit, in the order a partner uses them, and only where there is
 * something genuinely on point to put on a shelf. An empty shelf is left empty: one
 * resource that fits beats three that nearly do. */
export function shelves(resources = []) {
  const by = { see: [], build: [], sell: [] };
  for (const r of resources) (by[r.shelf ?? shelfOf(r.type)] ?? by.build).push(r);
  return by;
}

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
      const isSectorPage = (r.topics ?? []).includes('by_industry');
      if (!qualifies(r.type, onWork, onProduct, onFunction, onSector, isSectorPage)) return null;
      /* Unless the card is genuinely about that product, in which case it is the right
       * thing to point at. */
      if (PLATFORM_PAGE.test(r.title) && !product.size) return null;
      /* The department tag got it this far. These two decide whether it is about the same
       * kind of work, in a business the partner's clients are in. A telecom order
       * automation story reached an Infor regression card on a department tag alone. */
      const text = `${r.title} ${r.blurb ?? r.teaser ?? ''} ${(r.topics ?? []).join(' ')}`;
      if (conflicts(wantDomains, domainsOf(text))) return null;
      const fam = familiesIn(r);
      const onFamily = [...fam].some((f) => wantFamilies.has(f));
      /* A product or platform page describes a capability rather than a piece of work, so
       * it is placed by the product name and is not asked to name a process. */
      /* A product page is about a product and is placed by the product name. A tool is
       * about a subject: an AI governance assessment is not a thing to hand a marketing
       * client, and exempting every ON_PRODUCT type from the family check put it there. */
      const placedByName = r.type === 'product_page' && onProduct > 0;
      if (wantFamilies.size && fam.size && !placedByName && !onFamily) return null;
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
    out.push({ id: r.id, kind: KIND[r.type] ?? 'Resource', shelf: shelfOf(r.type), title: r.title, blurb: r.blurb ?? r.teaser ?? '', url: r.url });
    seenType.add(r.type);
  };
  /* One for each shelf before a second of any, because a partner wants something to look
   * at, something to build from and something to show a client, not three of one. */
  const seenShelf = new Set();
  for (const { r } of scored) {
    if (seenShelf.has(shelfOf(r.type))) continue;
    seenShelf.add(shelfOf(r.type));
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
