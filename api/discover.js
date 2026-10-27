import { discover } from '../lib/journey.js';
import { guard, json, body } from './_handler.js';

/* Started by the browser while the visitor is still on the last question, so the ten
 * seconds this takes are spent before the wait rather than inside it. The result is handed
 * straight back to /api/recommend. */
export default guard(async (req, res) => {
  const { profile, answers, partial } = await body(req);
  return json(res, 200, await discover(profile, answers, { partial: !!partial }));
});
