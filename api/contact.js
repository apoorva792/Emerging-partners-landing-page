import { guard, json, body, record } from './_handler.js';

/* Just a flag on the run record. The POC stops here by design: no CRM write, no owner
 * routing, no calendar — so the page must not imply a meeting has been booked. */
export default guard(async (req, res) => {
  const { id } = await body(req);
  await record(id, { contact_me: true, contact_requested: new Date().toISOString() });
  return json(res, 200, { ok: true });
});
