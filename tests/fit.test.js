/* node --test tests/
 *
 * Every case here is a thing that reached a real partner's PDF. The Fortude brief of
 * 28 October carried insurance fraud detection steps under a demand forecasting card,
 * an insurance agent offered as the demo on an ERP reporting card, a software toolchain
 * described as the mechanism of an Infor release cycle, and a telecom case study sent
 * with it. Each one passed the word overlap test it was given. No network. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { compatible, stepsFor, families, domains, conflicts, systems } from '../lib/fit.js';
import { relatedTo } from '../lib/resources.js';
import { verify } from '../lib/verify.js';

/* The partner: Infor ERP work for food, manufacturing and distribution clients. */
const scope = {
  domains: domains('food and beverage manufacturing distribution supply chain'),
  systems: systems('Infor CloudSuite M3 Microsoft Fabric Azure'),
};

const forecasting = {
  headline: "Demand forecasting that reads your clients' ERP and external signals together",
  work: 'demand signal forecasting',
  unit: 'product category',
  function: 'supply chain',
  paid_service: 'demand forecasting automation',
  customer_problem: 'planners set purchase orders from static reports',
};

const regression = {
  headline: 'Run your Infor regression suites end to end',
  work: 'regression test automation',
  unit: 'Infor module',
  function: 'it operations',
  paid_service: 'managed regression testing',
  customer_problem: 'SMEs are pulled off live projects every release cycle',
};

const kpiQnA = {
  headline: 'Live operational Q&A for your Infor M3 clients',
  work: 'operational KPI queries',
  unit: 'dashboard domain',
  function: 'operations',
  paid_service: 'natural language operational reporting',
  customer_problem: 'teams wait for a BI report to be built',
};

/* ---- 1. insurance fraud detection is not demand forecasting ---- */

const benjieRecord = {
  title: 'Benjie: agents for Insurance',
  sellable_as: 'Claims, underwriting and policy servicing agents for insurers',
  kind: 'capability',
  built: [
    'Monitors claims as they arrive cross-referencing behavioral patterns, historical data, network relationships and external intelligence',
    'Surfaces fraud signals correlated across claims with case files investigators can act on',
  ],
  topics: ['insurance'],
};

test('an insurance claims capability cannot be the reference on a forecasting card', () => {
  const got = compatible(benjieRecord, forecasting, 'reference', scope);
  assert.equal(got.ok, false);
  assert.match(got.why, /insurance/);
});

test('its claims steps are not the mechanism of a forecasting card', () => {
  assert.deepEqual(stepsFor(benjieRecord, forecasting, scope), []);
});

/* ---- 2. a software toolchain is not an Infor release cycle ---- */

const sdlcRecord = {
  title: 'AI-enabled SDLC pipeline',
  sellable_as: 'Impact analysis and test generation across the software delivery lifecycle',
  kind: 'delivered',
  functions: ['engineering'],
  built: [
    'Ingested Jira, GitHub, SharePoint, TestRail, and Rally into a single relationship-aware data layer',
    'Impact analysis agent automatically identified affected services, APIs, tests, and dependencies',
    'Test case generator produced complete test scenarios from requirements and user stories',
  ],
  topics: ['engineering'],
};

test('steps naming a toolchain their clients do not run are dropped', () => {
  const kept = stepsFor(sdlcRecord, regression, scope);
  assert.ok(!kept.some((s) => /Jira|GitHub|TestRail|Rally/.test(s)),
    `kept a foreign toolchain step: ${JSON.stringify(kept)}`);
});

test('and the engagement itself is rejected: it ran inside a stack their clients do not have', () => {
  const got = compatible(sdlcRecord, regression, 'mechanism', scope);
  assert.equal(got.ok, false);
  assert.match(got.why, /devtools/i);
});

test('a record naming no systems is not rejected for it', () => {
  const plain = { title: 'Release testing agents', sellable_as: 'Automated regression testing', kind: 'offer', built: ['Runs the suite on each release'], topics: [] };
  assert.equal(compatible(plain, regression, 'mechanism', scope).ok, true);
});

test('and one running in the same stack is kept', () => {
  const infor = { title: 'Infor release testing', sellable_as: 'Regression testing across Infor CloudSuite modules', kind: 'delivered', built: ['Runs regression suites against the Infor modules each update touches'], topics: [] };
  assert.equal(compatible(infor, regression, 'mechanism', scope).ok, true);
});

/* ---- 3. an insurance agent is not a demo for an ERP reporting card ---- */

test('a domain-specific agent is never offered as a demo outside its domain', () => {
  const agent = { title: 'Benjie', sellable_as: 'claims, underwriting and policy servicing', topics: ['insurance'] };
  assert.equal(compatible(agent, kpiQnA, 'demo', scope).ok, false);
  assert.equal(compatible(agent, forecasting, 'demo', scope).ok, false);
});

test('benjie is tagged for insurance only, so no operations card can reach it', async () => {
  const { default: products } = await import('../data/products.json', { with: { type: 'json' } });
  const benjie = products.agents.find((a) => a.id === 'benjie');
  assert.deepEqual(benjie.for, ['insurance']);
});

/* ---- 4. collateral about someone else's industry is omitted, not substituted ---- */

test('a telecom case study is not sent with an Infor regression play', () => {
  const got = relatedTo({
    topics: [regression.work, regression.unit, regression.headline],
    functions: ['it operations'],
    families: [...families(`${regression.headline} ${regression.work}`)],
    domains: [...scope.domains],
    products: ['Agent Studio'],
  });
  assert.ok(!got.some((r) => /telecom/i.test(r.title)), JSON.stringify(got.map((r) => r.title)));
});

