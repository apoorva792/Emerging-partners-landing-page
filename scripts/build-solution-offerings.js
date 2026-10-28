/* node scripts/build-solution-offerings.js
 *
 * The product path could only ever recommend the nine platform products, because those
 * were the only things written up as offerings. Everything else Lyzr sells, the industry
 * solutions and the named agents, sat in the catalogue as supporting evidence: Madison
 * GRC was in a regulated communications firm's candidate pool, tagged banking, and could
 * not be recommended to them because nothing described how a partner would sell it.
 *
 * This generates those offerings from the catalogue records we already crawled, so the
 * capabilities are the ones read off each page rather than written here. What it adds is
 * the commercial frame: who buys, what a partner charges for, what makes it live.
 *
 * Regenerate after a catalogue rebuild; the output is committed. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../lib/env.js';

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', f), 'utf8'));
const records = Object.values(read('catalog.json').records);

/* Audience pages, not solutions: a page written for a CIO is a pitch, not a thing a
 * partner deploys. */
const AUDIENCE = /^page_(cio|ceo|cto|head_of_ai|managing_director|venture_capital|docs_and_api|digital_transformation|ai_and_automation|agentic_os)$/;
/* Already written up by hand, with their own commercial detail and restrictions. */
const HAND_WRITTEN = new Set(['page_opencontroller', 'page_agent_blocks', 'page_lyzr_optimus', 'page_architect', 'page_agent_studio']);

/* Who signs for work in each department. */
const BUYER = {
  compliance: 'Chief Risk Officer or Head of Compliance',
  'it operations': 'Head of IT Operations or CIO',
  'customer service': 'Director of Customer Service',
  hr: 'Chief People Officer',
  finance: 'Finance Director',
  procurement: 'Head of Procurement',
  legal: 'General Counsel',
  sales: 'VP Sales or Chief Revenue Officer',
  marketing: 'Head of Marketing',
  operations: 'Chief Operating Officer',
  engineering: 'VP Engineering',
};

/* What makes it live now, per department. Written as a condition a partner can ask about
 * on a call, never as a claim about any particular client. */
const TRIGGER = {
  compliance: 'An audit date on the calendar, or a regulator asking how a decision was reached',
  'it operations': 'Ticket volume growing faster than the team, or an estate nobody has inventoried',
  'customer service': 'Response times slipping, or a support team hiring to keep up',
  hr: 'A hiring push, or an onboarding process that depends on one person',
  finance: 'A close that runs long, or reporting assembled by hand each month',
  procurement: 'A sourcing cycle under pressure, or supplier data spread across inboxes',
  legal: 'Contract review queued behind one team, or a regulatory change to absorb',
  sales: 'A pipeline target that needs more coverage than the team can give it',
  marketing: 'Content demand outrunning the team, or campaigns waiting on production',
  operations: 'A process that breaks at volume, or exceptions handled by whoever is free',
  engineering: 'A backlog that grows faster than it clears',
};

const FAMILY = {
  compliance: 'governance', 'it operations': 'incident', 'customer service': 'support',
  hr: 'people', finance: 'analytics', procurement: 'ordering', legal: 'governance',
  sales: 'outreach', marketing: 'outreach', operations: 'integration', engineering: 'engineering',
};

const words = (s) => String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);

/* The vocabulary a partner's own site would use if they could sell this: the department,
 * the industry, and the distinctive words of what the solution does. */
function signalsFor(r) {
  const out = new Set();
  for (const f of r.functions ?? []) { out.add(f); for (const w of words(f)) out.add(w); }
  if (r.industry && r.industry !== 'cross-industry') for (const w of words(r.industry)) out.add(w);
  for (const w of words(r.sellable_as).slice(0, 10)) out.add(w);
  return [...out].filter((w) => !['with', 'into', 'across', 'their', 'that', 'agents', 'agent', 'lyzr'].includes(w)).slice(0, 16);
}

/* Page titles are written for the website: "Fintech: what we do", "Jeff: agents for
 * Customer Service". What a partner needs is the name of the thing they would deploy. */
const title = (r) => r.title
  .replace(/\s*[|·]\s*Lyzr.*$/i, '')
  .replace(/:?\s*what we do$/i, '')
  .replace(/\s*overview$/i, '')
  .replace(/[:\s-]+$/, '')
  .trim();

/* A solution page named after a department reads as a category, not a product. Say what
 * it is instead, using the department it serves. */
