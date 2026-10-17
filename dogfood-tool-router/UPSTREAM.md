# Upstream

Kit: `RCTC_Dogfood_Grok_Integration_Kit_2026-10-16.zip` (plan only; not committed).

| Tool | Commit inspected | License | Installed here |
|---|---|---|---|
| addyosmani/agent-skills | `aeac41d4d005999432bb7312f7ff06383a91d59d` | MIT | no, names only |
| upstash/context7 | `e0041949fdb3b49b304d98715dde35be51b7c3d1` | MIT | no |
| Graphify-Labs/graphify | `91f4d120b630ee35c79bf3c75ccd186870a808f9` | Apache-2.0 | no |
| 21st MCP | not pinned (site, not a cloned repo) | confirm before copy | no |
| usestrix/strix | `972f5097c2bfaf8f1dd8b55744ab8861f0d6b6e5` | Apache-2.0 | no |

No paid account was opened. Context7 and 21st can bill usage after the owner enables them. Graphify and Strix are local tools with their own dependencies. Agent Skills is a git repo of instruction files.

Host matrix: Cursor, Claude Code, Codex, and Grok all read this `SKILL.md`. None of them receive an always-on MCP from this change. Grok in a chat with no terminal still has the files and the test command to run later.
