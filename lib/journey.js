import { buildProfile } from './profile.js';
import { candidatesFor, brief, full, isSolid, isUsable, patternById, productsFor, recordById, PATTERNS } from './catalog.js';
import { relatedTo, resourceById } from './resources.js';
import { retrieve } from './knowledge.js';
import { ask } from './studio.js';
import { isBusinessEmail } from './apollo.js';
import { fitScore, lyzrScore, gate, total, worthResearching, adjacency, FLOOR } from './score.js';
import { research } from './research.js';
import { verify } from './verify.js';
import { termSet } from './words.js';
import { playsFor, playById, briefOf, eligibility } from './plays.js';
import { compatible, stepsFor, domains, systems, families, objects, drifts } from './fit.js';

/* The journey is a state machine here, not a conversation the model improvises. Three LLM
 * calls at three fixed points, each with one job and a schema. That keeps the order of the
 * steps guaranteed — value before qualification, nothing asked that we could have read —
 * rather than hoping a prompt holds. */

/* The two questions no website can answer — what they want next, and where their clients
 * actually are — are asked by the UI the moment the email is in, while the profile is still
 * being built. The server's job is only the adaptive remainder: whatever the profiler could
 * not establish and that would change the recommendation. */
export const MAX_ADAPTIVE = 1;
export const questionsFor = (profile) => (profile.confirm ?? []).slice(0, MAX_ADAPTIVE);

export async function step1(email, website) {
  if (!email || !email.includes('@')) return { ok: false, error: 'Please enter your work email.' };
  if (!isBusinessEmail(email)) return { ok: false, error: 'Please use your work email so we can look up your company.' };

  const r = await buildProfile(email, website);
  if (!r.ok) {
    return { ok: false, error: 'no-signal', message: "We couldn't read that website. Tell us in one line what your company does and we'll carry on." };
  }
  return {
    ok: true,
    profile: r.profile,
    brand: r.brand,
    evidence: r.evidence,
    questions: questionsFor(r.profile),
    ms: r.ms,
  };
}

/* Company size is not a criterion and must never appear in the copy. Prompting for that
 * held most of the time and then wrote "you have 220 people", so the number simply does not
 * travel past the profiler: it stays on the profile for the record and is stripped here. */
/* The capability map goes with it, because every caller prints the map separately and
 * under its own heading. Left in, it was serialised twice into the same prompt: fourteen
 * thousand characters of duplicate context, paid for on every call. */
const withoutSize = (profile) => ({
  ...profile,
  capabilities: undefined,
  company: { ...profile.company, employees: undefined },
});

/* The capability map, small enough to sit inside another prompt. The brief and the
 * account ranker need to know what this firm has delivered; they do not need every step
 * of every engagement. */
/* The world this card lives in: the industries the partner actually serves and the systems
 * their clients actually run. Wider than anything one line says about itself, and the
 * thing a catalogue record has to be reconcilable with. */
const scopeOf = (profile) => ({
  domains: domains([
    ...(profile.industries ?? []).map((i) => i.name ?? i),
    ...(profile.capabilities?.industries ?? []),
  ].join(' ')),
  systems: systems([
    ...(profile.platforms ?? []).map((p) => p.name ?? p),
    ...(profile.capabilities?.technologies ?? []),
  ].join(' ')),
});

const capsBrief = (profile) => (profile.capabilities?.capabilities ?? []).map((c) => ({
  function: c.function, service: c.service, projects: c.projects,
  stack: c.stack.slice(0, 6), outcomes: c.outcomes.slice(0, 2), confidence: c.confidence,
}));

/* Two halves, because writing three cards in one call was the longest wait in the journey.
 * A cheap shortlist picks the entries, then one writer per entry runs in parallel — wall
 * time is now one card, not three. */
/* Split in two on purpose. Finding the lines takes about ten seconds and needs only what
 * the visitor has already told us, so the browser starts it as they answer the last
 * question and that ten seconds is spent while they are reading rather than while they
 * are waiting. Writing the cards is the part that cannot start early. */
