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

const BANNED = /\b(leverage|unlock|empower|seamless|robust|cutting-edge|transformative|game-changing|revolutionis\w*|supercharge|elevate|harness|best-in-class|world-class|next-generation|state-of-the-art|paradigm|holistic|synerg\w*)\b/i;

/* The fields a partner forwards to their own client. Anything wrong in these is wrong in
 * front of someone who is not our audience. */
const OUTBOUND = ['client_email', 'client_pitch', 'first_conversation'];

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

    /* 9. Reading we send with it has to be about this line. */
    if (!(card.resources ?? []).length) add(card, 'resources', 'nothing relevant to send with it');

    /* 10. House style, which the prompts ask for and the models still break. */
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
