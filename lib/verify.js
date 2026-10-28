/* The last gate before anything reaches a partner.
 *
 * Everything upstream is a reason to believe a card is sound. This is the pass that
 * assumes it is not. It runs over the finished cards, in code, against the evidence they
 * were built from, and it either repairs what can be repaired or records what cannot.
 *
 * Nothing here is a matter of taste. Every check is a thing that has actually gone out
 * wrong at some point: a result from one customer printed under another's problem, a
 * platform named that the firm does not work in, a client email referring to history that
 * never happened. */

import { families, domains, conflicts, lineText, objects, drifts } from './fit.js';

const BANNED = /\b(leverage|unlock|empower|seamless|robust|cutting-edge|transformative|game-changing|revolutionis\w*|supercharge|elevate|harness|best-in-class|world-class|next-generation|state-of-the-art|paradigm|holistic|synerg\w*)\b/i;

/* The fields a partner forwards to their own client. Anything wrong in these is wrong in
 * front of someone who is not our audience. */
const OUTBOUND = ['client_email', 'client_pitch', 'first_conversation'];

/* Pages about the platform in general. Useful to a partner evaluating Lyzr, useless to
 * the client they are about to send it to, unless the card is actually about that
 * product. */
const GENERIC_READING = /\b(docs? (and|&) api|api (reference|overview)|developer docs|get started|find the right agent|platform overview|pricing|what is lyzr|about lyzr)\b/i;

const text = (v) => (Array.isArray(v) ? v.join(' ') : typeof v === 'object' && v ? Object.values(v).join(' ') : String(v ?? ''));
const allText = (card, keys) => keys.map((k) => text(card[k])).join(' ');
const words = (s) => new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));

/* Proper nouns a card mentions. Crude on purpose: the check that follows is about whether
 * we can account for a name, and a false positive costs a line in the run record. */
function names(s) {
  return [...new Set((String(s).match(/\b[A-Z][A-Za-z0-9]*(?:\s+[A-Z][A-Za-z0-9]*)?\b/g) ?? [])
    .map((x) => x.trim()).filter((x) => x.length > 3))];
}