export async function discover(profile, answers, { partial = false } = {}) {
  const caps = profile.capabilities;
  /* The Lyzr side, scored in code and instant. It is no longer where opportunities come
   * from: it is how we check that there is something for Lyzr to contribute to one. */
  const candidates = candidatesFor(profile, answers);
  /* The product-led half. Filtered here rather than in the prompt: a play the partner has
   * shown no sign of being able to deliver is never put in front of the model, so it
   * cannot be proposed however good the story would sound. */
  const plays = playsFor(profile);
  const t0 = Date.now();

  const found = await ask('partner_discovery', [
    ...contextOf(profile, answers),
    partial
      ? '# Note: the visitor has not yet said where their clients are based. Do not propose a line whose case depends on data residency, sovereignty or in-country hosting, because you cannot know it applies.\n'
      : '',
    '# What Lyzr can contribute (check your advantage against these, cite by id)',
    JSON.stringify(candidates.map(brief), null, 1), '',
    plays.length
      ? `# Lyzr products this firm is eligible for (propose product opportunities only from these, by id)\n${JSON.stringify(plays.map(briefOf), null, 1)}\n`
      : '# No Lyzr product is a direct fit for this firm on the evidence we have. Propose capability opportunities only.\n',
    '# How this kind of work is sold and delivered (pick one by id)',
    JSON.stringify(PATTERNS.map((p) => ({ id: p.id, growth_path: p.growth_path, when: p.when })), null, 1), '',
    '# What a partner builds on and can demo',
    JSON.stringify(productsFor([...new Set(candidates.flatMap((r) => r.functions ?? []))]), null, 1),
  ].join('\n'), { model: 'haiku' });

  const proposed = found.opportunities ?? [];
  let evidence = caps?.evidence ?? [];
  let scored = assess(proposed, caps, candidates, plays);

  /* One more look, only for the candidate that earns it: commercially strong, and failing
   * only because we could not find the delivery behind it on their site. Everything else
   * is latency spent on a candidate we would drop anyway. */
  const thin = worthResearching(scored);
  let looked = { records: [], ms: 0, looked: 0 };
  if (thin.length && profile.company?.name) {
    looked = await research({ name: profile.company.name, domain: profile.company.website ?? '' }, thin, evidence)
      .catch(() => ({ records: [], ms: 0, looked: 0 }));
    if (looked.records.length) {
      evidence = [...evidence, ...looked.records];
      /* Scored again over the larger evidence set, as the whole point of looking was to
       * change the ranking rather than to decorate it. */
      scored = assess(proposed, { ...caps, evidence }, candidates, plays);
    }
  }

  const passed = scored.filter((x) => x.gate.pass).sort((a, b) => b.score - a.score);
  const { picks: distinct, dropped } = dedupe(passed);
  const scope = scopeOf(profile);
  /* Up to three, and only the ones worth a page. The spread pass is gone: forcing one of
   * each kind of growth, or three different products, filled the third slot with
   * something the reader could tell was filler, and a kit that pads to three teaches
   * them the other two were padding too. Strongest first, floor applied, stop. */
  const strong = distinct.filter((x) => x.score >= FLOOR);
  const chosen = (strong.length ? strong : distinct.slice(0, 1)).slice(0, 3);
  const picks = chosen.map((x) => toLine(x, scope));

  return {
    opening: found.opening ?? '',
    picks,
    /* Kept for the run record. A brief nobody can explain is worse than a thin one, and
     * the reason a candidate was dropped is the most useful thing in the file. */
    /* Both kinds of rejection, because "we found three" is only meaningful next to what
     * we turned down and why. */
    not_recommended: [
      ...scored.filter((x) => !x.gate.pass)
        .map((x) => ({ headline: x.opp.headline, score: x.score, why: x.gate.fails })),
      ...dropped.map((x) => ({ headline: x.opp.headline, score: x.score, why: ['another candidate covered the same ground'] })),
      ...distinct.filter((x) => !chosen.includes(x))
        .map((x) => ({ headline: x.opp.headline, score: x.score, why: [`scored ${x.score}, below the ${FLOOR} we are willing to put on a page`] })),
    ],
    considered: scored.length,
    research: { pages: looked.records.length, looked: looked.looked, ms: looked.ms },
    ms: Date.now() - t0,
  };
}

/* Score every candidate the model proposed, and gate it. The two are deliberately
 * separate: a candidate can be the best idea on the list and still not be something we
 * are willing to say. */
function assess(opportunities, caps, candidates, plays = []) {
  const eligible = new Map(plays.map((x) => [x.play.id, x]));
  const out = [];
  for (const opp of opportunities ?? []) {
    /* A product opportunity is only a product opportunity if the product was one we
     * offered. The model naming something else is a capability line that mentioned a
     * product, and it is scored as one. */
    const chosen = opp.path === 'product' ? eligible.get(String(opp.product ?? '').toLowerCase()) : null;
    const play = chosen?.play ?? null;
    if (opp.path === 'product' && !play) console.error('product not eligible, scored as capability:', opp.product);

    const pattern = resolvePattern(opp, play);
    if (!pattern) { console.error('dropped candidate, no pattern fits:', opp.pattern); continue; }

    /* How well each Lyzr record supports this, matched on the words of the work rather
     * than on the model's citation. The citation picks the field to look in; this decides
     * whether it holds. */
    const cited = new Set(opp.lyzr_cites ?? []);
    /* The whole catalogue, not only what was cited. The citation is a hint about where to
     * look, not a limit on where we may look: the catalogue is ours and we can find the
     * right record ourselves. Rejecting a sound opportunity because a haiku call cited
     * the wrong one of our own pages is a failure of ours, not of the opportunity.
     * Their evidence is the opposite case, and is checked strictly. */
    const ranked = candidates.map((r) => ({ r, s: support(r, opp) + (cited.has(r.id) ? 3 : 0) }))
      .filter((x) => isUsable(x.r))
      .sort((a, b) => b.s - a.s);

    const fit = fitScore(opp, caps);
    /* On a product line the Lyzr contribution is the product, and the product is a fact
     * about our own estate rather than something to be inferred from a case study. It
     * still has to be a product this partner qualified for, which was decided from their
     * evidence before the model ever saw it. */
    const lyzr = play ? playScore(play, chosen.fit, ranked) : lyzrScore(opp, ranked);
    const judged = {
      fit: fit.score,
      lyzr: lyzr.score,
      /* Computed from their evidence, not asked of the model: how far this is from what
       * they already do is exactly what their own delivered work can answer. */
      adjacency: adjacency(opp, caps, fit, play),
      monetisation: clamp(opp.monetisation ?? opp.clarity),
      trigger: clamp(opp.trigger ?? opp.feasibility),
    };
    out.push({
      opp, pattern, ranked, fit, lyzr, play,
      scores: judged,
      score: total(judged),
      gate: gate(opp, fit, lyzr),
    });
  }
  return out;
}

const clamp = (n) => Math.max(1, Math.min(5, Number(n) || 3));

