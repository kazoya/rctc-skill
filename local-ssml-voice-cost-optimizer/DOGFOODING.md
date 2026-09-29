# Dogfooding record — two skills used to produce each other

This pair deliberately demonstrates the repository's composition law:

> Reuse → Compose → Extend → Generate New

## Pass A — Focus Council shaped the voice optimizer

The design question was evaluated by simulated perspectives:
- Arabic NLP
- Speech/TTS
- FinOps/API
- product engineering
- accessibility

Three candidates were compared:
1. raw text → premium provider
2. fully local TTS
3. local language prep + W3C SSML IR + local preview/cache + selective premium adapter

The neutral evaluator summary selected (3) for the default case because it reduces repeated paid
iterations while preserving an optional premium final-render path.

## Pass B — Voice cost thinking improved Focus Council

The FinOps lesson was fed back into Focus Council:
- agent count should scale with decision value
- QUICK / STANDARD / DEEP modes prevent paying token cost for unnecessary debate
- duplicate candidate merging avoids redundant reasoning
- sensitivity analysis detects fragile “winners”

So the **answer-quality skill itself has a cost-control mechanism**.

## Marketing claim we can truthfully make

> These two RCTC skills were dogfooded together: the deliberation skill selected and stress-tested
> the local-first voice architecture, while the cost-optimization principles fed back into the
> deliberation skill's QUICK/STANDARD/DEEP modes.

Do not claim external customer validation unless real customer data is later collected.
