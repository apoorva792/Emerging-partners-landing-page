# Partner Opportunity Agent

A partner-strategy consultant for the Lyzr Emerging Partner Program. A services founder
gives a work email and a company website; two minutes later they have a **Partner
Opportunity Assessment** naming two or three AI service lines they could sell to the
clients they already have, with a Lyzr case study behind each one.

The rule the whole thing is built around: **the visitor gets something useful before they
are asked for anything.** Recommendations come at step 3; strategic accounts at step 5.

---

## Run it

```bash
cd ~/partner-opportunity-agent
npm start                       # http://localhost:3000 (scripts/dev-server.js)
```

No install step — no dependencies. Node 20+.

Other things you can run:

```bash
node scripts/try.js goml.io brainlabsdigital.com     # profile any companies, no browser
node scripts/run.js goml.io                          # the whole journey end to end in the terminal
node scripts/build-catalog.js                           # re-read the customer stories
node scripts/studio-setup.js                         # push KB + prompt changes to Studio
node scripts/studio-setup.js --only=agents           # just the prompts (after editing studio/*.md)
node scripts/fixtures.js goml.io                     # one real run, saved to runs/fixtures/
node scripts/preview.js                              # then /_preview.html?to=validate|focus|explore|accounts|brief|client
```

`scripts/fixtures.js` + `scripts/preview.js` render any finished screen from a saved run,
so the design can be checked without burning two minutes of live calls each time.

`.env` holds `LYZR_API_KEY` and `APOLLO_API_KEY`. It is gitignored.

## The journey

| Stage | What the visitor sees | What runs |
|---|---|---|
| 01 **Discover** | Work email + website | business-email check |
| 02 **Focus** | **The first question, immediately** — no profile screen, no progress bar. Two fixed questions (where they want to grow, where their clients are), then at most one adaptive | crawl ∥ Apollo ∥ `partner_profiler`, **in the background while they answer** |
| 03 **Explore** | 2–3 selectable cards: Overview / How to sell it / Proof, with related resources from our own catalog | `partner_opportunity` |
| 04 **Unlock** | "Have customers in mind?" | `partner_accounts`, beside the brief |
| 04 | The opportunity brief, downloadable as a PDF, closing on an offer to bring Lyzr in | `partner_assessment`, **started while they were still on the explorer** |

## Nothing is generated while the visitor watches

| | was | now |
|---|---|---|
| Profile (~20s) | a progress bar | runs while they answer the first two questions |
| Cards | 43s | **27s** — a cheap Haiku shortlist picks three entries, then one writer per entry runs **in parallel**, so wall time is one card rather than three |
| Brief (~30s) | a bar after the account step | starts 2.5s after the explorer renders, keyed by the selection and cached |

Writing three cards in one call was the longest wait in the journey. `partner_shortlist`
picks the entries and the angle for each; `partner_opportunity` is now a **single-card
writer** run once per pick. One card failing no longer fails the step — the others stand.
Dropping `proof` and `first_offer` from its schema took another 7s off, because the code
attaches both from our own files and the model emitting them was pure waste.

**There is no profile screen.** It told the visitor what they already knew and cost twenty
seconds to say it. Two fixed questions are asked instead, the moment the email is in, since
neither needs the profile: where they want to grow, and **where their clients are based**
(data residency and regulation change what can be proposed). Both are **multi-select** — a
firm selling into two regions should be able to say so. The profiler contributes at most
one more question, and only when it could not establish something that changes the answer.

**They can select more than one opportunity.** The tile opens a card; the tick decides
whether it goes in the brief. The first selected line leads the brief; the rest appear
under *Also on your list*, each keeping its own real opening offer.

**Back works everywhere.** Nothing is discarded by stepping back — cards and briefs are
cached, so returning is instant unless an answer actually changed, in which case the cache
is dropped and the work is redone.

## How it is put together

**Orchestration is a state machine in `lib/journey.js`, not a conversation.** Three LLM calls
at three fixed points, each with one job and a strict JSON schema. That *guarantees* value
lands before qualification and consent precedes the account question, rather than hoping a
prompt holds across a long chat.

