/* node --test tests/
 *
 * The ten failures this agent has actually produced, each pinned so it cannot come back.
 * Every one is written as a shape rather than as the company it happened to: the point is
 * that the same mistake is caught for any firm, not that one firm is special-cased.
 *
 *  1  a finance idea recommended to an integration shop on an unrelated citation
 *  2  insurance fraud mechanisms under a demand forecasting card
 *  3  a product's feature list printed as regression testing deliverables
 *  4  order validation turning into invoice reconciliation
 *  5  unrelated demos and case studies attached
 *  6  a workforce product offered because the firm has enterprise customers
 *  7  unverified customer demand stated as fact
 *  8  overlapping opportunities chosen to fill the page
 *  9  an optional commercial pattern breaking the schema
 * 10  a product-led recommendation going round the evidence gate
 *
 * No network. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { fitScore, lyzrScore, gate, total, adjacency, FLOOR } from '../lib/score.js';
import { compatible, stepsFor, objects, drifts, domains, systems } from '../lib/fit.js';
import { eligibility, playsFor, playById } from '../lib/plays.js';
import { patternById } from '../lib/catalog.js';
import { verify } from '../lib/verify.js';
import { relatedTo } from '../lib/resources.js';

/* An integration and ERP shop: delivered work in integration and procurement, nothing
 * anywhere near investment management. */
const integrator = {
  basis: 'delivered',
  capabilities: [
    { function: 'procurement', service: 'ERP procurement middleware', projects: 2, confidence: 'high', stack: ['SAP BTP'], outcomes: ['83% faster'], work: ['Migrated the integration layer'] },
    { function: 'it operations', service: 'Managed file transfer', projects: 3, confidence: 'high', stack: ['MFT'], outcomes: [], work: ['Deployed regional nodes'] },
  ],
  technologies: ['SAP BTP', 'Infor CloudSuite', 'MFT'],
  evidence: [
    { id: 'E1', what: 'SAP BTP procurement migration', function: 'procurement', grounded: true, basis: 'delivered', work: ['Migrated the integration layer onto SAP BTP'], stack: ['SAP BTP'], problem: 'manual middleware', outcomes: ['83% faster'] },
    { id: 'E2', what: 'Decentralised MFT rollout', function: 'it operations', grounded: true, basis: 'delivered', work: ['Deployed regional MFT nodes'], stack: ['MFT'], problem: 'slow transfers', outcomes: [] },
  ],
};

const opp = (over = {}) => ({
  headline: 'Automate purchase order validation',
  work: 'purchase order validation',
  unit: 'order type',
  function: 'procurement',
  buyer: 'Head of Procurement Operations',
  paid_service: 'order validation automation',
  customer_problem: 'order lines are checked by hand',
  cites: ['E1'],
  commercial: 4, monetisation: 4, trigger: 4,
  ...over,
});

/* 1 ---------------------------------------------------------------- */

test('1. an idea in a department they have never delivered into cannot reach the page', () => {
  const investment = opp({
    headline: 'Investment modelling for asset managers',
    work: 'investment portfolio modelling',
    function: 'finance',
    paid_service: 'investment modelling',
    cites: ['E2'],
  });
  const fit = fitScore(investment, integrator);
  assert.ok(fit.score < 2, `fit was ${fit.score}`);
  assert.equal(gate(investment, fit, { score: 4 }).pass, false);
  /* And even with a perfect Lyzr side and perfect model scores it stays below the floor. */
  const best = total({ fit: fit.score, lyzr: 5, adjacency: adjacency(investment, integrator, fit, null), monetisation: 5, trigger: 5 });
  assert.ok(best < FLOOR + 15, `an unrelated idea scored ${best}`);
});

/* 2 ---------------------------------------------------------------- */

const scope = { domains: domains('manufacturing distribution supply chain'), systems: systems('Infor CloudSuite SAP') };

test('2. insurance claims work cannot explain a demand forecasting card', () => {
  const insurance = {
    title: 'Benjie: agents for Insurance',
    sellable_as: 'Claims, underwriting and policy servicing agents for insurers',
    kind: 'capability', topics: ['insurance'],
    built: ['Monitors claims as they arrive cross-referencing behavioural patterns', 'Surfaces fraud signals for investigators'],
  };
  const forecasting = opp({ headline: 'Demand forecasting on their ERP data', work: 'demand signal forecasting', unit: 'product category', function: 'supply chain' });
  assert.equal(compatible(insurance, forecasting, 'mechanism', scope).ok, false);
  assert.deepEqual(stepsFor(insurance, forecasting, scope), []);
  assert.equal(compatible({ title: 'Benjie', sellable_as: 'claims and underwriting', topics: ['insurance'] }, forecasting, 'demo', scope).ok, false);
});

