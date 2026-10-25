import { step1 } from '../lib/journey.js';
import { guard, json, body, record } from './_handler.js';
import crypto from 'node:crypto';

export default guard(async (req, res) => {
  const { email, website } = await body(req);
  const id = crypto.randomUUID();
  const r = await step1(email, website);
  if (!r.ok) return json(res, 200, { ...r, id });
  await record(id, { email, website, profile: r.profile, evidence: r.evidence });
  return json(res, 200, { ...r, id });
});
