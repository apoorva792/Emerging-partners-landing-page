/* The product-led half of discovery.
 *
 * The capability path asks what work a partner could sell next. This one asks a different
 * question: which Lyzr product is their existing business already shaped to deploy, resell
 * or run? A workplace consultancy that has rolled out Microsoft 365 to forty thousand
 * people does not need an adjacent workflow idea, it needs Open Cowork and a deployment
 * offer. That opportunity is direct, and the old path could not see it because it only
 * reasoned from engagements to engagements.
 *
 * The grounding rule does not change. A play is eligible only when the partner's own
 * capability map shows the thing it needs, read off their site. An industry match is not
 * a reason to recommend a product, and neither is a plausible story about one. */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './env.js';
import { families } from './fit.js';

const load = (f) => JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', f), 'utf8')).offerings;

/* Two tiers. The nine platform products are written by hand, because their commercial
 * terms and their restrictions are things we had to decide rather than read. The rest
 * are generated from the catalogue pages we already crawled: the industry solutions and
 * the named agents, which existed in the system only as supporting evidence and so could
 * never be recommended. Madison GRC sat in a regulated communications firm's candidate
 * pool, tagged banking, and there was nothing describing how a partner would sell it. */
/* The five commercial motions, and what each product is for. A motion is the relationship
 * between a product and the partner's existing business: an upsell into work they already
 * deliver is a different conversation from entering a category they do not sell today,
 * even when the use case underneath sounds similar. Selection runs on this, because three
 * cards on one motion are three versions of the same meeting. */
const MOTIONS = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'motions.json'), 'utf8')).motions;
export const MOTION_BY_ID = new Map(MOTIONS.map((m) => [m.id, m]));
export const motionOf = (play) => MOTION_BY_ID.get(play?.commercial_motion) ?? null;

export const PLAYS = [
  ...load('partner-offerings.json').map((o) => ({ tier: 'product', ...o })),
  /* Every packaged solution is the same motion: it already exists, and the opportunity is
   * putting it in front of a segment the partner already sells to. Set here rather than
   * written into the file, which scripts/build-solution-offerings.js regenerates. */
  ...load('solution-offerings.json').map((o) => ({ commercial_motion: 'solution_to_segment', ...o })),
];

export const playById = (id) => {
  const key = String(id ?? '').toLowerCase().trim();
  return PLAYS.find((p) => p.offering_id === key || p.id === key || p.product_id === key) ?? null;
};

/* How distinctive each thing a play asks for actually is.
 *
 * Eligibility used to count matches: two points a family, one a signal, capped at three.
 * Counting rewards breadth, and the products with the widest `requires` lists won almost
 * every firm. Measured across the saved runs, OpenController led five profiles out of six
 * and SuperFlow four, not because those firms were alike but because those two records
 * ask for the most things. A manufacturing ERP partner, a Palantir implementation shop and
 * a healthcare IT firm came out with the same two products.
 *
 * So a term is worth what it tells us apart. "integration" is declared by most of the
 * catalogue and means almost nothing; "air-gapped" is declared by one and means a great
 * deal. This is the standard inverse-document-frequency weight over our own records, and
 * it is computed rather than hand-tuned so it stays right as the catalogue grows. */
const DF = new Map();
const termsOf = (play) => [
  ...new Set((play.requires?.families ?? []).map((f) => `f:${f}`)),
  ...new Set((play.requires?.signals ?? []).map((x) => `s:${String(x).toLowerCase()}`)),
];
const countTerms = (plays) => {
  for (const play of plays) for (const t of termsOf(play)) DF.set(t, (DF.get(t) ?? 0) + 1);
};
const idf = (t, total) => Math.log(total / (1 + (DF.get(t) ?? 0))) + 0.25;

/* The best few matches, not all of them. Even weighted, a record asking for twenty five
 * things has twenty five chances to match where one asking for five has five. Scoring
 * every play on its strongest matches puts them on the same footing. */
const topSum = (weights, n) => weights.sort((a, b) => b - a).slice(0, n).reduce((a, b) => a + b, 0);

