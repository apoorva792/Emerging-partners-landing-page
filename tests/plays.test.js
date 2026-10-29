/* node --test tests/
 *
 * The product-led half of discovery. The question these answer is not "does the product
 * sound relevant" but "has this firm shown us it could deliver it": a play is offered to
 * the model only when the partner's own capability map carries the signal, so an industry
 * match can never be the reason a product is recommended. No network.
 *
 * Every firm here is a shape, not a company. Nothing is hardcoded to a real partner. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYS, playById, playsFor, eligibility, briefOf } from '../lib/plays.js';
import { PATTERNS, patternById } from '../lib/catalog.js';
import { families } from '../lib/fit.js';

/* A partner profile is shaped the way buildProfile returns one. Only the fields the
 * eligibility read actually looks at. */
const firm = ({ one_line = '', services = [], platforms = [], capabilities = [], evidence = [], advertised = [], technologies = [] }) => ({
  company: { one_line },
  services: services.map((name) => ({ name })),
  platforms: platforms.map((name) => ({ name })),
  capabilities: {
    basis: 'delivered',
    capabilities,
    evidence,
    advertised_only: advertised,
    technologies,
  },
});

const cap = (fn, service, work = [], stack = []) => ({ function: fn, service, work, stack, projects: 1, confidence: 'high' });
const ev = (id, what, fn, work = [], stack = []) => ({ id, what, function: fn, work, stack, grounded: true, problem: '', outcomes: [] });

/* ---- 1. an AI consultancy with production agents ---- */

const aiConsultancy = firm({
  one_line: 'We build and run production AI agents for enterprise clients.',
  services: ['Agent development', 'MLOps and platform engineering'],
  platforms: ['AWS', 'Kubernetes'],
  technologies: ['Bedrock', 'Kubernetes', 'Okta'],
  capabilities: [cap('engineering', 'Production agent delivery', ['Deployed agents into client AWS accounts'], ['Bedrock'])],
  evidence: [ev('E1', 'Agents in production for an enterprise client', 'engineering', ['Shipped agents into production'], ['AWS'])],
});

test('an AI consultancy with production agents is eligible for OpenController', () => {
  const got = eligibility(playById('opencontroller'), aiConsultancy);
  assert.equal(got.ok, true, got.why);
  assert.ok(playsFor(aiConsultancy).some((x) => x.play.id === 'opencontroller'));
});

/* ---- 2. an enterprise workplace consultancy ---- */

const workplace = firm({
  one_line: 'We run digital workplace and employee experience programmes for large organisations.',
  services: ['Microsoft 365 rollout', 'Adoption and change management', 'Service desk'],
  platforms: ['Microsoft 365', 'SharePoint'],
  capabilities: [cap('people', 'Workforce rollout and adoption', ['Rolled Microsoft 365 out across a workforce'], ['SharePoint'])],
  evidence: [ev('E1', 'Workplace rollout across a workforce', 'people', ['Ran the adoption programme'], ['Microsoft 365'])],
});

test('a workplace consultancy is eligible for Open Cowork', () => {
  const got = eligibility(playById('open_cowork'), workplace);
  assert.equal(got.ok, true, got.why);
  assert.ok(playsFor(workplace).some((x) => x.play.id === 'open_cowork'));
});

/* ---- 3. an infrastructure partner with private deployment experience ---- */

const infra = firm({
  one_line: 'We design and operate private cloud and on-premise infrastructure for regulated organisations.',
  services: ['Data centre migration', 'Private cloud'],
  platforms: ['VMware'],
  technologies: ['VMware', 'Kubernetes'],
  capabilities: [cap('it operations', 'On-premise platform delivery', ['Built an air-gapped environment in a client data centre'], ['VMware'])],
  evidence: [ev('E1', 'Private cloud build in a client data centre', 'it operations', ['Commissioned hardware on site'], ['VMware'])],
});

test('an infrastructure partner with private deployment work is eligible for Optimus', () => {
  const got = eligibility(playById('optimus'), infra);
  assert.equal(got.ok, true, got.why);
  assert.ok(playsFor(infra).some((x) => x.play.id === 'optimus'));
});

/* ---- 4. a software company with a product of its own ---- */

