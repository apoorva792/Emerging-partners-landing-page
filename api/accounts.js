import { rankAccounts } from '../lib/journey.js';
import { guard, json, body, record } from './_handler.js';

/* Runs beside the brief, not before it. */
export default guard(async (req, res) => {
  const { id, profile, chosen, accounts } = await body(req);
  const ranked = await rankAccounts(profile, chosen, accounts);
  await record(id, { accounts, account_map: ranked });
  return json(res, 200, { ranked });
});