```
lib/crawl.js      home page + the pages that say what a services firm sells
lib/apollo.js     org enrich by domain, person match by email (never reveals email/phone)
lib/profile.js    crawl ∥ apollo → partner_profiler → profile
lib/catalog.js    what Lyzr has delivered, scored against the profile in code
data/catalog.json 62 customer stories, read off their own pages by scripts/build-catalog.js
data/patterns.json 6 engagement shapes: the first offer, the durations, the team
data/products.json what a partner builds on, and the agents they can demo
lib/knowledge.js  retrieval against the partner_program KB
lib/journey.js    the three steps
api/*.js          one endpoint per step (Vercel functions; server.js serves them locally)
public/index.html the whole UI, one file, no framework
runs/<id>.json    the run record, including the internal note
```

### Guardrails that are code, not prompt

Some rules were asked for politely and broken anyway, so they are enforced in `lib/`:

- **Company size never reaches the copy.** It is not a criterion. The model wrote "you have
  220 people" regardless, so `employees` is stripped from the profile before the
  opportunity and assessment agents ever see it (`withoutSize`).
- **Role addresses are not people.** Apollo cheerfully matched `hello@brainlabsdigital.com`
  to the founder, which would have the agent greeting a junior marketer by the CEO's first
  name. `isRoleAddress` blocks the person lookup for `hello@`, `info@`, `sales@` and friends.
- **Proof is overwritten from `data/proof.json`**, so a mis-copied case-study URL can never
  reach a visitor.
- **"Passed over" can't name a card we showed** — checked and dropped if it collides.
- **The internal note never leaves the server.** `api/assess.js` returns the two briefs and withholds `internal`.

### Honest sourcing

Every profile field is tagged `site`, `apollo` or `inferred`, and `evidence.source_quality`
is `site+apollo`, `site-only` or `apollo-only`. Sites behind a JS challenge (Sucuri,
Cloudflare — `saksoft.com` is one) simply can't be read; we don't try to defeat them. Apollo
carries those, and the profile says so rather than pretending.

## The brief

The visitor leaves with a partner opportunity brief: how to sell it, who sponsors it, what
to send, where it lands first, and the first thirty days. It exports as a **PDF, not a saved
web page** — rendered into a hidden iframe with the same stylesheet plus print rules (A4,
14mm margins, headings that never strand, the navy panel forced to print its background)
and printed, so everything stays live text rather than a canvas raster. `exportPdf()` waits
on `document.fonts.ready` and the logos first, or page one prints in a fallback face with
the lockup missing.

**The lockup** is the partner's mark, a cross, then ours. Their logo comes from Apollo's
`logo_url`, carried beside the profile rather than through the model, and falls back to
their name set in type. The guidelines put the symbol's minimum at 24px with clear space of
one lockup height, so the header uses the 26px symbol with 26px of air.

**Proof is more than a number.** The tab carries the result, the customer, the case study
teaser, a link, and two or three related resources — guides, playbooks, product pages —
chosen from `data/resources.json` by topic overlap in `lib/resources.js`, never by asking a
model which links sound relevant. After the first pick it stops choosing case studies and
goes looking for other kinds, because three case studies in a row is a reading list rather
than a sales kit.

**The client-facing one-pager was removed** on 2026-10-25. `studio/client-brief-prompt.md`
is still on disk if it is ever wanted back; it is no longer in `AGENTS` or the flow.

## Knowledge

| | What | Where |
|---|---|---|
| `partner_program` | the $5k package, eligibility, guardrails, FAQ | `kb/program/` |

Opportunities are **not** retrieved from a knowledge base and not chosen from a written
list. `data/catalog.json` holds what Lyzr has actually delivered, 62 customer stories read
off their own pages by `scripts/build-catalog.js`. `lib/catalog.js` scores them against the
profile in code, and `partner_discovery` proposes the lines, each citing the stories it
stands on. Rebuild the catalog with `node scripts/build-catalog.js` whenever
`data/resources.json` gains customer stories.

This replaced sixteen hand-written service lines filtered by five archetypes, on
2026-10-27. Sixteen was the quality ceiling: every IT consultancy chose from the same six,
so two firms that looked nothing alike got near-identical cards.

The catalog and the patterns carry no commercials. Deal sizes, margins and day rates are deliberately
absent from the entries and the agent is told never to put a number on the money — we do
not publish those figures, and a guessed one in a partner's hands is worse than silence.
`kb/program/_OPEN-QUESTIONS.md` holds the five commercial questions the agent currently
deflects to the partner team.

## The landing page

```bash
python3 scripts/patch-landing.py "~/Downloads/Lyzr Emerging Partners (3).html" https://<deployed-url>
```

