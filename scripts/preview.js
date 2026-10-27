/* Renders the finished screens from the saved fixtures, so the design can be checked
 * without burning a live run. Writes public/_preview.html (gitignored).
 *   node scripts/fixtures.js && node scripts/preview.js
 *   http://localhost:3000/_preview.html?to=explore|package|accounts
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../lib/env.js';

const dir = path.join(ROOT_DIR, 'runs', 'fixtures');
const load = (n) => JSON.parse(fs.readFileSync(path.join(dir, n + '.json'), 'utf8'));
const [profile, recommend, assess] = ['profile', 'recommend', 'assess'].map(load);

const stub = `
<style>*{animation:none!important;transition:none!important;scroll-behavior:auto!important}</style>
<script>
const FIX = {
  '/api/profile': ${JSON.stringify(profile)},
  '/api/recommend': ${JSON.stringify(recommend)},
  '/api/assess': ${JSON.stringify(assess)},
  '/api/accounts': { ranked: [{account:'Rakuten Symphony',why:'Champion inside; telco compliance trails are auditable requirements.'},{account:'Honda',why:'Manufacturing procurement workflows are manual-heavy and warm to reopen.'},{account:'Bosch',why:'Named account with multi-plant process sprawl worth one pilot.'}] },
  '/api/contact': { ok: true },
};
window.fetch = async (url) => ({ ok: true, json: async () => FIX[url] });
window.scrollTo = () => {};
/* ?to=<screen> drives the journey there, so a screenshot needs no clicking. */
addEventListener('load', () => {
  const to = new URLSearchParams(location.search).get('to');
  if (!to) return;
  const seq = { focus: 1, explore: 2, accounts: 3, brief: 4 }[to] || 0;
  const click = (sel) => document.querySelector(sel)?.click();
  let t = 0;
  const at = (ms, fn) => setTimeout(fn, t += ms);
  at(300, () => {
    document.getElementById('email').value = 'hello@goml.io';
    click('#start');
  });
  if (seq >= 2) for (let i = 0; i < 5; i++) at(250, () => { click('#qopts .opt'); click('#qnext'); });
  /* Tick a second card so the preview exercises the multi-play brief. */
  if (seq >= 3) at(900, () => document.querySelectorAll('.optab')[1]?.querySelector('.pickbox')?.click());
  if (seq >= 3) at(250, () => click('#build'));
  if (seq >= 4) at(600, () => {
    document.querySelectorAll('#accts .acct input').forEach((el, i) => { el.value = ['Rakuten Symphony', 'Honda', 'Bosch'][i] || ''; });
    click('#acctgo');
  });
  /* &untick=<n> clears that tile's tick first, to show that an unselected card keeps no
     highlight once you move off it. */
  const untick = new URLSearchParams(location.search).get('untick');
  if (untick) at(1000, () => document.querySelectorAll('.optab')[+untick]?.querySelector('.pickbox')?.click());

  /* &open=<n> opens that tile without ticking it, to show the reading state. */
  const openN = new URLSearchParams(location.search).get('open');
  if (openN) at(1200, () => document.querySelectorAll('.optab')[+openN]?.querySelector('strong')?.click());

  /* ?print=1 strips the page down to the document alone — exactly what the PDF export
     puts in its iframe — so the printed result can be checked. Its own timer, not chained
     to the sequence, so it cannot be skipped. */
  if (new URLSearchParams(location.search).get('print')) setTimeout(function () {
    var sheet = document.querySelector('#s9.on #sheet-client') || document.querySelector('#s8.on #sheet-partner');
    if (!sheet) { console.error('print: no sheet on screen'); return; }
    document.body.innerHTML = '<div class="wrap">' + sheet.outerHTML + '</div>';
    document.querySelectorAll('.copy,.tabs').forEach(function (el) { el.remove(); });
  }, 7000);
});
<\/script>`;

const html = fs.readFileSync(path.join(ROOT_DIR, 'public', 'agent.html'), 'utf8').replace('</head>', stub + '\n</head>');
fs.writeFileSync(path.join(ROOT_DIR, 'public', '_preview.html'), html);
console.log('wrote public/_preview.html');
