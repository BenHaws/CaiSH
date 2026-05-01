# Challenge Demo Polish

Date: 2026-04-30

Goal: Prepare CaiSH for Codex Creator Challenge submission tonight by making the app runnable, demo-stable, and easy to explain.

## Environment / Tooling

- Started with no `node_modules` directory present in the workspace mirror.
- Ran `npm install`; first sandboxed attempt failed due restricted npm fetch / Windows permissions, escalated rerun succeeded.
- `npm run lint` initially hit Windows sandbox path permissions, escalated rerun succeeded.
- `npm run build` initially hit Windows sandbox path permissions, escalated rerun succeeded.
- Node runtime warning: installed Node is `v20.12.1`; `@vitejs/plugin-react` requests `^20.19.0 || >=22.12.0`. Current toolchain still typechecks and builds successfully.
- Planned verification stack:
  - `npm install` or equivalent dependency restore
  - `npm run lint` (`tsc --noEmit`)
  - `npm run build` (`vite build`)
  - Local dev server via `npm run dev`

## Bugs / Fixes

- Fixed frontend tenant header default from `1` to `t-1` so API calls align with seeded tenant/server defaults.
- Bound request `x-user-role` into `nexusContext` alongside tenant context so DEV routes can authorize `DEV_ADMIN` calls.
- Added missing `virtual_ledger` table creation during seed/bootstrap.
- Fixed strategy execution ledger writes to use the active tenant ID instead of account entity IDs for `virtual_ledger.tenant_id`.
- Fixed dev/server middleware mode by passing Vite config inline from `server.ts` instead of relying on Vite loading `vite.config.ts` through `tsx`.
- Removed unused `@/*` path alias from TypeScript/Vite config; no project imports used it, and it was contributing to runner fragility.
- Fixed compiled server static asset resolution to use the project working directory, so production mode serves `dist/` correctly from a bundled server.
- Reworked strategy execution transaction to use synchronous Drizzle/better-sqlite calls inside `db.transaction`, fixing `Transaction function cannot return a promise`.
- Fixed browser blank-screen crash caused by top-level `new GoogleGenAI(...)` without a configured browser API key. Cerebro now lazy-loads Gemini only when a real key exists and otherwise runs deterministic demo intelligence.
- Added a visible boot fallback and React error boundary so future frontend crashes show a useful error panel instead of a blank screen.
- Reworked the Global Pulse hero into a world payment-route map with animated settlement arcs, treasury hub markers, route tickets, and a SWIFT gpi status control. Removed Moon/ISS visible switches while preserving the hidden Mars easter egg override.
- Fixed ISO Ingestion page contract: it now posts to `/api/iso-ingest` and renders `journalEntries` from the transformer response instead of treating the whole response object as an array.
- Added ISO ingestion error messaging and avoided parsing incomplete XML fragments while the user is still pasting.
- Rebalanced Liquid Glass UI primitives: defined missing `glass-card`, reduced overly heavy blur/opacity, normalized radii, softened shadows, and reduced nested glass treatment in the app shell/sidebar.
- Cleaned leftover unreachable ISS styling branches in the Global Pulse hero after converting Moon/ISS to icon-only placeholders.
- Changed fresh app startup behavior so the first screen remains the Liquidity Dashboard after industry config hydration instead of auto-pivoting to the active industry vertical.
- Added and saved two Oil & Gas hedging dashboard cards: `Hedge Effectiveness` and `Basis Risk Curve`. When the active industry optimization is Oil & Gas, the Liquidity Dashboard ensures these cards are present without duplicating them.
- Updated the Global Liquidity widget to a combined bar/line view: bars show total cash position, the line shows total cash projection, and compact YTD/CQ/PQ/NQ controls switch the point of view.
- Reduced widget header height and content padding to give charts and card content more vertical room.
- Updated the Liquidity Dashboard grid so standard widgets render three per row on wide screens while the Global Liquidity widget remains full-width. Quarter POVs now show 12 weeks of daily bars/projection data.

## Feature / Functionality Modifications

- Added explicit Node engine requirement: `>=20.19.0`.
- Added explicit `esbuild` dev dependency for server bundling.
- Added `build:server` script.
- Changed `build` to produce both frontend `dist/` and bundled backend `dist-server/server.js`.
- Changed `start` to run the bundled backend with plain Node.
- Changed `dev` to build and run the bundled backend, avoiding `tsx` at runtime for tonight's demo.
- Replaced Unix-only `clean` script with a Windows-safe Node cleanup command.
- Dynamic Gemini import split the frontend bundle into a smaller app chunk plus a separate AI vendor chunk.

## Demo Readiness Notes

- TypeScript check passes.
- Production build passes and now includes client + server output.
- Build emits a large chunk warning; acceptable for tonight's demo unless deployment size/performance becomes a blocker.
- Production demo server smoke-tested at `http://localhost:3000`; root page returns HTTP 200.
- Core API smoke tests passed:
  - `/api/entities`
  - `/api/accounts`
  - `/api/dev/global-stats` with `x-user-role: DEV_ADMIN`
  - `/api/dashboard`
  - `/api/energy/market-state`
  - `/api/insurance/solvency-metrics`
  - `/api/iso-ingest` with a sample `pacs.008` payment payload
- Strategy execution smoke test passed at `/api/execute-strategy`; returned `SUCCESS` and updated account balances.
- In-app browser visual check could not run because the Browser plugin's Node REPL requires Node `>=22.22.0`, while this machine's system Node is `v20.12.1`.
