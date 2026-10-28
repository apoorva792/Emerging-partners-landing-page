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

export const PLAYS = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'product-plays.json'), 'utf8')).plays;

export const playById = (id) => PLAYS.find((p) => p.id === String(id ?? '').toLowerCase().trim()) ?? null;

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
export function eligibility(play, profile) {
  const hay = haystack(profile);
  const fams = families(hay);
  const onFamily = (play.requires?.families ?? []).filter((f) => fams.has(f));
  const onSignal = (play.requires?.signals ?? []).filter((s) => hay.includes(s));

  /* Both axes, or three distinctive words. A family on its own is too coarse: a marketing
   * agency's site says "alerts" and classifies as incident handling, which was enough to
   * offer it a governance control plane. A single word is weaker still. So the kind of
   * work has to line up *and* their own vocabulary has to show it, unless the vocabulary
   * is emphatic enough on its own. */
  const score = onFamily.length * 2 + Math.min(3, onSignal.length);
  return {
    ok: (onFamily.length > 0 && onSignal.length > 0) || onSignal.length >= 3,
    score,
    onFamily,
    onSignal: onSignal.slice(0, 4),
    why: onFamily.length && onSignal.length
      ? `their delivered work covers ${onFamily.join(', ')}, and they name ${onSignal.slice(0, 3).join(', ')}`
      : onSignal.length >= 3
        ? `their own pages name ${onSignal.slice(0, 3).join(', ')}`
        : 'nothing in their evidence supports it',
  };
}

/* Which plays this partner could be shown at all, strongest first. The model never sees
 * the others, so it cannot propose one: the gate is in the retrieval, not in the prompt. */
export function playsFor(profile, n = 5) {
  return PLAYS
    .map((play) => ({ play, fit: eligibility(play, profile) }))
    .filter((x) => x.fit.ok)
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, n);
}

/* The compact view the discovery prompt gets. Enough to choose between them and to write
 * an honest line; not the prerequisites and the refusal conditions, which are ours to
 * enforce rather than the model's to weigh. */
export const briefOf = ({ play, fit }) => ({
  id: play.id,
  product: play.name,
  what_it_is: play.one_line,
  it_does: play.capabilities,
  sits_next_to: play.complements,
  why_them: fit.why,
  deployment_offer: play.implementation.offer,
  recurring_offer: play.managed.offer,
  buyer: play.buyer,
  trigger: play.trigger,
  not_for: play.do_not_recommend_when,
});
