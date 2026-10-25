/* End-to-end dry run against a real domain, no browser:
 *   node scripts/run.js goml.io
 * Answers the questions with the profiler's own guesses, picks the first card, and uses
 * three placeholder accounts, so it exercises every step the UI will. */
import { step1, step2, step3 } from '../lib/journey.js';

const domain = process.argv[2] || 'goml.io';
const t0 = Date.now();

const s1 = await step1(`hello@${domain}`, domain);
if (!s1.ok) { console.error(s1); process.exit(1); }
console.log(`\n== PROFILE (${Math.round(s1.ms / 1000)}s) ==\n${s1.profile.company.one_line}`);
console.log(`archetype ${s1.profile.archetype.primary} / ${s1.profile.archetype.confidence} | source ${s1.evidence.source_quality}`);

const answers = s1.questions.map((q) => ({ question: q.question, answer: q.guess ?? q.options[0] }));
console.log('\n== ANSWERS ==');
for (const a of answers) console.log(`  ${a.question} -> ${a.answer}`);

const s2 = await step2(s1.profile, answers);
console.log(`\n== CARDS ==\n${s2.opening}`);
for (const c of s2.cards) {
  console.log(`\n  [${c.id}] ${c.headline}`);
  console.log(`   what:  ${c.what_it_is}`);
  console.log(`   you:   ${c.why_you}`);
  console.log(`   buys:  ${c.who_buys}`);
  console.log(`   deliv: ${c.delivery} | ${c.lyzr_products.join(', ')}`);
  console.log(`   proof: ${c.proof.customer} — ${c.proof.result}\n          ${c.proof.url}`);
  console.log(`   first: ${c.first_step}`);
}
console.log(`\n  passed over: ${s2.not_recommended.id} — ${s2.not_recommended.why}`);

const accounts = [
  { name: 'Acme Insurance', strength: 'champion', note: 'COO is a former colleague' },
  { name: 'Northwind Logistics', strength: 'warm', note: '' },
  { name: 'Rivera Health', strength: 'dormant', note: 'worked with them in 2023' },
];
const s3 = await step3({ profile: s1.profile, answers, chosen: s2.cards[0], cards: s2.cards, accounts, skipped: false });
const a = s3.assessment;
console.log(`\n== ASSESSMENT ==\n"${a.headline}"`);
for (const k of ['company_overview', 'recommended_services', 'customer_map', 'starting_point', 'next_steps']) {
  console.log(`\n--- ${k}\n${a[k]}`);
}
console.log(`\nassumptions:`); for (const x of a.assumptions) console.log('  -', x);
console.log(`\n== INTERNAL (never shown) ==\nfit: ${s3.internal.fit}`);
for (const x of s3.internal.fit_reasons) console.log('  -', x);
console.log('watch outs:'); for (const x of s3.internal.watch_outs) console.log('  -', x);
console.log(`open with: "${s3.internal.opening_line}"`);
console.log(`\ntotal ${Math.round((Date.now() - t0) / 1000)}s`);
