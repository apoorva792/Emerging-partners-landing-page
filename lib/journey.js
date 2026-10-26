import { buildProfile } from './profile.js';
import { briefing, proofFor, forArchetypes } from './playbook.js';
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
export async function step2(profile, answers) {
  const entries = forArchetypes(profile.archetype.primary, profile.archetype.secondary);
  const context = [
    '# Company profile', JSON.stringify(withoutSize(profile), null, 1), '',
    '# What the visitor told us', JSON.stringify(answers, null, 1), '',
  ];

  const shortlist = await ask('partner_shortlist', [
    ...context,
    '# Playbook entries that fit this archetype',
    briefing(profile.archetype.primary, profile.archetype.secondary),
  ].join('\n'), { model: 'haiku' });

  const picks = (shortlist.picks ?? [])
    .map((p) => ({ ...p, entry: entries.find((e) => e.id === p.id) }))
    .filter((p) => p.entry)
    .slice(0, 3);

  const written = await Promise.all(picks.map(async (p) => {
    try {
      const card = await ask('partner_opportunity', [
        ...context,
        '# The service line to write', '',
        p.entry.text,
        proofFor(p.entry.case) ? `proof_url: ${proofFor(p.entry.case).url}` : '', '',
        '# Why this one was chosen for them', p.angle,
      ].join('\n'));
      return { ...card, id: card.id || p.id };
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
  return { opening: shortlist.opening ?? '', cards };
}

/* The consult half of a card — the objections their client will raise, the questions that
 * tell them whether an account is live, and when to walk away — is judgment, so it is the
 * model's to write. What it is not allowed to do is pad: three thin questions read as
 * filler and cost the whole card its authority. Short of the count, we show fewer. */
function tidyCard(card) {
  const lines = (xs, n) => [...new Set((xs ?? []).map((x) => String(x).trim()).filter(Boolean))].slice(0, n);
  card.qualify = lines(card.qualify, 3);
  card.objections = (card.objections ?? [])
    .filter((o) => o && String(o.objection ?? '').trim() && String(o.answer ?? '').trim())
    .slice(0, 2);
  for (const k of ['wrong_if', 'where_it_lands']) card[k] = String(card[k] ?? '').trim();
  if (card.fit) {
    for (const k of ['attaches_to', 'evidence', 'assumption']) {
      card.fit[k] = String(card.fit[k] ?? '').trim();
    }
  }
  return card;
}

/* Both of these are promises to the visitor rather than the model's prose — a case study
 * URL and the engagement they would sell — so both are written back from our own files
 * after the model has spoken. A mis-copied URL or a quietly inflated "6-week" can never
 * reach a card. */
function groundCards(cards, profile) {
  const entries = forArchetypes(profile.archetype.primary, profile.archetype.secondary);
  for (const card of cards ?? []) {
    const entry = entries.find((e) => e.id === card.id);
    if (!entry) continue;
    const p = proofFor(entry.case);
    if (p) card.proof = { customer: p.customer, result: p.result, url: p.url, title: p.title, teaser: p.teaser };
    if (entry.first_offer?.name) card.first_offer = { ...entry.first_offer };
    /* Who signs, how the build runs, who has to be on it, the line they repeat in the
     * meeting, and the conditions the line was drafted for. All of it is in the playbook
     * already; a model asked to write it instead produces a plausible version of a thing
     * we have on file. The model argues from these — it does not author them. */
    if (entry.buyer) card.who_buys = entry.buyer;
    if (entry.delivery?.shape) card.delivery = entry.delivery.shape;
    if (entry.delivery?.team_needed) card.team_needed = entry.delivery.team_needed;
    if (entry.client_pitch) card.client_pitch = entry.client_pitch;
    if (entry.fits_when?.length) card.fits_when = entry.fits_when;
    if (entry.lyzr_products?.length) card.lyzr_products = entry.lyzr_products;
    /* What else the partner can put in front of that client. Chosen from our own catalog
     * by topic overlap, never by asking a model which links sound relevant. */
    card.resources = relatedTo({
      topics: p?.topics ?? [],
      products: card.lyzr_products ?? [],
      industries: (profile.industries ?? []).map((i) => i.name),
      exclude: [entry.case],
    });
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
      attaches_to: c.fit?.attaches_to, where_it_lands: c.where_it_lands,
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
    /* A connective line about a single play is a line about nothing. */
    if (picked.length < 2) out.brief.how_they_connect = '';
  }

  return { brief: out.brief, internal: out.internal };
}