/* What Lyzr contributes to a product line. The product is the contribution, so this scores
 * how well the partner is placed to deliver it rather than how well a case study matches:
 * a strong eligibility read on their delivered work is worth more than a word that
 * happened to appear on their site. A catalogue record on point still adds, because it
 * means we have shipped something like it. */
function playScore(play, fit, ranked) {
  let s = fit.onFamily.length ? 4.2 : 3.4;
  if (fit.onFamily.length >= 2) s += 0.4;
  if ((ranked ?? []).some((x) => x.s >= LEADS)) s += 0.4;
  return {
    score: Math.min(5, Math.round(s * 10) / 10),
    lead: ranked?.[0] ?? null,
    why: `${play.name}: ${fit.why}`,
  };
}

/* The model is asked for a pattern id and sometimes answers with the growth path instead,
 * which is the field next to it in the list it was given. Dropping the candidate for that
 * throws away a good opportunity over a labelling slip, so the shape of the work decides
 * instead: running or governing something after it ships is a retainer, a packaged offer
 * into a new account is a win, and work inside a process they already run is expansion. */
const RUNS = /\b(run|runs|running|monitor|monitoring|govern|governance|manage[ds]?|managed|support|observability|audit trail|compliance reporting|operate|operations centre|estate)\b/i;

/* Which commercial motion maps onto which growth path, where the model gave us one. */
const MOTION_PATH = {
  new_implementation: 'win',
  product_deployment: 'win',
  productization: 'win',
  account_expansion: 'expand',
  managed_service: 'retain',
  embedding: 'win',
};

function resolvePattern(opp, play = null) {
  const exact = patternById(opp.pattern);
  if (exact) return exact;
  /* A product play names the pattern for each of its two shapes, so a product line never
   * has to fall back on guesswork. Which of the two depends on whether the model framed
   * it as the deployment or as the thing that bills every month. */
  if (play) {
    const runs = RUNS.test(`${opp.headline} ${opp.paid_service} ${opp.work}`);
    return patternById(runs ? play.managed.pattern : play.implementation.pattern)
      ?? patternById(play.implementation.pattern);
  }
  const said = String(opp.pattern ?? '').toLowerCase();
  const path = ['expand', 'win', 'retain'].includes(said) ? said
    : MOTION_PATH[opp.motion]
      ?? (RUNS.test(`${opp.headline} ${opp.paid_service} ${opp.work}`) ? 'retain'
        : opp.relation === 'new' ? 'win' : 'expand');
  const options = PATTERNS.filter((x) => x.growth_path === path);
  if (!options.length) return null;
  /* Within the path, the one whose `when` reads most like this work. */
  const text = `${opp.headline} ${opp.paid_service} ${opp.work} ${opp.customer_problem}`.toLowerCase();
  const words = (s) => new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  const t = words(text);
  return options
    .map((x) => ({ x, n: [...words(x.when)].filter((w) => t.has(w)).length }))
    .sort((a, b) => b.n - a.n)[0].x;
}

/* Two candidates on the same engagement pattern and the same department are the same
 * candidate twice. Two leading on the same Lyzr record come back with the same proof and
 * the same steps, which is one idea wearing two headlines. Higher score keeps it. */
function dedupe(scored, want = 3) {
  const byKey = new Set();
  const byLead = new Set();
  const byShape = new Set();
  const out = [];
  const held = [];
  for (const x of scored) {
    const key = `${x.pattern.id}--${(x.opp.function || 'line').replace(/\W+/g, '-')}`.toLowerCase();
    const leadId = x.lyzr.lead?.r?.id;
    /* Distinct means a different department or a different way of making money. Two
     * expansion plays inside procurement are one option; an expansion play and a retainer
     * inside IT operations are two, and a partner would sell them to different people. */
    const shape = `${x.opp.function}|${x.pattern.growth_path}`;
    const entry = { ...x, id: key };
    if (byKey.has(key) || (leadId && byLead.has(leadId)) || byShape.has(shape)) { held.push(entry); continue; }
    byKey.add(key); if (leadId) byLead.add(leadId); byShape.add(shape);
    out.push(entry);
  }
  /* A firm whose best work all sits in one department would otherwise end with a single
   * card. A second play in the same department is allowed back in as long as it is a
   * different engagement on a different Lyzr record; the two about literally the same
   * thing stay out. Whether it is then shown at all is the score's decision, not this
   * one: filling a slot is no longer a reason to show anything. */
  const dropped = [];
  for (const x of held) {
    const leadId = x.lyzr.lead?.r?.id;
    if (out.length < want && !byKey.has(x.id) && !(leadId && byLead.has(leadId))) {
      byKey.add(x.id); if (leadId) byLead.add(leadId);
      out.push(x);
    } else {
      dropped.push(x);
    }
  }
  return { picks: out, dropped };
}

/* The shape the card writer and the grounding step expect. Everything a promise is built
 * from, the engagement pattern and the Lyzr record, travels on it; everything the model
 * merely asserted is labelled as what it is. */
