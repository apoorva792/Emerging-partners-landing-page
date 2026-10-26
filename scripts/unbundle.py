"""Flattens the Claude Design export's asset bundle into real files.

    python3 scripts/unbundle.py            # rewrites public/index.html in place

The export ships every image, font and script as base64 inside a single JSON line in
`index.html` — 7.5MB of the file's 7.7MB. Nothing paints until the browser has downloaded
all of it, `JSON.parse`d the line, decoded 76 assets into blob URLs and swapped the whole
documentElement; until then the page shows its "Unpacking..." splash.

So we do that work once, here: write the assets to `public/assets/`, point the template's
uuid references at those paths, and emit the template as the page. The boot script, the
splash and the manifest all go away. `index.html` drops to ~180KB and the browser loads
the assets the normal way — in parallel, after first paint, cached between visits.

patch-landing.py calls this as its last step, so a fresh export stays fixed.
"""
import base64, gzip, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")

EXT = {
    "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp",
    "image/svg+xml": ".svg", "image/gif": ".gif", "image/avif": ".avif",
    "font/woff2": ".woff2", "font/woff": ".woff", "font/ttf": ".ttf",
    "text/javascript": ".js", "application/javascript": ".js",
    "text/css": ".css", "application/json": ".json",
}

# Assets the page needs for its first screen. Everything else is told to load lazily, so a
# scroll-down image never competes with the hero for bandwidth.
EAGER_ALT_HINT = "velodrome"


def tag(s, name):
    m = re.search(r'<script type="__bundler/%s"[^>]*>(.*?)</script>' % name, s, re.S)
    return m


def main(path=None):
    path = path or os.path.join(ROOT, "public", "index.html")
    s = io.open(path, encoding="utf-8").read()

    mt, tt = tag(s, "manifest"), tag(s, "template")
    if not mt or not tt:
        sys.exit("no bundle in %s — already unbundled?" % path)

    manifest = json.loads(mt.group(1))
    template = json.loads(tt.group(1))
    ext_el = tag(s, "ext_resources")
    ext_resources = json.loads(ext_el.group(1)) if ext_el else []
    pages_el = tag(s, "page_order")
    pages = json.loads(pages_el.group(1)) if pages_el else []
    if pages:
        sys.exit("export now ships nested page bundles; unbundling them is not implemented")

    # The embed we injected into the outer document has to ride along: the outer document
    # is what we are throwing away. It is rebuilt from its source rather than scraped back
    # out of the page, so only the app URL has to be recovered.
    app = re.search(r"var APP = '([^']+)'", s)
    if not app:
        sys.exit("could not find the agent embed in %s — patch-landing.py runs first" % path)
    embed = io.open(os.path.join(ROOT, "embed", "agent-embed.js"), encoding="utf-8").read()
    embed = embed.replace("__APP__", app.group(1))

    out_dir = os.path.join(os.path.dirname(path), "assets")
    os.makedirs(out_dir, exist_ok=True)
    for stale in os.listdir(out_dir):
        os.remove(os.path.join(out_dir, stale))

    urls, total = {}, 0
    for uuid, entry in manifest.items():
        data = base64.b64decode(entry["data"])
        if entry.get("compressed"):
            data = gzip.decompress(data)
        name = uuid + EXT.get(entry.get("mime", ""), ".bin")
        with open(os.path.join(out_dir, name), "wb") as f:
            f.write(data)
        urls[uuid] = "/assets/" + name
        total += len(data)

    for uuid, url in urls.items():
        template = template.replace(uuid, url)

    # SRI hashes were computed against the CDN copies the export replaced; the bytes are
    # ours now and the attributes only make the browser refuse them.
    template = re.sub(r'\s+integrity="[^"]*"', "", template, flags=re.I)
    template = re.sub(r'\s+crossorigin="[^"]*"', "", template, flags=re.I)

    resource_map = {e["id"]: urls[e["uuid"]] for e in ext_resources if e["uuid"] in urls}
    head = re.search(r"<head[^>]*>", template, re.I)
    if not head:
        sys.exit("template has no <head> to inject into")
    inject = (
        "<script>window.__resources = "
        + json.dumps(resource_map).replace("</", "<\\/")
        + ";</script>\n<script>\n"
        + embed
        + "\n</script>\n"
    )
    i = head.end()
    template = template[:i] + inject + template[i:]

    # Below-the-fold images loaded eagerly would still queue ahead of the hero.
    def lazy(m):
        t = m.group(0)
        if "loading=" in t or EAGER_ALT_HINT in t.lower():
            return t
        return t[:4] + ' loading="lazy" decoding="async"' + t[4:]

    template = re.sub(r"<img\b[^>]*>", lazy, template)

    io.open(path, "w", encoding="utf-8").write(template)
    print("wrote %s (%.0f KB)" % (os.path.realpath(path), os.path.getsize(path) / 1024))
    print("  %d assets -> %s (%.1f MB)" % (len(urls), out_dir, total / 1048576.0))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
