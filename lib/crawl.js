/* Two-stage crawl. Stage one reads the home page and the section pages a services firm
 * links from its nav. Stage two follows the links those pages carry into the individual
 * pieces of delivered work, which is where the only hard evidence on most sites lives.
 *
 * The first version took one page per category, so a firm with nine case studies gave us
 * a truncated index page and nothing else: the model then had service-category nav text
 * to reason from and guessed. Pages are chosen on what they turn out to contain, not on
 * the words in their URL, and the budget goes to the dense ones. */

const SKIP = /\.(pdf|jpe?g|png|gif|svg|zip|mp4|webm|webp|ico|css|js|xml|json)(\?|$)|\/(careers?|jobs?|contact|privacy|terms|cookie|legal|login|signin|sign-up|register|cart|checkout|search|sitemap|tag|author|category|events?|webinars?|podcast|ebooks?|whitepapers?|downloads?|subscribe|unsubscribe)\b|mailto:|tel:|^javascript:/i;

/* The sections worth opening from the nav, and how much they are usually worth. Anchor
 * text counts as much as the path: plenty of sites route case studies through /work or
 * /impact, and plenty of /solutions pages are a sales deck with nothing in them. */
const SECTIONS = [
  { kind: 'clients', p: /case-stud|case_stud|customer-stor|success-stor|our-work|portfolio|projects?|clients?|references?|showcase|impact/i, a: /case stud|success stor|our work|client stor|portfolio|projects/i, w: 10 },
  { kind: 'services', p: /what-we-do|services|solutions|offerings|capabilit|expertise|practice/i, a: /what we do|services|solutions|capabilit|expertise/i, w: 7 },
  { kind: 'products', p: /product|platform|accelerator|framework|toolkit|app(s)?\/|tool(s)?\//i, a: /product|platform|accelerator|framework/i, w: 7 },
  { kind: 'industries', p: /industr|sector|vertical|markets/i, a: /industr|sector|vertical/i, w: 5 },
  { kind: 'partners', p: /partner|alliance/i, a: /partner|alliance/i, w: 4 },
  { kind: 'about', p: /about|who-we-are|company|team|leadership/i, a: /about|who we are|company/i, w: 3 },
];

/* The one kind of post worth reading. A launch or a partnership announcement is the most
 * recent thing a company has said about itself, and the thing least likely to be on a
 * services page. Everything else under /blog stays skipped. */
const FEED = /\/(blog|news|press|insights|media|resources|articles?)\//i;
const FEED_TOPIC = /(\bai\b|agent|agentic|automat|copilot|llm|genai|launch|announc|partner|alliance|acquir|certif|award)/i;
const isAnnouncement = (path) => FEED.test(path) && FEED_TOPIC.test(path);

/* A two letter language code at the root is a translation of a page we already have. */
const LOCALE = /^\/(es|de|fr|pt|it|ja|zh|ko|nl|ru|ar|hi|pl|tr|sv|da|no|fi|cs|el|he|th|vi|id)\//i;

/* What a page has to contain before it counts as evidence of delivered work rather than a
 * description of what a firm would like to be hired for. */
const DELIVERED = /\b(engaged|partnered with|worked with|we (built|implemented|migrated|deployed|delivered|developed|automated|integrated|rolled out)|was (built|implemented|migrated|deployed|delivered)|were (built|implemented|migrated|deployed)|the client|the customer|our client|challenge|solution|results?|outcomes?|before|after)\b/i;
const OUTCOME = /\b\d[\d,.]*\s*(%|percent|x\b|hours?|days?|weeks?|months?|fte|tickets?|orders?|users?|million|billion|k\b)/i;
/* Proper nouns a services firm only writes down when it has actually touched the thing.
 * Generic enough to carry across stacks, specific enough that a marketing page about
 * "digital transformation" scores nothing. */
const STACK = /\b(SAP|S\/4|HANA|BTP|Ariba|SuccessFactors|ServiceNow|Salesforce|Workday|NetSuite|Dynamics|Oracle|EBS|Infor|Epicor|PeopleSoft|Sterling|webMethods|MuleSoft|Boomi|Informatica|Kafka|Snowflake|Databricks|Redshift|BigQuery|AWS|Bedrock|SageMaker|Azure|OpenAI|Anthropic|Vertex|GCP|Kubernetes|Terraform|SAP PI|PO|IDoc|EDI|API|RPA|UiPath|Automation Anywhere|Power Platform|SharePoint|Zendesk|HubSpot|Shopify|Magento|Sitecore|Adobe|Twilio|Splunk|Datadog|Tableau|Power BI|Qlik|Jira|GitHub|GitLab)\b/g;

const MAX_PAGES = 24;
/* The ceiling on what we hold per page before the furniture pass. */
const RAW_CHARS = 20_000;
const DEADLINE = 14_000;
const WORKERS = 8;

const strip = (html) => html
  .replace(/<(script|style|noscript|svg|head|nav|footer)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<\/(p|div|li|h[1-6]|tr|section)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'")
  .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&[a-z]+;/gi, ' ')
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();

/* One page can be reached by several URLs, and a nav link to /home redirects onto the
 * home page we already have. Compared after the fetch as well as before it, because the
 * redirect is only visible once the response is in. */
const norm = (u) => { try { const x = new URL(u); return (x.origin + x.pathname).replace(/\/+$/, '').toLowerCase(); } catch { return u; } };

const titleOf = (html) => (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim().slice(0, 120);

/* Most sites repeat the whole nav and footer inside the body, which on a short page is
 * most of what we read. Any line that appears on three or more pages is furniture. */
function dropFurniture(pages) {
  const seen = new Map();
  for (const p of pages) {
    for (const line of new Set(p.text.split('\n'))) {
      const k = line.trim();
      if (k.length > 2 && k.length < 90) seen.set(k, (seen.get(k) ?? 0) + 1);
    }
  }
  const limit = Math.max(3, Math.ceil(pages.length * 0.4));
  for (const p of pages) {
    p.text = p.text.split('\n').filter((l) => (seen.get(l.trim()) ?? 0) < limit).join('\n').trim();
  }
  return pages;
}

async function get(url, ms = 12_000) {
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
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) throw new Error(`${res.status}`);
  return { html: await res.text(), url: res.url };
}

/* Paths the site asks crawlers to leave alone. One request, short timeout, and a failure
 * means no restriction rather than no crawl: a missing robots.txt is the normal case. */
async function disallowed(origin) {
  try {
    const res = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return [];
    const lines = (await res.text()).split('\n').map((l) => l.replace(/#.*/, '').trim());
    const rules = [];
    let mine = false;
    for (const line of lines) {
      const [k, ...rest] = line.split(':');
      const v = rest.join(':').trim();
      if (/^user-agent$/i.test(k)) mine = v === '*';
      else if (mine && /^disallow$/i.test(k) && v) rules.push(v);
    }
    return rules;
  } catch { return []; }
}

/* Anchor text, not just the href: /impact and /our-work say nothing in the path. */
function linksWithText(html, base) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi)) {
    let href;
    try { href = new URL(m[1], base).href; } catch { continue; }
    out.push({ href, text: strip(m[2]).slice(0, 120) });
  }
  /* Some templates render cards as a bare href with the title in a sibling node. Those
   * links still matter, so take them with empty anchor text rather than dropping them. */
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) {
    try { const href = new URL(m[1], base).href; if (!out.some((l) => l.href === href)) out.push({ href, text: '' }); }
    catch { /* not a URL */ }
  }
  return out;
}