function toLine(x, scope = {}) {
  const { opp, pattern, lyzr, fit, play } = x;
  /* A product line's Lyzr side is the product, so it may have no catalogue record behind
   * it at all. Everything that reads `lead` has to cope with that. */
  const lead = lyzr.lead?.r ?? null;
  /* Word overlap gets a record considered. Compatibility decides whether it may be used,
   * and for what: the same record can be fine as an explanation and wrong as proof. */
  const fits = (r, role) => compatible(r, opp, role, scope).ok;
  const onPoint = x.ranked.filter((r) => r.s >= LEADS);
  return {
    id: x.id,
    headline: opp.headline,
    angle: opp.angle,
    work: opp.work,
    unit: opp.unit,
    function: opp.function,
    buyer: opp.buyer,
    relation: opp.relation ?? 'new',
    pattern,
    growth_path: pattern.growth_path,
    lead,
    /* Which half of the engine this came from, and the product if it was the product
     * half. Carried through so the card can lead with the product rather than bury it. */
    path: play ? 'product' : 'capability',
    play,
    /* Three different jobs, so three different records, chosen on three different bars.
     * `lead` carries the Lyzr side of the argument and may match loosely. `proof_lead`
     * prints a number measured at another customer, which demands a close match and the
     * same department, or a procurement card ends up quoting an outbound sales result.
     * `ref_lead` is what we point at when nothing can prove it: a solution or product
     * page says what the thing is without claiming an outcome, which is the honest
     * fallback and reads better than a case study about something else. */
    proof_lead: onPoint.find((x) => isSolid(x.r) && x.s >= PROVES
      && (x.r.functions ?? []).includes(opp.function)
      /* A record filed under five departments is not about one piece of work: it is a
       * platform page or a partnership page, and its numbers are vendor metrics rather
       * than a client's outcome. "3 joint customer solutions in documented production"
       * reached a production planning card that way. */
      && (x.r.functions ?? []).length <= 4
      /* And about the same subject, not merely the same department. */
      && hits(x.r, opp) >= 3
      && fits(x.r, 'proof'))?.r ?? null,
    /* And a reference still has to be about the work. "Built on <a coding agent for
     * someone else>" under a procurement card is not a weaker claim than a result, it is
     * the same wrong claim without the number, so when nothing is close enough the card
     * shows no provenance line at all. */
    /* A product line points at the product's own page, which is the honest reference:
     * it says what the thing does and claims no customer outcome. */
    /* A product line points at the product's own page, which is the honest reference: it
     * says what the thing does and claims no customer outcome. */
    ref_lead: (play ? catalogueFor(play) : null)
      /* A customer story used as a reference is still a claim that we have done this
       * sort of thing, so it has to clear the same subject and department test as one
       * used as proof. Only a solution or product page, which describes a capability
       * rather than an engagement, gets in on the looser match. */
      ?? (onPoint.find((x) => x.r.kind !== 'delivered' && hits(x.r, opp) >= 2 && fits(x.r, 'reference'))
        ?? onPoint.find((x) => hits(x.r, opp) >= 3
          && (x.r.functions ?? []).includes(opp.function)
          && fits(x.r, 'reference')))?.r
      ?? null,
    /* "What the client actually gets" is a description rather than a promise, so it can
     * come from a record that was too loose to cite: what it may not do is describe steps
     * from a different piece of work. So the record is chosen by whether its own steps
     * survive the filter, and a record that contributes one step contributes none. */
    /* Explaining how the thing works is a looser claim than proving it, but not a loose
     * one: a record that shares only a department and one word is describing some other
     * engagement's machinery. Two words of real subject overlap, and the steps themselves
     * still have to survive their own filter. */
    mechanism_lead: onPoint.find((x) => hits(x.r, opp) >= 2 && fits(x.r, 'mechanism')
      && stepsFor(x.r, opp, scope).length >= 2)?.r ?? null,
    scope,
    stories: x.ranked.filter((r) => r.s >= LEADS / 2).map((r) => r.r),
    /* The partner's own work this stands on. The card quotes it back to them, which is
     * the single thing that proves we read their site rather than their sector. */
    stands_on: fit.cited.filter((e) => e.grounded).slice(0, 3)
      .map((e) => ({ id: e.id, what: e.what, client: e.client, url: e.url, outcomes: e.outcomes })),
    /* How the money is actually made, which decides what the card promises and what the
     * reader has to budget for. A deployment labelled as a build makes them budget for a
     * build they do not need. */
    motion: MOTION_PATH[opp.motion] ? opp.motion : null,
    /* Two or three things they could charge for, taken from the offering where there is
     * one so a product stays a product and the service stays theirs. */
    sellable_services: (play?.sellable_services ?? [])
      .map((x) => ({ name: x.name, client_gets: x.client_gets }))
      .concat((opp.sellable_services ?? []).map((x) => ({ name: String(x).slice(0, 60), client_gets: '' })))
      .slice(0, 3),
    monetisation: String(opp.monetisation_note ?? '').slice(0, 160),
    /* What a client would have to confirm. Printed as things to check, which is what
     * makes everything beside them credible. */
    assumptions: (opp.assumptions ?? []).map((x) => String(x).trim()).filter(Boolean).slice(0, 2),
    restrictions: play?.restrictions ?? [],
    customer_problem: opp.customer_problem,
    /* An inferred problem is shown as a thing to confirm, never as a thing we know. A
     * line standing on a service page cannot attest to anything, whatever the model said:
     * the page describes what they sell, not a client who had the problem. */
    problem_status: opp.problem_status === 'attested' && !fit.advertised && !fit.profileOnly ? 'attested' : 'hypothesis',
    paid_service: opp.paid_service,
    lyzr_advantage: opp.lyzr_advantage,
    expansion_path: opp.expansion_path,
    scores: x.scores,
    score: x.score,
  };
}