const vendor = firm({
  one_line: 'We build and sell a multi-tenant SaaS platform for our own customers.',
  services: ['Product engineering', 'Platform development'],
  technologies: ['Kubernetes', 'AWS'],
  capabilities: [cap('engineering', 'Proprietary multi-tenant product development', ['Shipped releases of our own SaaS product'], ['AWS'])],
  evidence: [ev('E1', 'Our own product platform', 'engineering', ['Built the multi-tenant platform'], ['Kubernetes'])],
});

test('a software company with its own product is eligible for AgentBlocks OEM', () => {
  const got = eligibility(playById('agentblocks_oem'), vendor);
  assert.equal(got.ok, true, got.why);
  assert.ok(playsFor(vendor).some((x) => x.play.id === 'agentblocks_oem'));
});

/* ---- 5. nothing is matched automatically ---- */

const agency = firm({
  one_line: 'We are a brand and creative agency producing campaigns for consumer brands.',
  services: ['Brand strategy', 'Creative production', 'Media buying'],
  capabilities: [cap('marketing', 'Campaign production', ['Produced brand campaigns'], [])],
  evidence: [ev('E1', 'A brand campaign', 'marketing', ['Produced the creative'], [])],
});

test('a creative agency is not handed infrastructure or OEM products', () => {
  const ids = playsFor(agency).map((x) => x.play.id);
  assert.ok(!ids.includes('optimus'), `optimus offered to a creative agency: ${JSON.stringify(ids)}`);
  assert.ok(!ids.includes('agentblocks_oem'), `OEM offered to a creative agency: ${JSON.stringify(ids)}`);
  assert.ok(!ids.includes('open_cowork'), `a workforce rollout offered to a firm that has never run one: ${JSON.stringify(ids)}`);
});

test('a firm with no readable evidence is offered nothing at all', () => {
  const blank = { company: { one_line: '' }, services: [], platforms: [], capabilities: null };
  assert.deepEqual(playsFor(blank).map((x) => x.play.id), []);
});

test('eligibility never rests on the industry alone', () => {
  /* An insurer's integrator, named as such and nothing else. Insurance is a Lyzr vertical;
   * that is not a reason to recommend them anything. */
  const insuranceOnly = firm({
    one_line: 'We serve insurance clients.',
    services: ['Insurance consulting'],
    capabilities: [cap('claims', 'Insurance advisory', [], [])],
    evidence: [ev('E1', 'An insurance programme', 'claims', [], [])],
  });
  const ids = playsFor(insuranceOnly).map((x) => x.play.id);
  assert.ok(!ids.includes('optimus') && !ids.includes('agentblocks_oem') && !ids.includes('open_cowork'),
    `a vertical match handed out products: ${JSON.stringify(ids)}`);
});

/* ---- 6. the data layer holds together ---- */

test('every play names patterns that exist, and both of its offers', () => {
  for (const play of PLAYS) {
    assert.ok(patternById(play.implementation.pattern), `${play.id}: unknown pattern ${play.implementation.pattern}`);
    assert.ok(patternById(play.managed.pattern), `${play.id}: unknown pattern ${play.managed.pattern}`);
    assert.ok(play.implementation.offer && play.managed.offer, `${play.id}: missing an offer`);
    assert.ok(play.buyer && play.trigger, `${play.id}: no buyer or no trigger`);
    assert.ok((play.capabilities ?? []).length, `${play.id}: no verified capabilities`);
    assert.ok((play.do_not_recommend_when ?? []).length, `${play.id}: no reasons to refuse it`);
    assert.ok((play.prerequisites ?? []).length, `${play.id}: no prerequisites`);
  }
});

test('the spec\'s products are all covered, and OEM is not the same thing as the blocks', () => {
  const ids = PLAYS.map((p) => p.id);
  for (const id of ['opencontroller', 'open_cowork', 'agent_studio', 'architect', 'optimus', 'agentblocks_oem', 'agent_blocks']) {
    assert.ok(ids.includes(id), `missing play: ${id}`);
  }
  const oem = playById('agentblocks_oem');
  const blocks = playById('agent_blocks');
  assert.notEqual(oem.one_line, blocks.one_line);
  assert.match(oem.one_line, /white-label|product/i);
  assert.match(blocks.one_line, /primitive|memory|retrieval/i);
  assert.ok(blocks.do_not_recommend_when.some((x) => /OEM/i.test(x)),
    'the blocks play should say when the answer is OEM instead');
});

