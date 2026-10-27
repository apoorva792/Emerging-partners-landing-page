import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { env, ROOT_DIR } from './env.js';

const INFERENCE = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
export const IDS = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'studio', 'ids.json'), 'utf8'));

/* Per-call model override. The agent carries a default; the profiler runs on a faster model
 * because its job is extraction against a schema, not judgement. */
export const MODELS = {
  sonnet: { model: 'anthropic/claude-sonnet-4-6', llm_provider_id: 'Anthropic' },
  haiku: { model: 'anthropic/claude-haiku-4-5', llm_provider_id: 'Anthropic' },
  flash: { model: 'gemini/gemini-3.1-flash-lite', llm_provider_id: 'Google' },
};

export async function ask(agentKey, message, { session, model } = {}) {
  const agent_id = IDS.agents[agentKey];
  if (!agent_id) throw new Error(`no agent id for ${agentKey} — run scripts/studio-setup.js`);
  const sid = session || crypto.randomUUID();
  const res = await fetch(INFERENCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.LYZR_API_KEY },
    body: JSON.stringify({ user_id: `partner-${sid}`, agent_id, session_id: `${agent_id}-${sid}`, message, ...(MODELS[model] || {}) }),
    signal: AbortSignal.timeout(90_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Studio ${res.status}: ${text.slice(0, 300)}`);
  const raw = String(JSON.parse(text).response ?? '').replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  try { return plain(JSON.parse(raw)); } catch { throw new Error(`agent did not return JSON: ${raw.slice(0, 300)}`); }
}

/* Every prompt bans the em dash and the model writes them anyway, so the rule is enforced
 * here as well as asked for. A spaced en dash goes the same way; an unspaced one is a
 * range ("8-10 weeks") and is left alone. */
function plain(value) {
  if (typeof value === 'string') {
    return value.replace(/\s*\u2014\s*/g, ', ').replace(/ \u2013 /g, ', ').replace(/,\s*,/g, ',');
  }
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  }
  return value;
}
