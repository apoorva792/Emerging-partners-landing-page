/* node --test tests/
 *
 * These cover the rules that are enforced in code rather than asked for in a prompt: the
 * quote check behind every evidence record, the two-part score, the evidence gate, and
 * the bar a Lyzr record has to clear before its number may be printed on someone else's
 * card. Each one of them exists because it went wrong in a real run, so each one has a
 * test that fails if it is loosened by accident. No network. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { quoted, pagesToRead } from '../lib/evidence.js';
import { fitScore, lyzrScore, gate, total, WEIGHTS, worthResearching, adjacency, FLOOR, floorFor } from '../lib/score.js';

const page = `Arohak partnered with a Fortune-scale consumer healthcare enterprise to modernise
its procurement middleware. We migrated the integration layer onto SAP BTP and wired Ariba
into the existing EDI flows. Processing time fell by 83% and errors dropped tenfold.`;

test('a quote that is on the page counts', () => {
  assert.equal(quoted('We migrated the integration layer onto SAP BTP and wired Ariba into the existing EDI flows.', page), true);
});

test('a quote survives whitespace and line breaks being normalised', () => {
  assert.equal(quoted('modernise   its procurement middleware. We migrated the integration layer onto SAP BTP', page), true);
});

test('a paraphrase does not count', () => {
  assert.equal(quoted('We moved their procurement integrations to SAP Business Technology Platform.', page), false);
});

test('a quote too short to mean anything does not count', () => {
  assert.equal(quoted('SAP BTP', page), false);
});

/* ---- the capability map reads the right pages ---- */

test('delivered work is read before service pages, and thin pages are skipped', () => {
  const pages = [
    { kind: 'home', url: 'a', density: 9, text: 'x' },
    { kind: 'services', url: 'b', density: 2, text: 'x' },
    { kind: 'work', url: 'c', density: 12, text: 'x' },
    { kind: 'clients', url: 'd', density: 7, text: 'x' },
  ];
  const got = pagesToRead(pages).map((p) => p.url);
  assert.deepEqual(got.slice(0, 2), ['c', 'd']);
  assert.ok(!got.includes('a'), 'the home page is covered by the profiler, not the evidence pass');
  assert.ok(got.includes('b'), 'service pages still go in, for the advertised side');
});

/* ---- fit is computed from their evidence, not from the model's confidence ---- */

const caps = {
  basis: 'delivered',
  capabilities: [{ function: 'procurement', service: 'SAP procurement automation', projects: 3, confidence: 'high', stack: ['SAP BTP'] }],
  evidence: [
    { id: 'E1', what: 'SAP BTP procurement migration', function: 'procurement', grounded: true, basis: 'delivered', work: ['Migrated integration layer onto SAP BTP'], stack: ['SAP BTP', 'Ariba'], problem: 'manual procurement middleware', outcomes: ['83% faster'] },
    { id: 'E2', what: 'ServiceNow field service rollout', function: 'field service', grounded: true, basis: 'delivered', work: ['Implemented ServiceNow FSM'], stack: ['ServiceNow'], problem: 'dispatch', outcomes: [] },
    { id: 'E3', what: 'An ungrounded claim', function: 'finance', grounded: false, basis: 'delivered', work: [], stack: [], problem: '', outcomes: [] },
  ],
};

const opp = (over = {}) => ({
  headline: 'Automate SAP procurement order validation',
  work: 'procurement order validation',
  unit: 'order type',
  function: 'procurement',
  buyer: 'Procurement Operations Manager',
  paid_service: 'SAP procurement automation',
  customer_problem: 'order validation is manual',
  cites: ['E1'],
  commercial: 4, clarity: 4, feasibility: 4,
  ...over,
});

test('a candidate citing nothing scores zero on fit', () => {
  assert.equal(fitScore(opp({ cites: [] }), caps).score, 0);
});

test('a candidate citing an invented id scores zero on fit', () => {
  assert.equal(fitScore(opp({ cites: ['E9'] }), caps).score, 0);
});

test('a candidate whose only citation failed its quote check scores zero on fit', () => {
  assert.equal(fitScore(opp({ cites: ['E3'] }), caps).score, 0);
});

test('a candidate in a department they have delivered into scores above one they have not', () => {
  const near = fitScore(opp(), caps).score;
  const far = fitScore(opp({ function: 'finance', headline: 'Investment modelling', work: 'investment modelling', cites: ['E2'] }), caps).score;
  assert.ok(near > far, `${near} should beat ${far}`);
});

test('the Arohak failure: a finance idea cited to an unrelated engagement cannot clear the gate', () => {
  const o = opp({ function: 'finance', headline: 'Investment financial modelling for asset managers', work: 'investment modelling', paid_service: 'financial modelling', cites: ['E2'] });
  const fit = fitScore(o, caps);
  const lyzr = { score: 4, lead: {}, why: '' };
  assert.ok(fit.score < 2, `fit was ${fit.score}`);
  assert.equal(gate(o, fit, lyzr).pass, false);
});

test('evidence from a service page is capped below evidence from an engagement', () => {
  const advertised = {
    basis: 'advertised',
    capabilities: [],
    evidence: [{ ...caps.evidence[0], basis: 'advertised' }],
  };
  const got = fitScore(opp(), advertised);
  assert.equal(got.advertised, true);
  assert.ok(got.score <= 3, `advertised evidence scored ${got.score}`);
  assert.ok(got.score >= 2, 'but it still has to be able to pass the gate');
});

