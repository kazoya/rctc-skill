# Context7 fallback

Date: 2026-10-17. Host Node: v24.15.0 (`node --version` in this session).

The question used as the dogfood query is task `node-fetch-docs`: what the Node 22 fetch API document says.

Context7 was not called. This session has no Context7 MCP namespace, and `registry.json` keeps `context7.enabled` false. No API key was created.

Result: **unverified**. The router returns `local: evidence-before-claim` and `external: null` until the owner enables Context7 and a live query returns a library id plus version.

Fallback while it stays off: read the Node.js release docs for the version you actually run, and do not cite a page you did not open.

`packages` engines in this repo say `>=18`. That line is in `package.json`. It is not a Context7 answer about Node 22 fetch.
