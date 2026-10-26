const $ = (id) => document.getElementById(id);
const S = {
  id: null, profile: null, questions: [], answers: [], qi: 0,
  brand: null, cards: [], pick: 0, picked: [], chosen: [], brief: null, accounts: [],
  pending: {},   // work started before the visitor needs it
  seen: new Set(),  // questions already put in front of the visitor
};

/* Four stages now: the profile screen is gone. The visitor answers questions while we read
 * their site, so "Validate" was a screen that told them what they already knew. */
const STAGES = ['Discover', 'Focus', 'Explore', 'Unlock'];
const STEPS = ['s0', 's1', 's3', 's4', 's5', 's6', 's7', 's8'];
const STAGE_OF = [0, 0, 1, 2, 2, 3, 3, 3];
const WIDE = new Set(['s5', 's8']);

$('rail').innerHTML = STAGES.map((s, i) => `<div><i></i><span>0${i + 1} &nbsp;${s}</span></div>`).join('');

function show(id) {
  for (const s of [...STEPS, 'sx']) $(s).classList.toggle('on', s === id);
  const now = STAGE_OF[STEPS.indexOf(id)] ?? 0;
  [...$('rail').children].forEach((el, i) => {
    el.classList.toggle('on', i <= now);
    el.classList.toggle('now', i === now);
  });
  $('wrap').classList.toggle('wide', WIDE.has(id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
const fail = (msg) => { $('xmsg').textContent = msg; show('sx'); };
const esc = (t = '') => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* The model sometimes starts a sentence fragment lowercase; it reads like a typo. */
const up = (t = '') => String(t).replace(/^[a-z]/, (c) => c.toUpperCase());

async function post(path, payload) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `server error ${r.status}`);
  return r.json();
}

/* Three things about Lyzr, shown one at a time under the progress line while the visitor
 * waits. The cursor is module-level on purpose: the three waits in a session continue the
 * rotation rather than each restarting on the first one. */
const PROOF = [
  {
    label: 'Recognized by CB Insights',
    text: "Named among the world's 100 most promising AI startups in 2026.",
  },
  {
    label: 'Trusted by global enterprises',
    text: 'Powering production AI deployments for enterprises including Accenture, PepsiCo, KPMG and WTW.',
  },
  {
    label: '$100M+ in partner opportunities',
    text: 'Over $100 million in AI opportunities routed to Lyzr partners in 2026.',
  },
];
let proofAt = 0;

function proof(el, ms = 6000) {
  if (!el) return () => {};
  let timer = null;
  el.innerHTML = `<div class="pdots">${PROOF.map(() => '<i></i>').join('')}</div>`;
  const dots = el.querySelector('.pdots');
  const paint = () => {
    const i = proofAt++ % PROOF.length;
    const p = PROOF[i];
    /* Taken out of the flow before the next one lands, so the card never resizes. */
    const leaving = el.querySelector('.pi:not(.out)');
    if (leaving) { leaving.classList.add('out'); setTimeout(() => leaving.remove(), 600); }
    const d = document.createElement('div');
    d.className = 'pi';
    d.innerHTML = `<h4>${esc(p.label)}</h4><p>${esc(p.text)}</p>`;
    el.insertBefore(d, dots);
    [...dots.children].forEach((b, n) => b.classList.toggle('on', n === i));
    timer = setTimeout(paint, ms);
  };
  paint();
  return () => clearTimeout(timer);
}

function ticker(tickEl, barEl, lines, seconds) {
  let i = -1, t0 = Date.now(), stop = false;
  const paint = () => {
    if (stop) return;
    const pct = Math.min(96, ((Date.now() - t0) / (seconds * 1000)) * 100);
    if (barEl) barEl.style.width = pct + '%';
    const next = Math.min(lines.length - 1, Math.floor(pct / (100 / lines.length)));
    if (next !== i) { i = next; tickEl.innerHTML = lines[i]; }
    requestAnimationFrame(paint);
  };
  paint();
  /* Every wait screen carries one, so it starts and stops with the progress line rather
   * than at three separate call sites. */
  const stopProof = proof(tickEl.parentElement?.querySelector('.proof'));
  return () => { stop = true; stopProof(); if (barEl) barEl.style.width = '100%'; };
}

/* The five questions every visitor is asked, in order. Only the first one touches the
 * site, and only to pre-tick: its options stand on their own, so nobody waits on the crawl
 * to answer it. They are asked the moment the email is in — while the site is still being
 * read — because twenty seconds of watching a progress bar buys nothing. */
const FIXED_QUESTIONS = [
  {
    field: 'service_lines',
    question: 'What kind of work do you primarily deliver for clients?',
    /* The hint only claims a reading of their site once there is one. */
    hint: () => (serviceHits().size
      ? 'We found a few areas on your website. Tell us which ones matter most.'
      : 'Tell us which ones matter most.'),
    preselect: serviceHits,
    options: [
      'Cloud & infrastructure',
      'ERP & enterprise systems',
      'Software engineering',
      'Data & analytics',
      'Business process automation',
      'AI consulting',
      'Other',
    ],
  },
  {
    field: 'growth',
    question: 'Where do you see the biggest opportunity to grow?',
    hint: "We'll use this to shape what we recommend.",
    options: [
      'Expand within existing accounts',
      'Win new enterprise customers',
      'Add AI services to existing offerings',
      'Build repeatable industry solutions',
      'Improve delivery margins',
    ],
  },
  {
    field: 'demand',
    /* The one question that decides the rest: everything else describes the firm, this is
     * the only place actual demand shows up. */
    question: 'What are your customers asking you for today?',
    options: [
      'Automating manual workflows',
      'AI agents connected to business systems',
      'Internal AI assistants',
      'Modernizing existing applications',
      'Private or on-prem AI',
      'Exploring AI but no defined use case',
      'Not seeing much demand yet',
    ],
  },
  {
    field: 'ai_delivery',
    question: 'How far along are you in delivering AI projects?',
    hint: 'It decides what kind of enablement and technical support is worth offering.',
    options: [
      'Already delivering in production',
      'Running pilots or POCs',
      'Have opportunities but need delivery capabilities',
      'Building our first offering',
      'Still evaluating',
    ],
  },
  {
    field: 'client_geography',
    question: 'Where are most of your customers based?',
    hint: 'Quick one — it changes what we can propose.',
    options: [
      'North America',
      'UK & Europe',
      'Middle East',
      'India & South Asia',
      'Asia Pacific',
      'Other',
    ],
  },
];

/* The crawl names service lines in the company's own words ("NetSuite implementation");
 * the question offers buckets. This maps one onto the other well enough to tick a box the
 * visitor can untick, never well enough to answer for them. An empty profile — the site is
 * still being read, or could not be — simply ticks nothing. */
const SERVICE_BUCKETS = [
  ['Cloud & infrastructure', /\b(cloud|aws|azure|gcp|devops|infrastructure|kubernetes|managed services|migration)\b/i],
  ['ERP & enterprise systems', /\b(erp|sap|netsuite|oracle|dynamics|salesforce|workday|servicenow|crm)\b/i],
  ['Software engineering', /\b(software|application|product engineering|web|mobile|full[ -]?stack|custom development)\b/i],
  ['Data & analytics', /\b(data|analytics|bi|warehouse|lakehouse|etl|reporting|power bi)\b/i],
  ['Business process automation', /\b(process automation|rpa|workflow|bpa|bpo)\b/i],
  ['AI consulting', /\b(ai|artificial intelligence|machine learning|ml ops|mlops|genai|llm)\b/i],
];

function serviceHits() {
  const text = (S.profile?.services ?? [])
    .map((x) => (typeof x === 'string' ? x : `${x.name ?? ''} ${x.evidence ?? ''}`))
    .join(' · ');
  return new Set(SERVICE_BUCKETS.filter(([, re]) => re.test(text)).map(([label]) => label));
}

/* ---------------- 00 discover ---------------- */
$('start').onclick = () => {
  const email = $('email').value.trim();
  $('e0').hidden = true;
  if (!email.includes('@')) { $('e0').textContent = 'Please enter your work email.'; $('e0').hidden = false; return; }

  /* The email domain is the website. Asking for both was asking the same question twice,
   * and people answered the second one with their email. */
  S.pending.profile = post('/api/profile', { email })
    .then((r) => {
      if (!r.ok) throw new Error(r.message || r.error);
      S.id = r.id; S.profile = r.profile; S.brand = r.brand ?? null;
      /* Whatever the profiler could not establish gets appended, so the adaptive question
       * lands after the fixed two rather than holding them up. */
      for (const q of r.questions ?? []) if (!S.questions.some((x) => x.field === q.field)) S.questions.push(q);
      /* The site finishes being read while the visitor is still on the first question. If
       * they have not answered it yet, draw it again so what we found arrives in time to
       * be of use — ticked, and said in the hint — rather than a moment too late. */
      if (S.questions[S.qi]?.field === 'service_lines' && !$('qopts').querySelector('.opt.on')) {
        S.seen.delete('service_lines');
        askQ();
      }
      return r;
    });
  /* Work started ahead of the visitor can fail before anyone is waiting on it. Marking it
   * handled keeps that from surfacing as an unhandled rejection; the real await still
   * rejects and still shows the error screen. */
  S.pending.profile.catch(() => {});

  S.questions = [...FIXED_QUESTIONS];
  S.answers = [];
  S.seen = new Set();
  S.qi = 0;
  askQ();
};

/* ---------------- 03 focus ---------------- */
async function askQ() {
  if (S.qi >= S.questions.length) {
    /* Almost always already resolved — this is the seam where a slow site shows itself. */
    if (!S.profile) {
      show('s1');
      const done = ticker($('tick'), $('bar'), [
        'reading <b>' + esc(($('email').value.split('@')[1] || '').trim()) + '</b>',
        'what you build, and who for',
        'the industries your work keeps landing in',
      ], 18);
      try { await S.pending.profile; } catch (e) { done(); return fail(e.message); }
      done();
      if (S.qi < S.questions.length) return askQ();
    }
    return recommend();
  }
  const q = S.questions[S.qi], n = S.questions.length;
  const had = answerFor(q.field);
  $('qdots').innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i <= S.qi ? 'on' : ''}"></i>`).join('');
  $('qtext').textContent = q.question;
  $('qhint').textContent = (typeof q.hint === 'function' ? q.hint() : q.hint) ?? '';
  $('qfree').value = '';
  /* Nothing here is single-choice any more: a firm that sells to two regions should be
   * able to say so, and coming back to a question shows what they picked last time. */
  /* Pre-ticks are an opening offer, not an answer: they appear the first time a question
   * is shown and never again, so coming back shows what the visitor picked, not what we
   * guessed. */
  const first = !S.seen.has(q.field);
  S.seen.add(q.field);
  const chosen = new Set(had ? had.split(' · ') : (first && q.preselect ? q.preselect() : []));
  $('qopts').innerHTML = (q.options ?? []).map((o) =>
    `<button class="opt${chosen.has(o) ? ' on' : ''}">${esc(o)}</button>`).join('');
  [...$('qopts').children].forEach((b) => {
    b.onclick = () => b.classList.toggle('on');
  });
  $('qback').hidden = S.qi === 0;
  show('s3');
}

