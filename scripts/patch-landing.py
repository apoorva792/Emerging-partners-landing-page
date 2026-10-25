"""Wires the Emerging Partners landing page to the real Partner Opportunity Agent.

    python3 scripts/patch-landing.py "~/Downloads/Lyzr Emerging Partners (3).html" https://<app>

The page is a Claude Design export. Two things about it shape this patch:

  * its bundler replaces the whole documentElement once it boots, so anything injected into
    the page's markup is discarded — the embed has to live on `window` and re-bind itself;
  * it already ships a *simulated* partner journey behind the hero form, which is exactly
    what we are replacing.

So the embed goes in as a real <script> in the outer document's <head>, sourced from
embed/agent-embed.js (kept as a normal file so it is lint-able and testable, rather than a
string inside a string). The original export is never modified; output lands in landing/.
"""
import sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")

src = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/Downloads/Lyzr Emerging Partners (3).html")
app = (sys.argv[2] if len(sys.argv) > 2 else "/agent.html").rstrip("/") or "/agent.html"
out = os.path.join(ROOT, "public", "index.html")

embed = open(os.path.join(ROOT, "embed", "agent-embed.js"), encoding="utf-8").read()
if "__APP__" not in embed:
    sys.exit("embed/agent-embed.js no longer has the __APP__ placeholder")
embed = embed.replace("__APP__", app)
if "</script" in embed:
    sys.exit("embed script contains a closing script tag and cannot be inlined")

# The export ships a *simulated* opportunity journey and a programme pitch built around a
# dollar figure. The embed replaces the behaviour; data/landing-copy.json replaces the
# words, as find/replace pairs against the escaped page string so they can be read and
# edited without touching this script.
import json
REWRITES = [(r["find"], r["replace"]) for r in
            json.load(open(os.path.join(ROOT, "data", "landing-copy.json"), encoding="utf-8"))]

s = open(src, encoding="utf-8").read()

for find, repl in REWRITES:
    if find not in s:
        sys.exit("landing copy changed upstream, this no longer matches:\n  " + find[:160])
    s = s.replace(find, repl)

# The deck upload is removed outright: there is nothing behind it. The row is matched by
# its own literal start and end rather than by counting tags backwards — an index walked
# from the label landed outside the row and spliced the document into itself.
_row_start = '<div style=\\"display:flex;align-items:center;gap:14px;flex-wrap:wrap\\">'
_row_end = '{{ fileLabel }}<\\u002Fspan>'
_a = s.find(_row_start)
_b = s.find(_row_end, _a)
if _a == -1 or _b == -1:
    sys.exit("could not find the deck upload row")
_b = s.find('<\\u002Fdiv>', _b)
if _b == -1:
    sys.exit("deck upload row is not closed where expected")
_b += len('<\\u002Fdiv>')
if not 0 < _b - _a < 1500:
    sys.exit("deck upload row looks wrong: %d characters" % (_b - _a))
_before = len(s)
s = s[:_a] + s[_b:]
assert len(s) < _before, "removing the deck row did not shrink the page"

# The closing line went with the deck row's promise: it is a rule-off and a sentence that
# says nothing the page has not already said.
_h = s.find('<p id=\\"site-help\\"')
if _h == -1:
    sys.exit("could not find the closing helper line")
_hend = s.find('<\\u002Fp>', _h)
if _hend == -1 or _hend - _h > 500:
    sys.exit("closing helper line is not shaped as expected")
_hend += len('<\\u002Fp>')
_before = len(s)
s = s[:_h] + s[_hend:]
assert len(s) < _before, "removing the closing line did not shrink the page"

if "lpa-ov" in s:
    sys.exit("already patched — start from the clean export")

anchor = "</head>"
i = s.find(anchor)
if i == -1:
    sys.exit("could not find the outer document's </head>")

s = s[:i] + "<script>\n" + embed + "\n</script>\n" + s[i:]
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w", encoding="utf-8").write(s)

print("wrote " + os.path.realpath(out))
print("  the landing page is the site index; the agent lives at " + app)
print("  original untouched: " + src)
