# Architecture — local intent, selective premium rendering

## Core principle

SSML is the **speech intent layer**, not the billing layer.

```text
                ┌───────────────────┐
raw text ──────▶│ Arabic Prep       │
                └────────┬──────────┘
                         ▼
                ┌───────────────────┐
                │ W3C SSML IR       │
                └────────┬──────────┘
                         ▼
              ┌──────────┴──────────┐
              ▼                     ▼
       local preview          hash + cache
              │                     │
              └──────────┬──────────┘
                         ▼
                  routing decision
                   /             \
               local            premium
                                  │
                           provider adapter
                                  │
                     Narakeet / other provider
```

## Cost levers

1. **Prepare once locally** — punctuation and tashkeel iterations cost no provider credits.
2. **Segment deterministically** — stable IDs make changed-only renders possible.
3. **Content-addressed cache** — hash(text + voice + prosody + adapter version).
4. **Draft locally** — premium only after content approval.
5. **Selective escalation** — route difficult or high-value segments to premium output.
6. **Reuse final audio** — do not regenerate unchanged narration for a new video build.
7. **Measure** — count provider-bound characters/units before the request.

## Suggested cache key

```text
sha256(
  normalized_text +
  voice_id +
  language +
  prosody_json +
  pronunciation_lexicon_version +
  adapter_version
)
```

## Arabic preparation record

Keep:

```json
{
  "original": "...",
  "normalized": "...",
  "punctuated": "...",
  "diacritized": "...",
  "overrides": [],
  "lexicon_version": "v1",
  "review_state": "draft|reviewed|approved"
}
```

This makes pronunciation changes reviewable instead of invisible.
