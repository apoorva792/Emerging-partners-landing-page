/* Two judgements that have to stay apart.
 *
 * How good an opportunity is, and how sure we are that the firm can really do it, are
 * different questions. Scored together, a compelling idea drags its own evidence up with
 * it, which is how a brief ends up recommending investment modelling to an SAP
 * integration shop: the idea scored well and nothing ever asked whether they had done
 * anything like it.
 *
 * So: a weighted score for quality, and a separate pass/fail gate for evidence. A
 * candidate that fails the gate does not reach the partner however well it scores. */

import { isSolid, isUsable } from './catalog.js';

/* The weights. Demonstrated fit carries the most because it is the thing a partner can
 * check against their own memory in two seconds, and the thing that loses them if it is
 * wrong. */
export const WEIGHTS = { fit: 0.30, commercial: 0.25, lyzr: 0.20, clarity: 0.15, feasibility: 0.10 };

const terms = (s) => new Set(String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
const overlap = (a, b) => { const B = terms(b); return [...terms(a)].filter((w) => B.has(w)).length; };

/* How well the firm's own delivered work supports this candidate. Not the model's opinion
 * of its own candidate: computed from the records it cited and whether those records are
 * about the same thing it claims. */
export function fitScore(opp, caps) {
  const byId = new Map((caps?.evidence ?? []).map((e) => [e.id, e]));
  const cited = [...new Set(opp.cites ?? [])].map((id) => byId.get(id)).filter(Boolean);
  if (!cited.length) return { score: 0, cited: [], why: 'cites nothing we could find on their site' };

  const grounded = cited.filter((e) => e.grounded);
  if (!grounded.length) return { score: 0, cited, why: 'every citation failed its quote check' };

  /* Does the cited work actually look like the work being proposed? Same department is
   * the strongest single signal; shared vocabulary between what they built and what is
   * being sold is the next. */
  const text = `${opp.headline} ${opp.work} ${opp.paid_service} ${opp.customer_problem}`;
  const best = Math.max(...grounded.map((e) =>
    overlap(text, `${e.what} ${e.work.join(' ')} ${e.stack.join(' ')} ${e.problem}`)));
  const sameFunction = grounded.some((e) => e.function && e.function === opp.function);
  const row = (caps?.capabilities ?? []).find((c) => c.function === opp.function);

  /* A service page they wrote about themselves is weaker evidence than an engagement
   * they delivered, and a candidate built on one can never score as though it were. */
  const advertised = grounded.every((e) => e.basis === 'advertised');
  let s = grounded.length >= 2 ? 2.6 : 2.0;
  if (sameFunction) s += 1.1;
  s += Math.min(1.0, best * 0.25);
  if (row?.confidence === 'high') s += 0.4;
  if (grounded.some((e) => (e.outcomes ?? []).length)) s += 0.4;
  /* A single engagement is a capability; three in the same department is a practice. */
  if ((row?.projects ?? 0) >= 3) s += 0.3;
  /* Claimed off a department they have never delivered into is the Arohak failure in one
   * line, so it is capped rather than merely penalised. */
  if (!sameFunction && !row) s = Math.min(s, 2.2);

  if (advertised) s = Math.min(s, 3.0);

  return {
    score: Math.min(5, Math.round(s * 10) / 10),
    advertised,
    cited,
    grounded: grounded.length,
    sameFunction,
    why: sameFunction ? `${grounded.length} grounded engagement(s) in ${opp.function}` : `${grounded.length} grounded engagement(s), different department`,
  };
}

/* What Lyzr actually contributes, measured against the records rather than against the
 * sentence the model wrote. A candidate whose Lyzr side is "they could use our platform"
 * scores zero here and fails the gate: if the firm could ship it this quarter on what
 * they already run, we are not part of the opportunity. */
export function lyzrScore(opp, ranked) {
  const lead = ranked?.[0];
  if (!lead || lead.s < 9) return { score: 0, lead: null, why: 'no Lyzr record is actually about this work' };
  let s = lead.s >= 18 ? 4.2 : lead.s >= 14 ? 3.6 : 3.0;
  if (isSolid(lead.r)) s += 0.5;
  else if (isUsable(lead.r)) s += 0.2;
  /* Two records on point is a capability we can stand behind twice over. */
  if ((ranked.filter((x) => x.s >= 9).length) >= 2) s += 0.3;
  return {
    score: Math.min(5, Math.round(s * 10) / 10),
    lead,
    why: `${lead.r.kind} record on point: ${lead.r.title}`,
  };
}

/* 0 to 100, so a reader of the run record can compare two candidates without knowing the
 * weights. */
export function total(parts) {
  const s = WEIGHTS.fit * parts.fit + WEIGHTS.commercial * parts.commercial + WEIGHTS.lyzr * parts.lyzr
    + WEIGHTS.clarity * parts.clarity + WEIGHTS.feasibility * parts.feasibility;
  return Math.round((s / 5) * 100);
}

/* The gate. Separate from the score on purpose, and checked after it: these are the
 * conditions under which we are willing to say a thing to a partner at all. */
export function gate(opp, fit, lyzr) {
  const fails = [];
  if (!fit.cited.length) fails.push('no citation resolved to a page on their site');
  else if (!fit.grounded) fails.push('no citation survived its quote check');
  if (fit.score < 2) fails.push('their own delivered work does not support this capability');
  if (lyzr.score < 3) fails.push('no defensible Lyzr advantage');
  if (!opp.buyer || opp.buyer.length < 3) fails.push('no buyer named');
  if (!opp.work || !opp.unit) fails.push('nothing concrete to scope a first engagement on');
  return { pass: fails.length === 0, fails };
}

/* Which candidates are worth one targeted search before we give up on them. A thin
 * citation on a strong commercial idea is the case the extra call exists for; everything
 * else is not worth the latency. */
export function worthResearching(scored) {
  return scored.filter((x) => !x.gate.pass
    && x.gate.fails.some((f) => f.includes('delivered work') || f.includes('citation'))
    && !x.gate.fails.includes('no defensible Lyzr advantage')
    && x.opp.commercial >= 4);
}
