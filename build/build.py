#!/usr/bin/env python3
"""32766.com static site builder.

Reads page fragments from build/pages/*.html (each starts with a <!-- key: value --> header),
wraps them in the shared layout, expands {{PLACEHOLDERS}}, and writes finished HTML to the repo root.
Also writes assets/js/limits-data.js, sitemap.xml, robots.txt, ads.txt and site.webmanifest.

Usage:  python3 build/build.py            (run from the repo root or anywhere)
No third-party packages required.
"""
import datetime, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "build"))
from limits import LIMITS, CATEGORIES  # noqa: E402

SITE = "https://32766.com"
NAME = "32766 — Limits Lab"
ADSENSE = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>'
TODAY = datetime.date.today().isoformat()
POPULAR = {
    ("X (Twitter)", "Post — free account"), ("Instagram", "Caption"), ("Instagram", "Caption — visible before '… more'"),
    ("Instagram", "Hashtags per post"), ("LinkedIn", "Post"), ("TikTok", "Video caption"), ("YouTube", "Video title"),
    ("YouTube", "Description"), ("Threads", "Post"), ("Bluesky", "Post"), ("Facebook", "Post"),
    ("Search results", "Title tag — character guide"), ("Search results", "Meta description — character guide"),
    ("Google Ads", "Responsive search ad headline"), ("Google Ads", "Responsive search ad description"),
    ("Meta (Facebook & Instagram)", "Ad primary text — recommended"), ("SMS", "Single message — GSM-7"),
    ("Email", "Subject line — recommended"), ("Apache Lucene (Elasticsearch, OpenSearch, Solr)", "Single indexed term"),
    ("Microsoft Excel", "Characters in one cell"), ("Pinterest", "Pin description"), ("Reddit", "Post title"),
    ("Discord", "Message"), ("Context window tier", "128K window"),
}
UNIT_LABEL = {"chars": "characters", "bytes": "bytes", "tokens": "tokens", "px": "pixels"}
METHOD_LABEL = {"g": "visible characters", "u16": "UTF-16 units", "b": "UTF-8 bytes", "x": "X weighted",
                "gsm": "GSM-7 / UCS-2", "tok": "tokens (est.)", "ht": "hashtags", "none": "—"}
KIND_LABEL = {"hard": "Hard limit", "rec": "Recommended", "default": "Default"}

NAV = [
    ("tools.html", "Tools", "tools"), ("limits.html", "Limits Library", "limits"), ("guides.html", "Guides", "guides"),
    ("the-32766-limit.html", "Why 32766", ""), ("videos.html", "Videos", ""), ("challenge.html", "Challenge", "community"),
    ("support.html", "Support", "community"), ("teams.html", "For Teams", "teams"),
]


BASE = """<script>document.write('<base href="'+(location.hostname.slice(-10)==='github.io'?'/'+location.pathname.split('/')[1]+'/':'/')+'">')</script>\n"""


def esc(s):
    return html.escape(str(s), quote=True)


def fmt_num(v):
    return f"{v:,}"


def cat_name(c):
    return next(n for k, n, _ in CATEGORIES if k == c)


def cat_url(c):
    return next(u for k, _, u in CATEGORIES if k == c)