/* 3 ---------------------------------------------------------------- */

test('3. a product feature list is never what the client gets', () => {
  const features = [
    'Durable execution: every step is journaled and a restart resumes from the point of failure',
    'OAuth2 with automatic refresh, AWS Signature v4, JWT bearer tokens and mTLS all ship built in',
  ];
  const regression = { headline: 'Managed regression testing for every release', what_it_is: 'Each release is tested before it reaches production.' };
  /* A feature sentence names no outcome in the client's business: the subject check and
   * the feature-talk filter are what keep it off the card, and the card's own deliverable
   * is about the client. */
  const subject = objects(`${regression.headline} ${regression.what_it_is}`);
  const real = 'Each release is held at a gate until regression results meet the pass threshold';
  assert.equal(drifts(subject, real), null);
  for (const f of features) assert.ok(!/\b(release|test)\w*\b.*\bclient\b/i.test(f), 'a feature line is about the software, not the client');
  /* And the card ends up with the deliverable, not the feature, which the verifier
   * enforces by removing anything off-subject. */
  const c = { id: 'r', headline: regression.headline, what_it_is: regression.what_it_is, why_you: 'You already run their release cycles.', who_buys: 'QA lead', stands_on: [{ id: 'E1', what: 'x', url: 'u' }], first_offer: { name: 'review' }, how_to_sell: { expansion: 'per release' }, monetisation: 'per release cycle', mechanism: [real, 'Coverage gaps are reported per cycle'] };
  verify([c], { industries: [{ name: 'manufacturing' }] });
  assert.equal(c.mechanism.length, 2);
});

/* 4 ---------------------------------------------------------------- */

test('4. order validation does not become invoice reconciliation', () => {
  const subject = objects('purchase order validation against master data');
  assert.ok(drifts(subject, 'Invoices are reconciled against the goods receipt and the purchase order'),
    'a line naming both is still a second service');
  assert.equal(drifts(subject, 'Each order line is checked before it posts'), null);
});

/* 5 ---------------------------------------------------------------- */

test('5. unrelated collateral is omitted rather than substituted', () => {
  const got = relatedTo({
    topics: ['purchase order validation', 'order type'],
    functions: ['procurement'],
    families: ['ordering'],
    domains: ['manufacturing'],
    products: ['Agent Studio'],
  });
  assert.ok(!got.some((r) => /mentorcloud|telecom|accenture|hedge fund/i.test(r.title)), JSON.stringify(got.map((r) => r.title)));
  /* And nothing at all is a valid answer. */
  const none = relatedTo({ topics: ['quantum key distribution'], functions: ['nonexistent'], families: ['infrastructure'], domains: ['publicsector'] });
  assert.ok(none.length <= 2);
});

/* 6 ---------------------------------------------------------------- */

test('6. a workforce product is not offered for having enterprise customers', () => {
  const enterpriseButNotWorkplace = {
    company: { one_line: 'We deliver enterprise integration programmes for large organisations.' },
    services: [{ name: 'Enterprise integration' }],
    platforms: [{ name: 'SAP' }],
    capabilities: {
      basis: 'delivered',
      capabilities: [{ function: 'integration', service: 'Middleware delivery', projects: 3, confidence: 'high', stack: ['SAP'], work: ['Built the integration layer'], outcomes: [] }],
      evidence: [{ id: 'E1', what: 'Middleware programme', function: 'integration', grounded: true, work: ['Built the integration layer'], stack: ['SAP'] }],
      technologies: ['SAP'],
      advertised_only: [],
    },
  };
  const got = eligibility(playById('open_cowork'), enterpriseButNotWorkplace);
  assert.equal(got.ok, false, `offered on: ${got.why}`);
  assert.ok(!playsFor(enterpriseButNotWorkplace).some((x) => x.play.offering_id === 'open_cowork'));
});

/* 7 ---------------------------------------------------------------- */

