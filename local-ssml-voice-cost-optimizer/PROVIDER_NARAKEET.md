# Narakeet adapter notes

Verified against Narakeet public developer documentation on 2026-09-23.

## What the adapter may rely on

Narakeet exposes a Text-to-Speech REST API and documents:
- streaming and polling workflows
- MP3/M4A output, with WAV on the long/polling path
- voice selection
- voice speed controls
- volume controls
- richer script controls for pitch, pauses and multi-voice content

Reference:
- https://www.narakeet.com/docs/automating/text-to-speech-api/
- https://www.narakeet.com/docs/automating/

## Cost/account truth

Narakeet's developer page currently says:
- API access is included with eligible top-up or metered commercial accounts
- free accounts and unmetered subscriptions are not eligible for API keys
- the streaming audio API is intended for short content; the developer docs state a 1 KB input
  limit for streaming and 100 KB for long/polling audio jobs

Therefore this skill must **not** describe automated Narakeet rendering as a free local service.

The cost-saving strategy is instead:
1. prepare and preview locally
2. cache locally
3. render only approved/changed/high-value segments externally

## W3C SSML compatibility rule

Do not send arbitrary W3C SSML directly and assume complete support.

The canonical internal representation is W3C-style SSML. The Narakeet adapter should map supported
intent to Narakeet's documented request parameters and script syntax.

Unsupported tags must:
- degrade explicitly to plain text, or
- be rejected with a clear adapter warning

Never silently pretend a prosody feature was applied.
