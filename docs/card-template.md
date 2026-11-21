---
# Copy to src/content/concepts/<slug>.md. The file name becomes the URL: /concepts/<slug>/
title: Concept name
claim: One sentence a visitor can check against the demo.
month: 1
order: 7                      # position within the month
status: planned               # planned | in-progress | live
demo:
  type: animation             # plot | animation | video | live
  src: /demos/<slug>.gif      # file in public/demos/, or a URL for a live demo
  alt: What the demo shows, in words
metrics:                      # a live card needs at least 2
  - { label: "Closed-form vs Monte Carlo error", value: "0.3%" }
  - { label: "Samples", value: "10⁶" }
code: https://github.com/divekarrohan/rl-from-scratch/blob/main/...        # required when live
derivation: https://github.com/divekarrohan/physical-ai-log/blob/main/...  # optional
shows: What this demo proves.
limits: What it does not prove.
---

Optional body: a short explanation, rendered under the card.
