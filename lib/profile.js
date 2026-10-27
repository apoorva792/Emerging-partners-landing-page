import { crawl } from './crawl.js';
import { searchCompany } from './search.js';
import { enrich, domainOf, isBusinessEmail } from './apollo.js';
import { ask } from './studio.js';
import { buildEvidence, forReasoning } from './evidence.js';

/* Three rules the prompt states and the model still breaks, so they are enforced here
 * instead. Each one reaches the visitor if it slips, which is why none of them is left to
 * the prompt alone. */

const WORDS = (s = '') => s.trim().split(/\s+/).filter(Boolean).length;
/* Their own address is not evidence of where their customers are. The model keeps writing
 * "HQ in New York" under a US customer market, which is the exact conflation the markets
 * split exists to prevent. */
const SELF_LOCATION = /\b(hq|headquarters|headquartered|based in|office|offices)\b/i;

function tidy(profile) {
  const p = { ...profile };

  if (p.markets) {
    const customers = (p.markets.customers ?? []).filter((c) => !SELF_LOCATION.test(c.evidence ?? ''));
    /* Dropping the last piece of customer evidence has to drop the confidence with it,
     * or the card claims "confirmed" over an empty row. */
    const confidence = customers.length ? p.markets.customers_confidence : 'unknown';
    p.markets = { ...p.markets, customers, customers_confidence: confidence };
  }

  /* A question the profile has already answered is worse than no question: it tells the
   * visitor we were not reading. The prompt bans these; this is the backstop. */
  const settled = [];
  if (['builds', 'advises'].includes(p.delivery_capability?.verdict)) settled.push(/build|advis|deliver|engineer|implement/i);
  if (p.customer_type && p.customer_type !== 'unclear') settled.push(/enterprise|mid-market|smb|customer segment|sell to/i);
  /* The five the app asks every visitor itself. The prompt bans them by name; these catch
   * the rewordings, which is how they come back. */
  settled.push(/what kind of work|service lines?|deliver for (your )?clients/i);
  settled.push(/opportunit(y|ies) to grow|where.*grow|grow(th)? (plan|priorit)/i);
  settled.push(/asking (you )?for|demand|use cases? .*(want|ask)/i);
  settled.push(/how far along|maturity|pilots? or poc|in production/i);
  settled.push(/where are .*(customers|clients) based|geograph|region/i);

  p.confirm = (p.confirm ?? [])
    .filter((q) => !settled.some((re) => re.test(q.question) || re.test(q.field)))
    .filter((q) => WORDS(q.question) <= 20)
    .slice(0, 1);

  return p;
}

/* email + website in, profile out. Each source is optional: a dead site still profiles from
 * Apollo, and an Apollo miss still profiles from the crawl. Both missing is the one real
 * failure, and the caller asks the visitor to describe the business instead. */
export async function buildProfile(email, website) {
  const site = website || domainOf(email);
  const t0 = Date.now();
  /* The brand is taken from the domain rather than waited on from Apollo: the search runs
   * beside the crawl instead of behind it, and for a services firm the domain label is the
   * name on the building. A wrong guess returns little and the profile carries on. */
  const brand = domainOf(site).split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  /* The evidence pass starts the moment the crawl lands, not after the profiler, so the
   * capability map is built while the profiler is still reading. Two models on the same
   * pages at the same time, and the step costs what the slower of them costs. */
  const crawling = crawl(site);
  const reading = crawling.then((c) => (c.ok ? buildEvidence(c.pages) : null)).catch(() => null);

  const [crawled, enriched, searched] = await Promise.all([
    crawling,
    enrich(email, site),
    searchCompany(brand, domainOf(site)).catch(() => ({ ok: false, hits: [], text: '' })),
  ]);

  if (!crawled.ok && !enriched.org) {
    return { ok: false, reason: 'no-signal', errors: crawled.errors, ms: Date.now() - t0 };
  }

  const message = [
    `# The company`,
    `website given: ${site}`,
    `email domain: ${domainOf(email)}`,
    '',
    '# Apollo — organisation',
    enriched.org ? JSON.stringify(enriched.org, null, 1) : '(no match)',
    '',
    '# Apollo — the person who entered their email',
    enriched.person ? JSON.stringify(enriched.person, null, 1) : '(no match)',
    '',
    '# Crawled pages',
    crawled.ok ? crawled.text : '(the site could not be read)',
    '',
    '# What the web says about them',
    '(launch posts, partnerships, coverage. Use it for already_built and recent_moves.)',
    searched.ok ? searched.text : '(no web results)',
  ].join('\n');

  const [profiled, evidence] = await Promise.all([ask('partner_profiler', message), reading]);
  const profile = tidy(profiled);
  /* The capability map rides on the profile because the browser carries the profile back
   * for every later step, and an opportunity that cannot see what the firm has delivered
   * is the thing this whole pass exists to stop. */
  profile.capabilities = forReasoning(evidence);
  return {
    ok: true,
    profile,
    /* Their name and mark, carried beside the profile rather than through the model: a
     * logo URL is not something to let a language model retype. */
    brand: {
      name: profile.company?.name || enriched.org?.name || site,
      logo: enriched.org?.logo || null,
    },
    evidence: {
      pages: crawled.pages.map((p) => ({ kind: p.kind, url: p.url, title: p.title })),
      apollo_org: Boolean(enriched.org),
      apollo_person: Boolean(enriched.person),
      business_email: isBusinessEmail(email),
      /* What the profile was allowed to read. A claim about what they already built is
       * only as good as the page it came from, and this is where that page is recorded. */
      web: searched.hits ?? [],
      web_provider: searched.provider ?? null,
      crawl_errors: crawled.errors,
      /* The profile card is worded from this: an apollo-only profile has to say so, and
       * lean harder on the confirm questions, because nothing in it came from the company. */
      source_quality: crawled.ok ? (enriched.org ? 'site+apollo' : 'site-only') : 'apollo-only',
      /* What the capability map was built from, so a weak set of opportunities can be
       * traced to a site that said nothing rather than to the engine. */
      evidence: evidence?.stats ?? null,
      /* The full records stay on the server for the run file. Only the reasoning view
       * travels with the profile. */
      records: evidence?.records ?? [],
    },
    ms: Date.now() - t0,
  };
}