const contextOf = (profile, answers) => [
  '# Company profile', JSON.stringify(withoutSize(profile), null, 1), '',
  /* The capability map comes first in the model's attention and last in the prose, which
   * is the right way round: it is the material, and the profile is the frame. */
  '# What this firm has actually delivered (your primary material, cite by id)',
  profile.capabilities
    ? JSON.stringify(profile.capabilities, null, 1)
    : '(their site could not be read for delivered work. Lean on the profile, and mark every customer problem as a hypothesis.)',
  profile.capabilities?.basis === 'advertised'
    ? '\n# Note: this firm publishes no engagement write-ups. The records above are the service pages they wrote about themselves, which say what they sell and not what they have shipped. Cite them as usual, keep the claims about their delivery smaller, and mark every customer problem as a hypothesis.\n'
    : '',
  '',
  '# What the visitor told us', JSON.stringify(answers, null, 1), '',
];

export async function step2(profile, answers, found) {
  /* The browser hands back what it prefetched. Without it, or if it came back with
   * nothing usable, the step runs it now: a slower journey beats a broken one. */
  const d = found?.picks?.length ? found : await discover(profile, answers);
  const { opening, picks, ms: discoveryMs, not_recommended } = d;
  const context = contextOf(profile, answers);
  const t1 = Date.now();

  const written = await Promise.all(picks.map(async (p) => {
    try {
      const card = await ask('partner_opportunity', [
        ...context,
        '# The service line to write', '',
        JSON.stringify({
          headline: p.headline, work: p.work, unit: p.unit, function: p.function,
          buyer: p.buyer, paid_service: p.paid_service,
          customer_problem: p.customer_problem, problem_status: p.problem_status,
          lyzr_advantage: p.lyzr_advantage,
        }, null, 1), '',
        /* Their own delivered work, which is what the line was generated from and what
         * the card has to argue from. Without it the writer falls back on the sector and
         * the card reads like a template. */
        '# What THIS FIRM has already delivered that this line stands on (quote it back to them)',
        JSON.stringify(p.stands_on, null, 1), '',
        p.problem_status === 'hypothesis'
          ? '# The customer problem is an inference, not something their site evidences. Write it as something to confirm on the first call, never as a fact about their clients.\n'
          : '',
        '# The Lyzr engagements it was built from (your material, never your subject)',
        JSON.stringify(p.stories.map(full), null, 1), '',
        '# Why this one was chosen for them', p.angle,
        /* How it stands against what they already ship. Discovery decided it; the card has
         * to be written from it, or a firm that already runs agents reads a card telling
         * it to start. */
        `# How it stands against what they already have: ${p.relation}`,
        /* Which of the three kinds of growth this is. The three cards are three different
         * ways to make money rather than three use cases. */
        `# Which kind of growth this is: ${p.growth_path}`,
      ].join('\n'));
      return { ...card, id: p.id, growth_path: p.growth_path, line: p };
    } catch (e) {
      /* One card failing is not the step failing — the others still stand. */
      console.error('card failed for', p.id, e.message);
      return null;
    }
  }));

  const cards = written.filter(Boolean);
  if (!cards.length) throw new Error('No service lines could be written for this profile.');
  cards.forEach(tidyCard);
  groundCards(cards, profile);
  /* Nothing reaches the partner that has not been checked against the evidence it was
   * built from. Cheap, synchronous, and the only place in the journey that assumes the
   * model got it wrong. */
  const checked = verify(cards, profile);
  if (checked.issues.length) console.error('verify:', JSON.stringify(checked.issues));
  return {
    opening,
    cards: checked.cards,
    not_recommended,
    quality: { issues: checked.issues, blocking: checked.blocking, degraded: checked.degraded },
    ms: { discovery: discoveryMs ?? 0, cards: Date.now() - t1 },
  };
}

/* How well a customer story actually supports this line. The model cites generously, and
 * a loose citation is not a harmless one: the story it leads with supplies the proof and
 * the "what the client actually gets" steps, so a near-miss puts an insurance call
 * campaign under a clinical workflow card. Matched on the words of the work and on the
 * business function, not on the model's say-so. */
/* How many words of substance this line and this story actually share. Kept separate
 * from the score because the two are used for different decisions: the score decides
 * whether a story may back an argument, and this decides whether it may carry a number.
 * A shared department is not a shared subject, and scoring them together is how an HR
 * result ended up under a claims triage card. */
function hits(story, line) {
  const terms = termSet(`${line.work} ${line.headline} ${line.unit}`);
  const text = `${story.sellable_as} ${(story.built ?? []).join(' ')} ${story.industry}`.toLowerCase();
  return [...terms].filter((w) => text.includes(w)).length;
}

function support(story, line) {
  const sameFunction = (story.functions ?? []).includes(line.function);
  return hits(story, line) * 4 + (sameFunction ? 5 : 0) + (isSolid(story) ? 2 : 0);
}
/* Enough to lead a card on. Below this the story is about something else, whatever the
 * citation said. */
const LEADS = 9;
/* And what it takes to quote that record's published number on someone else's card. */
const PROVES = 14;

/* The questions that tell a partner whether an account is live are judgment, so they are
 * the model's to write. What it is not allowed to do is pad: three thin questions read as
 * filler and cost the whole card its authority. Short of the count, we show fewer. */
function tidyCard(card) {
  const lines = (xs, n) => [...new Set((xs ?? []).map((x) => String(x).trim()).filter(Boolean))].slice(0, n);
  card.qualify = lines(card.qualify, 3);
  card.where_it_lands = String(card.where_it_lands ?? '').trim();
  card.attaches_to = String(card.attaches_to ?? '').trim();
  return card;
}

