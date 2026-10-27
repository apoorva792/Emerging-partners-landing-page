/* Small, polite crawl: the home page plus the handful of pages that actually say what a
 * services firm sells. We are not indexing the site — we want roughly 20k characters of
 * the right pages, fast enough that the visitor watches it happen. */

const WANT = [
  [/what-we-do|services|solutions|offerings|capabilit|expertise|practice/i, 'services'],
  /* What they have already built. A firm that ships its own agents says so on a product
   * page, and reading past it is how we end up recommending them their own roadmap. */
  [/product|platform|accelerator|app(s)?\/|tool(s)?\//i, 'products'],
  [/industr|sector|verticals|markets/i, 'industries'],
  [/case-stud|case_stud|customers|clients|our-work|portfolio|success/i, 'clients'],
  [/about|who-we-are|company|team|leadership/i, 'about'],
  [/partner|alliance|technolog/i, 'partners'],
];
/* The one kind of post worth reading. A launch or a partnership announcement is the most
 * recent thing a company has said about itself, and it is the thing least likely to be on
 * a services page. Everything else under /blog stays skipped. */
const ANNOUNCE = /\/(blog|news|press|insights|media|resources)\//i;
const ANNOUNCE_TOPIC = /(\bai\b|agent|agentic|automat|copilot|llm|genai|launch|announc|partner|alliance|acquir)/i;
const isAnnouncement = (path) => ANNOUNCE.test(path) && ANNOUNCE_TOPIC.test(path);
const SKIP = /\.(pdf|jpe?g|png|gif|svg|zip|mp4|webp|ico|css|js)(\?|$)|\/(blog|news|careers|jobs|privacy|terms|cookie|legal|login|contact)\b|mailto:|tel:|#/i;
const MAX_PAGES = 13;
const PER_PAGE = 3500;

const strip = (html) => html
  .replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<\/(p|div|li|h[1-6]|tr|section)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'")
  .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&[a-z]+;/gi, ' ')
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();

const titleOf = (html) => (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim().slice(0, 120);

async function get(url) {
  const res = await fetch(url, {
    headers: {
      /* A real browser UA: plenty of corporate sites 403 an unknown agent. Sites behind a
       * JS challenge (Sucuri, Cloudflare) still refuse us, and we let them — Apollo covers
       * that case and the profile says plainly that the site could not be read. */
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) throw new Error(`${res.status}`);
  return { html: await res.text(), url: res.url };
}

export { get, strip, titleOf };

export async function crawl(site) {
  const start = site.startsWith('http') ? site : `https://${site}`;
  const pages = [];
  const errors = [];

  let home;
  try {
    home = await get(start);
  } catch {
    try { home = await get(start.replace('https://', 'https://www.')); }
    catch (e) { return { ok: false, pages: [], errors: [`could not reach ${site}: ${e.message}`], text: '' }; }
  }
  const origin = new URL(home.url).origin;
  pages.push({ kind: 'home', url: home.url, title: titleOf(home.html), text: strip(home.html).slice(0, PER_PAGE) });

  /* Pick one best link per kind, in the order the kinds are listed: a firm that has a
   * services page and a case-studies page tells us more than five pages about itself. */
  const links = [...home.html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1])
    .filter((h) => isAnnouncement(h) || !SKIP.test(h))
    .map((h) => { try { return new URL(h, home.url).href; } catch { return null; } })
    .filter((h) => h && h.startsWith(origin) && h !== home.url);

  const chosen = [];
  /* Two of these, because one launch post is an anecdote and two are a direction. They are
   * taken before the category pages so a long nav cannot crowd them out. */
  for (const href of links) {
    if (chosen.length >= 2) break;
    if (chosen.some((c) => c.href === href)) continue;
    if (isAnnouncement(new URL(href).pathname)) chosen.push({ href, kind: 'announcement' });
  }
  for (const [re, kind] of WANT) {
    for (const href of links) {
      if (chosen.length >= MAX_PAGES - 1) break;
      if (chosen.some((c) => c.href === href)) continue;
      if (re.test(new URL(href).pathname)) { chosen.push({ href, kind }); break; }
    }
  }
  /* Then top up with whatever else is on the main nav, shortest paths first — those are
   * the pages the company itself considers important. */
  for (const href of [...new Set(links)].sort((a, b) => a.length - b.length)) {
    if (chosen.length >= MAX_PAGES - 1) break;
    if (SKIP.test(href)) continue;
    if (!chosen.some((c) => c.href === href)) chosen.push({ href, kind: 'page' });
  }

  const got = await Promise.all(chosen.map(async ({ href, kind }) => {
    try {
      const p = await get(href);
      return { kind, url: p.url, title: titleOf(p.html), text: strip(p.html).slice(0, PER_PAGE) };
    } catch (e) { errors.push(`${href}: ${e.message}`); return null; }
  }));
  pages.push(...got.filter(Boolean).filter((p) => p.text.length > 200));

  const text = pages.map((p) => `## ${p.kind.toUpperCase()}: ${p.title}\n${p.url}\n${p.text}`).join('\n\n');
  return { ok: pages.length > 0, pages, errors, text };
}