const DEPT_NAME = {
  'page_healthcare': 'Healthcare operations agents',
  'page_fintech': 'Fintech compliance and fraud agents',
  'page_government': 'Public sector service agents',
  'page_e_commerce': 'E-commerce operations agents',
  'page_legal': 'Legal and contract agents',
  'page_procurement': 'Procurement agents',
  'page_compliance_and_governance': 'Compliance and governance agents',
  'page_it_operations': 'IT operations agents',
  'page_revenue_and_sales': 'Revenue and sales agents',
  'page_insurance': 'Insurance operations agents',
};
const nameFor = (r) => DEPT_NAME[r.id] ?? title(r);

function offeringFrom(r) {
  const fn = (r.functions ?? [])[0] ?? 'operations';
  const name = nameFor(r);
  const family = FAMILY[fn] ?? 'integration';
  const industry = r.industry && r.industry !== 'cross-industry' ? r.industry : null;

  return {
    offering_id: r.id.replace(/^page_/, 'sol_'),
    product_id: r.id,
    tier: 'solution',
    name,
    url: r.url,
    catalogue_id: r.id,
    one_line: r.sellable_as,
    /* Whose business this is for, from the page it was generated from. Read by the
     * eligibility check, which weights an industry match above a department one. */
    industry: industry ?? '',
    /* Read off the page by the catalogue builder, not written here. */
    capabilities: (r.built ?? []).slice(0, 5),
    partner_shapes: ['systems integrator', 'consultancy', 'managed service provider', 'software firm'],
    complements: [
      industry ? `Clients already in ${industry}` : `Work they already deliver in ${fn}`,
      `An existing ${fn} practice or delivery team`,
      'Systems the partner already integrates for those clients',
    ],
    requires: {
      families: [family],
      signals: signalsFor(r),
      why: `Sold into ${fn}${industry ? ` at ${industry} clients` : ''}, so the partner has to already reach that department.`,
    },
    customer_problems: (r.built ?? []).slice(0, 3).map((b) => `Doing this by hand today: ${String(b).replace(/^[A-Z]/, (c) => c.toLowerCase())}`),
    sellable_services: [
      { name: `${name} readiness assessment`, client_gets: `Their ${fn} workflows mapped, with the first one scoped` },
      { name: `${name} deployment`, client_gets: 'The solution running on one workflow inside their own systems' },
      { name: `Run and extend ${name}`, client_gets: 'Kept current as their process and their rules change' },
    ],
    implementation: { pattern: 'assess-then-build', offer: `Map the ${fn} workflow with the people who run it, then deploy the first one` },
    managed: { pattern: 'take-over-and-run', offer: 'Operate it after go-live and extend it to the next workflow, billed monthly' },
    revenue: {
      implementation: `Assessment charged as an engagement, then the first ${fn} workflow deployed`,
      recurring: 'A monthly fee to run it, growing with each further workflow',
    },
    buyer: BUYER[fn] ?? 'An operations leader in the client business',
    trigger: TRIGGER[fn] ?? 'A process that has outgrown the people running it',
    prerequisites: [
      `The partner already delivers into ${fn} for these clients`,
      'Access to the systems the work reads and writes',
    ],
    do_not_recommend_when: [
      `The partner has never delivered anything into ${fn}`,
      industry ? `Their clients are not in ${industry} or anything like it` : 'The department is not one they reach',
      'What they need is the platform underneath rather than a packaged solution',
    ],
    restrictions: ['Scope and commercial terms are agreed with the Lyzr partner team, not quoted from this page'],
    resources: [r.id],
  };
}

const chosen = records.filter((r) => /^page_/.test(r.id)
  && !AUDIENCE.test(r.id)
  && !HAND_WRITTEN.has(r.id)
  && (r.built ?? []).length >= 3
  /* Confidence is about how well the page described itself, and a solution page that
   * reads thin still names a real solution. What it may not do is carry a result, and
   * nothing here does. */
  && ['high', 'medium', 'low'].includes(r.confidence));

const out = {
  _note: 'Generated by scripts/build-solution-offerings.js from the catalogue records. Capabilities are read off each page by the catalogue builder; what is added here is the commercial frame. Regenerate after a catalogue rebuild.',
  offerings: chosen.map(offeringFrom),
};
fs.writeFileSync(path.join(ROOT_DIR, 'data', 'solution-offerings.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`wrote ${out.offerings.length} solution offerings`);
for (const o of out.offerings) console.log(`  ${o.offering_id.padEnd(30)} ${o.requires.families[0].padEnd(12)} ${o.name.slice(0, 44)}`);
