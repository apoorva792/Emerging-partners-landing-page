/* One real journey, saved as fixtures, so the design can be checked without burning a
 * two-minute live run each time.  node scripts/fixtures.js [domain] */
import fs from 'node:fs';
import path from 'node:path';
import { buildProfile } from '../lib/profile.js';
import { questionsFor, step2, step3 } from '../lib/journey.js';
import { ROOT_DIR } from '../lib/env.js';

const domain = process.argv[2] || 'goml.io';
const dir = path.join(ROOT_DIR, 'runs', 'fixtures');
fs.mkdirSync(dir, { recursive: true });
const put = (name, data) => { fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(data, null, 1)); console.log('  ' + name); };

console.log(`fixtures from ${domain}`);
const r = await buildProfile('hello@' + domain, domain);
const questions = questionsFor(r.profile);
put('profile', { ok: true, id: 'fixture', profile: r.profile, brand: r.brand, evidence: r.evidence, questions });

const answers = questions.map((q) => ({ field: q.field, question: q.question, answer: q.options[0] }));
const rec = await step2(r.profile, answers);
put('recommend', rec);

/* Three, so the fixture exercises the full three-sheet brief. */
const chosen = rec.cards.slice(0, Number(process.argv[3]) || 3);
const accounts = (r.profile.named_clients ?? []).slice(0, 3)
  .map((c, i) => ({ name: c.name, strength: ['Champion inside', 'Warm', 'Dormant'][i] ?? 'Warm' }));
const a = await step3({ profile: r.profile, answers, chosen, cards: rec.cards });
put('assess', { brief: a.brief });
console.log('done');
