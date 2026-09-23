# Local SSML Voice Cost Optimizer

**Arabic-first, provider-neutral, local-first.**

The expensive mistake in TTS pipelines is often not the provider price alone; it is paying the
provider again for every punctuation edit, pronunciation fix, preview and unchanged paragraph.

This skill moves repeatable work locally:

```text
Arabic text
→ cleanup/context/punctuation
→ optional diacritization
→ W3C SSML intermediate representation
→ local preview
→ content-addressed cache
→ provider adapter
→ premium render only for selected/final segments
```

## Why W3C SSML locally?

It creates one stable speech-control contract even when providers differ. Your application owns
the semantic intent (“pause 500ms”, “read this alias”, “slow this sentence”) and adapters translate
that intent into each provider's actual controls.

## Quick demo

```bash
python3 local-ssml-voice-cost-optimizer/tools/ssml_compiler.py \
  local-ssml-voice-cost-optimizer/examples/ar_demo.ssml
```

The output is provider-neutral JSON segments. No network call is made.

## Narakeet

Narakeet is a useful premium adapter example because it exposes TTS automation plus speed/volume
and richer script controls. Its API is not a free local engine: current Narakeet documentation
states API keys are available to eligible top-up or metered commercial accounts, while free
accounts are not eligible for API keys.

See [PROVIDER_NARAKEET.md](PROVIDER_NARAKEET.md).

## Arabic quality

Suggested local toolbox:
- local LLM for context-aware punctuation restoration
- CAMeL Tools for Arabic NLP/diacritization where suitable
- PyArabic for normalization and harakat utilities
- a project-specific pronunciation lexicon
- local TTS for fast preview
- optional local ASR for coarse back-check

Automatic tashkeel is never treated as ground truth.

## Dogfooding

This architecture was selected using the sibling [Focus Council](../focus-council/) method.
See [DOGFOODING.md](DOGFOODING.md).

## Support

If this saved paid TTS iterations:
- ⭐ Star: https://github.com/kazoya/rctc-skill
- ☕ Buy Me a Coffee: https://buymeacoffee.com/Asrawi612
- useful test cases and provider adapters are welcome
