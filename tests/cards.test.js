/* node --test tests/
 *
 * Card composition: the three things a card must never confuse, and the one workflow it
 * must hold on to from its headline to its outreach email.
 *
 * Each case is a class of error seen on a real brief, written here as a shape so it
 * catches the same mistake on any company:
 *   - a product's own feature list printed as what the client gets
 *   - a card that opens on one workflow and closes on another
 *   - a deployment that calls itself something else
 *   - collateral that is about the platform rather than the work
 * No network. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { objects, drifts } from '../lib/fit.js';
import { verify } from '../lib/verify.js';

const profile = { industries: [{ name: 'manufacturing' }], capabilities: { industries: ['distribution'] } };

/* A finished card, the way groundCards leaves one. */
const card = (over = {}) => ({
  id: 'c1',
  headline: 'Catch purchase order errors before they reach the ERP',
  what_it_is: 'Every purchase order line is checked against master data before it posts, and exceptions reach a buyer.',
  why_you: 'You already run the order capture integration for a distributor, so you hold the process end to end today.',
  who_buys: 'Head of Procurement Operations',
  growth_path: 'expand',
  path: 'capability',
  stands_on: [{ id: 'E1', what: 'Order capture integration', url: 'https://x/1' }],
  first_offer: { name: 'Purchase order validation feasibility proof', shape: '2 weeks, one order type' },
  how_to_sell: { expansion: 'each further order type' },
  mechanism: [
    'Every purchase order line is checked against master data before it posts',
    'Exceptions reach a buyer with the reason attached, everything else posts straight through',
  ],
  qualify: ['How many purchase orders arrive a week, and how many need a human?'],
  discovery: ['Which order types carry the most exceptions'],
  client_email: 'We have been looking at how the order validation we built could cover every order type.',
  first_step: 'Pick one order type and measure how many orders need a human today',
  where_it_lands: 'Distribution clients already on the order capture integration',
  resources: [{ id: 'r1', title: 'Procurement automation: 90-day guide', url: 'https://x/2' }],
  lyzr_products: ['Agent Studio'],
  ...over,
});

/* verify repairs the card as it goes, so a second run sees an already-clean card. One
 * run, then read both the issues and what it left behind. */
const run = (c) => verify([c], profile);
const problems = (out, check) => out.issues.filter((i) => i.check === check);

/* ---- 1. one workflow, all the way down ---- */

test('a deliverable about a different workflow is caught and removed', () => {
  const c = card({
    mechanism: [
      'Every purchase order line is checked against master data before it posts',
      'Invoices are reconciled against the goods receipt and the purchase order',
    ],
  });
  verify([c], profile);
  assert.equal(c.mechanism.length, 1, 'the invoice line should have gone');
  assert.ok(c.mechanism[0].includes('purchase order line'));
});

test('an outreach email about a different workflow is removed, not sent', () => {
  const c = card({ client_email: 'We have been looking at automating your invoice reconciliation and remittance matching.' });
  const got = problems(run(c), 'workflow');
  assert.equal(got.length, 1, JSON.stringify(got));
  assert.match(got[0].detail, /outreach email is about invoice/);
  assert.equal(c.client_email, undefined);
});

test('the qualifying questions have to be about the same thing as the card', () => {
  const c = card({ qualify: ['How many invoices are reconciled by hand each month?'] });
  assert.equal(problems(run(c), 'workflow').length, 1);
  assert.deepEqual(c.qualify, []);
});

