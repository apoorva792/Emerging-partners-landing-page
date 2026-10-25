/* Apollo enrichment. Two calls, both optional: if either fails or comes back thin the
 * profiler carries on with the crawl alone. Nothing here is ever shown to the visitor
 * as fact — it is a pre-fill they confirm or correct on the profile card. */
import { env } from './env.js';

const API = 'https://api.apollo.io/api/v1';
const FREE_MAIL = new Set(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'live.com', 'msn.com', 'yandex.com', 'mail.com', 'gmx.com', 'me.com', 'qq.com', '163.com']);

export const domainOf = (s = '') =>
  s.includes('@') ? s.split('@').pop().trim().toLowerCase()
    : s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

export const isBusinessEmail = (email) => !FREE_MAIL.has(domainOf(email));

/* A shared mailbox is not a person. Apollo will happily match hello@acme.com to Acme's
 * founder — the domain is a catch-all — and then the agent greets a junior marketer by the
 * CEO's first name and tells the partner team it spoke to a decision maker. */
const ROLE = /^(hello|hi|info|contact|enquir(y|ies)|inquir(y|ies)|sales|team|admin|support|help|office|mail|marketing|partners?|press|careers|jobs|hr|accounts?|billing|finance|legal|no-?reply|webmaster|service)$/i;
export const isRoleAddress = (email = '') => ROLE.test(email.split('@')[0].trim());

async function post(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'x-api-key': env.APOLLO_API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`apollo ${endpoint} -> ${res.status}`);
  return res.json();
}

/* Keywords are the useful part: Apollo infers them from the whole web presence, not
 * just the pages we can reach. We keep a generous slice and let the profiler judge. */
export async function enrichOrg(domain) {
  const o = (await post('/organizations/enrich', { domain }))?.organization;
  if (!o) return null;
  return {
    name: o.name ?? null,
    website: o.website_url ?? null,
    /* Used for the partner's own mark on the documents they hand to a client. */
    logo: o.logo_url ?? null,
    linkedin: o.linkedin_url ?? null,
    description: o.short_description ?? o.seo_description ?? null,
    industry: o.industry ?? null,
    industries: o.industries ?? [],
    keywords: (o.keywords ?? []).slice(0, 120),
    employees: o.estimated_num_employees ?? null,   // recorded, never used to qualify
    revenue: o.annual_revenue_printed ?? null,
    founded: o.founded_year ?? null,
    city: o.city ?? null,
    state: o.state ?? null,
    country: o.country ?? null,
    location: [o.city, o.state, o.country].filter(Boolean).join(', ') || null,
    technologies: (o.technology_names ?? []).slice(0, 40),
  };
}

/* Person match by email. Never reveals personal emails or phone numbers — we only want
 * who we are talking to (name, title, seniority) so the agent addresses them properly
 * and the partner team knows whether this was a decision maker. */
export async function matchPerson(email) {
  const p = (await post('/people/match', { email, reveal_personal_emails: false, reveal_phone_number: false }))?.person;
  /* A role address (hello@, info@) comes back as a shell record. That is not a person. */
  if (!p || (!p.name && !p.first_name && !p.title)) return null;
  const current = (p.employment_history ?? []).find((e) => e.current);
  return {
    name: p.name ?? ([p.first_name, p.last_name].filter(Boolean).join(' ') || null),
    first_name: p.first_name ?? null,
    title: p.title ?? null,
    seniority: p.seniority ?? null,
    headline: p.headline ?? null,
    linkedin: p.linkedin_url ?? null,
    city: p.city ?? null,
    country: p.country ?? null,
    org_name: current?.organization_name ?? p.organization?.name ?? null,
    since: current?.start_date ?? null,
    previous: (p.employment_history ?? []).filter((e) => !e.current).slice(0, 3)
      .map((e) => [e.title, e.organization_name].filter(Boolean).join(' at ')),
  };
}

export async function enrich(email, website) {
  const domain = domainOf(website || email);
  const [org, person] = await Promise.all([
    enrichOrg(domain).catch(() => null),
    email && !isRoleAddress(email) ? matchPerson(email).catch(() => null) : null,
  ]);
  return { domain, org, person };
}