/* How much a fetched page is worth keeping, from what it actually says. This is the part
 * that replaces trusting the URL: a /solutions page full of delivery detail outranks a
 * /case-studies index that is nine teasers and a nav. */
function classify(page) {
  const t = page.text;
  const n = t.length;
  if (n < 350) return { kind: page.kind, density: 0, stack: [] };
  const stack = [...new Set((t.match(STACK) ?? []).map((s) => s.trim()))];
  const per = (re) => (t.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) ?? []).length;
  const delivered = per(DELIVERED);
  const outcomes = per(OUTCOME);
  /* Per thousand characters, so a long page does not win on length alone. */
  const k = n / 1000;
  const density = Math.round(((delivered * 2 + outcomes * 4 + stack.length * 3) / Math.max(1, k)) * 10) / 10;
  /* An index page lists work; a story tells one. The tell is how many internal links it
   * carries relative to its text. */
  const kind = page.kind === 'work' && page.links > 12 && n / page.links < 180 ? 'clients' : page.kind;
  return { kind, density, stack };
}

export { get, strip, titleOf };

export async function crawl(site) {
  const start = site.startsWith('http') ? site : `https://${site}`;
  const t0 = Date.now();
  const errors = [];
  const left = () => DEADLINE - (Date.now() - t0);

  let home;
  try {
    home = await get(start);
  } catch {
    try { home = await get(start.replace('https://', 'https://www.')); }
    catch (e) { return { ok: false, pages: [], errors: [`could not reach ${site}: ${e.message}`], text: '' }; }
  }
  const origin = new URL(home.url).origin;
  const deny = await disallowed(origin);
  const seen = new Set([norm(home.url)]);
  const allowed = (href) => {
    if (!href.startsWith(origin) || seen.has(norm(href)) || SKIP.test(href)) return false;
    const path = new URL(href).pathname;
    if (deny.some((d) => path.startsWith(d))) return false;
    return true;
  };

  /* Fetch a batch with a cap on how many are in flight, so a site with twenty candidate
   * pages is not hit twenty times at once. */
  async function fetchAll(targets) {
    const out = [];
    const queue = [...targets];
    await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, async () => {
      while (queue.length && left() > 1500) {
        const { href, kind } = queue.shift();
        try {
          const p = await get(href, Math.min(9000, Math.max(2500, left())));
          out.push({
            /* The whole page, trimmed to a sane ceiling rather than to the per page
             * budget. The budget is applied at the end, after the furniture has gone:
             * cutting first meant that on a site with a large mega menu we kept four
             * thousand characters of navigation, deleted it as furniture, and were left
             * with nine hundred characters of nothing on every page. */
            kind, url: p.url, title: titleOf(p.html), text: strip(p.html).slice(0, RAW_CHARS),
            links: linksWithText(p.html, p.url).filter((l) => l.href.startsWith(origin)).length,
            html: p.html,
          });
        } catch (e) { errors.push(`${href}: ${e.message}`); }
      }
    }));
    return out;
  }

  /* ---- stage one: the home page and the sections it links to ---- */
  const navLinks = linksWithText(home.html, home.url);
  const stageOne = [];
  const take = (href, kind) => { if (allowed(href)) { seen.add(norm(href)); stageOne.push({ href, kind }); } };

  /* Two announcements, because one launch post is an anecdote and two are a direction.
   * Taken first so a long nav cannot crowd them out. */
  let posts = 0;
  for (const l of navLinks) {
    if (posts >= 2) break;
    if (allowed(l.href) && isAnnouncement(new URL(l.href).pathname)) { take(l.href, 'announcement'); posts++; }
  }
  /* Up to two pages per section rather than one: a firm often splits its delivery story
   * across /services and /solutions, and the second page is where the detail sits. */
  for (const s of SECTIONS) {
    let n = 0;
    for (const l of navLinks) {
      if (n >= 2 || stageOne.length >= 11) break;
      const path = new URL(l.href).pathname;
      if (!allowed(l.href)) continue;
      if (s.p.test(path) || (l.text && s.a.test(l.text))) { take(l.href, s.kind); n++; }
    }
  }
  /* Then top up with whatever else is on the nav, shortest paths first: those are the
   * pages the company itself considers important. */
  for (const l of [...navLinks].sort((a, b) => a.href.length - b.href.length)) {
    if (stageOne.length >= 11) break;
    take(l.href, 'page');
  }

  const first = await fetchAll(stageOne);

  /* ---- stage two: follow the section pages into the individual pieces of work ---- */
  /* Every link carried by a stage-one page that looks like one item rather than another
   * index: deeper than the page that pointed at it, or sitting under it. Anchor text that
   * reads like a story title counts too, since Webflow and friends render case study
   * cards as a bare link with the title inside. */
  const hubs = first.filter((p) => ['clients', 'services', 'products', 'industries'].includes(p.kind));
  const leads = new Map();
  for (const hub of hubs) {
    const weight = hub.kind === 'clients' ? 10 : 4;
    for (const l of linksWithText(hub.html, hub.url)) {
      if (!allowed(l.href)) continue;
      const path = new URL(l.href).pathname;
      /* One item, not another listing: a real path with some length to it, and not one of
       * the section pages we already have. */
      if (path.length < 8 || first.some((p) => norm(p.url) === norm(l.href))) continue;
      /* A hub page's sidebar is mostly its own blog. Those posts are articles about the
       * subject, not records of work done, and on a content-heavy site they crowd out the
       * handful of pages that are. Only a launch or partnership post earns a slot, and
       * stage one has already taken two of those. */
      if (FEED.test(path) && !isAnnouncement(path)) continue;
      /* The same page in another language is the same page. */
      if (LOCALE.test(path)) continue;
      const words = path.split(/[/\-_]/).filter(Boolean).length;
      if (words < 3) continue;
      const bonus = (DELIVERED.test(l.text) ? 2 : 0) + (STACK.test(l.text) ? 3 : 0) + Math.min(3, words - 3)
        /* A path that says outright that it is one piece of work beats one that happens
         * to be long. Sites that keep their case studies in a folder say so. */
        + (/case-stud|customer-stor|success-stor|our-work|portfolio|\/projects?\//i.test(path) ? 6 : 0);
      leads.set(l.href, Math.max(leads.get(l.href) ?? 0, weight + bonus));
    }
  }
  const room = Math.max(0, MAX_PAGES - 1 - first.length);
  const stageTwo = [...leads.entries()].sort((a, b) => b[1] - a[1]).slice(0, room)
    .map(([href]) => { seen.add(norm(href)); return { href, kind: 'work' }; });
  const second = stageTwo.length && left() > 2500 ? await fetchAll(stageTwo) : [];

  /* ---- keep what turned out to be worth keeping ---- */
  const homePage = { kind: 'home', url: home.url, title: titleOf(home.html), text: strip(home.html).slice(0, RAW_CHARS), links: navLinks.length, html: home.html };
  const all = [homePage, ...first, ...second];
  /* Furniture first, then classify: a page's density is a property of what it says, and
   * the nav it shares with every other page is not what it says. */
  dropFurniture(all);
  for (const p of all) Object.assign(p, classify(p));
  for (const p of all) delete p.html;

  /* The home page always stays. Everything else earns its place on what it contains, and
   * a page that survived the fetch but says nothing is noise in the model's context. */
  /* A redirect can land two fetches on the same page, and the second is pure duplication
   * in the model's context. */
  const once = new Map();
  for (const p of all.slice(1)) if (!once.has(norm(p.url)) && norm(p.url) !== norm(home.url)) once.set(norm(p.url), p);
  const rest = [...once.values()]
    .filter((p) => p.text.length > 250)
    .sort((a, b) => (b.density + (b.kind === 'work' ? 6 : 0)) - (a.density + (a.kind === 'work' ? 6 : 0)));
  /* Dense pages get the long read, thin ones a paragraph. The total is what the profiler
   * can hold without the delivered work being buried in service-page prose. */
  const pages = [homePage, ...rest].map((p) => ({
    kind: p.kind, url: p.url, title: p.title, density: p.density, stack: p.stack,
    text: p.text.slice(0, p.density >= 8 ? 4000 : p.density >= 3 ? 2600 : 1600),
  }));

  const text = pages.map((p) => `## ${p.kind.toUpperCase()}: ${p.title}\n${p.url}\n${p.text}`).join('\n\n');
  return { ok: pages.length > 0, pages, errors, text, ms: Date.now() - t0 };
}