/* The product's own page in the catalogue, where we have crawled one. Not every product
 * has a readable page: three of them are JavaScript shells that return no text, which is
 * why the play file carries its own description and the catalogue link is optional. */
const catalogueFor = (play) => (play.catalogue_id ? recordById(play.catalogue_id) : null);

/* The client's end state, from the writer, kept only where it survives three tests: it is
 * about the thing this card is about, it is concrete enough to check, and it is not a
 * sentence lifted off a product page. Two is the floor: one deliverable reads as an
 * afterthought and is worse than none. */
const FEATURE_TALK = /\b(ai.powered|end.to.end|seamless\w*|enterprise.grade|best.in.class|turnkey|out of the box|scalab\w*|robust|cutting.edge|next.generation|unified platform|single pane)\b/i;

function deliverables(card, line) {
  const subject = objects(`${card.headline} ${line.work} ${line.unit} ${card.what_it_is}`);
  const seen = new Set();
  return (card.client_gets ?? [])
    .map((x) => String(x ?? '').trim())
    .filter((x) => x.length > 12 && x.length < 180)
    .filter((x) => (seen.has(x.toLowerCase()) ? false : seen.add(x.toLowerCase())))
    /* A deliverable about a different thing from the card is a second service hiding
     * inside the first: order validation quietly becoming invoice reconciliation. */
    .filter((x) => !drifts(subject, x))
    /* And it has to describe something rather than praise it. */
    .filter((x) => !FEATURE_TALK.test(x))
    .slice(0, 4);
}

/* How much of this they already have. A partner reads a card very differently depending
 * on whether it asks them to start something, to package something they have built before,
 * or to take an existing service further. Derived from their own evidence rather than
 * asserted: if nothing they have delivered sits in this department, it is new to them,
 * whatever the model called it. */
const PACKAGES = new Set(['package-then-sell', 'embed-and-license']);
const DEPLOYS = new Set(['deploy-in-their-estate', 'roll-out-to-everyone']);

function offeringKind(line) {
  const proven = (line.stands_on ?? []).length > 0;
  /* The label has to agree with the engagement underneath it. A card sold as a packaged
   * solution that calls itself an extension, or a deployment that calls itself a new
   * service, contradicts its own first offer two inches down the page. So the pattern
   * decides, and only where the pattern is neutral does the relation. */
  if (PACKAGES.has(line.pattern?.id)) return 'Something you have built, packaged to sell again';
  if (DEPLOYS.has(line.pattern?.id)) return 'A deployment you would run for them';
  if (!proven) return 'A new service for you';
  if (line.relation === 'scales') return 'Something you have built, packaged to sell again';
  return 'An extension of what you already sell';
}

/* The kinds of work this card is about, read off the finished card rather than off the
 * line, because the writer may have made it more specific than the line was. */
const familiesOf = (line, card) => families([
  line.headline, line.work, line.unit, line.paid_service, line.customer_problem,
  card?.what_it_is, card?.headline,
].filter(Boolean).join(' '));

/* A solution page's own description is a sentence, and a sentence rendered as the name of
 * a thing reads as a mistake. First clause, and never more than a line. */
function shortTitle(s) {
  const first = String(s ?? '').split(/[.;]/)[0].trim();
  if (first.length <= 70) return first;
  const cut = first.slice(0, 70);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,\s]+$/, '');
}

/* Everything on a card that is a promise rather than an argument: the engagement they
 * would sell, how long it runs, who has to be on it, what the client actually gets, and
 * the proof. None of it is the model's to write. It comes from the engagement pattern the
 * line was matched to and from the customer stories the line cites, so a quietly inflated
 * "six weeks" or a mis-copied case study URL can never reach a partner. */
