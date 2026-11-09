# Source Trace — Saqr & Rakan → Master Skills Factory

**Inspected repo:** `C:\A\ghoor\saqrrakan`  
**Branch:** `pozzolan-trade-prime` (tracking `origin/pozzolan-trade-prime`)  
**HEAD at inspect:** `bd078df4` + local uncommitted trade-desk work (not modified by this extraction)

## Mapped artifacts (read-only)

| Saqr path | Transferable idea | Public RCTC artifact |
|---|---|---|
| `src/lib/trade-desk/parse.ts` | Alias catalog, quantity parse, prompt/price injection reject | `src/parse.js` + `src/catalog.js` |
| `src/lib/trade-desk/review.ts` | Market ≠ sell; approvals; incomplete vs approved; availability | `src/pricing.js` + `src/quote.js` + `src/validate.js` |
| `src/lib/trade-desk/document.ts` | RFQ without total vs approved quote | `renderQuoteText` |
| `src/lib/trade-desk/store.ts` | Local JSON + tenant forbid | `src/store.js` |
| `src/lib/trade-desk/pilot.ts` | Synthetic pilot cases | tests + demo (new synthetic text) |
| `src/lib/channels/order.ts` | `wa.me` preview URL builder | `src/outbound-preview.js` (**no real waDigits**) |
| Landing WhatsApp UI | Preview before user send | claims: PREVIEW_ONLY |
| Trade desk docs | WhatsApp does not send from desk | `claims.whatsapp_send=NOT_IMPLEMENTED` |

## Explicitly NOT copied

- Live product price approvals / customer RFQs  
- `SAQR_ORDER_WHATSAPP` digits  
- Firebase / gateway credentials  
- Uncommitted private seller measurements  

## Honesty

Saqr trade-desk WhatsApp **send** = not implemented. Landing uses user-opened `wa.me` link. Master pack mirrors that honesty.