const answerFor = (field) => S.answers.find((a) => a.field === field)?.answer;

function recordAnswer(q, value) {
  S.answers = S.answers.filter((a) => a.field !== q.field);
  if (value) S.answers.push({ field: q.field, question: q.question, answer: value });
}

function nextQ() {
  const q = S.questions[S.qi];
  /* Past the last question there is nothing to record: the screen has already moved on. */
  if (!q) return;
  const picked = [...$('qopts').querySelectorAll('.opt.on')].map((b) => b.textContent.trim());
  const free = $('qfree').value.trim();
  recordAnswer(q, [...picked, free].filter(Boolean).join(' · '));
  S.qi++;
  /* Changing an answer invalidates anything built on the old one. */
  S.cards = []; S.pending = { profile: S.pending.profile };
  askQ();
}

$('qnext').onclick = nextQ;
$('qfree').addEventListener('keydown', (e) => { if (e.key === 'Enter') nextQ(); });
$('qskip').onclick = () => {
  const q = S.questions[S.qi];
  if (!q) return;
  recordAnswer(q, ''); S.qi++; askQ();
};
$('qback').onclick = () => { S.qi = Math.max(0, S.qi - 1); askQ(); };

/* ---------------- 05 explore ---------------- */
async function recommend() {
  show('s4');
  const done = ticker($('tick2'), $('bar2'), [
    'where your clients already trust you',
    'what they are being asked for',
    'what you could deliver without rebuilding',
    'what the first engagement looks like',
    'and the proof to put behind it',
  ], 48);
  try {
    if (S.cards.length) { renderExplorer(); done(); return show('s5'); }   // coming back
    const r = await post('/api/recommend', { id: S.id, profile: S.profile, answers: S.answers });
    done();
    S.cards = r.cards; S.pick = 0; S.picked = [0];
    $('opening').textContent = r.opening ?? '';
    $('s5h').textContent = r.cards.length === 1 ? 'Where you could grow.'
      : `${['One', 'Two', 'Three', 'Four'][r.cards.length - 1]} ways you could grow with Lyzr.`;
    renderExplorer();
    show('s5');
  } catch (e) { done(); fail(e.message); }
}