function groundCards(cards, profile) {
  for (const card of cards ?? []) {
    const line = card.line;
    if (!line) continue;
    const { pattern, stories } = line;
    /* {work} and {unit} are the only blanks the model fills in a promise, and they are
     * four words each: what the engagement is about, and the one thing a pilot runs on. */
    const fill = (s) => String(s ?? '')
      .replace(/\{work\}/g, line.work || 'workflow')
      .replace(/\{unit\}/g, line.unit || 'process')
      /* "Multi-agent workflow operations" dropped into "{work} operations review" reads
       * as "operations operations review". The model is describing the work, not writing
       * the label, so the join is ours to clean up. */
      .replace(/\b(\w+)\s+\1\b/gi, '$1')
      .replace(/^./, (c) => c.toUpperCase());

    /* The strongest story this line stands on carries the proof, and it is one we read off
     * the page ourselves rather than one assigned to a service line by hand. The old
     * mapping used sixteen of sixty case studies and put a go-to-market figure under a
     * governance play. */
    /* The story that carries the proof and what the client gets has to be the one about
     * *this* work. Taking the first solid citation put an HR engagement's agents under a
     * software delivery line; matching on the function alone then put regulatory
     * monitoring under agent governance, because both are "compliance". So it is matched
     * on the words of the work itself. */
    /* A number is the strongest thing on the card and the easiest to misplace, so it
     * comes from the record chosen to prove rather than from the one chosen to argue. */
    const lead = line.proof_lead ?? line.ref_lead;
    /* Judged against the finished card, not against the line it grew from. The writer
     * makes a card more specific than the line was, and filtering against the looser text
     * kept material the final check then threw out wholesale. */
    const written = { ...line, headline: card.headline, what_it_is: card.what_it_is, why_you: card.why_you };
    /* "What the client actually gets" is the client's end state, which is a different
     * thing from what our product does and from what the partner configures with it. The
     * writer produces it for this workflow; we keep only what is about this workflow.
     *
     * The old fallback copied a product's own capability lines straight in, which put
     * SuperFlow's durable execution features inside a regression testing deliverable. A
     * product page is never a deliverable. */
    card.mechanism = deliverables(card, written);
    if (!card.mechanism.length) {
      /* Nothing usable from the writer, so the engagement we cited speaks instead, step
       * by step: one engagement covers several kinds of work at once and the steps
       * belonging to a different one describe a toolchain this client does not have. */
      const shows = line.mechanism_lead ?? lead;
      card.mechanism = shows ? stepsFor(shows, written, line.scope).slice(0, 4) : [];
    }
    if (card.mechanism.length < 2) delete card.mechanism;
    if (line.proof_lead) {
      card.proof = { customer: lead.client, result: lead.results?.[0] ?? '', url: lead.url, title: lead.title, teaser: '' };
      /* What the client actually gets, taken from what the agents in that engagement
       * really do. This is the half of a card that used to be written once per service
       * line; now it is evidence. One engagement often covers several functions at once,
       * so the steps that belong to a different one are dropped before the first four:
       * a line about test automation should not open with the HR agent. */
    } else if (lead) {
      /* Either nothing we have published is about this work, or what we have is not close
       * enough to put a number on it. Both say the same honest thing. */
      /* No customer story is about this work yet, so there is no result to quote. What
       * there is, is the thing itself: what it does, and the page that describes it. Said
       * plainly rather than dressed as proof. */
      /* Some solution pages are titled with nothing but the function they serve, and
       * "Built on IT operations" reads as a mistake. What the page says it is beats what
       * the page is called. */
      const title = lead.title.replace(/\s*overview$/i, '').replace(/:\s*what we do$/i, '').trim();
      card.reference = {
        title: shortTitle(title.length >= 18 ? title : (lead.sellable_as || title)),
        url: lead.url,
        kind: lead.kind,
      };
    }

    card.first_offer = {
      name: fill(pattern.first_offer.name),
      shape: fill(pattern.first_offer.shape),
      ends_with: fill(pattern.first_offer.ends_with).replace(/^./, (c) => c.toLowerCase()),
    };
    card.who_buys = line.buyer;
    card.delivery = fill(pattern.delivery.shape);
    card.team_needed = fill(pattern.delivery.team_needed);
    card.discovery = (pattern.discovery ?? []).map(fill);
    card.roles = { partner: fill(pattern.roles.partner), lyzr: fill(pattern.roles.lyzr) };
    /* Where the money goes next is a revenue promise, so it comes from the pattern even
     * though the model was asked to think about it. */
    card.how_to_sell = { ...(card.how_to_sell ?? {}), expansion: fill(pattern.expansion) };

    /* What they build on, and what they can put in front of a client next week. A named
     * agent is worth more than a platform name here: a partner can demo Diane. */
    const kit = productsFor([line.function]);
    card.lyzr_products = kit.platform.map((p) => p.name);
    /* A demo is the strongest claim on the card, because the partner will put it in front
     * of a client. An agent built for an industry they do not serve fails that test
     * however its department tag reads: Benjie is an insurance claims agent and it reached
     * a supply chain forecasting card through the word "operations". */
    card.demo = kit.agents
      .filter((a) => compatible(
        { title: a.name, sellable_as: a.does, topics: a.for }, line, 'demo', line.scope).ok)
      .map((a) => ({ name: a.name, does: a.does }));

    /* What else the partner can send that client. Matched on the function and the topics
     * of the stories this line actually stands on, never by asking a model which links
     * sound relevant. */
    /* Matched on what this line is about, in its own words. Taking the topics off the
     * cited Lyzr stories put an outbound SDR case study under a ServiceNow incident card:
     * the story backed the argument loosely, and its topics were nothing to do with the
     * work. The stories still contribute, but behind the line's own vocabulary. */
    /* A play carries its own approved reading, which beats anything matched by topic. */
    const approved = (line.play?.resources ?? []).map(resourceById).filter(Boolean);
    card.resources = approved.length ? approved.slice(0, 3) : relatedTo({
      /* The line's own vocabulary, and the topics of the one record that was close
       * enough to prove it. The other cited stories are deliberately left out: their
       * topics are the taxonomy of a different engagement, and two coarse words shared
       * with it ("human", "resources") was enough to put a mentorship case study under a
       * field service card. */
      topics: [line.work, line.unit, card.headline, ...(line.proof_lead?.topics ?? [])],
      functions: [line.function],
      /* What this card is about and whose business it is, so a page about someone else's
       * industry cannot arrive on a department tag alone. */
      families: [...familiesOf(line, card)],
      domains: [...(line.scope?.domains ?? [])],
      products: card.lyzr_products,
      industries: (profile.industries ?? []).map((i) => i.name),
      exclude: stories.map((s) => s.id),
    });
    /* Their own delivered work, carried onto the card. This is the thing that proves we
     * read their site rather than their sector, it is what the brief quotes back, and it
     * is what the verification pass checks every claim against. */
    card.stands_on = line.stands_on ?? [];
    card.offering = offeringKind(line);
    card.motion = line.motion;
    card.sellable_services = line.sellable_services ?? [];
    card.monetisation = line.monetisation || fill(pattern.expansion);
    card.assumptions = line.assumptions ?? [];
    /* What we are not entitled to promise about this offering, kept on the card so the
     * verifier can check nothing contradicted it. Never shown to a partner as a list. */
    card.restrictions = line.restrictions ?? [];
    /* A product line says which product up front rather than burying it among the
     * platform list. The commercial point of these is that they are obvious. */
    if (line.play) {
      card.product = { name: line.play.name, does: line.play.one_line, url: line.play.url };
      card.path = 'product';
      /* The platform list is noise next to a named product. */
      card.lyzr_products = [...new Set([line.play.name, ...(card.lyzr_products ?? [])])].slice(0, 3);
    }
    card.customer_problem = line.customer_problem ?? '';
    card.problem_status = line.problem_status ?? 'hypothesis';
    card.lyzr_advantage = line.lyzr_advantage ?? '';
    card.scores = line.scores;
    card.score = line.score;

    /* The line object carried the pattern and the full stories through; the card goes to
     * the browser and to the run record, so it does not need to. */
    delete card.line;
  }
  return cards;
}

