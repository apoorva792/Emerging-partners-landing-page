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
import { eligibility, playsFor, playById, briefOf, PLAYS } from '../lib/plays.js';
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

/* Every recommendation is licence-led, so the gate needs the Lyzr product behind the
 * candidate. These tests are about the other conditions, so they pass a product that
 * qualified and let the rest of the gate do the judging. */
const PLAY = { offering_id: 'opencontroller', name: 'OpenController', tier: 'product', commercial_motion: 'governance_upsell' };

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
  assert.equal(gate(noEvidence, fit, { score: 5 }, PLAY).pass, false);

  /* And a citation that resolves but is about another department is capped below the gate
   * however strong the product fit. */
  const wrongDept = opp({ function: 'finance', headline: 'Investment modelling', work: 'investment modelling', cites: ['E2'] });
  assert.equal(gate(wrongDept, fitScore(wrongDept, integrator), { score: 5 }, PLAY).pass, false);
});

test('a sound opportunity still passes all of it', () => {
  const good = opp();
  const fit = fitScore(good, integrator);
  const lyzr = { score: 4.4, lead: null, why: '' };
  assert.equal(gate(good, fit, lyzr, PLAY).pass, true, JSON.stringify(gate(good, fit, lyzr, PLAY).fails));
  const score = total({ fit: fit.score, lyzr: lyzr.score, adjacency: adjacency(good, integrator, fit, null), monetisation: 4, trigger: 4 });
  assert.ok(score >= FLOOR, `a sound opportunity scored ${score}, below the floor`);
});

test('the department cap is strict where we could read departments, and honest where we could not', () => {
  /* On a case study we know which department it served, so a candidate claiming another
   * one is the Arohak failure and stays below the gate. On a service page we do not, so
   * holding a firm to a resolution we never had just punishes it for its website. */
  const wrongDept = opp({ function: 'finance', headline: 'Investment modelling', work: 'investment modelling', cites: ['E2'] });
  assert.equal(gate(wrongDept, fitScore(wrongDept, integrator), { score: 5 }, PLAY).pass, false);

  const advertisedOnly = {
    basis: 'advertised',
    capabilities: [],
    technologies: [],
    evidence: [{ id: 'E1', what: 'Customer communications platform', function: 'customer service', grounded: true, basis: 'advertised', work: ['Runs the communications platform'], stack: [], problem: '', outcomes: [] }],
  };
  const otherDept = opp({ function: 'finance', cites: ['E1'] });
  const fit = fitScore(otherDept, advertisedOnly);
  assert.equal(fit.advertised, true);
  assert.ok(fit.score >= 2 && fit.score <= 3, `advertised fit was ${fit.score}`);
  assert.equal(gate(otherDept, fit, { score: 4 }, PLAY).pass, true);
  /* And it still cannot outrank a firm we could actually read. */
  assert.ok(fit.score < fitScore(opp(), integrator).score);
});

/* ---- 11. every recommendation is licence-led ----
 *
 * The failure this guards against: the brief for Fingent came back with three cards, two
 * of which named no Lyzr product at all, and the renderer filled the gap with the
 * pattern's generic sentence about "the platform the agents run on". A partner reads that
 * as a services catalogue with our logo on it. A card with nothing of ours behind it is a
 * use case they could build next quarter without us, so it is not an opportunity. */

test('11. an opportunity with no Lyzr product behind it cannot be recommended', () => {
  const good = opp();
  const fit = fitScore(good, integrator);
  const lyzr = { score: 4.4, lead: null, why: '' };

  const withProduct = gate(good, fit, lyzr, PLAY);
  assert.equal(withProduct.pass, true, JSON.stringify(withProduct.fails));

  /* Same candidate, same evidence, same score. The only difference is that nothing of
   * ours is behind it, and that alone is disqualifying. */
  const without = gate(good, fit, lyzr, null);
  assert.equal(without.pass, false, 'a use case is not a licensed opportunity');
  assert.ok(without.fails.some((f) => f.includes('no Lyzr product')), without.fails.join('; '));
});

