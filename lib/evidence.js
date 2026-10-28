/* The capability map: what this firm has demonstrably delivered, as against what it says
 * it sells. Every fact carries the page it came from and a quote from that page, and the
 * quote is checked here rather than trusted, so a record that cannot be traced back to
 * the site does not reach the opportunity engine at all.
 *
 * This runs beside the profiler, not after it, so it costs no wall-clock. */

import { ask } from './studio.js';

/* Enough pages to cover a firm's delivered work without the extraction becoming the
 * longest thing in the journey. Twelve covers every site we have tested. */
const MAX_WORK = 12;
const MAX_OFFER = 5;

const words = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const squash = (s) => words(s).replace(/\s+/g, ' ');

/* A quote is only evidence if it is on the page. Models paraphrase under instruction not
 * to, and a paraphrase that drifts is exactly how an invented capability gets a citation.
 * Compared with whitespace and punctuation flattened, since the page text has been
 * stripped out of HTML and the model may have normalised a character. */
export function quoted(excerpt, pageText) {
  const q = squash(excerpt);
  if (q.length < 25) return false;
  const hay = squash(pageText);
  if (hay.includes(q)) return true;
  /* A long quote that straddles a line the stripper collapsed still counts when most of
   * its run of words is there in order. */
  const toks = q.split(' ');
  if (toks.length < 8) return false;
  const half = toks.slice(0, Math.floor(toks.length * 0.6)).join(' ');
  return hay.includes(half);
}

/* Which pages are worth the call. Delivered work first, by how much of it the page
 * carries; then a few service pages, which is where the advertised side comes from. */
export function pagesToRead(pages) {
  const rest = pages.filter((p) => p.kind !== 'home');
  const work = rest
    .filter((p) => ['clients', 'work'].includes(p.kind) || p.density >= 6)
    .sort((a, b) => b.density - a.density)
    .slice(0, MAX_WORK);
  /* A firm that publishes no readable engagements has everything it will ever tell us on
   * its service and product pages, so read all of them rather than a sample. Reading five
   * left one such firm with three evidence records between seven industries and six
   * service lines, and a partner can only be shown opportunities in departments we have
   * something on: three records meant three departments and the rest failed the gate for
   * a reason that was about our budget rather than their business. */
  const budget = work.length >= 3 ? MAX_OFFER : MAX_WORK;
  const offer = rest
    .filter((p) => !work.includes(p) && ['services', 'products', 'industries', 'page', 'partners'].includes(p.kind))
    .sort((a, b) => b.density - a.density)
    .slice(0, budget);
  return [...work, ...offer];
}

const clean = (xs, n, len = 120) => [...new Set((xs ?? [])
  .map((x) => String(x ?? '').trim()).filter((x) => x.length > 1).map((x) => x.slice(0, len)))].slice(0, n);

/* A result is a result when it has a number in it. "Improved efficiency" is a sentence
 * about nothing and the prompt bans it, so this is the backstop. */
const MEASURED = /\d/;

export async function readRecord(page) {
  const message = [
    `# Page kind as crawled: ${page.kind}`,
    `# URL: ${page.url}`,
    `# Title: ${page.title}`,
    '',
    page.text,
  ].join('\n');
  const r = await ask('partner_evidence', message, { model: 'haiku' });

  const rec = {
    url: page.url,
    title: page.title || r.headline || '',
    classification: r.classification,
    headline: String(r.headline ?? '').slice(0, 140),
    client: String(r.client ?? '').slice(0, 80),
    client_descriptor: String(r.client_descriptor ?? '').slice(0, 160),
    industry: String(r.industry ?? '').slice(0, 60),
    function: String(r.buyer_function ?? '').toLowerCase().slice(0, 40),
    problem: String(r.problem ?? '').slice(0, 300),
    work: clean(r.work, 6),
    stack: clean(r.stack, 14, 40),
    outcomes: clean(r.outcomes, 4, 140).filter((o) => MEASURED.test(o)),
    service: String(r.repeatable_service ?? '').slice(0, 90),
    proprietary: clean(r.proprietary, 4, 60),
    managed: Boolean(r.managed),
    excerpt: String(r.excerpt ?? '').slice(0, 280),
    confidence: ['high', 'medium', 'low'].includes(r.confidence) ? r.confidence : 'low',
  };

  /* Three corrections the prompt asks for and the model still gets wrong, each of which
   * reaches the partner if it slips. */
  rec.grounded = quoted(rec.excerpt, page.text);
  /* A marketing page's numbers are promises. Only an engagement may carry a result. */
  if (rec.classification !== 'delivered') rec.outcomes = [];
  /* A delivered record with no work in it is a teaser, not an engagement. */
  if (rec.classification === 'delivered' && rec.work.length < 2) rec.classification = 'thin';
  /* An ungrounded quote drops the record to the floor: it may still name a technology,
   * but nothing downstream may lead on it. */
  if (!rec.grounded) rec.confidence = 'low';
  return rec;
}

/* Group the delivered records into capabilities. Done in code rather than by a model:
 * grouping by the department whose problem it was is the split that matters commercially,
 * and a model asked to do it returns a different taxonomy every run. */