export function verify(cards, profile) {
  const issues = [];
  const caps = profile?.capabilities;
  const add = (card, check, detail, severity = 'warn') =>
    issues.push({ card: card?.id ?? '-', headline: card?.headline ?? '', check, detail, severity });

  /* What this firm is known to touch: their own platforms, the technologies in their
   * delivered work, and the industries they serve. A card may name these. */
  const known = new Set([
    ...(profile?.platforms ?? []).map((p) => String(p.name ?? p).toLowerCase()),
    ...(caps?.technologies ?? []).map((t) => t.toLowerCase()),
    ...(profile?.services ?? []).flatMap((s) => [...words(s.name)]),
  ].filter(Boolean));

  const seen = new Set();
  const kept = [];

  for (const card of cards ?? []) {
    let blocked = false;

    /* 0. A product card has to name a product we actually offered it, and the play it
     *    came from was already checked against their evidence. This catches a card that
     *    lost its product somewhere between the engine and the page. */
    if (card.path === 'product' && !card.product?.name) {
      add(card, 'product', 'a product line arrived with no product on it', 'block');
      blocked = true;
    }

    /* 1. Every card traces to something this firm has really delivered. */
    if (!(card.stands_on ?? []).length) {
      add(card, 'evidence', 'nothing on their own site was cited for this line');
    }

    /* 2. A measured result belongs to the customer it was measured at, and may only sit
     *    under work of the same kind. The engine enforces this; a card that arrived here
     *    with a result and no citation behind it did not come through the engine. */
    if (card.proof?.result && !card.proof.url) {
      delete card.proof;
      add(card, 'proof', 'a result with no source was removed');
    }

    /* 3. The partner's client must never read our other customer's name. A proof line is
     *    ours to show the partner; it is not theirs to forward. */
    const outbound = allText(card, OUTBOUND);
    const customer = card.proof?.customer;
    if (customer && outbound.toLowerCase().includes(String(customer).toLowerCase().slice(0, 18))) {
      for (const k of OUTBOUND) if (typeof card[k] === 'string') card[k] = '';
      add(card, 'leak', `outbound copy named ${customer}, our customer, and was cleared`, 'block');
    }

    /* 4. Client-facing copy must not claim history that did not happen. Any company name
     *    in it that is neither the partner, nor a client they named, nor one of ours, is
     *    something the model brought with it. */
    const ours = new Set([
      ...(profile?.named_clients ?? []).map((c) => String(c.name).toLowerCase()),
      ...(caps?.evidence ?? []).map((e) => String(e.client).toLowerCase()),
      String(profile?.company?.name ?? '').toLowerCase(),
    ]);
    for (const n of names(outbound)) {
      const low = n.toLowerCase();
      if (ours.has(low) || known.has(low) || words(outbound).size < 5) continue;
      /* Only flag it when it reads like a company rather than a job title or a system we
       * already know they work in. */
      if (/\b(Inc|Ltd|LLC|GmbH|Corp|Group|Holdings)\b/.test(n)) {
        add(card, 'invented', `outbound copy names ${n}, which is not in their evidence`, 'block');
        for (const k of OUTBOUND) if (typeof card[k] === 'string') card[k] = '';
        break;
      }
    }

    /* 5. There has to be a route from the first engagement to the next pound. A card with
     *    no opening offer or no expansion is an idea, not an opportunity. */
    if (!card.first_offer?.name || !card.how_to_sell?.expansion) {
      add(card, 'commercial', 'no first engagement or no expansion path', 'block');
      blocked = true;
    }

    /* 6. Distinct. Two cards aimed at the same department with the same kind of growth
     *    are one card shown twice. */
    const shape = `${card.who_buys ?? ''}|${card.growth_path ?? ''}`.toLowerCase();
    if (seen.has(shape)) {
      add(card, 'distinct', 'same buyer and same growth path as an earlier card', 'block');
      blocked = true;
    }
    seen.add(shape);

    /* 7. Only platforms this firm works in. Naming a stack they do not touch is the
     *    fastest way to lose a reader who knows their own business. */
    const body = allText(card, ['what_it_is', 'why_you', 'client_pitch', 'where_it_lands']);
    for (const n of names(body)) {
      const low = n.toLowerCase();
      if (known.has(low)) continue;
      if (/^(SAP|ServiceNow|Oracle|Workday|Salesforce|NetSuite|Infor|Epicor|Dynamics|MuleSoft|Boomi|webMethods|Sterling|Ariba|SuccessFactors|Snowflake|Databricks|Bedrock|SageMaker)$/i.test(n)) {
        add(card, 'platform', `names ${n}, which is not in their platforms or their delivered work`);
      }
    }

    /* 8. An inferred client problem has to read as a question, not as a fact about their
     *    clients. The prompt is told; this says when it did not listen. */
    if (card.problem_status === 'hypothesis' && /\b(your clients are|they are losing|clients currently spend|teams waste)\b/i.test(body)) {
      add(card, 'hypothesis', 'an inferred problem is written as an established fact');
    }

    /* 9. The whole card, read as one thing. Each piece was checked against the line when
     *    it was chosen; this reads the rendered card the way a partner will and asks
     *    whether its parts are about the same business. A forecasting card whose
     *    mechanism describes claims processing is internally contradictory even though
     *    every field passed its own test. */
    const whole = lineText(card);
    const want = { f: families(whole), d: new Set([...domains(whole), ...(profile?.capabilities?.industries ?? []).flatMap((i) => [...domains(i)])]) };

    const section = (label, value, keys) => {
      const t = Array.isArray(value) ? value.join(' ') : typeof value === 'object' && value ? Object.values(value).join(' ') : String(value ?? '');
      if (!t.trim()) return;
      if (conflicts(want.d, domains(t))) {
        add(card, 'mismatch', `${label} is about ${[...domains(t)].join('/')}, the card is about ${[...want.d].join('/') || 'something else'}`, 'block');
        for (const k of keys) delete card[k];
        return;
      }
      const f = families(t);
      if (want.f.size && f.size && ![...f].some((x) => want.f.has(x))) {
        add(card, 'mismatch', `${label} describes ${[...f].join('/')}, the card is about ${[...want.f].join('/')}`, 'block');
        for (const k of keys) delete card[k];
      }
    };

    section('the mechanism', card.mechanism, ['mechanism']);
    section('the demo', (card.demo ?? []).map((d) => `${d.name} ${d.does}`), ['demo']);
    section('the reference', card.reference ? `${card.reference.title}` : '', ['reference']);
    section('the proof', card.proof ? `${card.proof.result} ${card.proof.customer} ${card.proof.title}` : '', ['proof']);
    for (const r of [...(card.resources ?? [])]) {
      const t = `${r.title} ${r.blurb ?? ''}`;
      const f = families(t);
      const bad = conflicts(want.d, domains(t))
        || (want.f.size && f.size && ![...f].some((x) => want.f.has(x)));
      if (bad) {
        card.resources = card.resources.filter((x) => x.id !== r.id);
        add(card, 'mismatch', `dropped "${r.title}", it is not about ${[...want.f].join('/') || 'this work'}`);
      }
    }

    /* 9b. One workflow, from the headline to the outreach email. Every section of a card
     *     has to be about the same thing the card is about. A card that opens on purchase
     *     order validation and closes on invoice reconciliation is two services sharing a
     *     page, and the partner cannot sell either of them from it. Checked on the thing
     *     the work acts on, which is what stays constant when the wording does not. */
    /* Everything the card itself claims to be about, so a deliverable that mentions a
     * supplier on a purchase order card is not treated as a different service. Narrow
     * enough to catch a real second workflow, wide enough not to punish detail. */
    const subject = objects([card.headline, card.what_it_is, card.why_you,
      card.first_offer?.name, card.who_buys].filter(Boolean).join(' '));
    const sections = [
      ['what the client gets', 'mechanism'],
      ['the first engagement', 'first_offer'],
      ['the discovery questions', 'discovery'],
      ['the qualifying questions', 'qualify'],
      ['the outreach email', 'client_email'],
      ['the first step', 'first_step'],
      ['where it lands', 'where_it_lands'],
    ];
    for (const [label, key] of sections) {
      const value = card[key];
      /* A list is judged line by line, never as one joined string: three deliverables
       * about purchase orders and one about invoices read as a card about orders when
       * they are concatenated, and the wrong line survives. */
      if (Array.isArray(value)) {
        const bad = value.filter((x) => drifts(subject, String(x)));
        if (!bad.length) continue;
        card[key] = value.filter((x) => !drifts(subject, String(x)));
        const off = drifts(subject, String(bad[0]));
        add(card, 'workflow', `${bad.length} of ${label} ${bad.length === 1 ? 'is' : 'are'} about ${off.got.join('/')}, the card is about ${off.want.join('/')}`, 'block');
        continue;
      }
      const t = typeof value === 'object' && value ? Object.values(value).join(' ') : String(value ?? '');
      const off = drifts(subject, t);
      if (!off) continue;
      /* An email or a question about a different service is worse than none: the partner
       * sends it and the client answers about something else. */
      add(card, 'workflow', `${label} is about ${off.got.join('/')}, the card is about ${off.want.join('/')}`, 'block');
      delete card[key];
    }

    /* 9c. Reading that is about the platform rather than the work is filler. A partner
     *     forwarding "Docs and API overview" with a procurement offer has sent their
     *     client our documentation, which answers a question nobody asked. */
    card.resources = (card.resources ?? []).filter((r) => {
      const t = `${r.title} ${r.blurb ?? ''}`;
      if (drifts(subject, t)) {
        add(card, 'resources', `dropped "${r.title}", it is about ${drifts(subject, t).got.join('/')}`);
        return false;
      }
      /* A general platform page earns its place only when the card is actually about
       * that product, matched on the whole product name. Matching on its first word let
       * "Find the right agent" through on the strength of "Agent Studio". */
      const named = [card.product?.name, ...(card.lyzr_products ?? [])].filter(Boolean)
        .some((p) => r.title.toLowerCase().includes(String(p).toLowerCase()));
      if (GENERIC_READING.test(r.title) && !named) {
        add(card, 'resources', `dropped "${r.title}", too general to send with this offer`);
        return false;
      }
      return true;
    });

    /* 9d. A product card has to say what the firm is missing, or it is a vendor pitch.
     *     The writer is told; this is how we find out when it did not listen. */
    if (card.path === 'product' && !/\b(already|today|you run|you built|you deliver|you hold|you own|currently)\b/i.test(card.why_you ?? '')) {
      add(card, 'product', 'a product card that never says what they already provide');
    }

    /* 10. Reading we send with it has to be about this line. */
    if (!(card.resources ?? []).length) add(card, 'resources', 'nothing relevant to send with it');

    /* 11. House style, which the prompts ask for and the models still break. */
    const prose = allText(card, ['what_it_is', 'why_you', 'client_pitch', 'first_step', 'where_it_lands']);
    const bad = prose.match(BANNED);
    if (bad) add(card, 'style', `filler word: ${bad[0]}`);
    if (prose.includes('—')) add(card, 'style', 'em dash');

    if (!blocked) kept.push(card);
  }

  return {
    cards: kept.length ? kept : (cards ?? []),
    /* Dropping every card leaves the visitor with nothing, which is worse than one card
     * with a noted problem. If that happens the run record says so loudly. */
    degraded: Boolean(cards?.length) && !kept.length,
    issues,
    blocking: issues.filter((i) => i.severity === 'block').length,
  };
}
