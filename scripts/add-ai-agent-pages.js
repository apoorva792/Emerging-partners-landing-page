/* Adds the /ai-agents/ library to data/resources.json.
 *
 *   node scripts/add-ai-agent-pages.js
 *
 * Those pages are live on lyzr.ai and in no sitemap, so nothing that walks the site can
 * find them. The Leia chat agent's `lyzr_usecases` knowledge base crawled them, so the
 * URLs and titles come from there, once, offline. The knowledge base is not a runtime
 * dependency: this writes the pages into the list the catalogue is built from, and
 * everything downstream treats them like any other source.
 *
 * They go in as collateral, not as offerings. Each one is an application a partner builds
 * and runs on Agent Studio, so it is a thing to reference and send rather than a licence
 * of its own, and it is tagged so a card about that industry can find it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../lib/env.js';
import { env } from '../lib/env.js';

const KB = '6abd4394f5b20fbc51ceeab6';            // lyzr_usecases, from the Leia repo
const RAG = 'https://rag-prod.studio.lyzr.ai/v3';
const QUERIES = ['manufacturing production planning', 'logistics supply chain shipment', 'retail merchandising catalog',
  'telecom network billing', 'energy utilities', 'education admissions student', 'construction', 'automotive',
  'pharma life sciences', 'media buying', 'finance accounting forecasting', 'hr operations recruiting',
  'customer support', 'outbound sales', 'procurement sourcing', 'legal contract clause', 'healthcare medical coding',
  'insurance underwriting', 'banking operations', 'oracle cloud', 'azure', 'aws', 'google cloud', 'nvidia',
  'ibm cloud', 'agriculture', 'real estate', 'travel', 'defense', 'cybersecurity', 'data pipeline monitoring',
  'municipal services'];

/* Slug words to the tags the library already uses, so a new page is found by the same
 * matching as an old one rather than by a vocabulary of its own. */
const INDUSTRY = {
  manufacturing: 'manufacturing', production: 'manufacturing', supply: 'logistics', logistics: 'logistics',
  shipment: 'logistics', telecom: 'telecom', retail: 'retail', ecommerce: 'e-commerce', healthcare: 'healthcare',
  medical: 'healthcare', pharma: 'healthcare', banking: 'banking', insurance: 'insurance', education: 'education',
  admissions: 'education', student: 'education', energy: 'energy & utilities', government: 'government',
  municipal: 'government', media: 'media & advertising', travel: 'travel & hospitality', automotive: 'manufacturing',
  construction: 'construction', agriculture: 'agriculture', defense: 'government', 'real': 'real estate',
};
const FUNCTION = {
  accounting: 'finance', financial: 'finance', forecasting: 'finance', hr: 'human resources',
  support: 'customer service', customer: 'customer service', sales: 'revenue & sales', outbound: 'revenue & sales',
  sourcing: 'procurement', procurement: 'procurement', contract: 'legal', clause: 'legal', legal: 'legal',
  underwriting: 'insurance', coding: 'healthcare', network: 'it operations', monitoring: 'it operations',
  pipeline: 'it operations', cybersecurity: 'compliance & risk', billing: 'finance', catalog: 'operations',
};
const PLATFORM = { oracle: 'oracle', azure: 'azure', aws: 'aws', google: 'google cloud', ibm: 'ibm cloud', nvidia: 'nvidia' };

const slugWords = (url) => url.split('/ai-agents/')[1].replace(/^buidling-|^building-/, '').split(/[-/]/).filter(Boolean);

const pages = new Map();
await Promise.all(QUERIES.map(async (q) => {
  const u = `${RAG}/rag/${KB}/retrieve/?query=${encodeURIComponent(q)}&top_k=10&retrieval_type=mmr&lambda_param=0.6&score_threshold=0`;
  try {
    const r = await fetch(u, { headers: { 'x-api-key': env.LYZR_API_KEY }, signal: AbortSignal.timeout(30_000) });
    if (!r.ok) return;
    for (const d of (await r.json()).results ?? []) {
      const t = String(d.text ?? '');
      const url = (t.match(/URL:\s*(\S+)/) ?? [])[1];
      if (!url || !url.includes('/ai-agents/')) continue;
      const title = (t.match(/Page:\s*(.+?)\s+URL:/) ?? [])[1];
      const blurb = (t.match(/Summary:\s*([\s\S]{0,260}?)(?:\s+Section:|$)/) ?? [])[1];
      const key = url.replace(/\/$/, '');
      const prev = pages.get(key) ?? {};
      if (title) pages.set(key, { url: key, title: prev.title || title.trim(), blurb: (prev.blurb || blurb || '').trim() });
    }
  } catch { /* one query failing is not the run failing */ }
}));

const file = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'resources.json'), 'utf8'));
const have = new Set(file.resources.map((r) => (r.url ?? '').replace(/\/$/, '')));
let added = 0;
for (const p of pages.values()) {
  if (!p.title || have.has(p.url)) continue;
  const words = slugWords(p.url);
  /* Every one of these is about building and shipping agents into a client's systems, so
   * they all carry the engineering tag. Without a tag that maps to a family they classify
   * as nothing, and a resource that classifies as nothing can never be sent with anything,
   * which would have made adding them pointless. */
  const topics = new Set(['agent studio', 'agent_studio', 'by_industry', 'engineering', 'workflow_automation']);
  for (const w of words) {
    if (INDUSTRY[w]) topics.add(INDUSTRY[w]);
    if (FUNCTION[w]) topics.add(FUNCTION[w]);
    if (PLATFORM[w]) topics.add(PLATFORM[w]);
  }
  /* Many of these pages came back from the knowledge base without a summary, and a
   * resource with no words cannot be classified, so it can never be sent with anything.
   * The slug says what the page is, so it becomes the sentence. Nothing is invented: the
   * URL is the claim. */
  const described = p.url.split('/ai-agents/')[1]
    .replace(/^buidling-|^building-/, 'Building ')
    .replace(/^deploy-/, 'Deploying ')
    .replace(/^ai-agents-for-/, 'AI agents for ')
    .replace(/-/g, ' ')
    .replace(/\bai agents\b/gi, 'AI agents')
    .trim();
  file.resources.push({
    priority: 3,
    /* Not res_ai_: five pages already in the library have ids starting that way, and
     * rebuilding this list wiped them. */
    id: `res_aiagents_${words.join('_')}`.slice(0, 70),
    type: 'solution_page',
    title: p.title,
    blurb: p.blurb || `${described.charAt(0).toUpperCase()}${described.slice(1)}.`,
    teaser: '',
    url: p.url,
    topics: [...topics],
  });
  added++;
}
fs.writeFileSync(path.join(ROOT_DIR, 'data', 'resources.json'), JSON.stringify(file, null, 1) + '\n');
console.log(`added ${added} pages, resources.json now holds ${file.resources.length}`);
