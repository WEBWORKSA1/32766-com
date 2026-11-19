# 32766.com — Research & Concept Decision

_Compiled November 19, 2026._

## 1. What "32766" means

| Domain | Meaning | Commercial relevance |
|---|---|---|
| **Software / search** | **32,766 bytes** is Apache Lucene's maximum single-term length, inherited by Elasticsearch, OpenSearch and Solr. Errors: "Document contains at least one immense term … longer than the max length 32766" / "bytes can be at most 32766 in length". Lucene writes terms into 32,768-byte blocks with a ≤2-byte length prefix → 32,766. | High. Recurring, painful developer error; B2B audience with real budgets. |
| **Computing neighbor** | **32,767 = 2^15 − 1** (signed 16-bit max): Excel's characters-per-cell limit, Windows extended path / command line, Oracle extended VARCHAR2 & PL/SQL, top of Kubernetes' default NodePort range (30000–32767). | High. Excel limit is a mass-market search topic. |
| **AI** | Context windows are measured in tokens (32K = 32,768 tokens tier). Token/limit tooling is a fast-growing search category. | High, growing. |
| **Maths** | 32,766 = 2 × 3 × 43 × 127; 0x7FFE; binary 111111111111110; abundant number with 16 divisors. | Low (curiosity content). |
| **Place / people** | ZIP 32766 = Oviedo (alias Chuluota), Seminole County, FL — ~16K people, median household income ≈ $146K (ACS 2023). | Low ceiling: tiny population. |
| **Commerce / trademarks** | No dominant brand uses "32766". Low conflict risk if used descriptively. | Positive. |

## 2. Market evidence for the chosen niche (text limits & counters)

- wordcounter.net: ~11–12M visits/month, ~22-minute average session (Semrush, late 2025).
- "character counter" ≈ 201K US searches/month; "word counter" ≈ 1M; "character count" up to ~1M globally (Semrush keyword panels).
- **Flaw:** counter keywords have very low CPC (~$0.07–$0.18). A pure counter site earns on volume only.
- **Counter-strategy:** pair mass-market counters with high-intent developer/marketing pages (bytes, Lucene, databases, AI tokens, SEO snippets, ads, SMS cost) and a **lead-gen funnel to paid services** (audits → implementation), plus an API waitlist.

## 3. Competitive audit (25+ sites reviewed)

Fetched directly: wordcounter.net, charactercountonline.com, lettercount.com, charactercounter.com, convertcase.net, countwordsfree.com, mothereff.in/byte-counter, Twilio message-segment calculator, Mangools SERP simulator, tiktokenizer, textfixer.com, wordcounter.io, diffchecker.com, calculator.net, omnicalculator.com, buymeacoffee.com, gleam.io, devpost.com, wellfound.com.
Reviewed via search-indexed pages: Sprout Social character counter & guides, Buffer character-limit help + API docs, Hootsuite caption preview & post-length cheat sheet, Google Ads Help (RSA limits), multiple SERP pixel-width tools (Spotibo, SEO Worth, TripleDart, Bushe), AI-model context comparisons.

**Patterns adopted**
- Live stats grid (chars, words, sentences, reading/speaking time, density) — wordcounter.net, charactercounter.com.
- Platform-limit comparisons beside the counter — lettercount, charactercounter, Hootsuite.
- Byte vs character explanation — mothereff.in.
- Encoding + segment + culprit-character view — Twilio.
- Pixel-width SERP preview with desktop/mobile — Mangools, Spotibo.
- Tool categories + editorial policy for trust — Omni Calculator, calculator.net.
- Freemium / API upsell and lead capture — Diffchecker, Mangools.
- Preset amounts, memberships, supporter wall — Buy Me a Coffee.
- Contest mechanics: rules, verified entries, judging — Gleam, Devpost.
- Job cards with role tags + direct application — Wellfound.

**Gaps we exploit:** no competitor combines grapheme / UTF-16 / UTF-8 / weighted / GSM / token counting in one checker against a curated multi-category limits database; almost none cover developer byte limits; few have a real B2B funnel.

## 4. Decision

**"32766 — Limits Lab": Will it fit? Stay one byte under the limit.**
Free, private, in-browser toolkit (9 tools) + 160-entry Limits Library (8 hubs) + guides + videos, monetized by AdSense, a Free Fit Audit lead funnel (SEO, ads, social, SMS/email, search/data, AI), bulk/API waitlist, sponsorships, donations, a monthly 160-character writing contest and a talent pipeline.
