# 32766.com — Phase-wise Build Prompts

Use these prompts in order with any capable AI coding assistant to rebuild, extend or audit the site. Each phase is self-contained. Replace `[OWNER_INBOX]` with the private form inbox — never paste it into page HTML, text or repo docs.

---

## Phase 0 — Strategy lock
> Act as a domain-monetization strategist. The domain is **32766.com** ("327 66"). Research the number's significance in commerce, business, AI, economy and people: Apache Lucene's 32,766-byte maximum term (Elasticsearch/OpenSearch/Solr "immense term" error), 32,767 = 2^15−1 (Excel cell limit, Windows paths, Oracle, Kubernetes NodePort range), AI token windows, maths, and ZIP 32766 (Oviedo/Chuluota, FL). Choose the single most profitable, AdSense-approvable concept. Output: concept, tagline, audience, revenue streams with numbers, the main flaw and how the plan mitigates it, and a sitemap. Avoid trademark use of "32766".

**Locked answer:** "32766 — Limits Lab" — free character/word/byte/token counters + a limits checker against 160 real limits, guides, and a B2B Fit Audit funnel.

## Phase 1 — Benchmark (25+ sites)
> Review at least 25 world-class sites: wordcounter.net, charactercountonline.com, lettercount.com, charactercounter.com, convertcase.net, countwordsfree.com, mothereff.in/byte-counter, Twilio segment calculator, Mangools SERP simulator, Portent/Spotibo SERP previews, tiktokenizer, OpenAI tokenizer, textfixer, wordcounter.io, diffchecker, calculator.net, omnicalculator, Sprout Social, Buffer, Hootsuite, Google Ads Help, Buy Me a Coffee, Gleam, Devpost, Wellfound. For each list tools, stats, settings, sections, forms, CTAs, monetization, trust signals and design traits. Produce a feature matrix and choose what to adopt and what gap to own.

## Phase 2 — Architecture & design system
> Build a static site for GitHub Pages (free plan, `main` branch, root, `.nojekyll`). Use a tiny Python build (`build/build.py`, standard library only) that wraps fragments in `build/pages/*.html` (header comment with title, description, schema, group, scripts, priority, noindex) in one layout and writes HTML to the repo root, plus `assets/js/limits-data.js`, `sitemap.xml`, `robots.txt`, `ads.txt` (`google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`) and `site.webmanifest`. Use relative links only so the site works on both `*.github.io/32766-com/` and the custom domain. The layout must include: the AdSense script `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>` in `<head>`; canonical/OG/Twitter meta; WebSite JSON-LD; a top bar on every page whose link text reads "Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership" linked to https://web.works/contact (the words "web.works" must never be visible); sticky header with logo "32766 Limits Lab" (number underlined by a 99.99%-full amber meter with a red tip), nav, Free Fit Audit CTA, theme toggle and burger; footer with newsletter, link columns and a trademark/copyright disclosure; mobile CTA bar; once-per-session audit nudge; cookie notice. Design: near-black ink, amber #ffb224 accent, fit-green / over-red status colors, Archivo (variable width) + JetBrains Mono, light/dark, reduced-motion and print styles.

## Phase 3 — Limits Library data
> Create `build/limits.py` with ~160 entries `(category, platform, field, value, unit, kind, method, note)` across 8 categories (social, SEO, ads, messaging, data, AI, systems, identity). `kind` = hard / recommended / default. `method` = visible characters (graphemes), UTF-16 units, UTF-8 bytes, X weighted, GSM-aware, tokens, hashtags, or none. Source from official docs (Google Ads Help, platform help centers, RFCs, vendor docs) and cross-check. Mark ~24 "popular" entries. Avoid model-by-model AI tables that go stale; use window tiers.

