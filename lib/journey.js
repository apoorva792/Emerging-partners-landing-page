import { buildProfile } from './profile.js';
import { candidatesFor, brief, full, isSolid, patternById, productsFor, PATTERNS } from './catalog.js';
import { relatedTo } from './resources.js';
import { retrieve } from './knowledge.js';
import { ask } from './studio.js';
import { isBusinessEmail } from './apollo.js';

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
const withoutSize = (profile) => ({ ...profile, company: { ...profile.company, employees: undefined } });

/* Two halves, because writing three cards in one call was the longest wait in the journey.
 * A cheap shortlist picks the entries, then one writer per entry runs in parallel — wall
 * time is now one card, not three. */
/* Split in two on purpose. Finding the lines takes about ten seconds and needs only what
 * the visitor has already told us, so the browser starts it as they answer the last
 * question and that ten seconds is spent while they are reading rather than while they
 * are waiting. Writing the cards is the part that cannot start early. */
export async function discover(profile, answers, { partial = false } = {}) {
  /* Scored in code and instant, so the one model call here is the one that thinks. This
   * used to be an archetype filter over sixteen hand-written entries, which meant every
   * IT consultancy in the pipeline chose from the same six. */
  const candidates = candidatesFor(profile, answers);
  const t0 = Date.now();
  const found = await ask('partner_discovery', [
    ...contextOf(profile, answers),
    partial
      ? '# Note: the visitor has not yet said where their clients are based. Do not propose a line whose case depends on data residency, sovereignty or in-country hosting, because you cannot know it applies.\n'
      : '',
    '# What Lyzr has actually delivered (cite these by id)',
    JSON.stringify(candidates.map(brief), null, 1), '',
    '# How this kind of work is sold and delivered (pick one by id)',
    JSON.stringify(PATTERNS.map((p) => ({ id: p.id, growth_path: p.growth_path, when: p.when })), null, 1), '',
    '# What a partner builds on and can demo',
    JSON.stringify(productsFor([...new Set(candidates.flatMap((r) => r.functions ?? []))]), null, 1),
  ].join('\n'), { model: 'haiku' });

  const picks = chooseForSpread(validate(found.lines, candidates));
  return { opening: found.opening ?? '', picks, ms: Date.now() - t0 };
}

const contextOf = (profile, answers) => [
  '# Company profile', JSON.stringify(withoutSize(profile), null, 1), '',
  '# What the visitor told us', JSON.stringify(answers, null, 1), '',
];

