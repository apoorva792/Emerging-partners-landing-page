import { step2 } from '../lib/journey.js';
import { guard, json, body, record } from './_handler.js';

export default guard(async (req, res) => {
  const { id, profile, answers, found } = await body(req);
  const out = await step2(profile, answers, found);
  await record(id, { answers, cards: out.cards, not_recommended: out.not_recommended });
  return json(res, 200, out);
});
