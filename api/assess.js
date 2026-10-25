import { step3 } from '../lib/journey.js';
import { guard, json, body, record } from './_handler.js';

export default guard(async (req, res) => {
  const { id, profile, answers, chosen, cards } = await body(req);
  const out = await step3({ profile, answers, chosen, cards });
  await record(id, { chosen: chosen?.id, brief: out.brief, internal: out.internal });
  /* The internal note never leaves the server. */
  return json(res, 200, { brief: out.brief });
});
