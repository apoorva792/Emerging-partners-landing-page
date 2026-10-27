/* One more look, for the candidate that is worth it.
 *
 * A firm's site does not always carry its best work. A capability can be real and sit in
 * a press release, a partner directory listing or a conference write-up instead. So when
 * a commercially strong candidate fails the evidence gate, we go and look for the missing
 * engagement specifically, rather than crawling more of the site and hoping.
 *
 * Bounded hard: this runs inside a step the visitor is waiting on. Two candidates, one
 * search each, three pages read, and everything cached for the life of the process. */

import { provider } from './search.js';
import { get, strip, titleOf } from './crawl.js';
import { readRecord } from './evidence.js';

const MAX_LOOKUPS = 2;
const PAGES_PER_LOOKUP = 3;
const cache = new Map();

const JUNK = /(linkedin|facebook|twitter|x\.com|instagram|youtube|crunchbase|glassdoor|indeed|zoominfo|rocketreach|apollo\.io|pitchbook|owler|clutch\.co|goodfirms|designrush|tracxn|zaubacorp|dnb\.com|wikipedia)\./i;

/* What we are actually missing: the firm's name plus the work we could not evidence. Two
 * phrasings, because "case study" finds the write-ups and the plain form finds the
 * announcements. */
const queriesFor = (name, opp) => [
  `"${name}" ${opp.work} case study OR project OR implementation`,
  `"${name}" ${opp.function} ${opp.work}`,
];

async function lookup(name, domain, opp) {
  const p = provider();
  if (!p) return [];
  const key = `${domain}|${opp.function}|${opp.work}`.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const run = (async () => {
    const batches = await Promise.all(queriesFor(name, opp).map(async (q) => {
      try { return await p.run(q); } catch { return []; }
    }));
    const seen = new Set();
    const hits = batches.flat()
      .filter((r) => r.url && !JUNK.test(r.url))
      .filter((r) => (seen.has(r.url) ? false : seen.add(r.url)))
      /* Their own pages first: a write-up on their site is evidence, the same project
       * described by a newswire is a mention of it. */
      .sort((a, b) => (b.url.includes(domain) ? 1 : 0) - (a.url.includes(domain) ? 1 : 0))
      .slice(0, PAGES_PER_LOOKUP);

    const pages = (await Promise.all(hits.map(async (h) => {
      if (h.body) return { kind: 'work', url: h.url, title: h.title, text: h.body.slice(0, 4000) };
      try {
        const page = await get(h.url, 8000);
        return { kind: 'work', url: h.url, title: h.title || titleOf(page.html), text: strip(page.html).slice(0, 4000) };
      } catch { return null; }
    }))).filter((x) => x && x.text.length > 400);

    const settled = await Promise.allSettled(pages.map((pg) => readRecord(pg)));
    return settled.filter((s) => s.status === 'fulfilled').map((s) => s.value)
      /* Only a grounded engagement counts. The whole point of the second look is to find
       * evidence, so a page that yields another marketing claim has found nothing. */
      .filter((r) => r.classification === 'delivered' && r.grounded);
  })();

  cache.set(key, run);
  return run;
}

/* Runs the lookups for the candidates worth one, and returns the new evidence records
 * with ids that continue the existing numbering, so a citation still means one thing. */
export async function research(company, candidates, existing) {
  const name = company?.name;
  const domain = company?.domain ?? '';
  if (!name || !candidates.length) return { records: [], ms: 0, looked: 0 };

  const t0 = Date.now();
  const picked = candidates.slice(0, MAX_LOOKUPS);
  const found = (await Promise.all(picked.map((c) => lookup(name, domain, c.opp).catch(() => [])))).flat();

  /* The same page can come back for two candidates, and a page the crawl already read is
   * not new evidence. */
  const have = new Set((existing ?? []).map((e) => e.url));
  const fresh = [];
  for (const r of found) {
    if (have.has(r.url)) continue;
    have.add(r.url);
    fresh.push(r);
  }

  let n = (existing ?? []).length;
  const records = fresh.map((r) => ({
    id: `E${++n}`,
    what: r.headline,
    client: r.client || r.client_descriptor || 'not named',
    industry: r.industry,
    function: r.function,
    problem: r.problem,
    work: r.work,
    stack: r.stack,
    outcomes: r.outcomes,
    grounded: true,
    url: r.url,
    found_by: 'search',
  }));

  return { records, ms: Date.now() - t0, looked: picked.length };
}