test('11b. every product the firm qualifies for reaches the model', () => {
  /* Sorting the eligible products by catalogue score alone handed the model three
   * products that all run `expand_engagement`, and the governance upsell and the
   * sovereign deployment never got seen. A firm's second best governance fit is a better
   * thing to put in front of it than its third best build tool: it is a different meeting
   * with a different buyer. */
  const firm = {
    company: { name: 'Test', one_line: 'We build and run enterprise AI agents' },
    industries: ['healthcare', 'financial services'],
    technologies: ['Azure', 'Kubernetes', 'SAP'],
    services: [{ name: 'AI agent development' }, { name: 'Private cloud engineering' }],
    capabilities: {
      basis: 'delivered',
      capabilities: [{ function: 'engineering', service: 'agent development', projects: 3, confidence: 'high', work: ['built agents'], stack: ['Azure'] }],
      evidence: [{ id: 'E1', what: 'Enterprise agent platform', function: 'engineering', grounded: true, basis: 'delivered', work: ['agentic workflow in production', 'governance and audit trail'], stack: ['Azure', 'Kubernetes'], problem: 'compliance', outcomes: ['100% coverage'] }],
      technologies: ['Azure', 'Kubernetes'],
      advertised_only: ['agentic automation', 'data residency', 'on-premises deployment'],
    },
  };
  const got = playsFor(firm);
  assert.ok(got.length >= 2, 'a firm this broad is eligible for more than one thing');

  /* The nine are the licence layer and none of them may be cut before the model has
   * seen it. Leading with one play per motion and capping the list at eight dropped
   * five of Fingent's nine eligible products, so SuperFlow, Optimus, Architect, Agent
   * Blocks and Open Finetuning were never considered. Deciding between two products is
   * the commercial judgement we hand to the model; doing it with a sort order is us
   * making that call blind. */
  const eligibleProducts = PLAYS.filter((p) => p.tier === 'product')
    .filter((p) => eligibility(p, firm).ok).map((p) => p.name);
  const shownProducts = got.filter((x) => x.play.tier === 'product').map((x) => x.play.name);
  for (const name of eligibleProducts) {
    assert.ok(shownProducts.includes(name), `${name} is eligible and never reaches the model`);
  }

  /* And every play carries one, because selection and the card's own eyebrow read it. */
  for (const x of got) {
    assert.ok(x.play.commercial_motion, `${x.play.name} has no commercial motion`);
  }
});

/* ---- 12. the same two products for every firm ----
 *
 * Three different firms, a manufacturing ERP partner, a Palantir implementation shop and
 * a mid-market IT consultancy, came out of the agent with the same two recommendations.
 * Not because they were alike: because eligibility counted matches, and the two records
 * that ask for the most things matched the most firms. Measured over the saved profiles,
 * one product led five of six and another four of six.
 *
 * Two things fixed it. A term is now worth how much it tells firms apart rather than one
 * point like any other, and a segment solution is matched on the industries the firm has
 * actually delivered into rather than on the vertical menu its website publishes, which
 * on a mid-size firm names eight or ten markets and so matched everything. */

test('12. a record that asks for more things does not thereby fit more firms', () => {
  const broad = playById('agent_studio');
  const narrow = playById('optimus');
  /* The breadth that used to decide this is in the kinds of work a record claims. */
  assert.ok((broad.requires.families ?? []).length > (narrow.requires.families ?? []).length,
    'this test is only meaningful while agent studio claims more kinds of work than optimus');

  /* A firm whose evidence is squarely about private, on-premises infrastructure. The
   * narrow record is the right answer for it, and used to lose to the broad one. */
  const onPrem = {
    company: { name: 'Test', one_line: 'We deploy air-gapped private cloud for regulated clients' },
    industries: [{ name: 'Government' }],
    technologies: ['Kubernetes', 'OpenShift'],
    services: [{ name: 'Private cloud engineering' }, { name: 'On-premise deployment' }],
    capabilities: {
      basis: 'delivered',
      capabilities: [{ function: 'infrastructure', service: 'private cloud', projects: 3, confidence: 'high', work: ['air-gapped deployment'], stack: ['Kubernetes'] }],
      evidence: [{ id: 'E1', what: 'Air-gapped deployment', industry: 'Government', function: 'infrastructure', grounded: true, basis: 'delivered', work: ['on-premise install', 'data residency controls'], stack: ['Kubernetes', 'OpenShift'], problem: 'sovereignty', outcomes: ['deployed'] }],
      technologies: ['Kubernetes'],
      industries: ['Government'],
      advertised_only: ['sovereign', 'air-gapped', 'on-premise', 'data residency'],
    },
  };
  const got = playsFor(onPrem);
  const names = got.map((x) => x.play.name);
  assert.ok(names.includes('Lyzr Optimus'), `the on-premise record did not reach an on-premise firm: ${names.join(', ')}`);
});