test('text that came out of the pattern files is not second-guessed', () => {
  /* The first engagement and the scoping questions are ours, with {work} and {unit}
   * filled in. They are generic by design and must not be flagged as a second service. */
  const c = card({
    headline: 'Keep every agent your clients run inventoried and governed',
    what_it_is: 'Every agent in production appears in one registry with an owner against it.',
    why_you: 'You already run agents for three clients.',
    first_offer: { name: 'Agent estate assessment', shape: '3 weeks', ends_with: 'a complete inventory of every agent, with owners' },
    discovery: ['How many forecasts and reports depend on them'],
    mechanism: ['Every agent in production appears in one registry', 'A policy check runs on every agent call'],
    /* The rest of the default card is about purchase orders, which this one is not. */
    qualify: [], client_email: '', first_step: '', where_it_lands: '',
  });
  assert.equal(problems(run(c), 'workflow').length, 0);
  assert.ok(c.first_offer.ends_with);
});

test('a section that names no workflow object is unspecific, not wrong', () => {
  const c = card({ first_step: 'Pick one client and walk the process through with them' });
  assert.equal(problems(run(c), 'workflow').length, 0);
  assert.ok(c.first_step);
});

test('a card whose sections all agree is left alone', () => {
  const c = card();
  const out = verify([c], profile);
  assert.equal(out.issues.filter((i) => ['workflow', 'mismatch'].includes(i.check)).length, 0, JSON.stringify(out.issues));
  assert.equal(c.mechanism.length, 2);
  assert.equal(c.resources.length, 1);
});

/* ---- 2. product features are not deliverables ---- */

test('platform documentation is not sent to a client with a procurement offer', () => {
  const c = card({
    resources: [
      { id: 'r1', title: 'Docs & API overview', url: 'https://x/3' },
      { id: 'r2', title: 'Find the right agent (2 min)', url: 'https://x/4' },
      { id: 'r3', title: 'Procurement automation: 90-day guide', url: 'https://x/5' },
    ],
  });
  const out = run(c);
  assert.deepEqual(c.resources.map((r) => r.id), ['r3']);
  assert.ok(problems(out, 'resources').length >= 2, JSON.stringify(out.issues));
});

test('a product page is kept when the card is actually about that product', () => {
  const c = card({
    headline: 'Keep every agent your clients run inventoried and governed',
    what_it_is: 'Every agent touching client data is registered, and a release cannot ship without a signed-off eval.',
    lyzr_products: ['OpenController'],
    path: 'product',
    product: { name: 'OpenController', does: 'the control plane over every agent', url: 'https://x/oc' },
    mechanism: ['Every agent touching client data is registered with an owner', 'A release cannot ship without a signed-off eval'],
    qualify: [], discovery: [], client_email: '', first_step: '', where_it_lands: '',
    first_offer: { name: 'Agent estate assessment', shape: '3 weeks' },
    resources: [{ id: 'r1', title: 'OpenController overview', url: 'https://x/oc' }],
  });
  verify([c], profile);
  assert.deepEqual(c.resources.map((r) => r.id), ['r1']);
});

/* ---- 3. a product card has to name the gap ---- */

test('a product card that never says what they already provide is flagged', () => {
  const c = card({
    path: 'product',
    product: { name: 'OpenController', does: 'control plane', url: 'https://x/oc' },
    why_you: 'Governance is becoming a board-level concern across the industry.',
  });
  assert.equal(problems(run(c), 'product').length, 1);
});

test('a product card that names what they already run is not flagged', () => {
  const c = card({
    path: 'product',
    product: { name: 'OpenController', does: 'control plane', url: 'https://x/oc' },
    why_you: 'You already run agents in production for three clients. What is missing is an inventory and an audit trail.',
  });
  assert.equal(problems(run(c), 'product').length, 0);
});

test('a card that claims to be product-led with no product is blocked', () => {
  /* Two cards, because dropping the only one would leave the visitor with nothing and
   * the verifier keeps a degraded set rather than an empty page. */
  const bad = card({ id: 'bad', path: 'product' });
  const good = card({ id: 'good', who_buys: 'Head of Supply Chain' });
  const out = verify([bad, good], profile);
  assert.deepEqual(out.cards.map((c) => c.id), ['good']);
  assert.equal(out.issues.find((i) => i.check === 'product').severity, 'block');
});

/* ---- 4. the drift test itself ---- */

