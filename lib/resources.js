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

export function relatedTo({ topics = [], products = [], industries = [], exclude = [] } = {}, n = 3) {
  const want = bag([...topics, ...products, ...industries]);
  if (!want.size) return [];
  const skip = new Set(exclude);

  const scored = ALL
    .filter((r) => USEFUL.has(r.type) && r.url && !skip.has(r.id))
    .map((r) => {
      const hit = overlap(bag(r.topics), want);
      if (!hit) return null;
      /* Topic overlap decides it; priority only breaks ties, and a case study is nudged
       * down because the card already carries one. */
      const score = hit * 10 + (r.priority ?? 0) - (r.type === 'case_study' ? 4 : 0);
      return { r, score, hit };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const out = [];
  const seenType = new Set();
  for (const { r } of scored) {
    /* One of each kind before a second of any kind: three case studies in a row is a
     * reading list, not a sales kit. */
    if (seenType.has(r.type) && out.length < n) continue;
    out.push({ id: r.id, kind: KIND[r.type] ?? 'Resource', title: r.title, blurb: r.blurb ?? r.teaser ?? '', url: r.url });
    seenType.add(r.type);
    if (out.length >= n) break;
  }
  /* If variety left us short, fill with the next best whatever they are. */
  for (const { r } of scored) {
    if (out.length >= n) break;
    if (out.some((x) => x.id === r.id)) continue;
    out.push({ id: r.id, kind: KIND[r.type] ?? 'Resource', title: r.title, blurb: r.blurb ?? r.teaser ?? '', url: r.url });
  }
  return out;
}