countTerms(PLAYS);

/* Everything the partner has shown us, as one lower-case haystack: what they delivered,
 * what they advertise, the systems they touch and the services they name. Deliberately
 * wide, because the evidence for "they do infrastructure work" can sit in any of them. */
function haystack(profile) {
  const caps = profile?.capabilities;
  return [
    ...(caps?.capabilities ?? []).flatMap((c) => [c.function, c.service, ...(c.work ?? []), ...(c.stack ?? [])]),
    ...(caps?.evidence ?? []).flatMap((e) => [e.what, e.function, e.problem, ...(e.work ?? []), ...(e.stack ?? [])]),
    ...(caps?.advertised_only ?? []),
    ...(caps?.technologies ?? []),
    ...(profile?.services ?? []).map((s) => s.name ?? s),
    ...(profile?.platforms ?? []).map((p) => p.name ?? p),
    ...(profile?.strengths ?? []).map((s) => s.name ?? s),
    /* Who they serve counts too. A firm whose whole client base is banks and credit
     * unions is telling us something about what it could deploy, and reading only its
     * service names threw that away. */
    ...(profile?.industries ?? []).map((i) => i.name ?? i),
    profile?.company?.one_line,
    /* What they have already shipped with AI, which is the strongest signal there is for
     * the products that sit over an existing agent estate. */
    profile?.already_built?.verdict,
    ...(profile?.already_built?.capabilities ?? [])
      .flatMap((c) => [c?.name, c?.what_it_does, c?.evidence]),
    ...(profile?.already_built?.tied_to ?? []).map((t) => (typeof t === 'string' ? t : t?.name)),
  ].filter(Boolean).join(' \n ').toLowerCase();
}

/* Does this partner show the thing this play needs? Two independent ways to qualify, and
 * one is enough: the kind of work their delivered engagements are (a family), or the words
 * their own site uses about what they do (a signal). Both are read off evidence rather
 * than asserted, and a play that matches on neither is not offered at all. */
/* "Banking" and "Banks", "fintech" and "financial services": the same industry written
 * two ways. Stemmed to the first six characters so one matches the other, which is the
 * difference between Madison GRC reaching a firm whose clients are banks and not. */
