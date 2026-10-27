import { step2 } from '../lib/journey.js';
import { guard, json, body, record } from './_handler.js';

export default guard(async (req, res) => {
  const { id, profile, answers, found } = await body(req);
  const out = await step2(profile, answers, found);
  /* The quality report goes to the run file, never to the browser: it is how we find out
   * what the engine got wrong without the visitor reading it. */
  await record(id, { answers, cards: out.cards, not_recommended: out.not_recommended, quality: out.quality });
  return json(res, 200, { opening: out.opening, cards: out.cards, ms: out.ms });
});
