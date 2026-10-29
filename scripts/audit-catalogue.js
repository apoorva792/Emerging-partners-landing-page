/* What the agent knows about Lyzr, and what it is missing.
 *
 *   node scripts/audit-catalogue.js            # the report
 *   node scripts/audit-catalogue.js --live     # also check every source URL still resolves
 *
 * The agent can only recommend what is in the catalogue, and the catalogue can only hold
 * what is in data/resources.json, which is a list somebody wrote by hand. That makes the
 * list the ceiling on the whole product, and nothing until now has said what is on it.
 *
 * This reports rather than fixes. Adding a source is a decision: more records is not the
 * same as better recommendations, and a page that is not really a thing a partner can sell
 * is one more way for the agent to recommend something weak.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../lib/env.js';

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', f), 'utf8'));
const args = new Set(process.argv.slice(2));
const resources = read('resources.json').resources;
const records = read('catalog.json').records;
const solutions = read('solution-offerings.json').offerings;
const products = read('partner-offerings.json').offerings;
const cat = Object.values(records);

const line = (s = '') => console.log(s);
const head = (s) => { line(); line(`== ${s} ==`); };

head('WHAT IS IN THE CATALOGUE');
line(`sources listed in resources.json : ${resources.length}`);
line(`records built from them          : ${cat.length}`);
const byKind = {};
for (const r of cat) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
line(`  by kind                        : ${JSON.stringify(byKind)}`);
line(`hand-written products            : ${products.length}`);
line(`packaged records                 : ${solutions.length}`);

head('CAN IT BE SOLD? (the licence question)');
const status = {};
for (const s of solutions) status[s.product_mapping_status] = (status[s.product_mapping_status] ?? 0) + 1;
line(JSON.stringify(status, null, 1));
const unmapped = solutions.filter((s) => s.product_mapping_status === 'needs_review');
line(`\n${unmapped.length} records name no Lyzr product, so they can give a recommendation`);
line('context but can never be one. Either a product belongs under them, or they are');
line('collateral rather than an offering:');
for (const s of unmapped) line(`   ${s.name}${s.industry ? `  [${s.industry}]` : ''}`);

head('PRODUCTS WITH NOTHING BEHIND THEM');
/* A product a partner cannot be shown any evidence for is a harder sell than one with a
 * customer story, and we should know which is which. */
const haystack = cat.map((r) => `${r.title} ${r.sellable_as ?? ''} ${(r.built ?? []).join(' ')}`.toLowerCase()).join('\n');
for (const p of products) {
  const named = haystack.includes(p.name.toLowerCase().replace(/^lyzr /, ''));
  const res = (p.resources ?? []).length;
  if (!named || !res) line(`   ${p.name.padEnd(18)} evidence in catalogue: ${named ? 'yes' : 'NONE'} · resources attached: ${res}`);
}

head('DUPLICATES AND DEAD SOURCES');
const seenUrl = new Map();
for (const r of resources) {
  const u = (r.url ?? '').replace(/\/$/, '');
  if (seenUrl.has(u)) line(`   duplicate URL: ${r.title}  ==  ${seenUrl.get(u)}`);
  else seenUrl.set(u, r.title);
}
const noRecord = resources.filter((r) => !records[r.id]);
line(`   sources that produced no record: ${noRecord.length}`);
for (const r of noRecord.slice(0, 12)) line(`      ${r.type.padEnd(14)} ${r.title}`);
if (noRecord.length > 12) line(`      … and ${noRecord.length - 12} more`);

head('WHAT THE SITE HAS THAT WE DO NOT');
const known = new Set([...resources.map((r) => (r.url ?? '').replace(/\/$/, ''))]);
const maps = ['page-sitemap.xml', 'case-studies-sitemap.xml', 'blueprints-sitemap1.xml', 'blueprints-sitemap2.xml', 'template-sitemap.xml'];
const missing = [];
for (const m of maps) {
  try {
    const xml = await (await fetch(`https://www.lyzr.ai/${m}`, { signal: AbortSignal.timeout(20_000) })).text();
    for (const u of [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1].replace(/\/$/, ''))) {
      if (!known.has(u)) missing.push(u);
    }
  } catch { line(`   (could not read ${m})`); }
}
const section = {};
for (const u of missing) {
  const s = u.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean)[0] ?? '(root)';
  section[s] = (section[s] ?? 0) + 1;
}
line(`   ${missing.length} live pages are not on our list, by section:`);
for (const [k, v] of Object.entries(section).sort((a, b) => b[1] - a[1]).slice(0, 14)) {
  line(`      ${String(v).padStart(4)}  /${k}/`);
}
line('\n   Note: /ai-agents/ is live and in no sitemap, so it cannot be found this way.');
line('   Those URLs are in the Leia chat agent\'s knowledge bases, which crawled them.');

if (args.has('--live')) {
  head('DEAD LINKS');
  let dead = 0;
  await Promise.all(resources.map(async (r) => {
    try {
      const res = await fetch(r.url, { method: 'HEAD', signal: AbortSignal.timeout(15_000) });
      if (!res.ok) { line(`   ${res.status}  ${r.title}  ${r.url}`); dead++; }
    } catch { line(`   ERR  ${r.title}  ${r.url}`); dead++; }
  }));
  line(`   ${dead} of ${resources.length} sources did not resolve`);
}

line('\nNothing was changed. Adding a source is a decision.');