def limits_table(cat=None, compact=False):
    rows = [L for L in LIMITS if cat in (None, "all") or L[0] == cat]
    out = ['<div class="tbl-wrap"><table class="limits-table"><thead><tr>']
    out.append("<th>Platform</th><th>Field</th><th style=\"text-align:right\">Limit</th>")
    if not compact:
        out.append("<th>Type</th><th>Counted as</th><th>Notes</th>")
    if cat in (None, "all"):
        out.append("<th>Category</th>")
    out.append("</tr></thead><tbody>")
    for c, p, f, v, u, k, m, n in rows:
        out.append(f'<tr data-cat="{c}"><td><b>{esc(p)}</b></td><td>{esc(f)}</td><td class="n">{fmt_num(v)} <small>{esc(UNIT_LABEL.get(u, u))}</small></td>')
        if not compact:
            out.append(f"<td>{KIND_LABEL[k]}</td><td><small>{METHOD_LABEL[m]}</small></td><td><small>{esc(n)}</small></td>")
        if cat in (None, "all"):
            out.append(f'<td><a href="{cat_url(c)}">{esc(cat_name(c))}</a></td>')
        out.append("</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


CHECKER = """
<div class="tool" id="checker">
  <div class="tool-head"><span class="t">FIT CHECKER · runs in your browser</span>
    <div class="tool-actions"><button class="btn btn-ghost btn-sm" data-act="paste">Paste</button><button class="btn btn-ghost btn-sm" data-act="sample">Sample</button><button class="btn btn-ghost btn-sm" data-act="copy">Copy</button><button class="btn btn-ghost btn-sm" data-act="clear">Clear</button></div></div>
  <label for="txt" class="sr">Your text</label>
  <textarea id="txt" placeholder="Paste or type your text — caption, title, SMS, prompt, JSON value…" spellcheck="true"></textarea>
  <div class="counts">
    <div><b data-k="chars">0</b><span>Characters</span></div>
    <div><b data-k="words">0</b><span>Words</span></div>
    <div><b data-k="bytes">0</b><span>UTF-8 bytes</span></div>
    <div><b data-k="tokens">0</b><span>AI tokens (est.)</span></div>
    <div><b data-k="noSpace">0</b><span>Chars without spaces</span></div>
    <div><b data-k="sentences">0</b><span>Sentences</span></div>
    <div><b data-k="x">0</b><span>X weighted count</span></div>
    <div><b data-k="readMin">0 sec</b><span>Reading time</span></div>
  </div>
  <div class="big-meter" id="bigMeter" data-limit="32766" data-method="b">
    <div class="row"><span class="num"><span class="used">0</span> / 32,766 bytes</span><span class="muted left">32,766 to spare</span></div>
    <div class="meter"><i></i></div>
    <small class="muted">The 32,766-byte line is Apache Lucene's single-term limit (Elasticsearch, OpenSearch, Solr).</small>
  </div>
  <div class="fixcta" id="fixcta"><b>Over 32,766 bytes?</b> As a keyword value this text would trigger the “immense term” error. <a href="guide-fix-elasticsearch-immense-term.html">See the fix</a> or <a href="free-audit.html?need=search">get a free fix plan</a>.</div>
</div>
"""

LIMIT_LIST = """
<div class="card" id="limitChecker">
  <h3 style="margin-bottom:.2em">Where does it fit?</h3>
  <p class="lc-sum" id="lcSum">Paste text to check it against real limits.</p>
  <div class="lc-controls">
    <label class="sr" for="lcCat">Category</label>
    <select id="lcCat"><option value="pop">Most-checked limits</option><option value="all">All checkable limits</option></select>
    <label class="sr" for="lcSearch">Search limits</label>
    <input type="search" id="lcSearch" placeholder="Search: tiktok, sms, varchar…">
  </div>
  <ul class="lc-list" id="lcList"></ul>
  <p class="muted" style="font-size:.8rem;margin:10px 0 0">Limits reviewed November 2026 · <a href="limits.html">Full Limits Library</a> · Platforms change limits — confirm critical ones in official docs.</p>
</div>
"""


def video(vid, title, note=""):
    n = f'<p class="muted" style="font-size:.86rem;margin:.5rem 0 0">{note}</p>' if note else ""
    return f'<div><div class="vid" data-yt="{vid}"><button type="button" aria-label="Play video: {esc(title)}">{esc(title)}</button></div>{n}</div>'


def expand(body):
    body = body.replace("{{CHECKER}}", CHECKER).replace("{{LIMIT_LIST}}", LIMIT_LIST)
    body = body.replace("{{COUNT_ALL}}", str(len(LIMITS)))
    body = body.replace("{{COUNT_CHECK}}", str(len([L for L in LIMITS if L[6] != "none"])))
    body = re.sub(r"\{\{TABLE:(\w+)(?::(compact))?\}\}", lambda m: limits_table(m.group(1), bool(m.group(2))), body)
    body = re.sub(r"\{\{VIDEO:([\w-]+)\|([^|}]+)(?:\|([^}]*))?\}\}", lambda m: video(m.group(1), m.group(2), m.group(3) or ""), body)
    cards = "".join(
        f'<a class="card" href="{u}"><span class="tag">{len([L for L in LIMITS if L[0]==k])} limits</span><h3>{esc(n)}</h3><span class="go">Open hub →</span></a>'
        for k, n, u in CATEGORIES)
    body = body.replace("{{CATCARDS}}", f'<div class="grid g4">{cards}</div>')
    return body


def layout(meta, body, path):
    title = meta.get("title", NAME)
    desc = meta.get("description", "")
    canon = SITE + "/" + ("" if path == "index.html" else path)
    robots = "noindex,follow" if meta.get("noindex") else "index,follow,max-image-preview:large"
    group = meta.get("group", "")
    scripts = '<script src="assets/js/main.js" defer></script>'
    if "tools" in meta.get("scripts", ""):
        scripts = '<script src="assets/js/limits-data.js" defer></script><script src="assets/js/tools.js" defer></script>' + scripts
    schema = meta.get("schema", "")
    schema_tag = f'<script type="application/ld+json">{schema}</script>\n' if schema else ""
    nav = "".join(f'<li><a href="{h}"{f" data-group={chr(34)}{g}{chr(34)}" if g else ""}>{t}</a></li>' for h, t, g in NAV)
    nudge = "" if meta.get("nonudge") else """<aside class="nudge" id="nudge" aria-label="Free audit offer" hidden><button class="nudge-x" aria-label="Close" data-nudge-close>×</button><b>Hitting a limit you can't see?</b><p>Get a free Fit Audit of your titles, ads, SMS or search index — a human-written fix list, usually within one business day.</p><a class="btn btn-amber btn-sm btn-block" href="free-audit.html">Get my free audit</a></aside>"""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
{BASE if meta.get("base") else ""}<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canon}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#0c0e12">
<meta property="og:type" content="{meta.get('ogtype','website')}">
<meta property="og:site_name" content="{esc(NAME)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
{ADSENSE}
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebSite","name":"{NAME}","url":"{SITE}/","description":"Free tools that check whether your text fits: characters, words, UTF-8 bytes and AI tokens against real platform, SEO, SMS, database and AI limits."}}</script>
{schema_tag}</head>
<body data-group="{group}">
<a class="skip" href="#main">Skip to content</a>
<div class="topbar" role="note"><a href="https://web.works/contact" target="_blank" rel="noopener">Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership</a></div>
<header class="site"><div class="wrap nav">
<a class="logo" href="index.html" aria-label="32766 Limits Lab home"><span class="num">32766</span><span class="lname">Limits Lab</span></a>
<nav aria-label="Main"><ul class="menu" id="menu">{nav}<li class="menu-cta"><a href="free-audit.html">Free Fit Audit</a></li></ul></nav>
<div class="nav-cta"><a class="btn btn-amber btn-sm" href="free-audit.html">Free Fit Audit</a>
<button class="icon-btn" id="themeBtn" aria-label="Toggle light/dark theme">◐</button>
<button class="icon-btn burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu">☰</button></div>
</div></header>
<main id="main">
{body}
</main>
<footer class="site"><div class="wrap">
<div class="foot-grid">
<div><a class="logo" href="index.html"><span class="num">32766</span><span class="lname">Limits Lab</span></a>
<p class="muted" style="margin-top:12px">Free, private, in-browser tools that tell you whether your text fits — characters, words, bytes and AI tokens checked against {len(LIMITS)} real-world limits. Stay one byte under the limit.</p>
<form class="js-form inline-form" data-subject="Newsletter: The Limit Log" data-ok="You're in. The Limit Log arrives when platforms change their limits — no spam.">
<input type="email" name="email" required placeholder="you@email.com" aria-label="Email for The Limit Log newsletter"><input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
<input type="hidden" name="list" value="The Limit Log"><button class="btn btn-amber btn-sm" type="submit">Get The Limit Log</button><div class="form-msg" role="status"></div></form></div>
<div><h4>Tools</h4><ul><li><a href="character-counter.html">Character counter</a></li><li><a href="word-counter.html">Word counter</a></li><li><a href="byte-counter.html">UTF-8 byte counter</a></li><li><a href="token-counter.html">AI token counter</a></li><li><a href="text-splitter.html">Text splitter</a></li><li><a href="truncate-text.html">Truncate text</a></li><li><a href="sms-counter.html">SMS counter</a></li><li><a href="serp-preview.html">SERP preview</a></li><li><a href="text-cleaner.html">Text cleaner</a></li></ul></div>
<div><h4>Limits</h4><ul><li><a href="limits.html">Limits Library</a></li>{''.join(f'<li><a href="{u}">{esc(n)}</a></li>' for _, n, u in CATEGORIES)}<li><a href="cheat-sheet.html">Printable cheat sheet</a></li></ul></div>
<div><h4>Learn &amp; join</h4><ul><li><a href="guides.html">All guides</a></li><li><a href="the-32766-limit.html">Why 32766?</a></li><li><a href="videos.html">Videos</a></li><li><a href="challenge.html">160 Challenge</a></li><li><a href="support.html">Support the lab</a></li><li><a href="careers.html">Careers &amp; talent</a></li><li><a href="advertise.html">Advertise &amp; sponsor</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="teams.html">For teams</a></li><li><a href="free-audit.html">Free Fit Audit</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="editorial-policy.html">Editorial policy</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li><li><a href="cookies.html">Cookies</a></li><li><a href="disclaimer.html">Disclaimer</a></li><li><a href="trademark.html">Trademark &amp; ©</a></li></ul></div>
</div>
<div class="legal">
<p><b>Trademark &amp; copyright disclosure:</b> “32766” is used on this site only as a domain-name identifier and as a reference to a widely documented numeric limit (read “327 66”). No claim of exclusive rights is made to the number 32766 or 32767, and this site is not affiliated with, endorsed by or sponsored by the Apache Software Foundation, Elastic, OpenSearch, Microsoft, Google, Meta, X, LinkedIn, TikTok, OpenAI, Anthropic, the U.S. Postal Service or any company, product, place or person that uses these numbers. All product names, logos and trademarks belong to their respective owners and are used for identification only. <a href="trademark.html">Full disclosure</a>.</p>
<p>Informational tools and content — limits are reviewed regularly but platforms change them; confirm critical limits in official documentation. Some pages show advertising served by Google AdSense. © <span class="year">2026</span> 32766.com. Original text, tools, data compilation and design © 32766.com.</p>
</div></div></footer>
<div class="mcta"><a class="btn btn-ghost" href="tools.html">Tools</a><a class="btn btn-amber" href="free-audit.html">Free audit</a></div>
{nudge}
<div class="cookie" id="cookie" role="dialog" aria-label="Cookie notice"><p style="margin:0">We use essential storage and, with your consent, cookies from Google to show and measure ads. Your text never leaves your browser. See our <a href="cookies.html">Cookie Policy</a>.</p>
<div class="acts"><button class="btn btn-amber btn-sm" data-cookie="all">Accept</button><button class="btn btn-ghost btn-sm" data-cookie="essential">Essential only</button></div></div>
{scripts}
</body></html>
"""


def parse(path):
    raw = open(path, encoding="utf-8").read()
    m = re.match(r"\s*<!--(.*?)-->\s*", raw, re.S)
    meta = {}
    if m:
        for line in m.group(1).strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        raw = raw[m.end():]
    return meta, raw


def main():
    pages_dir = os.path.join(ROOT, "build", "pages")
    built = []
    for fn in sorted(os.listdir(pages_dir)):
        if not fn.endswith(".html"):
            continue
        meta, body = parse(os.path.join(pages_dir, fn))
        out = layout(meta, expand(body), fn)
        with open(os.path.join(ROOT, fn), "w", encoding="utf-8") as f:
            f.write(out)
        built.append((fn, meta))

    # limits data for the browser
    data = [{"c": c, "p": p, "f": f, "v": v, "u": u, "k": k, "m": m, "n": n, **({"pop": 1} if (p, f) in POPULAR else {})}
            for c, p, f, v, u, k, m, n in LIMITS]
    with open(os.path.join(ROOT, "assets", "js", "limits-data.js"), "w", encoding="utf-8") as f:
        f.write("/* 32766.com Limits Library — generated by build/build.py; edit build/limits.py instead. */\n")
        f.write("window.LIMITS=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
        f.write("window.LIMIT_CATS=" + json.dumps([[k, n, u] for k, n, u in CATEGORIES], ensure_ascii=False) + ";\n")
        f.write(f'window.LIMITS_REVIEWED="{TODAY}";\n')

    # sitemap
    urls = []
    for fn, meta in built:
        if meta.get("noindex") or fn == "404.html":
            continue
        loc = SITE + "/" + ("" if fn == "index.html" else fn)
        pr = meta.get("priority", "0.6")
        urls.append(f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n")
    with open(os.path.join(ROOT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\nDisallow: /build/\n\nUser-agent: Mediapartners-Google\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    with open(os.path.join(ROOT, "ads.txt"), "w") as f:
        f.write("google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0\n")
    with open(os.path.join(ROOT, "site.webmanifest"), "w") as f:
        json.dump({"name": NAME, "short_name": "32766", "start_url": "./index.html", "display": "standalone",
                   "background_color": "#0c0e12", "theme_color": "#0c0e12",
                   "icons": [{"src": "assets/img/favicon.svg", "sizes": "any", "type": "image/svg+xml"},
                             {"src": "assets/img/icon-512.png", "sizes": "512x512", "type": "image/png"}]}, f, indent=1)
    open(os.path.join(ROOT, ".nojekyll"), "w").close()
    print(f"Built {len(built)} pages, {len(LIMITS)} limits, sitemap with {len(urls)} URLs ({TODAY}).")


if __name__ == "__main__":
    main()