test('the three new commercial patterns exist and carry their promises', () => {
  for (const id of ['roll-out-to-everyone', 'deploy-in-their-estate', 'embed-and-license']) {
    const p = patternById(id);
    assert.ok(p, `missing pattern ${id}`);
    assert.ok(p.first_offer.shape && p.delivery.shape && p.delivery.team_needed,
      `${id}: durations and staffing must come from the file`);
    assert.equal((p.discovery ?? []).length, 4);
  }
  /* And the originals are untouched. */
  for (const id of ['assess-then-build', 'prove-then-roll-out', 'audit-then-build', 'review-then-deploy', 'package-then-sell', 'inventory-then-govern', 'take-over-and-run']) {
    assert.ok(patternById(id), `lost an existing pattern: ${id}`);
  }
  assert.equal(PATTERNS.length, 10);
});

test('the capability catalogue is untouched', async () => {
  const { default: catalog } = await import('../data/catalog.json', { with: { type: 'json' } });
  assert.equal(Object.keys(catalog.records).length, 104);
});

test('the prompt view carries what the model needs and hides what is ours to enforce', () => {
  const view = briefOf({ play: playById('optimus'), fit: eligibility(playById('optimus'), infra) });
  assert.ok(view.product && view.buyer && view.deployment_revenue && view.recurring_revenue);
  assert.ok(view.customer_problems.length && view.services_you_could_sell.length);
  /* Restrictions travel, because what we must not promise is the model's problem.
   * Prerequisites do not: we check those ourselves. */
  assert.ok(view.restrictions.some((r) => /power, cooling/i.test(r)));
  assert.equal(view.prerequisites, undefined, 'prerequisites are checked by us, not weighed by the model');
  assert.equal(view.capabilities, undefined);
});

test('every offering carries the fields the kit is built from', () => {
  for (const o of PLAYS) {
    assert.ok(o.offering_id && o.product_id, `${o.id}: no stable ids`);
    assert.ok(o.customer_problems.length >= 2, `${o.id}: too few customer problems`);
    assert.ok(o.sellable_services.length >= 2, `${o.id}: too few sellable services`);
    for (const s of o.sellable_services) assert.ok(s.name && s.client_gets, `${o.id}: a service with no outcome`);
    assert.ok(o.revenue.implementation && o.revenue.recurring, `${o.id}: no revenue model`);
    assert.ok(Array.isArray(o.restrictions), `${o.id}: no restrictions field`);
  }
});

test('unpublished commercial terms are recorded as restrictions, not as promises', () => {
  /* OEM licensing is the one we must not quote. Optimus is shipping, so its restriction
   * is now the physical one and no longer a date. */
  assert.ok(playById('agentblocks_oem').restrictions.some((r) => /not published/i.test(r)));
  assert.ok(!JSON.stringify(playById('optimus')).match(/Q4 2026/i), 'Optimus is live; no ship date');
  /* And nothing anywhere in the file promises money. */
  const text = JSON.stringify(PLAYS);
  assert.ok(!/\$[\d]/.test(text), 'a figure reached the offerings file');
  assert.ok(!/\b(discount|margin of|revenue share|\d+%\s*(margin|commission))\b/i.test(text));
});

test('the new process families classify the new offering shapes', () => {
  assert.ok(families('rolled out to every employee across the workforce').has('workspace'));
  assert.ok(families('air-gapped appliance in their own data centre').has('infrastructure'));
  assert.ok(families('white-label SDK embedded in their own multi-tenant product').has('embedding'));
  /* And they do not swallow the old ones. */
  assert.ok(families('regression test suite for each release').has('testing'));
  assert.ok(!families('regression test suite for each release').has('infrastructure'));
});

test('a kind-of-work match alone is not enough, nor is one word', () => {
  /* "Alerts" on a marketing page classifies as incident handling. That was enough to
   * offer a creative agency a governance control plane before both axes were required. */
  const vague = firm({
    one_line: 'We send alerts to clients when a campaign needs attention.',
    services: ['Campaign management'],
    capabilities: [cap('incident', 'Campaign alerting', ['We escalate when a campaign underperforms'], [])],
    evidence: [ev('E1', 'Campaign alerting', 'incident', ['Escalated underperforming campaigns'], [])],
  });
  assert.equal(eligibility(playById('opencontroller'), vague).ok, false,
    'a family match with none of their own vocabulary should not qualify');

  const oneWord = firm({ one_line: 'We build things.', services: ['Software'], capabilities: [], evidence: [] });
  assert.equal(eligibility(playById('agent_studio'), oneWord).ok, false);
});

