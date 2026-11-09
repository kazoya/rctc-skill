---
name: guarded-messaging-preview
description: >
  Build WhatsApp deep-link previews and guarded inbound auto-replies that never
  invent sell prices. Use for preview/send UX honesty. Live gateway send is
  NOT_IMPLEMENTED in this pack.
---

# guarded-messaging-preview

- Outbound: `buildWhatsAppPreviewUrl` → `PREVIEW_ONLY` or `NOT_IMPLEMENTED_FOR_SEND`.
- Inbound: `guardInbound` → clarify incomplete RFQ; refuse price injection.
- `sent` is always `false` here.

Do not classify as production WhatsApp capability.