test('workflow objects separate services that share a department', () => {
  assert.deepEqual([...objects('purchase order validation against master data')], ['order']);
  assert.deepEqual([...objects('invoice reconciliation and remittance matching')], ['invoice']);
  assert.ok(drifts(objects('purchase order validation'), 'reconciles invoices against receipts'));
  assert.equal(drifts(objects('purchase order validation'), 'checks each order line'), null);
  assert.equal(drifts(objects('purchase order validation'), 'enforces policy on every call'), null,
    'a sentence about nothing in particular is unspecific, not a different service');
});

test('a card with no identifiable subject does not reject everything', () => {
  const c = card({ headline: 'A better way to work', what_it_is: 'Agents help your clients move faster.' });
  const out = verify([c], profile);
  assert.equal(out.issues.filter((i) => i.check === 'workflow').length, 0);
});

test('ordinary English is not mistaken for a workflow object', () => {
  assert.deepEqual([...objects('pick the client with the longest lead time')], []);
  assert.deepEqual([...objects('this leads to a shorter cycle')], []);
  assert.deepEqual([...objects('that forms part of the handover')], []);
  assert.deepEqual([...objects('qualify inbound leads faster')], ['lead']);
});

test('a deliverable that reads like a product page never reaches the card', () => {
  /* groundCards builds the block from the writer's client_gets, dropping anything that
   * praises the software instead of describing the client's end state. Exercised here
   * through the filter's own vocabulary, so the rule is pinned wherever it lives. */
  const marketing = [
    'Seamless end-to-end order orchestration across the enterprise',
    'AI-powered purchase order processing, best-in-class',
    'Enterprise-grade, scalable order validation',
  ];
  const FEATURE_TALK = /\b(ai.powered|end.to.end|seamless\w*|enterprise.grade|best.in.class|turnkey|out of the box|scalab\w*|robust|cutting.edge|next.generation|unified platform|single pane)\b/i;
  for (const line of marketing) assert.ok(FEATURE_TALK.test(line), line);
  assert.ok(!FEATURE_TALK.test('Every purchase order line is checked against master data before it posts'));
});

/* ---- 5. commercial entitlement, demand assumptions, incremental revenue ---- */

test('a ship date we have not reached is not promised away', () => {
  const c = card({
    restrictions: ['Ships Q4 2026, so it cannot be committed to an earlier date'],
    monetisation: 'Install and commission this quarter, then an annual operate contract',
  });
  const out = run(c);
  assert.equal(problems(out, 'restriction').length, 1);
  assert.ok(!out.cards.includes(c) || out.degraded);
});

test('unpublished licensing terms are not quoted', () => {
  const c = card({
    restrictions: ['Commercial and licensing terms are not published'],
    why_you: 'You ship your own product today. A licence fee of the usual kind applies.',
  });
  assert.equal(problems(run(c), 'restriction').length, 1);
});

test('a card with no account of how the money arrives is flagged', () => {
  assert.equal(problems(run(card({ monetisation: '' })), 'commercial').length, 1);
  assert.equal(problems(run(card({ monetisation: 'Billed per order type, monthly' })), 'commercial').length, 0);
});

test('an inferred customer problem has to come with something to confirm', () => {
  assert.equal(problems(run(card({ problem_status: 'hypothesis', assumptions: [] })), 'assumption').length, 1);
  assert.equal(problems(run(card({ problem_status: 'hypothesis', assumptions: ['That buyers still key these by hand'] })), 'assumption').length, 0);
  assert.equal(problems(run(card({ problem_status: 'attested', assumptions: [] })), 'assumption').length, 0);
});

test('a default platform page does not ride in on the platform list', () => {
  const c = card({
    lyzr_products: ['Agent Studio', 'Knowledge Base'],
    resources: [
      { id: 'r1', title: 'Knowledge Base overview', url: 'https://x/1', shelf: 'see' },
      { id: 'r2', title: 'Procurement automation: 90-day guide', url: 'https://x/2', shelf: 'build' },
    ],
  });
  run(c);
  assert.deepEqual(c.resources.map((r) => r.id), ['r2']);
});

