/* End-to-end dry run against a real domain, no browser:
 *   node scripts/run.js arohak.com
 * Answers the questions with the profiler's own guesses, takes the first card, and uses
 * three placeholder accounts, so it exercises every step the UI will. Prints the
 * capability map and the quality report too, which is where a bad run shows itself. */
import { step1, step2, step3, rankAccounts } from '../lib/journey.js';

const domain = process.argv[2] || 'goml.io';
const t0 = Date.now();

const s1 = await step1(`hello@${domain}`, domain);
if (!s1.ok) { console.error(s1); process.exit(1); }
const caps = s1.profile.capabilities;
console.log(`\n== PROFILE (${Math.round(s1.ms / 1000)}s) ==\n${s1.profile.company.one_line}`);
console.log(`archetype ${s1.profile.archetype.primary} / ${s1.profile.archetype.confidence} | source ${s1.evidence.source_quality}`);
console.log(`evidence ${JSON.stringify(s1.evidence.evidence)} | basis ${caps?.basis ?? 'none'}`);
for (const c of caps?.capabilities ?? []) {
  console.log(`  [${c.confidence}] ${c.function} x${c.projects} :: ${c.service}`);
}

const answers = s1.questions.map((q) => ({ question: q.question, answer: q.guess ?? q.options?.[0] }));
console.log('\n== ANSWERS ==');
for (const a of answers) console.log(`  ${a.question} -> ${a.answer}`);

const s2 = await step2(s1.profile, answers);
console.log(`\n== CARDS (discovery ${s2.ms.discovery}ms, cards ${s2.ms.cards}ms) ==\n${s2.opening}`);
for (const c of s2.cards) {
  console.log(`\n  [${c.growth_path} ${c.score}] ${c.headline}`);
  console.log(`   what:  ${c.what_it_is}`);
  console.log(`   you:   ${c.why_you}`);
  console.log(`   buys:  ${c.who_buys}  (problem: ${c.problem_status})`);
  console.log(`   stands on: ${(c.stands_on ?? []).map((e) => e.what).join(' | ') || '(none)'}`);
  console.log(`   first: ${c.first_offer?.name} — ${c.first_offer?.shape}`);
  console.log(`   proof: ${c.proof ? `${c.proof.result} @ ${c.proof.customer}` : c.reference ? `built on ${c.reference.title}` : '(none claimed)'}`);
  console.log(`   send:  ${(c.resources ?? []).map((r) => r.title).join(' | ') || '(nothing on point)'}`);
}

/* The whole stack, and what became of each part of it. The point of the change is that a
 * product can now be considered and consciously turned down, so the turning down has to
 * be visible or the reviewer is back to guessing. */
const st = s2.stack ?? {};
console.log(`\n== THE STACK CONSIDERED (${(st.eligible ?? []).length} eligible) ==`);
for (const e of st.eligible ?? []) console.log(`  ${e.product.padEnd(34)} ${String(e.motion).padEnd(20)} ${e.why}`);
console.log('\n== SELECTED ==');
for (const c of st.chosen ?? []) {
  console.log(`  ${c.product} (${c.motion}) [score ${c.score}, not used to pick]`);
  console.log(`     ${c.headline}`);
  console.log(`     because: ${c.because || '(model gave no reason)'}`);
  console.log(`     Lyzr adds: ${c.adds || '(not stated)'}`);
}
console.log('\n== REJECTED ==');
for (const r of st.rejected ?? []) console.log(`  ${String(r.product).padEnd(34)} ${r.why}`);

console.log(`\n== QUALITY: ${s2.quality.issues.length} issues, ${s2.quality.blocking} blocking${s2.quality.degraded ? ' DEGRADED' : ''} ==`);
for (const i of s2.quality.issues) console.log(`  [${i.severity}] ${i.check}: ${i.detail}`);
console.log('\n== PASSED OVER ==');
for (const n of s2.not_recommended ?? []) console.log(`  ${n.score} ${n.headline}${n.product ? ` [${n.product}]` : ''}\n      ${n.why.join('; ')}`);

