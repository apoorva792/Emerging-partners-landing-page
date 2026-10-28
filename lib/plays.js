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
export const PLAYS = [
  ...load('partner-offerings.json').map((o) => ({ tier: 'product', ...o })),
  ...load('solution-offerings.json'),
];

export const playById = (id) => {
  const key = String(id ?? '').toLowerCase().trim();
  return PLAYS.find((p) => p.offering_id === key || p.id === key || p.product_id === key) ?? null;
};

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
function industryFit(play, profile) {
  const mine = stem(play.industry ?? '');
  if (!mine) return [];
  const theirs = new Set([
    ...(profile?.industries ?? []).map((i) => stem(i.name ?? i)),
    ...(profile?.capabilities?.industries ?? []).map(stem),
  ].filter(Boolean));
  if (!theirs.size) return [];
  const market = marketOf(mine);
  return [...theirs].some((t) => market.includes(t)) ? [play.industry] : [];
}

export function eligibility(play, profile) {
  const hay = haystack(profile);
  const fams = families(hay);
  const onFamily = (play.requires?.families ?? []).filter((f) => fams.has(f));
  const onSignal = (play.requires?.signals ?? []).filter((s) => hay.includes(s));
  const onIndustry = industryFit(play, profile);

  /* Both axes, or three distinctive words. A family on its own is too coarse: a marketing
   * agency's site says "alerts" and classifies as incident handling, which was enough to
   * offer it a governance control plane. A single word is weaker still. So the kind of
   * work has to line up *and* their own vocabulary has to show it, unless the vocabulary
   * is emphatic enough on its own. */
  /* An industry match is the strongest single thing here. A solution built for banking,
   * in front of a firm whose entire client base is banks and credit unions, is a better
   * recommendation than one that merely shares a department with them. Without it every
   * governance solution tied on score and the list was filled in array order. */
  const score = onFamily.length * 2 + Math.min(3, onSignal.length) + onIndustry.length * 3;
  return {
    ok: (onFamily.length > 0 && onSignal.length > 0) || onSignal.length >= 3
      || (onIndustry.length > 0 && (onFamily.length > 0 || onSignal.length > 0)),
    onIndustry,
    score,
    onFamily,
    onSignal: onSignal.slice(0, 4),
    why: onIndustry.length
      ? `their clients are in ${onIndustry.join(', ')}, and ${onFamily.length ? `their work covers ${onFamily.join(', ')}` : `they name ${onSignal.slice(0, 2).join(', ')}`}`
      : onFamily.length && onSignal.length
        ? `their delivered work covers ${onFamily.join(', ')}, and they name ${onSignal.slice(0, 3).join(', ')}`
      : onSignal.length >= 3
        ? `their own pages name ${onSignal.slice(0, 3).join(', ')}`
        : 'nothing in their evidence supports it',
  };
}

/* Which plays this partner could be shown at all, strongest first. The model never sees
 * the others, so it cannot propose one: the gate is in the retrieval, not in the prompt. */
export function playsFor(profile, n = 6) {
  const scored = PLAYS
    .map((play) => ({ play, fit: eligibility(play, profile) }))
    .filter((x) => x.fit.ok)
    .sort((a, b) => b.fit.score - a.fit.score);
  /* A platform product and a solution built on it are different conversations, so the
   * list keeps room for both rather than letting whichever tier scores higher fill it.
   * Without this a firm with a strong governance signal was shown four governance
   * solutions and none of the products underneath them. */
  const products = scored.filter((x) => x.play.tier === 'product').slice(0, 3);
  const solutions = scored.filter((x) => x.play.tier === 'solution').slice(0, 3);
  return [...products, ...solutions]
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, n);
}

/* The compact view the discovery prompt gets. Enough to choose between them and to write
 * an honest line; not the prerequisites and the refusal conditions, which are ours to
 * enforce rather than the model's to weigh. */
export const briefOf = ({ play, fit }) => ({
  id: play.offering_id,
  product_id: play.product_id,
  kind: play.tier === 'product' ? 'a Lyzr platform product' : 'a packaged Lyzr solution the partner deploys',
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