const KIND = ['Industry play', 'Cross-industry play', 'Capability play', 'Delivery play'];

function renderExplorer() {
  $('optabs').innerHTML = S.cards.map((c, i) => `
    <button class="optab${S.picked.includes(i) ? ' on' : ''}${i === S.pick ? ' open' : ''}" data-i="${i}">
      <em>${esc(KIND[i] ?? 'Play')}</em>
      <strong>${esc(c.headline)}</strong>
      <span class="pickbox"><span class="box">${S.picked.includes(i) ? '✓' : ''}</span>${S.picked.includes(i) ? 'Selected' : 'Add to my brief'}</span>
    </button>`).join('');
  [...$('optabs').children].forEach((el) => {
    const i = +el.dataset.i;
    /* The tile opens the card; the tick decides whether it goes in the brief, so a
     * visitor can read all three and still take two. */
    el.onclick = (e) => {
      if (e.target.closest('.pickbox')) {
        S.picked = S.picked.includes(i) ? S.picked.filter((x) => x !== i) : [...S.picked, i].sort((a, b) => a - b);
      } else {
        S.pick = i;
      }
      renderExplorer();
    };
  });
  renderDetail();
}

function renderDetail() {
  const c = S.cards[S.pick];
  const o = c.first_offer ?? {}, h = c.how_to_sell ?? {}, pr = c.proof ?? {};
  const m = /^([\d.,]+(?:[–-][\d.,]+)?\s*(?:%|x|\+)?)\s+(.{4,})$/i.exec(pr.result ?? '');

  /* Sections only exist when they have something in them: a labelled empty block reads
   * as a feature we shipped half of. */
  const fit = c.fit ?? {};
  const block = (label, body) => (body ? `<div class="block"><em>${esc(label)}</em>${body}</div>` : '');
  const fact = (dt, dd) => (dd ? `<div class="fact"><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>` : '');

  $('detail').innerHTML = `
    <h2>${esc(c.headline)}</h2>
    <p class="fits">${esc(c.why_you)}</p>

    <div class="tabs" id="dtabs">
      <button class="on" data-p="ov">Overview</button>
      <button data-p="fit">Why it fits you</button>
      <button data-p="sell">In the room</button>
      <button data-p="proof">Proof</button>
    </div>

    <div class="pane on" data-p="ov">
      <p class="lede" style="margin-bottom:26px">${esc(c.what_it_is)}</p>
      <div class="offer">
        <em>What you sell first</em>
        <h3>${esc(o.name ?? '')}</h3>
        <p class="shape">${esc(o.shape ?? '')}</p>
        <p>Ends with ${esc(o.ends_with ?? '')}.</p>
      </div>
      <dl class="facts">
        ${fact('Who buys it', c.who_buys)}
        ${fact('Delivery shape', c.delivery)}
        ${fact('Who you need on it', c.team_needed)}
        ${fact('What Lyzr does', up(c.lyzr_role ?? ''))}
        ${fact('Runs on', (c.lyzr_products ?? []).join(' · '))}
      </dl>
    </div>

    <div class="pane" data-p="fit">
      ${block('What it attaches to', fit.attaches_to ? `<p class="lede">${esc(up(fit.attaches_to))}</p>` : '')}
      <dl class="facts">
        ${fact('Why we think so', fit.evidence)}
        ${fact('Where it lands first', up(c.where_it_lands ?? ''))}
      </dl>
      ${block('This line was drafted for firms that', (c.fits_when ?? []).length
        ? `<ul class="checks">${c.fits_when.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '')}
      ${fit.assumption ? `<p class="caveat"><b>Taking on trust:</b> ${esc(fit.assumption)}</p>` : ''}
      ${c.wrong_if ? `<p class="caveat"><b>The wrong line if:</b> ${esc(c.wrong_if.replace(/^(if|when)\s+/i, ''))}</p>` : ''}
    </div>

    <div class="pane" data-p="sell">
      ${c.client_pitch ? `<p class="pull"><span>The line to repeat</span>${esc(c.client_pitch)}</p>` : ''}
      ${block('When to raise it', h.trigger ? `<p class="lede">${esc(up(h.trigger))}</p>` : '')}
      ${block('Ask them', (c.qualify ?? []).length
        ? `<ol class="qlist">${c.qualify.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>` : '')}
      ${block("What they'll say back", (c.objections ?? []).length
        ? c.objections.map((ob) => `<div class="qa"><b>&ldquo;${esc(ob.objection)}&rdquo;</b><p>${esc(ob.answer)}</p></div>`).join('') : '')}
      <dl class="facts">
        ${fact('The first thing to do', up(c.first_step ?? ''))}
        ${fact('Where it goes next', up(h.expansion ?? ''))}
      </dl>
    </div>

    <div class="pane" data-p="proof">
      <p class="proofline">${m ? `<b>${esc(m[1].trim())}</b> ${esc(m[2])}` : esc(pr.result ?? '')}</p>
      <p class="small" style="margin-bottom:8px">${esc(pr.customer ?? '')}</p>
      ${pr.teaser && pr.teaser.toLowerCase() !== `${(pr.customer ?? '').toLowerCase()}: ${(pr.result ?? '').toLowerCase()}`
        ? `<p style="margin-bottom:14px">${esc(pr.teaser)}</p>` : ''}
      ${pr.url ? `<p style="margin-bottom:30px"><a href="${encodeURI(pr.url)}" target="_blank" rel="noopener">${esc(pr.title || 'Read the case study')} &#8599;</a></p>` : ''}

      ${(c.resources ?? []).length ? `
        <h3>What else you can put in front of them</h3>
        <ul class="reslist">
          ${c.resources.map((r) => `<li>
            <em>${esc(r.kind)}</em>
            <a href="${encodeURI(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>
            ${r.blurb ? `<p>${esc(r.blurb)}</p>` : ''}
          </li>`).join('')}
        </ul>` : ''}
    </div>

    <div class="dfoot"><button class="go accent" id="build">Build my brief &rarr;</button></div>`;

  const tabs = $('dtabs');
  [...tabs.children].forEach((b) => {
    b.onclick = () => {
      [...tabs.children].forEach((x) => x.classList.toggle('on', x === b));
      $('detail').querySelectorAll('.pane').forEach((p) => p.classList.toggle('on', p.dataset.p === b.dataset.p));
    };
  });
  /* The card they are reading always counts, ticked or not — having to tick the one on
   * screen before the button means anything is a step nobody expects. */
  $('build').onclick = () => {
    S.picked = [...new Set([...S.picked, S.pick])].sort((a, b) => a - b);
    S.chosen = S.picked.map((i) => S.cards[i]);
    startBrief(S.chosen);
    toAccounts();
  };

  /* Most visitors take the card they are looking at, and writing the brief is the longest
   * wait in the journey. So it starts once they have sat on a card for a moment, and by
   * the time they have typed three client names it is usually done. A brief for a card
   * they end up not choosing is one wasted call; a minute of staring at a progress bar is
   * worse. Cached by card id, so switching tabs and coming back costs nothing. */
  clearTimeout(S.pending.peek);
  S.pending.peek = setTimeout(() => startBrief(S.picked.map((i) => S.cards[i])), 2500);
}

/* One request per card, kept so a second look costs nothing. */
function startBrief(chosen) {
  const picked = (Array.isArray(chosen) ? chosen : [chosen]).filter(Boolean);
  if (!picked.length) return null;
  /* Keyed by the whole selection: adding a second line is a different brief. */
  const key = 'brief:' + picked.map((c) => c.id).join('+');
  if (S.pending[key]) return S.pending[key];
  S.pending[key] = post('/api/assess', {
    id: S.id, profile: S.profile, answers: S.answers, chosen: picked, cards: S.cards,
  });
  /* A failed prefetch must not be cached, or the retry returns the same rejection. */
  S.pending[key].catch(() => { delete S.pending[key]; });
  return S.pending[key];
}

/* ---------------- 06 accounts, before the documents ---------------- */
function acctRow() {
  const d = document.createElement('div');
  d.className = 'acct';
  /* A short label: "How well do you know them?" was wider than any column that leaves
   * room for the name beside it, so it was always cut off mid-word. */
  d.innerHTML = `<input type="text" placeholder="Client name">
    <select aria-label="How well do you know them?">
      <option value="">Relationship…</option>
      <option>Champion inside</option>
      <option>Warm</option>
      <option>Dormant</option>
    </select>`;
  return d;
}
function toAccounts() {
  if (!$('accts').children.length) for (let i = 0; i < 3; i++) $('accts').append(acctRow());
  show('s6');
}
$('addacct').onclick = () => { if ($('accts').children.length < 5) $('accts').append(acctRow()); };
$('acctgo').onclick = () => {
  S.accounts = [...$('accts').children]
    .map((r) => ({ name: r.children[0].value.trim(), strength: r.children[1].value || 'not said' }))
    .filter((a) => a.name);
  finish();
};
$('acctskip').onclick = () => { S.accounts = []; finish(); };

/* ---------------- 08 the brief ---------------- */
async function finish() {
  const brief = startBrief(S.chosen);                 // usually already resolved
  const ranked = S.accounts.length
    ? post('/api/accounts', { id: S.id, profile: S.profile, chosen: S.chosen[0], accounts: S.accounts })
        .then((r) => r.ranked).catch(() => [])
    : Promise.resolve([]);

  show('s7');
  const done = ticker($('tick3'), $('bar3'), [
    'the case for taking this to a client',
    'who sponsors it, and what sets it off',
    S.accounts.length ? 'which of your clients it lands with first' : 'what the first thirty days look like',
    'something you could send this afternoon',
  ], S.accounts.length ? 16 : 10);

  try {
    const [b, lands] = await Promise.all([brief, ranked]);
    done();
    S.brief = b.brief;
    S.brief.where_it_lands = lands;
    $('partnerdoc').innerHTML = partnerSheet();
    show('s8');
  } catch (e) {
    done();
    /* A failed prefetch must not poison the retry. */
    delete S.pending['brief:' + S.chosen.map((c) => c.id).join('+')];
    fail(e.message);
  }
}

/* Their mark beside ours. If Apollo has no logo we set their name instead — a wordmark in
 * type is honest, where a stretched favicon is not. */
function lockup() {
  const name = S.brand?.name || S.profile.company.name || '';
  const theirs = S.brand?.logo
    ? `<img class="theirs" src="${encodeURI(S.brand.logo)}" alt="${esc(name)}" onerror="this.outerHTML='<span class=\'name\'>${esc(name)}</span>'">`
    : `<span class="name">${esc(name)}</span>`;
  return `<span class="lockup">${theirs}<span class="x">&times;</span>
    <img class="mark" src="/brand/lyzr-mark-black.svg" alt="Lyzr"></span>`;
}

function partnerSheet() {
  const b = S.brief, co = S.profile.company.name || '';
  const ic = b.ideal_customer ?? {};
  const lands = b.where_it_lands ?? [];
  const plays = S.chosen ?? [];
  const many = plays.length > 1;

  /* Every chosen line, in full, from the card we already verified — not from a second
   * description written for the brief. This is what makes choosing three worth anything. */
  /* A link that already appeared under an earlier play is not worth repeating. */
  const seenRes = new Set();
  const play = (c, i) => {
    const o = c.first_offer ?? {}, pr = c.proof ?? {};
    const res = (c.resources ?? []).filter((r) => !seenRes.has(r.url) && seenRes.add(r.url));
    const m = /^([\d.,]+(?:[–-][\d.,]+)?\s*(?:%|x|\+)?)\s+(.{4,})$/i.exec(pr.result ?? '');
    return `<article class="play">
      ${many ? `<p class="playnum">Play ${String(i + 1).padStart(2, '0')} of ${plays.length}</p>` : ''}
      <h3>${esc(c.headline)}</h3>
      <p class="sh-body">${esc(c.what_it_is)}</p>
      <p class="playwhy">${esc(c.why_you)}</p>
      <dl class="kv">
        <dt>Who buys it</dt><dd>${esc(c.who_buys)}</dd>
        <dt>Sell first</dt><dd><b>${esc(o.name ?? '')}</b>${o.shape ? ` · ${esc(o.shape)}` : ''}${o.ends_with ? `<br>Ends with ${esc(o.ends_with)}.` : ''}</dd>
        ${c.how_to_sell?.trigger ? `<dt>Raise it when</dt><dd>${esc(up(c.how_to_sell.trigger))}</dd>` : ''}
        ${c.how_to_sell?.expansion ? `<dt>Then</dt><dd>${esc(up(c.how_to_sell.expansion))}</dd>` : ''}
      </dl>
      ${pr.result ? `<p class="playproof">${m ? `<b>${esc(m[1].trim())}</b> ${esc(m[2])}` : esc(pr.result)}
        — ${esc(pr.customer ?? '')}${pr.url ? ` · <a href="${encodeURI(pr.url)}" target="_blank" rel="noopener">${esc(pr.title || 'case study')}</a>` : ''}</p>` : ''}
      ${res.length ? `<div class="reading">
        <p class="readlab">Send with it</p>
        <ul>${res.map((r) => `<li><a href="${encodeURI(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a> <span>${esc(r.kind)}</span></li>`).join('')}</ul>
      </div>` : ''}
    </article>`;
  };

  return `<div class="sheet" id="sheet-partner">
    <header class="sh-top">
      ${lockup()}
      <span class="sh-doclabel"><b>Opportunity brief</b>${esc(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}</span>
    </header>

    <h1 class="sh-head">${esc(b.headline)}</h1>
    <p class="sh-lede">${esc(b.the_case ?? '')}</p>

    <section class="sh-sect">
      <h3>What you already have</h3>
      <div class="pills">${(b.you_today ?? []).map((x) => `<span class="pill">${esc(x)}</span>`).join('')}</div>
    </section>

    <section class="sh-sect">
      <h3>${many ? `The ${['two', 'three', 'four'][plays.length - 2] ?? plays.length} you picked` : 'The play'}</h3>
      ${plays.map(play).join('')}
      ${many && b.how_they_connect ? `<p class="connect">${esc(b.how_they_connect)}</p>` : ''}
    </section>

    <section class="sh-sect">
      <h3>Who to take it to</h3>
      <dl class="kv">
        <dt>Who sponsors it</dt><dd>${esc((ic.roles ?? []).join(' · '))}</dd>
        <dt>Where it lands</dt><dd>${esc((ic.industries ?? []).join(' · '))}</dd>
        <dt>Raise it when</dt><dd>${(ic.triggers ?? []).map(esc).join('<br>')}</dd>
      </dl>
    </section>

    <section class="sh-sect">
      <h3>What to ask them</h3>
      <ul class="qlist" style="margin-bottom:0">${(b.what_to_ask ?? []).map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
    </section>

    ${lands.length ? `<section class="sh-sect">
      <h3>Where it lands first</h3>
      <ol class="lands">${lands.map((l, i) => `<li><span class="r">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(l.account)}</b><span>${esc(l.why)}</span></span></li>`).join('')}</ol>
    </section>` : ''}

    <section class="sh-sect">
      <h3>Your first thirty days</h3>
      <ol class="track">${(b.first_30_days ?? []).map((d) => `<li><em>${esc(d.when)}</em>${esc(d.what)}</li>`).join('')}</ol>
    </section>

    <section class="sh-sect">
      <div class="panel">
        <h3>What Lyzr puts behind it</h3>
        <ul>${(b.how_lyzr_helps ?? []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <p>${esc(b.the_ask)}</p>
      </div>
    </section>

    <div class="sh-foot">
      <span>${esc(co)} &middot; Opportunity brief</span>
      <span class="by">Prepared with <img src="/brand/lyzr-black.svg" alt="Lyzr"></span>
    </div>
  </div>`;
}

