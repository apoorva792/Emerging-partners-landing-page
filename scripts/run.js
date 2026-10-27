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

console.log(`\n== QUALITY: ${s2.quality.issues.length} issues, ${s2.quality.blocking} blocking${s2.quality.degraded ? ' DEGRADED' : ''} ==`);
for (const i of s2.quality.issues) console.log(`  [${i.severity}] ${i.check}: ${i.detail}`);
console.log('\n== PASSED OVER ==');
for (const n of s2.not_recommended ?? []) console.log(`  ${n.score} ${n.headline}\n      ${n.why.join('; ')}`);

const accounts = [
  { name: 'Acme Insurance', strength: 'Champion inside' },
  { name: 'Northwind Logistics', strength: 'Warm' },
  { name: 'Rivera Health', strength: 'Dormant' },
];
const [s3, ranked] = await Promise.all([
  step3({ profile: s1.profile, answers, chosen: [s2.cards[0]], cards: s2.cards }),
  rankAccounts(s1.profile, s2.cards[0], accounts),
]);
const b = s3.brief;
console.log(`\n== BRIEF ==\n"${b.headline}"\n${b.the_case}`);
console.log(`\nyou today: ${b.you_today.join(' · ')}`);
console.log('why lyzr:'); for (const r of b.why_lyzr) console.log(`  ${r.you_have} -> ${r.lyzr_adds}`);
console.log(`ask: ${b.the_ask}`);
console.log(`accounts: ${ranked.map((r) => r.account).join(', ')}`);

console.log(`\n== INTERNAL (never shown) ==\nfit: ${s3.internal.fit}`);
for (const x of s3.internal.fit_reasons) console.log('  -', x);
console.log('watch outs:'); for (const x of s3.internal.watch_outs) console.log('  -', x);
console.log(`\ntotal ${Math.round((Date.now() - t0) / 1000)}s`);