/* ---- the Lyzr side ---- */

const record = (over = {}) => ({ id: 'cs_x', kind: 'delivered', confidence: 'high', built: ['a', 'b'], title: 'A story', ...over });

test('no Lyzr record on point means no defensible advantage, and the gate fails', () => {
  const lyzr = lyzrScore(opp(), [{ r: record(), s: 4 }]);
  assert.equal(lyzr.score, 0);
  assert.equal(gate(opp(), fitScore(opp(), caps), lyzr).pass, false);
});

test('a close Lyzr match scores above a loose one', () => {
  const close = lyzrScore(opp(), [{ r: record(), s: 20 }]).score;
  const loose = lyzrScore(opp(), [{ r: record(), s: 10 }]).score;
  assert.ok(close > loose, `${close} should beat ${loose}`);
});

/* ---- the two judgements stay apart ---- */

test('a brilliant idea with no evidence behind it still fails', () => {
  const o = opp({ cites: [], commercial: 5, clarity: 5, feasibility: 5 });
  const fit = fitScore(o, caps);
  const lyzr = lyzrScore(o, [{ r: record(), s: 20 }]);
  const score = total({ fit: fit.score, lyzr: lyzr.score, adjacency: 5, monetisation: 5, trigger: 5 });
  assert.ok(score >= 50, 'it scores well');
  assert.equal(gate(o, fit, lyzr).pass, false, 'and is still not shown');
});

test('the weights are the ones the brief promises', () => {
  assert.deepEqual(WEIGHTS, { fit: 0.30, adjacency: 0.25, lyzr: 0.20, monetisation: 0.15, trigger: 0.10 });
  assert.equal(Math.round(Object.values(WEIGHTS).reduce((a, b) => a + b, 0) * 100), 100);
  assert.equal(total({ fit: 5, adjacency: 5, lyzr: 5, monetisation: 5, trigger: 5 }), 100);
  /* A missing dimension costs its weight rather than defaulting to full marks. */
  assert.equal(total({ fit: 5, adjacency: 5, lyzr: 5, monetisation: 5 }), 90);
});

test('adjacency is measured from their evidence, not asked of the model', () => {
  const near = adjacency(opp(), caps, fitScore(opp(), caps), null);
  const far = adjacency(
    opp({ function: 'finance', headline: 'Investment modelling', work: 'investment modelling' }),
    caps, fitScore(opp({ function: 'finance', cites: ['E2'] }), caps), null);
  assert.ok(near > far, `${near} should beat ${far}`);
});

test('the floor is what stops a kit padding to three', () => {
  assert.ok(FLOOR >= 65 && FLOOR <= 80, `an implausible floor: ${FLOOR}`);
  const weak = total({ fit: 3, adjacency: 3, lyzr: 3, monetisation: 3, trigger: 3 });
  assert.ok(weak < FLOOR, `a card of threes should not reach the page: ${weak}`);
  const strong = total({ fit: 4.5, adjacency: 4, lyzr: 4, monetisation: 4, trigger: 4 });
  assert.ok(strong >= FLOOR, `a genuinely strong card should: ${strong}`);
});

test('only a thin-evidence candidate with real commercial weight is worth a second look', () => {
  const thin = { opp: opp({ commercial: 5 }), gate: { pass: false, fails: ['their own delivered work does not support this capability'] } };
  const weak = { opp: opp({ commercial: 2 }), gate: { pass: false, fails: ['their own delivered work does not support this capability'] } };
  const noLyzr = { opp: opp({ commercial: 5 }), gate: { pass: false, fails: ['no defensible Lyzr advantage'] } };
  const got = worthResearching([thin, weak, noLyzr]);
  assert.equal(got.length, 1);
  assert.equal(got[0], thin);
});

/* ---- a site we could not read at all ---- */

test('with no readable site a candidate stands on the profile alone, at the floor', () => {
  const got = fitScore(opp(), null);
  assert.equal(got.profileOnly, true);
  assert.equal(got.score, 2);
  assert.equal(gate(opp(), got, { score: 4 }).pass, true, 'a dead end is worse than a hypothesis');
  assert.equal(gate(opp(), got, { score: 0 }).pass, false, 'but the Lyzr side is still checked');
});

test('an empty capability map is treated the same as none', () => {
  assert.equal(fitScore(opp(), { basis: 'delivered', capabilities: [], evidence: [] }).profileOnly, true);
});

test('the floor moves with how much of their site we could read', () => {
  const delivered = { basis: 'delivered', evidence: [{ id: 'E1' }] };
  const advertised = { basis: 'advertised', evidence: [{ id: 'E1' }] };
  assert.equal(floorFor(delivered), 70);
  assert.ok(floorFor(advertised) < floorFor(delivered),
    'a firm that publishes no engagements has a lower ceiling and needs a lower bar');
  assert.ok(floorFor(null) < floorFor(advertised), 'and a firm whose site we could not read at all, lower still');

  /* The ceiling is the reason. Fit is capped at 3 on an advertised basis and the
   * projects and outcomes points cannot be earned, so the best reachable score is well
   * under what a documented firm reaches on a middling candidate. */
  const bestAdvertised = total({ fit: 3, adjacency: 4, lyzr: 5, monetisation: 5, trigger: 5 });
  assert.ok(bestAdvertised < 90 && bestAdvertised >= floorFor(advertised));
});