const stem = (s) => String(s ?? '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 6);

/* Industries that are the same market under different names. One list per group, read
 * both ways, so "banking" finds a firm whose clients are "Banks" and "Credit Unions". */
const SAME_MARKET = [
  ['financ', 'bankin', 'banks', 'bank', 'fintec', 'wealth', 'credit', 'paymen', 'capita'],
  ['insura', 'insure', 'underw'],
  ['health', 'hospit', 'clinic', 'provid', 'payer', 'pharma', 'lifesc'],
  ['retail', 'ecomme', 'commer', 'consum', 'merchа'],
  ['manufa', 'indust', 'produc', 'distri', 'logist', 'supply'],
  ['govern', 'public', 'munici', 'federa', 'defenc', 'defens'],
  ['teleco', 'telco', 'media', 'entert'],
  ['educat', 'univer', 'school', 'edtech'],
];
const marketOf = (a) => SAME_MARKET.find((g) => g.includes(a)) ?? [a];

/* The industry this offering was built for, from the catalogue page it came from, against
 * the industries this partner actually serves. Only the declared industry counts: reading
 * it off the description's words matched "connected" and "building" and reported a firm's
 * clients as being in them. A cross-industry solution declares none and matches none. */
/* Which market this firm has actually delivered into, as against which markets its
 * website lists.
 *
 * `profile.industries` is the vertical menu, and every mid-size services firm names eight
 * or ten. Doxim lists Healthcare third behind Financial Services; Foxtrot lists Healthcare
 * and Biotech among nine. Matching a packaged solution against that list made every firm
 * eligible for every segment, which is how a bank's integrator was offered healthcare
 * operations agents and an aerospace firm was offered banking GRC.
 *
 * What they have delivered into is a different and much smaller set, and it is recorded:
 * each grounded evidence record carries the industry of the engagement behind it. That is
 * what a segment play is matched on. The advertised list is kept only to describe the fit
 * once it is established, never to establish one. */
function industryFit(play, profile) {
  const mine = stem(play.industry ?? '');
  if (!mine) return [];
  const market = marketOf(mine);
  const inMarket = (xs) => [...new Set(xs.map(stem).filter(Boolean))].some((t) => market.includes(t));

  /* Delivered: the industries on their grounded engagement records, and the capability
   * map's own read of who they serve, which is derived from the same evidence. */
  const delivered = [
    ...(profile?.capabilities?.evidence ?? []).filter((e) => e.grounded !== false).map((e) => e.industry),
    ...(profile?.capabilities?.industries ?? []),
  ].filter(Boolean);

  return inMarket(delivered) ? [play.industry] : [];
}


export function eligibility(play, profile) {
  const hay = haystack(profile);
  const fams = families(hay);
  const onFamily = (play.requires?.families ?? []).filter((f) => fams.has(f));
  const onSignal = (play.requires?.signals ?? []).filter((x) => hay.includes(String(x).toLowerCase()));
  const onIndustry = industryFit(play, profile);

  /* A record built for one industry is not a recommendation for a firm in another.
   *
   * It used to be enough to name three of its signals, and the signals on a solution
   * include words like "operations", "service" and "compliance" that are on every
   * services firm's website. That is how a healthcare operations solution reached four of
   * six saved profiles, a manufacturing ERP partner and a financial services firm among
   * them. If a record declares an industry, the firm has to be in that market. */
  if (play.industry && !onIndustry.length) {
    return { ok: false, onIndustry: [], score: 0, onFamily, onSignal: [], why: `built for ${play.industry}, which is not their market` };
  }

  const total = PLAYS.length || 1;
  const famWeight = topSum(onFamily.map((f) => idf(`f:${f}`, total)), 3);
  const sigWeight = topSum(onSignal.map((x) => idf(`s:${String(x).toLowerCase()}`, total)), 4);
  /* Their own market, which is the single most useful thing we know about who they can
   * reach, and the one axis the nine platform records say nothing about. */
  const score = Math.round((famWeight + sigWeight + onIndustry.length * 3) * 10) / 10;

  /* Both axes, or signals distinctive enough to stand alone. The shape of the test is
   * unchanged; what changed is that "three signals" now has to mean three that tell this
   * firm apart, rather than three words any services firm would use. */
  /* The weight says how much a match tells this firm apart from other firms in the
   * catalogue; it does not say how many things we matched. A single rare word is still a
   * single word: "Software" on a one-line profile scores well on rarity alone and must
   * never qualify a product by itself. So both still have to hold, a distinctive match
   * and enough of them. */
  const ok = (onFamily.length > 0 && onSignal.length > 0 && sigWeight >= 1.0)
    || (onSignal.length >= 3 && sigWeight >= 2.6)
    || (onIndustry.length > 0 && (onFamily.length > 0 || onSignal.length > 0));

  /* The two or three most distinctive things we matched, so the reason reads as the
   * evidence it is rather than as a list of everything that happened to overlap. */
  const best = (xs, kind) => xs
    .map((x) => ({ x, w: idf(`${kind}:${String(x).toLowerCase()}`, total) }))
    .sort((a, b) => b.w - a.w).slice(0, 3).map((o) => o.x);

  return {
    ok,
    onIndustry,
    score,
    onFamily,
    onSignal: best(onSignal, 's'),
    why: onIndustry.length
      ? `their clients are in ${onIndustry.join(', ')}, and ${onFamily.length ? `their work covers ${best(onFamily, 'f').join(', ')}` : `they name ${best(onSignal, 's').slice(0, 2).join(', ')}`}`
      : onFamily.length && onSignal.length
        ? `their delivered work covers ${best(onFamily, 'f').join(', ')}, and they name ${best(onSignal, 's').join(', ')}`
        : onSignal.length
          ? `their own pages name ${best(onSignal, 's').join(', ')}`
          : 'nothing in their evidence supports it',
  };
}


/* Which plays this partner could be shown at all, strongest first. The model never sees
 * the others, so it cannot propose one: the gate is in the retrieval, not in the prompt. */
export function playsFor(profile, n = 16) {
  const scored = PLAYS
    .map((play) => ({ play, fit: eligibility(play, profile) }))
    .filter((x) => x.fit.ok)
    .sort((a, b) => b.fit.score - a.fit.score);

  /* Every eligible product reaches the model. No exceptions.
   *
   * This used to lead with one play per commercial motion and then cut the list at eight.
   * Measured over the saved profiles that was severe: Fingent qualified for all nine
   * products and four were shown, so SuperFlow, Optimus, Architect, Agent Blocks and Open
   * Finetuning were never considered at all. A motion is not an opportunity. Agent Studio
   * and SuperFlow both widen an engagement and are still different capabilities, different
   * customer problems and different engagements, and deciding between them is exactly the
   * commercial judgement we hand to the model. Eliminating one before it is seen is us
   * making that call with a sort order.
   *
   * The nine are the licence layer, so they are never dropped. The solutions are context
   * and there can be twenty of them, so they are bounded: the strongest few, one per
   * segment so a single industry cannot take every slot. */
  const products = scored.filter((x) => x.play.tier === 'product');

  const seenSegment = new Set();
  const solutions = [];
  for (const x of scored) {
    if (x.play.tier === 'product') continue;
    const seg = x.play.industry ? String(x.play.industry).toLowerCase() : `horizontal:${x.play.offering_id}`;
    if (seenSegment.has(seg)) continue;
    seenSegment.add(seg);
    solutions.push(x);
  }

  return [...products, ...solutions.slice(0, Math.max(0, n - products.length))]
    .sort((a, b) => b.fit.score - a.fit.score);
}



/* The compact view the discovery prompt gets. Enough to choose between them and to write
 * an honest line; not the prerequisites and the refusal conditions, which are ours to
 * enforce rather than the model's to weigh. */
export const briefOf = ({ play, fit }) => ({
  id: play.offering_id,
  product_id: play.product_id,
  kind: play.tier === 'product' ? 'a Lyzr platform product' : 'a packaged Lyzr solution the partner deploys',
  /* The market this record was built for, and the fact that the firm has delivered into
   * it. Without this a banking GRC solution and a general purpose platform product read
   * the same to the model, so the strongest thing we know, that this firm already works
   * in the exact market the solution was built for, never reached the page. */
  built_for_industry: play.industry ?? null,
  /* Whether this is a thing to sell or a thing to point at. An application page that
   * names no product cannot lead a recommendation, so proposing one wastes a slot. */
  can_lead_a_recommendation: play.tier === 'product'
    || ['is_a_product', 'verified'].includes(play.product_mapping_status),
  licence_behind_it: play.tier === 'product' ? play.name
    : (play.product_mapping_status === 'is_a_product' ? play.name
      : (play.primary_product_id ?? null)),
  /* The commercial motion this product runs, which is the thing that makes two
   * recommendations different from each other. */
  commercial_motion: play.commercial_motion,
  motion_means: motionOf(play)?.what,
  what_it_needs_from_them: motionOf(play)?.needs,
  follow_on_revenue: play.follow_on,
  product: play.name,
  what_it_is: play.one_line,
  it_does: play.capabilities,
  sits_next_to: play.complements,
  why_them: fit.why,
  /* What the customers of this partner's clients actually struggle with, and the two or
   * three things a partner could charge for. The model picks from these rather than
   * inventing a service, which is how a product stays a product and the service stays
   * the partner's. */
  customer_problems: play.customer_problems,
  services_you_could_sell: play.sellable_services,
  deployment_revenue: play.revenue.implementation,
  recurring_revenue: play.revenue.recurring,
  /* The line between what it can do and what we may promise. */
  restrictions: play.restrictions,
  buyer: play.buyer,
  trigger: play.trigger,
  not_for: play.do_not_recommend_when,
});