function mapOf(records) {
  const delivered = records.filter((r) => r.classification === 'delivered');
  const offered = records.filter((r) => r.classification === 'offered');

  const byFunction = new Map();
  for (const r of delivered) {
    const key = r.function || 'unspecified';
    if (!byFunction.has(key)) byFunction.set(key, []);
    byFunction.get(key).push(r);
  }

  const demonstrated = [...byFunction.entries()].map(([fn, rs]) => ({
    function: fn,
    projects: rs.length,
    /* The firm's own words for the thing, preferred from its most confident record. */
    service: (rs.find((r) => r.confidence === 'high') ?? rs[0]).service
      || (rs.find((r) => r.confidence === 'high') ?? rs[0]).headline,
    work: clean(rs.flatMap((r) => r.work), 8),
    stack: clean(rs.flatMap((r) => r.stack), 10, 40),
    industries: clean(rs.map((r) => r.industry), 4),
    outcomes: clean(rs.flatMap((r) => r.outcomes), 4, 140),
    clients: clean(rs.map((r) => r.client), 4),
    managed: rs.some((r) => r.managed),
    confidence: rs.some((r) => r.confidence === 'high' && r.grounded) ? 'high'
      : rs.some((r) => r.grounded) ? 'medium' : 'low',
    sources: rs.map((r) => r.url),
  })).sort((a, b) => b.projects - a.projects || b.work.length - a.work.length);

  return {
    demonstrated,
    /* What they say they sell, kept apart from what they have shown. A line built on this
     * alone is a hypothesis and has to be labelled one. */
    advertised: clean(offered.map((r) => r.service || r.headline), 10),
    industries: clean(delivered.map((r) => r.industry), 6),
    /* From what they have delivered, and from what they advertise where there is no
     * delivered work. A firm that publishes no engagements still names the systems it
     * works in on its service pages, and that is a fact about them read off their own
     * site. Taking it only from delivered work meant an advertised-basis firm could
     * never match a stack, so every one of its opportunities lost the same points. */
    technologies: clean([...delivered, ...(delivered.length ? [] : offered)]
      .flatMap((r) => r.stack), 18, 40),
    clients: clean(delivered.map((r) => r.client), 8),
    client_shapes: clean(delivered.map((r) => r.client_descriptor), 6, 160),
    proprietary: clean(records.flatMap((r) => r.proprietary), 6, 60),
    /* A firm that already runs things for clients after go-live can be sold a retainer.
     * A firm that only builds cannot, however good the idea. */
    runs_things: delivered.some((r) => r.managed),
  };
}

export async function buildEvidence(pages) {
  const t0 = Date.now();
  const targets = pagesToRead(pages ?? []);
  if (!targets.length) return { ok: false, records: [], map: null, ms: 0 };

  const settled = await Promise.allSettled(targets.map((p) => readRecord(p)));
  const records = settled.filter((s) => s.status === 'fulfilled').map((s) => s.value)
    .filter((r) => r.classification !== 'thin');
  const failed = settled.filter((s) => s.status === 'rejected').length;

  return {
    ok: records.length > 0,
    records,
    map: mapOf(records),
    stats: {
      pages: targets.length,
      kept: records.length,
      delivered: records.filter((r) => r.classification === 'delivered').length,
      grounded: records.filter((r) => r.grounded).length,
      failed,
    },
    ms: Date.now() - t0,
  };
}

/* What the opportunity engine is allowed to reason from: the capability map plus the
 * delivered records in brief, each with the id a generated line has to cite. */
export function forReasoning(ev) {
  if (!ev?.ok) return null;
  const delivered = ev.records.filter((r) => r.classification === 'delivered');
  /* Plenty of good firms publish no engagement at all: an IT services company whose site
   * is twenty solution pages, an agency whose work sits behind a login. Refusing to say
   * anything to them is not caution, it is a broken product. So where there is no
   * delivered work we fall back to what they say they sell, which is still read off
   * their own pages and still quote-checked, and everything built on it is labelled as a
   * thing to confirm rather than a thing we know. */
  const basis = delivered.length ? 'delivered' : 'advertised';
  const source = delivered.length ? delivered
    : ev.records.filter((r) => r.classification === 'offered' && r.grounded);
  const idOf = (r, i) => `E${i + 1}`;
  return {
    basis,
    capabilities: ev.map.demonstrated.map((d) => ({
      function: d.function, service: d.service, projects: d.projects,
      work: d.work, stack: d.stack, industries: d.industries,
      outcomes: d.outcomes, managed: d.managed, confidence: d.confidence,
    })),
    evidence: source
      .map((r, i) => ({
        id: idOf(r, i),
        basis,
        what: r.headline,
        client: r.client || r.client_descriptor || 'not named',
        industry: r.industry,
        function: r.function,
        problem: r.problem,
        work: r.work,
        stack: r.stack,
        outcomes: r.outcomes,
        grounded: r.grounded,
        url: r.url,
      })),
    advertised_only: ev.map.advertised,
    technologies: ev.map.technologies,
    industries: ev.map.industries,
    proprietary: ev.map.proprietary,
    runs_things: ev.map.runs_things,
  };
}
