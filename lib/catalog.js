import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './env.js';

/* What Lyzr has actually delivered, read off the customer story pages by
 * scripts/build-catalog.js. This replaced a fixed list of sixteen service lines: the
 * answer to "what could this firm sell" is in the work we have really done, and there is
 * a lot more of it than anyone could write down by hand. */
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', f), 'utf8'));

const CATALOG = Object.values(read('catalog.json').records);
export const PATTERNS = read('patterns.json').patterns;
const PRODUCTS = read('products.json');

export const patternById = (id) => PATTERNS.find((p) => p.id === id) ?? null;

/* A record the engine is allowed to build an opportunity on. The low-confidence ones are
 * pages that are mostly marketing: they are kept because they still say which industries
 * we show up in, but a line cannot stand on one alone. */
export const isSolid = (r) => r.confidence === 'high' && (r.built ?? []).length >= 2;
export const recordById = (id) => CATALOG.find((r) => r.id === id) ?? null;

const words = (s) => String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
const bag = (xs) => new Set((xs ?? []).flatMap(words));
const hits = (a, b) => [...a].filter((w) => b.has(w)).length;

/* The visitor's own answers are the strongest signal about where their clients need work,
 * and they arrive as prose. These map them onto the functions the catalog is indexed by. */
const ANSWER_FUNCTIONS = [
  [/finance|account|audit|close|reconcil|invoice|spend/i, ['finance', 'procurement']],
  [/procure|supplier|vendor|sourcing|purchas/i, ['procurement', 'supply chain']],
  [/hr|people|talent|recruit|hiring|onboard/i, ['hr']],
  [/market|campaign|brand|content|creative/i, ['marketing']],
  [/sales|revenue|pipeline|sdr|lead/i, ['sales']],
  [/support|service desk|customer|ticket|helpdesk/i, ['customer service']],
  [/legal|contract/i, ['legal']],
  [/complian|governance|regulat|risk|audit trail/i, ['compliance', 'risk']],
  [/infra|platform|devops|cloud|integration|migration|legacy/i, ['it operations', 'engineering']],
  [/supply chain|logistic|manufactur|warehouse/i, ['supply chain', 'operations']],
  [/research|analys|insight|diligence/i, ['research']],
  [/workflow|process|automat|operations|back office/i, ['operations']],
];

function functionsWanted(profile, answers) {
  const text = [
    ...(answers ?? []).map((a) => `${a.question} ${Array.isArray(a.answer) ? a.answer.join(' ') : a.answer}`),
    ...(profile.services ?? []).map((s) => s.name),
    ...(profile.strengths ?? []),
    profile.company?.one_line ?? '',
  ].join(' ');
  const out = new Set();
  for (const [re, fns] of ANSWER_FUNCTIONS) if (re.test(text)) fns.forEach((f) => out.add(f));
  /* Nothing matched, which happens for a firm described only in abstractions. Operations
   * is where most of the catalog lives, so it is the honest default rather than nothing. */
  if (!out.size) out.add('operations');
  return [...out];
}

/* Scored in code, not by a model: this runs between the questions and the first card, so
 * every second here is a second the visitor watches. */
export function candidatesFor(profile, answers, n = 14) {
  const wanted = new Set(functionsWanted(profile, answers));
  const industry = bag((profile.industries ?? []).map((i) => i.name));
  const systems = bag(profile.platforms ?? []);
  const theirWords = bag([
    ...(profile.services ?? []).map((s) => s.name),
    ...(profile.strengths ?? []),
  ]);

  const scored = CATALOG.map((r) => {
    const fn = (r.functions ?? []).filter((f) => wanted.has(f)).length;
    const ind = hits(bag([r.industry, ...(r.topics ?? [])]), industry);
    const sys = hits(bag(r.systems ?? []), systems);
    const topic = hits(bag(r.topics ?? []), theirWords);
    /* Function is what the work *is*, so it leads. Industry says the partner's clients
     * look like this customer. Systems is the rarest and most convincing signal, because
     * it means we have done it inside the same stack they implement. */
    const score = fn * 12 + ind * 5 + sys * 8 + topic * 2 + (isSolid(r) ? 6 : 0);
    return { r, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  /* Never hand the writer fourteen records from one function: it will propose the same
   * line three times. Two per function first, then fill. */
  const out = [];
  const perFunction = new Map();
  for (const { r } of scored) {
    const key = (r.functions ?? [])[0] ?? 'other';
    const seen = perFunction.get(key) ?? 0;
    if (seen >= 2) continue;
    perFunction.set(key, seen + 1);
    out.push(r);
    if (out.length >= n) break;
  }
  for (const { r } of scored) {
    if (out.length >= n) break;
    if (!out.includes(r)) out.push(r);
  }
  return out;
}

/* What the partner would demo. The named agents are the point: a partner can show a
 * client Diane next week, where "the platform supports HR use cases" is a sentence. */
export function productsFor(functions = []) {
  const want = new Set(functions);
  const fits = (p) => !p.for || p.for.some((f) => want.has(f));
  const platform = PRODUCTS.platform.filter((p) => p.default || fits(p)).slice(0, 4);
  const agents = PRODUCTS.agents.filter((a) => a.for.some((f) => want.has(f))).slice(0, 2);
  return { platform, agents };
}

/* Two views of a record, because the two calls need different things and the first one is
 * on the visitor's clock. Discovery is choosing between fourteen, so it gets the shape of
 * each: enough to tell what the work was, not enough to quote. The writer gets three at
 * most and needs all of it. */
export const brief = (r) => ({
  id: r.id,
  industry: r.industry,
  functions: r.functions,
  built: (r.built ?? []).slice(0, 3),
  systems: r.systems,
  sellable_as: r.sellable_as,
  solid: isSolid(r),
});

export const full = (r) => ({
  id: r.id,
  client: r.client,
  industry: r.industry,
  functions: r.functions,
  built: r.built,
  systems: r.systems,
  results: r.results,
  sellable_as: r.sellable_as,
});