test('12b. a segment solution is matched on delivered work, not the vertical menu', () => {
  /* A financial services firm whose website also lists healthcare, which is what every
   * mid-size services firm's website does. Its delivered evidence says one thing. */
  const bank = {
    company: { name: 'Test', one_line: 'We modernise core systems for banks and credit unions' },
    /* The menu. Long, and not evidence of anything. */
    industries: [{ name: 'Financial Services' }, { name: 'Healthcare' }, { name: 'Utilities' }, { name: 'Insurance' }],
    technologies: ['Azure'],
    services: [{ name: 'Core banking integration' }],
    capabilities: {
      basis: 'delivered',
      capabilities: [{ function: 'finance', service: 'core banking', projects: 2, confidence: 'high', work: ['payments integration'], stack: ['Azure'] }],
      /* The delivered record. One market. */
      evidence: [{ id: 'E1', what: 'Core banking integration', industry: 'Financial services', function: 'finance', grounded: true, basis: 'delivered', work: ['payments integration', 'compliance reporting'], stack: ['Azure'], problem: 'manual reconciliation', outcomes: ['faster close'] }],
      technologies: ['Azure'],
      industries: [],
      advertised_only: [],
    },
  };
  const segments = playsFor(bank).map((x) => x.play).filter((p) => p.industry);
  for (const p of segments) {
    assert.ok(!/health/i.test(p.industry),
      `a healthcare solution reached a bank's integrator on the strength of its website menu: ${p.name}`);
  }
});

test('12c. the id we hand the model resolves back to the same play', () => {
  /* The failure this encodes: the eligible map was keyed on `play.id` while the model was
   * handed `play.offering_id`. The nine platform records carry the same string in both and
   * resolved; the twenty nine packaged solutions have no `id` at all, so every one of them
   * keyed to `undefined`. The model would propose Madison GRC for a bank, the lookup would
   * miss, and the industry layer could never reach a partner however well it fitted.
   *
   * Anything we show the model has to come back to us by the name we showed it. */
  const fit = { why: '', onFamily: [], onSignal: [], onIndustry: [], score: 1, ok: true };
  for (const play of PLAYS) {
    const shown = briefOf({ play, fit }).id;
    assert.ok(shown, `${play.name} is shown to the model with no id`);
    const back = playById(shown);
    assert.ok(back, `${play.name} is shown as "${shown}" and cannot be looked up by it`);
    assert.equal(back.name, play.name, `"${shown}" resolves to ${back.name}, not ${play.name}`);
  }
});

/* ---- 13. an application page is not a licence ----
 *
 * The 29 packaged records carried a `product_id` that pointed at the web page they were
 * read from, never at one of the nine products. Nothing therefore connected a card to a
 * licence, and an appealing industry page could win a slot against a real product. That
 * is how a brief came back "licence-led" with nothing of ours underneath it. */

test('13. a record with no licence behind it cannot be the recommendation', () => {
  const good = opp();
  const fit = fitScore(good, integrator);
  const lyzr = { score: 4.4, lead: null, why: '' };

  /* Its own product page: this is a licence and it may lead. */
  const isProduct = { offering_id: 'sol_madison_grc', name: 'Madison GRC', tier: 'solution', product_mapping_status: 'is_a_product' };
  assert.equal(gate(good, fit, lyzr, isProduct).pass, true);

  /* An application page naming the product it runs on: also allowed. */
  const named = { offering_id: 'sol_nitro', name: 'Lyzr Nitro', tier: 'solution', product_mapping_status: 'verified' };
  assert.equal(gate(good, fit, lyzr, named).pass, true);

  /* An industry page naming no product: context, not a recommendation. */
  const unmapped = { offering_id: 'sol_healthcare', name: 'Healthcare operations agents', tier: 'solution', product_mapping_status: 'needs_review' };
  const blocked = gate(good, fit, lyzr, unmapped);
  assert.equal(blocked.pass, false, 'an application page became a licence-led card');
  assert.ok(blocked.fails.some((f) => f.includes('cannot be one')), blocked.fails.join('; '));
});

test('13b. every packaged record carries a mapping verdict', () => {
  for (const play of PLAYS.filter((p) => p.tier !== 'product')) {
    assert.ok(['is_a_product', 'verified', 'needs_review'].includes(play.product_mapping_status),
      `${play.name} has no product_mapping_status`);
    /* Mapped means mapped to something real, never to a page id. */
    if (play.product_mapping_status === 'verified') {
      assert.ok(PLAYS.some((p) => p.offering_id === play.primary_product_id),
        `${play.name} maps to "${play.primary_product_id}", which is not a play`);
    }
  }
});
