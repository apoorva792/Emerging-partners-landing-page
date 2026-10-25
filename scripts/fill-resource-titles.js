/* The resource catalog was built from card text that the site had already clipped, so 117
 * of 174 titles and blurbs end in an ellipsis. There is no fuller copy locally, so this
 * fetches the real title from each page once and writes it back into data/resources.json.
 *   node scripts/fill-resource-titles.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../lib/env.js';

const FILE = path.join(ROOT_DIR, 'data', 'resources.json');
const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const clipped = (s) => typeof s === 'string' && /[…]\s*$/.test(s);

const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => (
    { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ' }[m]
  ))
  .replace(/\s+/g, ' ')
  .trim();

/* og:title is the editorial title; <title> carries the site suffix, so it is the fallback
 * and the suffix is cut off. */
function titleOf(html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (og) return decode(og[1]);
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return t ? decode(t[1]).replace(/\s*[|–—-]\s*Lyzr.*$/i, '') : null;
}

const todo = doc.resources.filter((r) => r.url && (clipped(r.title) || clipped(r.blurb) || clipped(r.teaser)));
console.log(`${todo.length} of ${doc.resources.length} resources are clipped`);

let fixed = 0, failed = 0;
const queue = [...todo];
async function worker() {
  while (queue.length) {
    const r = queue.shift();
    try {
      const res = await fetch(r.url, { signal: AbortSignal.timeout(15_000), redirect: 'follow' });
      if (!res.ok) throw new Error(String(res.status));
      const full = titleOf(await res.text());
      if (full && full.length > 3) {
        if (clipped(r.title)) { r.title = full; fixed++; }
      } else throw new Error('no title');
    } catch (e) {
      failed++;
      /* Better a clean short title than a sentence that stops mid-word. */
      if (clipped(r.title)) r.title = r.title.replace(/\s*\S*…\s*$/, '').replace(/[,:;–—-]\s*$/, '');
    }
    /* A blurb or teaser that was clipped is a fragment either way: trim to the last
     * complete clause rather than leaving the ellipsis dangling. */
    for (const k of ['blurb', 'teaser']) {
      if (clipped(r[k])) r[k] = r[k].replace(/\s*\S*…\s*$/, '').replace(/[,:;–—-]\s*$/, '');
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
fs.writeFileSync(FILE, JSON.stringify(doc, null, 1));
console.log(`titles recovered from the site: ${fixed}; trimmed instead: ${failed}`);
console.log('remaining with an ellipsis:', JSON.stringify(doc).split('…').length - 1);
