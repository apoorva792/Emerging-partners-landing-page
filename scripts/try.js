/* node scripts/try.js <domain> [<domain>...] — profiles several companies and prints a digest. */
import { buildProfile } from '../lib/profile.js';
const out = await Promise.all(process.argv.slice(2).map(async (d) => {
  try { return [d, await buildProfile(`hello@${d}`, d)]; } catch (e) { return [d, { ok: false, reason: e.message }]; }
}));
for (const [d, r] of out) {
  if (!r.ok) { console.log(`\n### ${d}\n  FAILED: ${r.reason}`); continue; }
  const p = r.profile;
  console.log(`\n### ${d}  (${Math.round(r.ms / 1000)}s, ${r.evidence.pages.length} pages, apollo:${r.evidence.apollo_org ? 'y' : 'n'})`);
  console.log(`  ${p.company.one_line}`);
  console.log(`  archetype: ${p.archetype.primary} (${p.archetype.confidence})${p.archetype.secondary.length ? ' + ' + p.archetype.secondary.join(', ') : ''}`);
  console.log(`  sells:     ${p.services.map((s) => s.name).join(' · ')}`);
  console.log(`  to:        ${p.customer_type} in ${p.industries.map((i) => i.name).join(', ')}`);
  console.log(`  clients:   ${p.named_clients.map((c) => c.name).join(', ') || '—'}`);
  console.log(`  delivery:  ${p.delivery_capability.verdict}`);
  console.log(`  asks:      ${p.confirm.map((c) => c.question).join('  ')}`);
}