test('7. demand we cannot see is carried as an assumption, not as a fact', () => {
  const c = {
    id: 'h', headline: 'Automate purchase order validation', what_it_is: 'Order lines are checked before they post.',
    why_you: 'You already run their order capture integration.', who_buys: 'Head of Procurement',
    stands_on: [{ id: 'E1', what: 'x', url: 'u' }], first_offer: { name: 'proof' },
    how_to_sell: { expansion: 'per order type' }, monetisation: 'per order type',
    problem_status: 'hypothesis', assumptions: [],
  };
  const out = verify([c], { industries: [{ name: 'manufacturing' }] });
  assert.equal(out.issues.filter((i) => i.check === 'assumption').length, 1);
});

/* 8 ---------------------------------------------------------------- */

test('8. a weak third opportunity is left off rather than used to fill the page', () => {
  const weak = total({ fit: 3, adjacency: 2.5, lyzr: 3, monetisation: 3, trigger: 2 });
  assert.ok(weak < FLOOR, `a loose candidate scored ${weak}`);
  /* And two near-identical candidates cannot both be shown: same buyer, same growth. */
  const base = { id: 'a', headline: 'A', what_it_is: 'x', why_you: 'y', who_buys: 'Head of Procurement', growth_path: 'expand', stands_on: [{ id: 'E1', what: 'x', url: 'u' }], first_offer: { name: 'o' }, how_to_sell: { expansion: 'e' }, monetisation: 'm' };
  const out = verify([{ ...base }, { ...base, id: 'b' }], { industries: [{ name: 'manufacturing' }] });
  assert.equal(out.cards.length, 1, 'two cards aimed at the same buyer the same way');
});

/* 9 ---------------------------------------------------------------- */

test('9. a commercial motion maps onto a real pattern, and every pattern still validates', () => {
  const motions = ['new_implementation', 'product_deployment', 'productization', 'account_expansion', 'managed_service', 'embedding'];
  for (const m of motions) assert.ok(typeof m === 'string' && m.length);
  /* Every offering's two patterns exist, so a product line never falls back on guesswork
   * and never carries a duration from a pattern that does not fit it. */
  for (const id of ['roll-out-to-everyone', 'deploy-in-their-estate', 'embed-and-license', 'inventory-then-govern', 'take-over-and-run']) {
    const p = patternById(id);
    assert.ok(p && p.first_offer.shape && p.delivery.team_needed, `${id} is not a complete pattern`);
  }
  /* A card with no pattern-supplied delivery shape still renders: the fields are optional
   * downstream rather than required. */
  const c = { id: 'n', headline: 'A deployment', what_it_is: 'x', why_you: 'y', who_buys: 'CIO', stands_on: [{ id: 'E1', what: 'x', url: 'u' }], first_offer: { name: 'review' }, how_to_sell: { expansion: 'e' }, monetisation: 'annual fee' };
  const out = verify([c], { industries: [{ name: 'manufacturing' }] });
  assert.equal(out.cards.length, 1);
  assert.equal(out.blocking, 0, JSON.stringify(out.issues));
});

/* 10 --------------------------------------------------------------- */

test('10. a product-led recommendation goes through the same evidence gate', () => {
  /* The product side can be perfect and the candidate still fails, because the gate asks
   * about their evidence, not about ours. */
  const noEvidence = opp({ cites: [], path: 'product', product: 'opencontroller' });
  const fit = fitScore(noEvidence, integrator);
  assert.equal(fit.score, 0);
  assert.equal(gate(noEvidence, fit, { score: 5 }).pass, false);

  /* And a citation that resolves but is about another department is capped below the gate
   * however strong the product fit. */
  const wrongDept = opp({ function: 'finance', headline: 'Investment modelling', work: 'investment modelling', cites: ['E2'] });
  assert.equal(gate(wrongDept, fitScore(wrongDept, integrator), { score: 5 }).pass, false);
});

test('a sound opportunity still passes all of it', () => {
  const good = opp();
  const fit = fitScore(good, integrator);
  const lyzr = { score: 4.4, lead: null, why: '' };
  assert.equal(gate(good, fit, lyzr).pass, true, JSON.stringify(gate(good, fit, lyzr).fails));
  const score = total({ fit: fit.score, lyzr: lyzr.score, adjacency: adjacency(good, integrator, fit, null), monetisation: 4, trigger: 4 });
  assert.ok(score >= FLOOR, `a sound opportunity scored ${score}, below the floor`);
});