const accounts = [
  { name: 'Acme Insurance', strength: 'Champion inside' },
  { name: 'Northwind Logistics', strength: 'Warm' },
  { name: 'Rivera Health', strength: 'Dormant' },
];
/* Up to three, because the brief is a document about a set of lines and the parts that
 * only appear with more than one, the summary table and the recommendation between them,
 * are exactly the parts worth seeing in a dry run. */
const picked = s2.cards.slice(0, 3);
const tBrief = Date.now();
const [s3, ranked] = await Promise.all([
  step3({ profile: s1.profile, answers, chosen: picked, cards: s2.cards }),
  rankAccounts(s1.profile, picked[0], accounts),
]);
const b = s3.brief;
const wrap = (t, w = 92) => String(t ?? '').replace(new RegExp(`(.{1,${w}})(\\\\s|$)`, 'g'), '$1\n').trimEnd();

console.log('\n== BRIEF ==');
const words = (t) => String(t ?? '').trim().split(/\s+/).filter(Boolean).length;
for (const [i, pg] of (b.pages ?? []).entries()) {
  const c = picked.find((x) => x.id === pg.id);
  /* The word count is the point of the redesign, so the dry run prints it: a page over
   * roughly 200 words of narrative is one that will not sit on a single A4 sheet. */
  const narrative = [pg.why_fits, pg.the_opportunity, ...(pg.benefits ?? []),
    ...(pg.advantage ?? []).flatMap((x) => [x.capability, x.why]), pg.start?.conversation]
    .reduce((n, t) => n + words(t), 0);
  console.log(`\n-- page ${String(i + 1).padStart(2, '0')} of ${(b.pages ?? []).length}  [${narrative} words] --`);
  console.log(`  "${pg.headline}"`);
  console.log(`  powered by:  ${c?.product?.name ?? '(no product)'}`);
  console.log(`  offering:    ${pg.offering_name}`);
  console.log(`  why fits:    ${wrap(pg.why_fits)}`);
  console.log(`  opportunity: ${wrap(pg.the_opportunity)}`);
  for (const x of pg.benefits ?? []) console.log(`     + ${x}`);
  console.log('  lyzr advantage:');
  for (const x of pg.advantage ?? []) console.log(`     ${x.capability} :: ${x.why}`);
  console.log(`  start with:  ${pg.start?.who || '(no account)'} / ${pg.start?.buyer}`);
  console.log(`  ${wrap(pg.start?.conversation)}`);
  console.log(`  resources:   ${(c?.resources ?? []).length + (c?.proof?.url ? 1 : 0)} links`);
}
console.log(`\naccounts ranked (not printed on the sheets): ${ranked.map((r) => r.account).join(', ')}`);

console.log(`\n== INTERNAL (never shown) ==\nfit: ${s3.internal.fit}`);
for (const x of s3.internal.fit_reasons) console.log('  -', x);
console.log('watch outs:'); for (const x of s3.internal.watch_outs) console.log('  -', x);
const briefMs = Date.now() - tBrief;
/* Where the time actually goes. The journey is not the sum of these: the browser starts
 * discovery while the visitor is still answering and starts the brief while they are
 * reading a card, so some of this runs under the visitor's own thinking time. */
const sec = (ms) => (ms / 1000).toFixed(1) + 's';
console.log('\n== WHERE THE TIME GOES ==');
console.log(`  profile (crawl + apollo + evidence + profiler)  ${sec(s1.ms)}`);
console.log(`  discovery (eligibility + propose + validate)    ${sec(s2.ms.discovery)}`);
console.log(`  writing the cards                               ${sec(s2.ms.cards)}`);
console.log(`  the brief + ranking accounts                    ${sec(briefMs)}`);
console.log(`  ------------------------------------------------------`);
console.log(`  server work, start to finish                    ${sec(Date.now() - t0)}`);
console.log(`\ntotal ${Math.round((Date.now() - t0) / 1000)}s`);