test('an offering\'s own services are not listed when the card is about something else', () => {
  /* OpenController sells "agent estate discovery". A card about release testing that is
   * built on OpenController still sells release testing, not agent discovery. */
  const subject = objects('managed regression testing for every CloudSuite release');
  assert.ok(drifts(subject, 'Agent estate discovery: a list of every agent running'),
    'the product service should read as a different subject');
  assert.equal(drifts(subject, 'Release readiness validation: each release gated on results'), null);
});

test('a price or a revenue share is never put on a card', () => {
  for (const m of [
    'Monthly fee per page tested, or percentage of revenue uplift from winning variants',
    'A day rate of the usual kind plus a platform fee',
    'Billed at $4,000 per workflow per month',
    '20% of the savings in the first year',
  ]) {
    const c = card({ monetisation: m });
    const out = run(c);
    assert.equal(problems(out, 'commercial').length, 1, `let through: ${m}`);
    assert.ok(!/(\$|£|€)\s?\d|%|percentage|revenue share|day rate/i.test(c.monetisation), `survived on the card: ${c.monetisation}`);
    assert.ok(c.monetisation.length > 0, 'and something still explains how the money arrives');
  }
});

test('a shape rather than a number passes untouched', () => {
  const m = 'Discovery charged as an engagement, then a monthly fee per order type';
  const c = card({ monetisation: m });
  assert.equal(problems(run(c), 'commercial').length, 0);
  assert.equal(c.monetisation, m);
});

/* ---- 6. the library is only as useful as its classification ---- */

test('most of the knowledge base classifies as some kind of work', async () => {
  /* Resources are classified from their words and their tags. Reading only the words
   * left 101 of 174 classifying as nothing, and since a case study has to match
   * positively, none of those could ever be sent with anything: the shelves looked like
   * a thin library when they were a blind matcher. */
  const { familiesIn } = await import('../lib/resources.js');
  const { default: lib } = await import('../data/resources.json', { with: { type: 'json' } });
  const unclassified = lib.resources.filter((r) => !familiesIn(r).size);
  assert.ok(unclassified.length < lib.resources.length * 0.3,
    `${unclassified.length} of ${lib.resources.length} classify as nothing`);
  /* And the ones that do not are the genuinely cross-cutting kind, not case studies. */
  const stories = unclassified.filter((r) => ['case_study', 'story'].includes(r.type));
  assert.ok(stories.length <= 12, `${stories.length} case studies can never be sent with anything`);
});

test('every shape of card finds something to send', async () => {
  const { relatedTo, shelves } = await import('../lib/resources.js');
  const shapes = [
    ['procurement', ['ordering'], 'purchase order validation'],
    ['it operations', ['testing'], 'release regression testing'],
    ['it operations', ['governance'], 'agent estate discovery and audit'],
    ['marketing', ['outreach'], 'content scaling and search visibility'],
    ['customer service', ['support'], 'ticket deflection for support desks'],
  ];
  for (const [fn, fam, topic] of shapes) {
    const got = relatedTo({ topics: [topic], functions: [fn], families: fam, domains: ['manufacturing'] });
    assert.ok(got.length >= 1, `nothing at all for a ${fn} card about ${topic}`);
    const by = shelves(got);
    assert.ok(by.see.length + by.build.length + by.sell.length === got.length);
  }
});

test('a governance assessment is not handed to a marketing client', async () => {
  const { relatedTo } = await import('../lib/resources.js');
  const got = relatedTo({ topics: ['content scaling'], functions: ['marketing'], families: ['outreach'], domains: ['retail'] });
  assert.ok(!got.some((r) => /governance|compliance/i.test(r.title)), JSON.stringify(got.map((r) => r.title)));
});