/* Its own call, because the brief is already being written while the visitor is still
 * typing account names. Small output, a few seconds, merged into the brief when both land. */
export async function rankAccounts(profile, chosen, accounts) {
  const named = (accounts ?? []).filter((a) => a.name);
  if (!named.length) return [];
  const message = [
    '# Company profile', JSON.stringify(withoutSize(profile), null, 1), '',
    '# The service line they chose', JSON.stringify(chosen, null, 1), '',
    '# The accounts they named', JSON.stringify(named, null, 1),
  ].join('\n');
  const out = await ask('partner_accounts', message);
  /* The model must not quietly lose or rename an account the partner typed. */
  const ranked = (out.ranked ?? []).filter((r) => named.some((a) => a.name.toLowerCase() === String(r.account).toLowerCase()));
  for (const a of named) {
    if (!ranked.some((r) => r.account.toLowerCase() === a.name.toLowerCase())) ranked.push({ account: a.name, why: '' });
  }
  return ranked;
}

export async function step3({ profile, answers, chosen, cards }) {
  /* One line or several. The model writes the connective tissue only — each line is
   * rendered from the card we already verified, so choosing three does not cost three
   * more descriptions, and the ones it would have written could not contradict them. */
  const picked = (Array.isArray(chosen) ? chosen : [chosen]).filter(Boolean);

  const rules = await retrieve('partner_program', `activation package eligibility what happens next ${picked[0]?.headline ?? ''}`, 6)
    .catch(() => '');

  const message = [
    '# Company profile', JSON.stringify(withoutSize(profile), null, 1), '',
    /* What they have actually delivered, as against what they advertise. `you_today` and
     * `why_lyzr` are both answers to "what do you already have", and answering that from
     * a services page is how the brief ends up describing their marketing back to them. */
    '# What they have actually delivered (read off their own site)',
    JSON.stringify(capsBrief(profile), null, 1), '',
    '# What the visitor told us', JSON.stringify(answers, null, 1), '',
    `# The ${picked.length === 1 ? 'service line' : `${picked.length} service lines`} they chose`,
    '(rendered from our own records — do not describe them again)',
    JSON.stringify(picked.map((c) => ({
      name: c.headline, what_it_is: c.what_it_is, why_you: c.why_you,
      who_buys: c.who_buys, first_offer: c.first_offer?.name,
      /* The brief writes the connective tissue over these, so it has to see what the card
       * told them: a brief that argues a different fit than the card they chose reads as
       * two people who never spoke. */
      attaches_to: c.attaches_to, where_it_lands: c.where_it_lands,
    })), null, 1), '',
    '# The service lines they were shown and did not choose',
    JSON.stringify((cards ?? []).filter((c) => !picked.some((p) => p.id === c.id)).map((c) => c.headline), null, 1), '',
    '# Program rules (authoritative — follow exactly)', rules,
  ].join('\n');

  const out = await ask('partner_assessment', message);

  /* The model repeats itself in the short list fields — `industries` came back with the
   * same four sectors six times over, which renders as a wall. */
  const tidyList = (xs, n) => [...new Set((xs ?? []).map((x) => String(x).trim()).filter(Boolean))].slice(0, n);
  if (out.brief?.ideal_customer) {
    const ic = out.brief.ideal_customer;
    ic.roles = tidyList(ic.roles, 2);
    ic.industries = tidyList(ic.industries, 3);
    ic.triggers = tidyList(ic.triggers, 2);
  }
  if (out.brief) {
    out.brief.you_today = tidyList(out.brief.you_today, 3);
    out.brief.how_lyzr_helps = tidyList(out.brief.how_lyzr_helps, 3);
    out.brief.what_to_ask = tidyList(out.brief.what_to_ask, 3);
    out.brief.next_moves = tidyList(out.brief.next_moves, 3);
    /* A row that pairs a strength with nothing, or repeats the strength back as the
     * addition, is worse than a shorter table: it reads as a table for its own sake. */
    out.brief.why_lyzr = (out.brief.why_lyzr ?? [])
      .map((r) => ({ you_have: String(r?.you_have ?? '').trim(), lyzr_adds: String(r?.lyzr_adds ?? '').trim() }))
      .filter((r) => r.you_have && r.lyzr_adds && r.you_have.toLowerCase() !== r.lyzr_adds.toLowerCase())
      .slice(0, 3);
    /* A connective line about a single play is a line about nothing. */
    if (picked.length < 2) out.brief.how_they_connect = '';
  }

  return { brief: out.brief, internal: out.internal };
}
