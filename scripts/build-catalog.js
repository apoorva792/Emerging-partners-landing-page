/* Builds data/catalog.json: what Lyzr has actually delivered, one record per customer
 * story, read off the story pages themselves.
 *
 *   node scripts/build-catalog.js            # everything missing
 *   node scripts/build-catalog.js --force    # re-read everything
 *   node scripts/build-catalog.js --limit=5  # a sample, for checking the shape
 *
 * This is the engine's evidence base. The opportunity step reads it instead of a fixed
 * list of service lines, so a partner is shown work we have really done rather than work
 * somebody wrote down once. Slow and offline on purpose: it runs when the catalog changes,
 * never in a visitor's journey.
 */
import fs from 'node:fs';
import path from 'node:path';
import { get, strip } from '../lib/crawl.js';
import { ask } from '../lib/studio.js';
import { ROOT_DIR } from '../lib/env.js';

const OUT = path.join(ROOT_DIR, 'data', 'catalog.json');
const SRC = path.join(ROOT_DIR, 'data', 'resources.json');
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const CONCURRENCY = 6;

/* The scrape carries the whole site chrome: a mega-menu of every product and industry
 * above the story, and the footer's link farm below it. Fed in whole, the extractor reads
 * the menu as the customer's systems. So the body is cut out by its own landmarks. */
const OPEN = /\b(the challenge|the problem|problem statement|about the (client|customer|company)|overview)\b/i;
const CLOSE = /\b(more stories|similar case studies|share this|join \d|subscribe)\b/i;
function body(text) {
  const o = text.search(OPEN);
  const start = o > -1 ? Math.max(0, o - 400) : Math.floor(text.length * 0.3);
  const rest = text.slice(start);
  const c = rest.search(CLOSE);
  return (c > 400 ? rest.slice(0, c) : rest).slice(0, 7000).trim();
}

const resources = JSON.parse(fs.readFileSync(SRC, 'utf8')).resources;
/* The catalog lists a few index pages as stories: the case study listing, the wall of
 * love, the about page. They read as a story and extract as mush, so they never become
 * records. */
const INDEX_PAGE = /^story_(case_studies|customers|wall_of_love|about_us|lyzr_analyst_recognition)$/;
const stories = resources.filter((r) => (r.type === 'case_study' || r.type === 'story') && r.url && !INDEX_PAGE.test(r.id));
const existing = args.force ? {} : (fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).records : {});
let todo = stories.filter((r) => !existing[r.id]);
if (args.limit) todo = todo.slice(0, Number(args.limit));

console.log(`${stories.length} customer stories, ${Object.keys(existing).length} already read, ${todo.length} to do`);

const records = { ...existing };
const failed = [];
let done = 0;

async function one(r) {
  try {
    const { html } = await get(r.url);
    const text = body(strip(html));
    if (text.length < 400) throw new Error(`page gave only ${text.length} characters`);
    const out = await ask('partner_catalog', [
      `# Customer story: ${r.title}`, '', text,
    ].join('\n'));
    records[r.id] = {
      id: r.id,
      title: r.title,
      url: r.url,
      topics: r.topics ?? [],
      headline_result: r.blurb ?? '',
      ...out,
    };
    console.log(`  ${String(++done).padStart(3)}/${todo.length}  ${out.confidence.padEnd(4)} ${out.sellable_as.slice(0, 68)}`);
  } catch (e) {
    failed.push({ id: r.id, url: r.url, error: e.message });
    console.log(`  ${String(++done).padStart(3)}/${todo.length}  FAIL ${r.id}: ${e.message.slice(0, 60)}`);
  }
}

/* A fixed number of workers rather than a Promise.all over sixty: the crawl is polite and
 * the inference endpoint is shared with the live journey. */
const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  for (let r = queue.shift(); r; r = queue.shift()) await one(r);
}));

fs.writeFileSync(OUT, JSON.stringify({ built: new Date().toISOString(), records }, null, 1) + '\n');
const all = Object.values(records);
console.log(`\nwrote ${path.relative(ROOT_DIR, OUT)}: ${all.length} records, ${all.filter((x) => x.confidence === 'high').length} high confidence`);
if (failed.length) console.log(`${failed.length} failed:\n` + failed.map((f) => `  ${f.id}: ${f.error}`).join('\n'));
