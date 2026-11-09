# Sector Acceptance Matrix

**Evidence:** `npm test` → acceptance suite **PASS** (2026-11-09). All data synthetic.

| Sector | Complete request | Incomplete | Sector rule | Quote/summary | WA preview | Verified outcome |
|---|---|---|---|---|---|---|
| Wholesale produce | `2 طن خيار …` + approval | `بدي تمور` | Market ≠ sell; destination | APPROVED `0.600` | PREVIEW_ONLY | success, CSAT unknown |
| Electronic components | `10 pcs esp32` + approval | `need boards` | Approval overlay required | APPROVED | PREVIEW_ONLY | success, CSAT unknown |
| Clinics | `1 موعد كشف` + approval | `أبغى موعد` | **Admin only**; Rx text rejected | APPROVED booking quote | PREVIEW_ONLY | success, CSAT unknown |
| Pharmacies | `2 علبه فيتامين سي` | `عندكم ادوية؟` | **OTC admin**; prescription language rejected | APPROVED | PREVIEW_ONLY | success, CSAT unknown |
| CCTV / security | `4 كاميرا 4mp عمان` | `كاميرات` | Destination for install | APPROVED | PREVIEW_ONLY | success, CSAT unknown |
| General business services | `3 hours consulting` | `hello` | Hourly approval | APPROVED `225.000` | PREVIEW_ONLY | success, CSAT unknown |

## Config switch demo

Without changing core workflow code:

- `config/examples/wholesale_produce.sector.json` → `wholesale_produce_cfg`
- `config/examples/clinic_reception.sector.json` → `clinic_reception_cfg` (`administrativeOnly: true`)

## Clinical safety

Clinic/pharmacy paths reject diagnosis/prescription/dispensing language. No medical decisions generated.
