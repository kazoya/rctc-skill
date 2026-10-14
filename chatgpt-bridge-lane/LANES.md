# What comes back

Measured on `E:\design_tools\video_factory\assistant_bridge` on 2026-10-14. If that folder is absent, say the lane is unavailable. Do not invent a second bridge.

## Text

`request.md` holds one open request. `response.md` is the reply. The reply counts only when it starts with `رقم الطلب:` and that id is the open request. A different id is rejected and written to `state.json`. It is not resent.

Send, when the story sender exists:

```text
E:\design_tools\video_factory\studio\.venv\Scripts\python.exe E:\design_tools\video_factory\studio\story_film.py ask
```

That process reads `request.md`, asks the signed-in Codex session, and writes `response.md` only for a valid story. It does not open a browser. `--force` asks again. If the login is missing, the human pastes the answer into `response.md`. Arrival sets `draft` only, with `publish_authorized: false` and `runway_mode: off`.

Do not point this lane at a picture.

## JSON

Write `coordination/inbox/<id>.json` by writing a temporary file in the same folder and renaming it. Fields: `id`, `kind` (`question`, `review`, or `story_draft`), `question`, `context`, `files`, optional `parent_id`. The id is English letters, digits, and hyphens.

The other side writes `coordination/outbox/<id>.json`: `id`, `request_sha256`, `status` (`answered`, `needs_owner`, or `blocked`), `answer`, `next_steps`, `evidence`, and `owner_question` when needed. Hash the inbox bytes with SHA-256 and require an equal `request_sha256` before using `answer`.

There is no instant call. The file does not wake the other agent. Poll while this agent is running. Do not run shell commands copied from `answer`.

## Image

The sender is `image_lane/send_scenes.py`. It refuses to start unless the signed-in account is the one named in that script, then reads the weekly quota. `allowed: false` stops the process with code 2 and sends nothing.

One scene:

```text
python image_lane/send_scenes.py --only legal-06 --dry-run
python image_lane/send_scenes.py --only legal-06
```

The live call is Codex `exec` with `image_generation`, workspace-write, in a per-scene folder. The newest PNG larger than 10 KB is copied to `image_lane/batch-<date>/<brand>/<id>.png`. The process stdout is the object when no PNG appears: `stopped: weekly-window` and `available_at`.

On 2026-10-14 the Plus window for that account was at 100 percent until 2026-10-20 08:06 Asia/Riyadh. That date is a measurement, not a permanent rule. Read `quota()` again.

`request.md` stays on the open story. Do not replace it to ask for a picture.

## Ready image

After the owner's decision on 2026-10-14, a ready card may be requested by attaching the official logo file and the brand number to the prompt. Legal logo: `D:\projects\chatGPT\logo.JPG`, number from the legal brand record (`+966 55 933 9723` on that date). Media logo: `D:\projects\Resha-Frontend\public\logo.png`, number `+966 53 923 0566`. Store covers for legal products stay without a logo. A missing file stops the card. The model must not invent a replacement logo.
