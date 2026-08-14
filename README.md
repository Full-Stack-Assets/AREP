# AREP

Tradewind’s permanent product-quality matrix — executable competitive intel for DealFlow.

## What’s in here

| Path | Role |
| --- | --- |
| `src/data/platforms.json` | Ten-platform benchmark (`copy` / `improve` / `avoid`) |
| `src/data/quality-matrix.json` | Pillars, churn drivers, Priorities 1–5, scoring dimensions, hard fails |
| `src/intel/score.ts` | Feature scorer (vetoes beat credits; approval gates) |
| `src/intel/publish.ts` | Intel publisher → `.output/intel/` |
| `src/domain/` | Object graph, no-gate doctrine, dollar cost ledger stubs |

## Commands

```bash
npm ci
npm test
npm run intel:score -- fixtures/sample-feature.json
npm run intel:publish
```

## Scoring rules

1. Dimension scores sum to a base (max 100).
2. Credits add up to 15 points and **never clear a veto**.
3. Any hard-fail id on the feature → `vetoed` regardless of total.
4. Gates: `<50` draft · `50–74` needs_review · `≥75` ship_eligible (if not vetoed).
