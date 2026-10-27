import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './env.js';

const ALL = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'resources.json'), 'utf8')).resources;

/* The catalog writes the same topic two ways — "agent studio" and "agent_studio",
 * "compliance & risk" and "compliance_risk" — so everything is flattened to words before
 * it is compared. */
const words = (s) => String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
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
const qualifies = (type, onWork, onProduct) =>
  (ON_PRODUCT.has(type) ? onWork + onProduct : onWork) >= 1;

/* `topics` is the work this play is about, `industries` is where the partner sells. A
 * resource that matches the work travels; one that only matches the industry is a page
 * about the right sector and the wrong problem, so it ranks below and never alone. */
export function relatedTo({ topics = [], products = [], industries = [], exclude = [] } = {}, n = 3) {
  const work = bag(topics);
  const sector = bag(industries);
  const product = bag(products);
  if (!work.size && !product.size) return [];
  const skip = new Set(exclude);

  const scored = ALL
    .filter((r) => USEFUL.has(r.type) && r.url && !skip.has(r.id))
    .map((r) => {
      const t = bag(r.topics);
      const onWork = overlap(t, work);
      const onProduct = overlap(t, product);
      const onSector = overlap(t, sector);
      /* Clearing the floor on sector alone is how an unrelated page gets in on the word
       * "healthcare", and clearing it on the product name alone is how a media case study
       * gets in on the word "studio". */
      if (!qualifies(r.type, onWork, onProduct)) return null;
      /* Same work first, then the same work in their sector too, then the platform page.
       * Priority only breaks ties, and a case study is nudged down because the play
       * already carries one. */
      const score = onWork * 10 + onSector * 4 + onProduct * 2
        + (r.priority ?? 0) - (r.type === 'case_study' ? 4 : 0);
      return { r, score, onWork, onSector };
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
