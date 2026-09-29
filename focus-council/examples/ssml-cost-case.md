# Dogfood example — choosing a low-cost Arabic TTS architecture

This example records the **summary** of a Focus Council run used to shape the sibling
`local-ssml-voice-cost-optimizer` skill.

## Problem

Improve Arabic TTS quality while minimizing paid synthesis usage. Keep text preparation and
control local, but allow a premium provider such as Narakeet for selected final segments.

## Simulated expert perspectives

1. Arabic NLP engineer — normalization, punctuation, diacritization, proper nouns.
2. Speech/TTS engineer — SSML, prosody, local preview, segmentation.
3. FinOps/API architect — cache, changed-only rendering, metering and provider routing.
4. Product engineer — simple integration and observability.
5. Accessibility reviewer — pronunciation clarity and reproducible output.

## Shortlist

| Candidate | Summary |
|---|---|
| A | Send raw text directly to premium TTS |
| B | Fully local TTS and accept local quality |
| C | Local Arabic prep + W3C SSML IR + local preview + selective premium rendering |

## Neutral jury summary

Candidate C had the strongest balance because it moves repeatable preprocessing, iteration and
most previews off the paid path, while preserving a premium route for final/high-value segments.
A is simplest but pays for every iteration. B minimizes provider cost but may fail quality targets.

## Sensitivity

If zero external spend is the absolute requirement, B becomes the winner.
If fastest possible integration dominates all else, A can win.
Otherwise C is the recommended architecture.

This is not customer research; the jury was simulated for architecture evaluation.
