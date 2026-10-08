---
name: consistent-character-video
description: "Plan a ComfyUI video series with a locked character bible and Saudi-dialect dialogue handled outside the video model. Use when the user wants recurring characters, episode scenes, Wan, or LTX workflows. Choose Wan 2.2 I2V for face stability and LTX-2.3 when length or native audio matters more."
---

# consistent-character-video

Video models do not speak a dialect reliably. Write the Saudi dialogue as text, then record or synthesize voice separately. The image model only keeps the face and wardrobe.

## Character bible (one file per person)

- Canonical portrait: front, neutral light, no sunglasses.
- Two extra refs: three-quarter and full outfit.
- Locked: age range, hair, wardrobe colors, props. Do not re-roll these per episode.
- Negative: extra fingers, different outfit, different face, text artifacts.

## Model choice (ComfyUI, 2026)

| Need | Model |
|---|---|
| Same face across shots, photoreal motion | **Wan 2.2 I2V 14B** (image-to-video from the canonical still). 16GB+ VRAM; Lightning/LightX2V LoRA if you must go faster. |
| Longer clips or audio in one pass, less VRAM | **LTX-2.3** (about 8GB+ GGUF). Weaker identity on close-ups — still start from the same still. |
| Swap a character onto existing motion | Wan 2.2 Animate with a reference image, short source clips. |

Generate 2–4 seconds per shot. Low motion preserves the face. Same seed family per character when the workflow exposes it. Cut in an editor; do not ask one generation for a whole episode.

## Saudi dialogue

1. Write lines in Najdi or the requested regional dialect, not formal MSA, unless the character is a news anchor.
2. Record a human or use a voice product that explicitly offers a Saudi Arabic voice.
3. Lip-sync only if the workflow is built for it (Wan Animate). Otherwise cut on the voiceover.

## Shot list

Each shot: location, action in one sentence, start image (which bible frame), duration, line of dialogue. Reject a shot whose start image is not from the bible.