export async function step2(profile, answers, found) {
  /* The browser hands back what it prefetched. Without it, or if it came back with
   * nothing usable, the step runs it now: a slower journey beats a broken one. */
  const { opening, picks, ms: discoveryMs } = found?.picks?.length ? found : await discover(profile, answers);
  const context = contextOf(profile, answers);
  const t1 = Date.now();

  const written = await Promise.all(picks.map(async (p) => {
    try {
      const card = await ask('partner_opportunity', [
        ...context,
        '# The service line to write', '',
        JSON.stringify({ headline: p.headline, work: p.work, unit: p.unit, function: p.function, buyer: p.buyer }, null, 1), '',
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
  return { opening, cards, ms: { discovery: discoveryMs ?? 0, cards: Date.now() - t1 } };
}

/* How well a customer story actually supports this line. The model cites generously, and
 * a loose citation is not a harmless one: the story it leads with supplies the proof and
 * the "what the client actually gets" steps, so a near-miss puts an insurance call
 * campaign under a clinical workflow card. Matched on the words of the work and on the
 * business function, not on the model's say-so. */
function support(story, line) {
  const terms = new Set(`${line.work} ${line.headline} ${line.unit}`
    .toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  const text = `${story.sellable_as} ${(story.built ?? []).join(' ')} ${story.industry}`.toLowerCase();
  const words = [...terms].filter((w) => text.includes(w)).length;
  const sameFunction = (story.functions ?? []).includes(line.function);
  return words * 4 + (sameFunction ? 5 : 0) + (isSolid(story) ? 2 : 0);
}
/* Enough to lead a card on. Below this the story is about something else, whatever the
 * citation said. */
const LEADS = 9;

/* The rule that makes generated opportunities safe: a line has to stand on work we have
 * really done, it has to say which, and the one it leads with has to actually be about
 * the same work. Enforced here rather than in the prompt, because a prompt is a request
 * and this is a condition. */
function validate(lines, candidates) {
  const byId = new Map(candidates.map((r) => [r.id, r]));
  const out = [];
  for (const l of lines ?? []) {
    const pattern = patternById(l.pattern);
    if (!pattern) { console.error('dropped line, unknown pattern:', l.pattern); continue; }

    const cited = [...new Set(l.cites ?? [])].map((id) => byId.get(id)).filter(Boolean);
    /* Citations that do not hold up are dropped rather than the line, unless the lead
     * goes with them. A second, looser citation still earns its place as background. */
    const ranked = cited
      .map((r) => ({ r, s: support(r, l) }))
      .sort((a, b) => b.s - a.s);
    const lead = ranked[0];
    if (!lead || lead.s < LEADS || !isSolid(lead.r)) {
      console.error('dropped line, nothing solid is actually about it:', l.headline);
      continue;
    }
    out.push({
      ...l,
      id: `${pattern.id}--${(l.function || 'line').replace(/\W+/g, '-')}`.toLowerCase(),
      pattern,
      lead: lead.r,
      stories: ranked.filter((x) => x.s >= LEADS / 2).map((x) => x.r),
      /* The pattern decides how it is sold, so the growth path comes with it. A line
       * labelled `retain` on a build-and-hand-over pattern would promise revenue the
       * engagement does not produce. */
      growth_path: pattern.growth_path,
      relation: l.relation ?? 'new',
      _support: lead.s,
    });
  }

  /* Two lines on the same pattern and function are the same line twice. Two lines leading
   * on the same engagement are worse: they come back with the same proof and the same
   * steps, and the visitor is being shown one idea wearing two headlines. The stronger
   * one keeps it. */
  const byKey = new Set();
  const byLead = new Set();
  return out
    .sort((a, b) => b._support - a._support)
    .filter((l) => {
      if (byKey.has(l.id) || byLead.has(l.lead.id)) return false;
      byKey.add(l.id); byLead.add(l.lead.id);
      return true;
    });
}

/* Discovery proposes more than we write, and we write three. Taken straight down the
 * ranking they come back as three versions of the same motion, because the strongest
 * plays for a firm usually sit in the same part of its business. So the first pass takes
 * the best of each kind of growth, expand, win and retain, and only then does rank fill
 * what is left. A partner should be looking at a way to grow an account, a way to open a
 * new one, and a way to earn monthly, not at one idea three times. */
function chooseForSpread(ranked, n = 3) {
  const out = [];
  const used = new Set();
  for (const p of ranked) {
    if (out.length >= n) break;
    const path = p.growth_path;
    if (used.has(path)) continue;
    used.add(path);
    out.push(p);
  }
  for (const p of ranked) {
    if (out.length >= n) break;
    if (out.includes(p)) continue;
    out.push(p);
  }
  /* Back into the order the shortlist ranked them: the spread decides who is on the
   * screen, not who is first on it. */
  return out.sort((a, b) => ranked.indexOf(a) - ranked.indexOf(b));
}

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

/* The steps of that engagement that belong to this line, in the order the page told
 * them. Dropping the off-topic ones only happens when enough on-topic ones remain: a
 * short mechanism is better than a wrong one, an empty one is worse than both. */
function relevantSteps(built, line) {
  const terms = new Set(`${line.work} ${line.headline} ${line.unit} ${line.function}`
    .toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  const onPoint = built.filter((b) => {
    const text = b.toLowerCase();
    return [...terms].some((w) => text.includes(w));
  });
  return onPoint.length >= 3 ? onPoint : built;
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
    const lead = line.lead;
    if (lead) {
      card.proof = { customer: lead.client, result: lead.results?.[0] ?? '', url: lead.url, title: lead.title, teaser: '' };
      /* What the client actually gets, taken from what the agents in that engagement
       * really do. This is the half of a card that used to be written once per service
       * line; now it is evidence. One engagement often covers several functions at once,
       * so the steps that belong to a different one are dropped before the first four:
       * a line about test automation should not open with the HR agent. */
      card.mechanism = relevantSteps(lead.built ?? [], line).slice(0, 4);
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
    card.demo = kit.agents.map((a) => ({ name: a.name, does: a.does }));

    /* What else the partner can send that client. Matched on the function and the topics
     * of the stories this line actually stands on, never by asking a model which links
     * sound relevant. */
    card.resources = relatedTo({
      topics: [line.function, ...stories.flatMap((s) => s.topics ?? [])],
      products: card.lyzr_products,
      industries: (profile.industries ?? []).map((i) => i.name),
      exclude: stories.map((s) => s.id),
    });
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
