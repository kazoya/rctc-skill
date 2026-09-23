---
name: local-ssml-voice-cost-optimizer
description: >
  Local-first Arabic text-to-speech quality and cost optimization. Use when building Arabic TTS,
  SSML, voice-over, Narakeet or another premium-provider workflow where preprocessing, punctuation,
  context, optional diacritization, segmentation, preview, caching and W3C SSML should happen
  locally so paid synthesis is reserved for final/high-value segments. Provider-neutral; never
  claim external API usage is free when it is not.
---

# Local SSML Voice Cost Optimizer

**Invoke:** `/local-ssml-voice-cost-optimizer`

Goal:

> DO EXPENSIVE THINKING LOCALLY. PAY ONLY FOR THE AUDIO THAT NEEDS PREMIUM RENDERING.

Use W3C SSML as a **local intermediate representation (IR)**. Do not assume every provider accepts
the full SSML standard; compile/adapt the IR to the provider's supported controls.

## Pipeline

```text
RAW ARABIC
   ↓
NORMALIZE
   ↓
CONTEXT + PUNCTUATION
   ↓
OPTIONAL DIACRITIZATION + PRONUNCIATION LEXICON
   ↓
W3C SSML IR
   ↓
LOCAL PREVIEW
   ↓
QUALITY / CHANGE GATE
   ↓
HASH CACHE + DEDUPE
   ↓
PROVIDER ADAPTER (optional)
   ↓
PREMIUM RENDER ONLY WHERE NEEDED
   ↓
STITCH + LISTEN + RECORD COST
```

## 1. Normalize locally

Before synthesis:
- Unicode normalization
- normalize whitespace and repeated punctuation
- Arabic/Latin punctuation consistency
- normalize numbers/abbreviations according to intended reading
- preserve intentional user diacritics
- maintain a project pronunciation lexicon for names, brands, acronyms and foreign terms

Do not silently rewrite meaning.

## 2. Restore speaking structure

For unpunctuated or machine-generated Arabic, infer:
- sentence boundaries
- comma-level micro-pauses
- question/exclamation intent
- paragraph breaks
- quotation/dialogue boundaries

Prefer a local LLM when available. Keep both original and prepared text for audit/diff.

## 3. Diacritization

Treat automatic tashkeel as a candidate, not truth.

Preferred options:
- CAMeL Tools `camel_diac` / morphology data when appropriate
- PyArabic for normalization and harakat utilities
- project lexicon for ambiguous names/terms
- manual override for high-value or ambiguous phrases

Never overwrite a verified pronunciation with a weaker automatic guess.

## 4. Compile to a W3C SSML subset

Recommended local subset:
- `<speak>`
- `<p>`, `<s>`
- `<break time="">`
- `<prosody rate="" pitch="" volume="">`
- `<emphasis>`
- `<say-as>`
- `<sub alias="">`
- `<voice>`

Use `tools/ssml_compiler.py` to convert SSML into provider-neutral segment JSON.

## 5. Preview locally first

Render fast local previews with an available local engine (for example Piper or another local TTS).
The preview is for:
- timing
- segmentation
- pause quality
- obvious pronunciation mistakes
- content approval

Do not spend premium credits to discover punctuation mistakes.

## 6. Cost gate

Before any external call:
1. hash normalized segment + voice + prosody settings
2. reuse exact cached audio when hash exists
3. detect changed segments
4. render only changed/high-value segments
5. group compatible segments where provider limits and quality allow
6. record estimated and actual paid units if the provider exposes them

Premium routing policy examples:
- local-only for drafts
- premium only for approved final
- premium only for named entities / difficult sections
- premium only if local QA score falls below threshold

## 7. Provider adapter

The adapter maps the local SSML IR into the provider's actual API/script controls.

For Narakeet:
- do not assume full W3C SSML input compatibility
- use its documented voice/speed/volume and script controls
- API automation requires an eligible account/API key
- free browser previews and paid API automation are different things

See [PROVIDER_NARAKEET.md](PROVIDER_NARAKEET.md).

## 8. QA

Use at least two:
- local listening sample
- text diff: original vs prepared
- pronunciation lexicon check
- optional local ASR back-check for gross errors
- duration/pause sanity checks
- human listen for final/high-value content

## 9. Cost report

Every run should be able to answer:

```text
segments_total:
segments_reused_from_cache:
segments_local_previewed:
segments_sent_to_premium:
premium_characters_or_units:
estimated_cost:
actual_cost_if_known:
cache_hit_rate:
```

If cost cannot be calculated from provider data, say `UNKNOWN` rather than inventing a price.

## Composition

Recommended:

```text
Focus Council
    ↓ choose architecture / thresholds
Local SSML Voice Cost Optimizer
    ↓
Focused3
    ↓ prove text prep, cache behavior and output
```

## Truth rules

- “Local-first” does not mean the premium provider is local.
- Do not call Narakeet API “free”; API keys require eligible commercial/top-up or metered plans
  according to its current developer documentation.
- W3C SSML is the internal contract; provider adapters may support only a subset.
- Automatic Arabic punctuation/diacritization can be wrong; preserve overrides and review ambiguity.