## Phase 4 — Tools (vanilla JS, in-browser, no uploads)
> In `assets/js/tools.js` implement: analysis core (Intl.Segmenter graphemes/words/sentences, code points, UTF-16, UTF-8 via TextEncoder, emoji, hashtags, X weighted count with 23-char URLs, GSM-7/UCS-2 detection with extension chars, token estimate ±15%, Flesch score); **Fit Checker** with stats grid, 32,766-byte meter, contextual fix CTA, custom limit (by chars/UTF-16/bytes/words/tokens) and a filterable "Where does it fit?" list; pages for character counter, word counter (keyword density), UTF-8 byte counter (per-character breakdown, safe trim), AI token counter (context-window fit with output reserve, cost per call), text splitter (chars/bytes/words/tokens, overlap, 1/n numbering, presets for X, SMS, Lucene, Excel, RAG; TXT/JSONL export), safe truncator, SMS segment counter (culprit highlighting, smart-punctuation fix, cost), SERP pixel preview (canvas Arial 20px/14px, 600/920px), text cleaner/case converter with undo. Session-storage persistence only.

## Phase 5 — Lead generation
> `free-audit.html`: 5-step form (need → details → volume/timeline/budget → about you → contact + consent) with progress bar, auto-advance on the first step, `?need=` prefill, honeypot, trust FAQ and post-submit next step. Contextual CTAs inside tools when a limit is exceeded. `teams.html` services + inquiry form; API/bulk waitlist on `tools.html`; newsletter "The Limit Log" in footer and on the cheat sheet. All forms POST JSON via AJAX to `https://formsubmit.co/ajax/` + the inbox, which exists in JS only as an XOR-encoded reversed char array (`[OWNER_INBOX]` never appears in HTML/text/docs). `data-mail` links build a mailto at click time.

## Phase 6 — Donations, contest, hiring, sponsorship
> `support.html`: one-time/monthly/yearly, themed presets ($3.27, $7.66, $32.77, $100, $327.66, other), purpose (operations, tools, prizes, promotion, hiring), payment-method preference (card link, PayPal, Interac, UPI, bank), supporter circles and wall; payment links sent by email, no card fields. `challenge.html`: monthly "160 Challenge" (exactly 160 characters, grapheme-validated), countdown, judging rubric, entry form; `rules.html`: full skill-contest rules (no purchase necessary, 18+, Canadian skill-testing question, prize ≤ $100 by default). `careers.html`: six roles + application form. `advertise.html`: tool/hub/guide/newsletter/contest sponsorships, standards, media-kit form, domain inquiry link.

## Phase 7 — Content for AdSense approval
> Write original, people-first content: 8 limits hubs (intro, counted-as table, what happens when over, tips, FAQ with FAQPage schema, quick checker), `limits.html` (filterable full table, Dataset schema), printable `cheat-sheet.html`, `the-32766-limit.html` explainer, `guides.html` + guides: fix the immense-term error, characters vs bytes, database column sizing, AI tokens & context windows, Excel 32,767, title/meta length, SMS segments, write to fit. `videos.html` with verified YouTube IDs as click-to-load youtube-nocookie facades. Keep every title ≤ ~600px and description ≤ ~155 characters.

## Phase 8 — Trust & legal
> About, Contact (form + domain inquiry card), Editorial policy, Privacy (AdSense/third-party cookie disclosures, opt-out links, GDPR/PIPEDA/Law 25 rights), Terms, Disclaimer, Cookie policy (storage table), Trademark & copyright disclosure (no claim to 32766/32767; no affiliation with Apache, Elastic, Microsoft, Google, Meta, X, OpenAI, Anthropic, USPS, etc.), 404 with auto `<base>`.

## Phase 9 — QA
> Run headless-browser tests on every page (no JS errors), exercise each tool, submit forms against a mocked relay, check internal links, measure title/description pixel widths, screenshot desktop and mobile, and grep the repo to prove the inbox address never appears.

## Phase 10 — Publish & automate
> Push to `webworksa1/32766-com` on `main`, enable GitHub Pages (branch `main`, path `/`), and add `.github/workflows/refresh.yml`: on pushes to `build/**`/`assets/**`, weekly cron and manual dispatch → run `build/build.py` and `build/check.py`, commit changed output, request a Pages build. Then add the `CNAME` (32766.com) once DNS points at GitHub Pages, verify the domain, submit the sitemap to Search Console and apply for AdSense.

## Phase 11 — Growth backlog
> Exact tokenizers (lazy-loaded), more platforms (Shopify, Amazon listings, App Store), per-limit pages with change history, bulk CSV checker, public Limits API, browser extension, sponsor slots per tool, multilingual UI.
