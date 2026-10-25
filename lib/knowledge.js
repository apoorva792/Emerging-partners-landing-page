import { env } from './env.js';
import { IDS } from './studio.js';

const RAG = 'https://rag-prod.studio.lyzr.ai/v3';

export async function retrieve(kb, query, k = 6) {
  const url = `${RAG}/rag/${IDS.kb[kb]}/retrieve/?query=${encodeURIComponent(query)}&top_k=${k}&retrieval_type=mmr&lambda_param=0.6&score_threshold=0`;
  const res = await fetch(url, { headers: { 'x-api-key': env.LYZR_API_KEY }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`retrieve ${res.status}`);
  const j = await res.json();
  return (j.results ?? []).map((d) => d.text ?? '').join('\n\n');
}