/* ---------------- export ---------------- */
/* A PDF, not a saved web page. The document is rendered into a hidden iframe carrying the
 * same stylesheet plus the print rules — A4, real margins, sections that do not split
 * across a page break — and printed. Everything stays live text: selectable, searchable
 * and sharp at any zoom, which a canvas-rasterised PDF is not. The browser's print dialog
 * is where the visitor chooses "Save as PDF". */
function exportPdf(sheetId, title, btn) {
  const sheet = $(sheetId);
  if (!sheet) return;
  const css = [...document.styleSheets]
    .flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } })
    .join('\n');

  const was = btn && btn.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none';
  document.body.append(frame);

  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css}
/* The print rules above are scoped to @media print; the iframe is only ever printed, so
   they are restated unconditionally here for the preview the dialog shows. */
body{background:#fff;margin:0}
.sheet{border:none;border-radius:0;padding:0}
.copy,.tabs{display:none}
</style></head><body>${sheet.outerHTML}</body></html>`);
  doc.close();

  const go = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = was; }
      /* Safari needs the frame to outlive the dialog. */
      setTimeout(() => frame.remove(), 60_000);
    }
  };
  /* Wait for the webfonts and the two logos, or the first page prints in a fallback face
     with the lockup missing. */
  const imgs = [...doc.images].filter((i) => !i.complete);
  const ready = Promise.all([
    doc.fonts?.ready ?? Promise.resolve(),
    ...imgs.map((i) => new Promise((res) => { i.onload = i.onerror = res; })),
  ]);
  Promise.race([ready, new Promise((r) => setTimeout(r, 3000))]).then(() => setTimeout(go, 120));
}

const docTitle = () => `Opportunity brief — ${S.profile.company.name || 'your company'}`;
$('dlpartner').onclick = (e) => exportPdf('sheet-partner', docTitle(), e.currentTarget);

$('talk').onclick = async (e) => {
  e.target.disabled = true; $('talkdone').hidden = false;
  try { await post('/api/contact', { id: S.id }); } catch {}
};
$('xagain').onclick = () => location.reload();

/* Back, everywhere. Nothing is thrown away by stepping back — the cards and the brief are
 * cached, so returning to a screen is instant unless an answer actually changed. */
document.querySelectorAll('[data-back]').forEach((b) => { b.onclick = () => show(b.dataset.back); });
$('exploreback').onclick = () => { S.qi = Math.max(0, S.questions.length - 1); askQ(); };

/* Embedded in the landing page: the hero already took the email, so prefill and start
 * rather than asking twice. */
/* Embedded in the landing page: the form there already took the work email, so prefill and
 * start rather than asking twice. */
const qp = new URLSearchParams(location.search);
if (qp.get('email')) {
  $('email').value = qp.get('email');
  if (qp.get('go') !== '0') setTimeout(() => $('start').click(), 120);
  else $('email').focus();
}