test('nothing suitable means nothing, never a plausible substitute', () => {
  const got = relatedTo({
    topics: ['quantum cryptography key distribution'],
    functions: ['nonexistent department'],
    families: ['governance'],
    domains: ['publicsector'],
  });
  assert.ok(got.every((r) => !/mentorcloud|accenture/i.test(r.title)), JSON.stringify(got));
});

/* ---- 5. the verifier reads the rendered card, not its separate fields ---- */

test('a contradiction assembled across sections is caught on the finished card', () => {
  const card = {
    id: 'x', headline: forecasting.headline,
    what_it_is: 'Agents pull live Infor M3 data and generate purchase order suggestions by product category.',
    why_you: 'You built unified analytics across Infor M3 and Microsoft Fabric for an apparel supply chain client.',
    who_buys: 'Demand planner', growth_path: 'expand',
    stands_on: [{ id: 'E1', what: 'Infor M3 and Fabric analytics', url: 'https://x/1' }],
    first_offer: { name: 'Demand signal forecasting feasibility proof' },
    how_to_sell: { expansion: 'each further product category' },
    mechanism: benjieRecord.built,
    demo: [{ name: 'Benjie', does: 'claims, underwriting and policy servicing' }],
    reference: { title: 'Benjie: agents for Insurance', url: 'https://x/2' },
    resources: [{ id: 'r1', title: 'Multi-agent mentorship engine built for MentorCloud', url: 'https://x/3' }],
  };
  const out = verify([card], { industries: [{ name: 'manufacturing' }], capabilities: { industries: ['food and beverage'] } });
  assert.equal(card.mechanism, undefined, 'claims steps survived');
  assert.equal(card.demo, undefined, 'the insurance agent survived');
  assert.equal(card.reference, undefined, 'the insurance reference survived');
  assert.equal(card.resources.length, 0, 'the mentorship case study survived');
  assert.ok(out.issues.filter((i) => i.check === 'mismatch').length >= 4, JSON.stringify(out.issues));
});

test('a card whose sections agree is left alone', () => {
  const card = {
    id: 'y', headline: regression.headline,
    what_it_is: 'An orchestration agent identifies which Infor modules each update touches and executes the right regression suites.',
    why_you: 'You built Fortest and ran it for HamiltonJet across Infor CloudSuite.',
    who_buys: 'ERP operations manager', growth_path: 'win',
    stands_on: [{ id: 'E1', what: 'HamiltonJet regression testing', url: 'https://x/1' }],
    first_offer: { name: 'Regression test automation blueprint' },
    how_to_sell: { expansion: 'each further Infor module' },
    mechanism: ['Runs the regression suite against the modules each update touches', 'Produces a result log before sign off'],
    resources: [{ id: 'r2', title: 'IT operations: what we do', url: 'https://x/4' }],
  };
  const out = verify([card], { industries: [{ name: 'manufacturing' }] });
  assert.equal(out.cards.length, 1);
  assert.equal(card.mechanism.length, 2);
  assert.equal(out.issues.filter((i) => i.check === 'mismatch').length, 0, JSON.stringify(out.issues));
});

/* ---- the axes themselves ---- */

test('a domain conflict is a veto, and an absent domain is not a conflict', () => {
  assert.equal(conflicts(domains('insurance claims'), domains('manufacturing plant')), true);
  assert.equal(conflicts(domains('insurance claims'), domains('an agent that reads a form')), false);
});

test('process families tell apart work that shares vocabulary', () => {
  assert.ok(families('regression test suite for each release').has('testing'));
  assert.ok(families('demand forecast and replenishment planning').has('forecasting'));
  assert.ok(!families('demand forecast and replenishment planning').has('testing'));
});

test('the same work in a different ERP is still the same work', () => {
  const sap = {
    title: 'SAP order validation', kind: 'delivered', functions: ['procurement'],
    sellable_as: 'Validating purchase orders against SAP master data before submission',
    built: ['Reads the purchase order and checks each line against SAP master data'], topics: [],
  };
  const inforLine = {
    headline: 'Catch order errors before they reach your clients ERP',
    work: 'purchase order validation', unit: 'order type', function: 'procurement',
  };
  assert.equal(compatible(sap, inforLine, 'mechanism', scope).ok, true,
    'an SAP engagement is recognisable to an Infor client; a Jira one is not');
});

test('a record filed under five departments cannot carry proof', async () => {
  const { default: catalog } = await import('../data/catalog.json', { with: { type: 'json' } });
  const broad = Object.values(catalog.records).filter((r) => (r.functions ?? []).length >= 5);
  assert.ok(broad.every((r) => r.kind !== 'delivered'),
    `these are tagged everywhere and still count as engagements: ${broad.filter((r) => r.kind === 'delivered').map((r) => r.id)}`);
});

test('no record outside a customer engagement carries a result', async () => {
  const { default: catalog } = await import('../data/catalog.json', { with: { type: 'json' } });
  const bad = Object.values(catalog.records).filter((r) => r.kind !== 'delivered' && (r.results ?? []).length);
  assert.deepEqual(bad.map((r) => r.id), []);
});

test('neighbouring industries are not a conflict, distant ones still are', () => {
  assert.equal(conflicts(domains('manufacturing plant'), domains('supply chain distribution')), false);
  assert.equal(conflicts(domains('retail merchandising'), domains('warehouse logistics')), false);
  assert.equal(conflicts(domains('insurance claims'), domains('supply chain distribution')), true);
  assert.equal(conflicts(domains('bank lending'), domains('manufacturing plant')), true);
});