/* ---- the solution tier ---- */

test('industry solutions and named agents are offerings, not just footnotes', () => {
  const ids = PLAYS.map((p) => p.offering_id);
  /* These existed in the catalogue as supporting evidence and could never be
   * recommended, which is why a regulated communications firm serving banks was never
   * shown the banking GRC solution sitting in its own candidate pool. */
  for (const id of ['sol_madison_grc', 'sol_fintech', 'sol_insurance', 'sol_healthcare', 'sol_customer_service']) {
    assert.ok(ids.includes(id), `missing solution offering: ${id}`);
  }
  assert.ok(PLAYS.filter((p) => p.tier === 'product').length === 8);
  assert.ok(PLAYS.filter((p) => p.tier === 'solution').length >= 20);
});

test('a firm whose clients are banks is shown the banking solution', () => {
  const bankish = {
    company: { one_line: 'We run regulated customer communications for financial institutions.' },
    services: [{ name: 'Customer communications management' }, { name: 'Compliance operations' }],
    industries: [{ name: 'Financial Services' }, { name: 'Banks' }, { name: 'Credit Unions' }],
    capabilities: {
      basis: 'advertised',
      capabilities: [],
      evidence: [{ id: 'E1', what: 'Regulated communications platform', function: 'compliance', grounded: true, work: ['Ran the audit trail'], stack: [] }],
      advertised_only: ['CCM automation for regulated teams'],
      industries: ['financial services'],
      technologies: [],
    },
  };
  const got = playsFor(bankish);
  assert.ok(got.some((x) => /madison/i.test(x.play.name)), `no banking GRC solution: ${got.map((x) => x.play.name)}`);
  /* And the industry reason is stated, because that is what makes it credible. */
  const madison = got.find((x) => /madison/i.test(x.play.name));
  assert.match(madison.fit.why, /banking/i);
});

test('an industry match is only claimed where the offering declares one', () => {
  /* Reading industries off the description's words reported a firm's clients as being in
   * "connected" and in "building". Only the declared industry counts. */
  const manufacturer = {
    company: { one_line: 'We deliver ERP programmes.' },
    services: [{ name: 'ERP delivery' }],
    industries: [{ name: 'Manufacturing' }, { name: 'Distribution' }],
    capabilities: { basis: 'delivered', capabilities: [], evidence: [{ id: 'E1', what: 'ERP rollout', function: 'operations', grounded: true, work: ['Deployed the ERP'], stack: ['SAP'] }], advertised_only: [], industries: ['manufacturing'], technologies: ['SAP'] },
  };
  for (const { play, fit } of playsFor(manufacturer)) {
    for (const i of fit.onIndustry ?? []) {
      assert.ok(i && i.length > 3 && !/connected|building|their/i.test(i), `invented an industry: ${i}`);
    }
  }
});

test('both tiers get room in the list', () => {
  const broad = {
    company: { one_line: 'We build production AI agents and run compliance programmes for banks.' },
    services: [{ name: 'Agent development' }, { name: 'Compliance operations' }],
    industries: [{ name: 'Banks' }, { name: 'Financial Services' }],
    capabilities: {
      basis: 'delivered',
      capabilities: [{ function: 'compliance', service: 'Governance delivery', projects: 2, confidence: 'high', stack: ['AWS'], work: ['Built the audit trail'], outcomes: [] }],
      evidence: [{ id: 'E1', what: 'Agent governance programme', function: 'compliance', grounded: true, work: ['Built the audit trail'], stack: ['AWS'] }],
      advertised_only: [], industries: ['banking'], technologies: ['AWS', 'Kubernetes'],
    },
  };
  const got = playsFor(broad);
  assert.ok(got.some((x) => x.play.tier === 'product'), 'no platform product offered');
  assert.ok(got.some((x) => x.play.tier === 'solution'), 'no packaged solution offered');
});
