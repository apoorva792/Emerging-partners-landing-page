/* What the company says about itself everywhere except its own services pages: launch
 * posts, partnership announcements, press coverage, conference talks.
 *
 * It exists because the profile kept missing the most important fact about a firm. A
 * services page describes a practice that has been there for years; the thing that decides
 * whether an opportunity is new to them was announced three months ago and lives in a press
 * release. Recommending a firm the agent capability it launched in July is the single worst
 * failure this agent has, and no amount of reading their /services page fixes it.
 *
 * Optional, like Apollo: with no key the profile is built from the crawl alone, exactly as
 * before. Supports whichever of the three providers has a key set, because they are
 * interchangeable here and nobody should have to switch provider by editing code.
 */
import { env } from './env.js';
import { get, strip, titleOf } from './crawl.js';

const PER_PAGE = 3000;
const MAX_PAGES = 6;

/* Targeted rather than broad. A general search for a company name returns its homepage and
 * three directory listings; these ask the questions the profile cannot answer by itself. */
function queries(name, domain) {
  const n = `"${name}"`;
  return [
    `${n} AI agents OR agentic OR automation launch`,
    `${n} partnership OR alliance announcement`,
    `${n} customer OR case study results`,
    `${n} ${new Date().getFullYear()} news`,
  ].map((q) => ({ q, domain }));
}

async function serper(q) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': env.SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, num: 6 }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`serper ${res.status}`);
  const j = await res.json();
  return (j.organic ?? []).map((r) => ({ url: r.link, title: r.title, snippet: r.snippet ?? '' }));
}

async function tavily(q) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.TAVILY_API_KEY}` },
    body: JSON.stringify({ query: q, max_results: 6, search_depth: 'basic' }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`tavily ${res.status}`);
  const j = await res.json();
  /* Tavily returns extracted page text, so those results need no fetch of their own. */
  return (j.results ?? []).map((r) => ({ url: r.url, title: r.title, snippet: r.content ?? '', body: r.raw_content ?? r.content ?? '' }));
}

async function brave(q) {
  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=6`, {
    headers: { Accept: 'application/json', 'X-Subscription-Token': env.BRAVE_API_KEY },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`brave ${res.status}`);
  const j = await res.json();
  return (j.web?.results ?? []).map((r) => ({ url: r.url, title: r.title, snippet: r.description ?? '' }));
}

export function provider() {
  if (env.SERPER_API_KEY) return { name: 'serper', run: serper };
  if (env.TAVILY_API_KEY) return { name: 'tavily', run: tavily };
  if (env.BRAVE_API_KEY) return { name: 'brave', run: brave };
  return null;
}

/* Directories and aggregators describe a company in the words of whoever pays them. They
 * crowd out the company's own announcements and they are never worth a fetch. */
const JUNK = /(linkedin|facebook|twitter|x\.com|instagram|youtube|crunchbase|glassdoor|indeed|zoominfo|rocketreach|apollo\.io|bloomberg|pitchbook|owler|clutch\.co|goodfirms|designrush|tracxn|zaubacorp|dnb\.com|wikipedia)\./i;

export async function searchCompany(name, domain) {
  const p = provider();
  if (!p || !name) return { ok: false, reason: p ? 'no company name' : 'no search key', hits: [], text: '' };

  const t0 = Date.now();
  const batches = await Promise.all(queries(name, domain).map(async ({ q }) => {
    try { return await p.run(q); } catch { return []; }
  }));

  /* One result per URL, and the company's own pages first: a launch post on their site is
   * worth more than the same launch written up by a newswire. */
  const seen = new Set();
  const hits = batches.flat()
    .filter((r) => r.url && !JUNK.test(r.url))
    .filter((r) => (seen.has(r.url) ? false : seen.add(r.url)))
    .sort((a, b) => (b.url.includes(domain) ? 1 : 0) - (a.url.includes(domain) ? 1 : 0))
    .slice(0, MAX_PAGES);

  /* Tavily already carries the text. The others give links, which the crawler's own fetch
   * reads, so a page behind a WAF degrades to its snippet instead of failing the step. */
  const read = await Promise.all(hits.map(async (h) => {
    if (h.body) return { ...h, text: h.body.slice(0, PER_PAGE) };
    try {
      const page = await get(h.url);
      return { ...h, title: h.title || titleOf(page.html), text: strip(page.html).slice(0, PER_PAGE) };
    } catch { return { ...h, text: h.snippet }; }
  }));

  const usable = read.filter((h) => (h.text ?? '').length > 120);
  const text = usable.map((h) => `## WEB: ${h.title}\n${h.url}\n${h.text}`).join('\n\n');
  return { ok: usable.length > 0, provider: p.name, hits: usable.map((h) => ({ url: h.url, title: h.title })), text, ms: Date.now() - t0 };
}
