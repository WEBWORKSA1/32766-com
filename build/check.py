#!/usr/bin/env python3
"""Post-build sanity checks: internal links resolve, every page has the AdSense tag and the top contact bar,
and the private inbox address never appears in plain text. Exits non-zero on failure."""
import glob, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
for f in glob.glob(os.path.join(ROOT, "*.html")):
    s = open(f, encoding="utf-8").read()
    name = os.path.basename(f)
    for h in re.findall(r'href="([\w./-]+\.html)(?:[#?][^"]*)?"', s):
        if not h.startswith("http") and not os.path.exists(os.path.join(ROOT, h)):
            errors.append(f"{name}: broken link {h}")
    if "ca-pub-6620975821265271" not in s:
        errors.append(f"{name}: AdSense tag missing")
    if "Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership" not in s:
        errors.append(f"{name}: top contact bar missing")
    if re.search(r"[\w.+-]+@gmail\.com", s):
        errors.append(f"{name}: plain email address exposed")
print("\n".join(errors) or "All checks passed.")
sys.exit(1 if errors else 0)
