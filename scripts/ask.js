/* Quick retrieval check: node scripts/ask.js partner_playbook "netsuite implementation firm" */
import fs from 'node:fs/promises';
const env = Object.fromEntries((await fs.readFile('.env','utf8')).split('\n').filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')).trim(), l.slice(l.indexOf('=')+1).trim()]));
const ids = JSON.parse(await fs.readFile('studio/ids.json','utf8'));
const [kb, ...q] = process.argv.slice(2);
const url = `https://rag-prod.studio.lyzr.ai/v3/rag/${ids.kb[kb]}/retrieve/?query=${encodeURIComponent(q.join(' '))}&top_k=3&retrieval_type=mmr&lambda_param=0.6&score_threshold=0`;
const res = await fetch(url, { headers: { 'x-api-key': env.LYZR_API_KEY } });
const j = await res.json();
for (const d of (j.documents ?? j.results ?? j.data ?? [])) console.log('—', (d.metadata?.id ?? d.source ?? '?'), '\n ', (d.page_content ?? d.text ?? '').split('\n').slice(0,3).join(' / ').slice(0,180), '\n');
