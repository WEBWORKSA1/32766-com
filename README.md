# 32766.com — Limits Lab

**Will it fit? Stay one byte under the limit.** Free, private, in-browser tools that count characters, words, UTF-8 bytes and AI tokens and check text against 160 real-world limits.

- **Live (GitHub Pages):** https://webworksa1.github.io/32766-com/ · **Domain:** https://32766.com (add `CNAME` once DNS points to GitHub Pages)
- **Stack:** static HTML/CSS/vanilla JS, built by a standard-library Python script. No dependencies, no server.

## Structure
```
build/build.py      # wraps build/pages/*.html in the layout → writes *.html at repo root, sitemap, robots, ads.txt, limits-data.js
build/limits.py     # the Limits Library (single source of truth)
build/check.py      # post-build checks (links, AdSense tag, top bar, no exposed inbox)
build/pages/        # page fragments with a <!-- title/description/... --> header
assets/css, assets/js (main.js site behavior + forms, tools.js all tools), assets/img
.github/workflows/refresh.yml  # rebuild on source changes + weekly auto-refresh + Pages build request
```

## Edit & rebuild
```bash
python3 build/build.py && python3 build/check.py
```
Edit `build/pages/*.html` or `build/limits.py`, never the generated root `*.html`. Pushing changes under `build/` or `assets/` triggers the workflow, which rebuilds and commits the output automatically.

## Monetization
Google AdSense (`ca-pub-6620975821265271`, auto ads via the head tag, `ads.txt` included), Free Fit Audit lead funnel, teams services + API waitlist, sponsorships, donations, monthly 160 Challenge, careers.

See `RESEARCH.md` for the concept research and `BUILD-PROMPTS.md` for phase-wise build prompts.

© 2026 32766.com. "32766" is used as a domain identifier and a reference to a documented numeric limit; no affiliation with any third party is implied.
