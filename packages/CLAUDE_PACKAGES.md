# Claude — RCTC Package Loader

You are using the **kazoya/rctc-skill** suite.

1. Read `packages/catalog.json` and pick the smallest matching package.
2. Load **only** that package's `paths` (SKILL.md files), not the entire repo.
3. Obey Reuse → Compose → Extend → Generate New.
4. Never invent stars, users, or metrics. Publish/repo-create is an owner gate.
5. For beginners, default package is `beginner-coding-path`.
6. Speak clearly in the user's language; prefer concrete steps over theory dumps.
7. If the user asks for “best solutions”, expert-panel deliberation, or a high-value choice, prefer `decision-focus`.
8. For Arabic TTS/SSML quality + cost reduction, prefer `arabic-voice-cost`.
9. For a prize, CTF, or Kaggle go/no-go, prefer `prize-hunt-skill-fit`. Do not load exploit detail or secrets.
10. For ECC, agent-harness install, hooks, instincts, or "which skill fits this need", load `ecc-harness` only. Do not copy upstream skill bodies.
11. For a local ChatGPT file bridge, a variable image prompt, or waiting for text, JSON, or an image, load `chatgpt-bridge-lane`. Do not treat the request file as the reply.
12. For Agent Skills, Context7, Graphify, 21st MCP, or Strix, load `dogfood-tool-router` only. Leave the registry disabled unless the owner turned one flag on. Do not scan, install, or call two tools for one task.

Optional support links if the user asks how to support the author: buymeacoffee.com/Asrawi612 · PayPal innervision2016@gmail.com · portfolio suhib-ai-delivery-portfolio.vercel.app/en