Writes `landing/Lyzr Emerging Partners — with agent.html`; the original is never touched.

Two things about that export shape how this works, and both cost me a wrong attempt:

- **Its bundler replaces the whole `documentElement`** once it boots, so anything injected
  into the page's markup is thrown away. The embed therefore lives on `window`, polls for
  the hero form, and re-binds whenever the form reappears.
- **The export already ships a *simulated* partner journey** behind that hero form. The
  embed binds `submit` and `click` on the form in the capture phase, so the simulation
  never runs and the real agent opens instead — carrying the email over so nobody types it
  twice.

The embed is `embed/agent-embed.js`, kept as a normal file (`node --check`-able) rather than
a string inside a string; the patcher inlines it into the outer `<head>` with the app URL
substituted.

Verify a patch rendered and the overlay actually fires before trusting it — copy the output
into `public/`, serve it, and open it. The failure mode is silent: the overlay markup can be
present while the script never ran.

To preview the finished screens without a live run: `node scripts/fixtures.js`, then
`node scripts/preview.js`, then `/_preview.html?to=validate` (or `focus`, `explore`,
`accounts`, `brief`, `client`). Adding `&print=1` strips the page to the document alone —
exactly what the PDF export puts in its iframe — so the printed result can be checked with
`chrome --headless --print-to-pdf`.

## Deploying

Vercel, project root here. `public/` is served statically and `api/*.js` become functions.

**Environment variables** (Project → Settings → Environment Variables, all three environments):

| | Required | What it is |
|---|---|---|
| `LYZR_API_KEY` | yes | Agent Studio key. Every agent call uses it; without it nothing runs. |
| `APOLLO_API_KEY` | no, but | Company enrichment, the partner's logo on the brief, and the only source that works when a site sits behind a WAF. Without it the agent still runs from the crawl alone. |

There is no build step and no dependency install — Node 20+, no `node_modules`.

**The dev server lives in `scripts/`, not the repo root, and has to stay there.** Vercel's
CLI treats a root `server.js` as the application entrypoint and deploys the whole project
as a long-running Node server. The build still succeeds, which is what makes it nasty: it
silently bypasses the `functions` block in `vercel.json`, so `maxDuration` falls back to
the platform default of about ten seconds while the real calls take twenty to thirty, and
`public/` is served by the dev server's own file handler instead of the CDN.

Three things in `vercel.json` and the code exist because of how serverless differs from a
laptop, and all three were found by reading rather than by a failed deploy:

- **`maxDuration` is 60**, not 120. Hobby caps at 60s; the longest call is ~27s, so this is
  comfortable. On Pro it can go higher but does not need to.
- **The functions glob is `api/[!_]*.js`, not `api/*.js`.** `api/_handler.js` is shared
  helpers with no default export. Vercel skips `_`-prefixed files by convention, but an
  explicit `functions` glob that matches one forces it to be built as an endpoint, and the
  build fails.
- **`includeFiles: "{kb,data,studio}/**"`.** The playbook, the proof table, the resource
  catalog and `studio/ids.json` are read from disk at runtime. Vercel traces `import`s, not
  `fs.readFileSync` of a path it computes, so without this they are not uploaded and every
  request fails on a missing file.
- **`lib/env.js` prefers `process.env`** and treats a missing `.env` as empty. Reading the
  file unconditionally threw at *import* time, which took every endpoint down before it ran
  a line of its own.
- **Run records go to the temp directory on Vercel** and failures there are swallowed. The
  filesystem is read-only apart from `/tmp` and does not survive the request, so the record
  is a local convenience and never a reason to fail a visitor.

**The landing page is the site index.** `public/index.html` is the Emerging Partners page
with the agent embedded; the agent itself is `public/agent.html`, also reachable at
`/agent`. The embed opens `/agent.html` — a path on the same origin, not an absolute URL —
so moving the site to another domain needs no re-patch.

`public/index.html` is generated from a Claude Design export that is **not** in the repo.
To regenerate it: `python3 scripts/patch-landing.py "<export>.html"`. The copy rewrites
live in `data/landing-copy.json` and the patch fails loudly if any of them stops matching.


## Out of scope for the POC

No HubSpot, no owner routing, no calendar. "Talk to the partner team" sets a flag on the run
record and says so honestly; the page never implies a meeting is booked. `runs/<id>.json` is
the shape the CRM write will take when it's built.
