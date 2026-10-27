import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './env.js';

const DIR = path.join(ROOT_DIR, 'kb', 'playbook');
const PROOF = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'proof.json'), 'utf8'));

const field = (text, key) => text.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1].trim();

/* Keys are read inside their own block, not from the whole file: `shape` exists under both
 * `delivery` and `first_offer`, and a loose match takes whichever comes first. */
function block(text, key, keys) {
  const body = text.match(new RegExp(`^${key}:\\n((?:  \\S.*\\n)+)`, 'm'))?.[1] ?? '';
  return Object.fromEntries(keys.map((k) => [k, body.match(new RegExp(`^  ${k}: (.+)$`, 'm'))?.[1].trim()]));
}

/* The engine reads whole playbook entries rather than retrieved snippets: there are only
 * sixteen, a card is useless with half its fields, and precision matters more here than
 * recall. The knowledge base still serves the program answers and ad-hoc questions. */
const list = (text, key) => (text.match(new RegExp(`^${key}:\\n((?:  - .*\\n)+)`, 'm'))?.[1] ?? '')
  .split('\n').map((l) => l.replace(/^  - /, '').trim()).filter(Boolean);

export function entries() {
  return fs.readdirSync(DIR).filter((f) => f.endsWith('.yaml')).sort().map((f) => {
    const text = fs.readFileSync(path.join(DIR, f), 'utf8');
    return {
      id: field(text, 'id'),
      archetype: field(text, 'archetype'),
      also_fits: (text.match(/^also_fits: \[(.+)\]$/m)?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      case: text.match(/^\s*case: (\S+)$/m)?.[1],
      /* What this line is *about*, in the resource catalog's own vocabulary. Matching the
       * reading list against the case study's topics instead put an HR guide under a
       * factory workflow play: the proof travels from another sector on purpose, so its
       * subject is not this line's subject. */
      topics: list(text, 'topics'),
      /* Which of the three kinds of growth this line is: more work inside an account they
       * hold, a way into one they do not, or something that bills every month. It is a
       * property of the line, not a reading of the firm, so it lives here rather than
       * being decided per run. The three cards are chosen to cover all three. */
      growth_path: field(text, 'growth_path') ?? 'expand',
      /* The scoped engagement they sell first. Read out of the file and written over the
       * model's copy, for the same reason `proof` is: it is a commitment we make, so it
       * says what we wrote, not what the model remembered. */
      first_offer: block(text, 'first_offer', ['name', 'shape', 'ends_with']),
      /* Written over the model's copy for the same reason `first_offer` is: who signs,
       * how long a build runs, who has to be on it and the line they repeat in the
       * meeting are commitments, not phrasing. The model argues from them; it does not
       * get to restate them. */
      buyer: field(text, 'buyer'),
      /* The sales kit half of an entry: how the thing actually works, what the partner has
       * to find out before it is real, who brings what, and the question that opens the
       * conversation. Written here so every card carries it, rather than improvised per
       * firm by a model that has never delivered one. */
      first_conversation: (text.match(/^first_conversation: "?(.+?)"?$/m)?.[1] ?? '').trim() || undefined,
      mechanism: list(text, 'mechanism'),
      discovery: list(text, 'discovery'),
      roles: block(text, 'roles', ['partner', 'lyzr']),
      client_pitch: (text.match(/^pitch_to_their_client: "?(.+?)"?$/m)?.[1] ?? '').trim() || undefined,
      delivery: block(text, 'delivery', ['shape', 'team_needed']),
      lyzr_products: (text.match(/^  lyzr_products: \[(.+)\]$/m)?.[1] ?? '')
        .split(',').map((x) => x.trim()).filter(Boolean),
      text,
    };
  });
}

export function forArchetypes(primary, secondary = []) {
  const want = new Set([primary, ...secondary]);
  return entries()
    .filter((e) => want.has(e.archetype) || e.also_fits.some((a) => want.has(a)));
}

export const proofFor = (caseId) => PROOF[caseId] ?? null;

export function briefing(primary, secondary) {
  return forArchetypes(primary, secondary).map((e) => {
    const p = proofFor(e.case);
    return `--- ${e.id}\n${e.text}${p ? `proof_url: ${p.url}\nproof_title: ${p.title}\n` : ''}`;
  }).join('\n');
}
