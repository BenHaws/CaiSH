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
- Fixed an app-shell breakpoint regression where the in-app browser width rendered the sidebar and main dashboard as stacked columns, pushing Liquidity Dashboard below the clipped viewport. Shell now switches to row layout at `md` width so the dashboard loads beside the side nav.
- Activated the Liquidity Dashboard Off-Earth and Orbital asset management icon controls. Each now switches the Global Pulse hero into its own asset-management HUD state with dedicated background, metrics, asset nodes, and route visualization while preserving the hidden Mars override.

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
- In-app browser visual checks now pass for the Liquidity Dashboard shell, Global Pulse hero, and Off-Earth/Orbital asset controls after resetting the browser automation runtime.

## 2026-05-22 Review Notes

Reviewed `TECHNICAL_DEEP_DIVE.md`, `PROMO_VIBE.md`, this polish log, and the current Liquidity Dashboard application surface.

Important alignment updates made:
- `TECHNICAL_DEEP_DIVE.md` now references `CustomDashboardEngine.tsx` instead of the stale `DashboardCanvas.tsx` name.
- `TECHNICAL_DEEP_DIVE.md` and `PROMO_VIBE.md` now describe Earth, Off-Earth, Orbital, and hidden Mars modes instead of stale visible Moon/ISS switcher copy.
- `PROMO_VIBE.md` now frames the visual vibe around global route mesh plus off-earth/orbital control states.

Recommended smoothing backlog for this version:
1. **Done - Add a Retail Netting shortcut from Liquidity Dashboard**: Added a compact "Run Netting Simulation" CTA below Global Pulse that routes directly to the Retail netting cockpit.
2. **Done - Create an Industry Mode indicator**: Added a header chip showing the active industry optimization with a one-click route to Admin Console.
3. **Done - Persist Global Pulse selected mode**: Earth/Off-Earth/Orbital/Mars pulse mode now persists in `localStorage`.
4. **Done - Tighten Global Pulse responsive layout**: Reduced HUD padding/title scale at the in-app browser width to avoid clipping in Orbital and Off-Earth modes.
5. **Done - Add demo-safe empty/error states to every widget**: Added visible fallback states for API-fed dashboard widgets, replacing silent console-only failures in the primary dashboard.
6. **Done - Code-split heavyweight modules**: Lazy-loaded vertical cockpits, Retail netting, Cerebro, and vendor bundles. The production build no longer emits the large chunk warning.
7. **Done - Normalize route naming in nav and docs**: Public nav label now uses "Liquidity Dashboard"; remaining shorthand stays in implementation/polish notes only.
8. **Done - Make ISO ingestion sample payload accessible in-app**: Added a "Load Sample" button with a sample `pacs.008` payment payload.
9. **Done - Add deployment health endpoint**: Added `/api/health` returning version, build mode, seed status, and timestamp.
10. **In progress - Commit and push the latest polish pass**: Latest app-shell, Global Pulse, docs, and smoothing changes are ready for final build/smoke test before commit/push.

## 2026-05-22 Smoothing Execution

- Added dashboard shortcut from Liquidity Dashboard to Retail Netting Command Center.
- Added active Industry Mode chip in the app header that opens Admin Console.
- Persisted Global Pulse mode selection across reloads.
- Tightened Global Pulse HUD spacing and title scale for the in-app browser viewport.
- Added visible loading/error fallbacks for primary API-backed dashboard widgets.
- Added lazy-loaded vertical modules and Vite manual vendor chunks; production build now splits flow, chart, motion, icon, AI, and core vendor bundles.
- Renamed primary nav label from "Liquidity Cockpit" to "Liquidity Dashboard" for public consistency.
- Added in-app ISO sample payload loader and tightened parsed journal amount wrapping.
- Added `/api/health` deployment probe.
- Smoke-tested root page, `/api/health`, Retail netting shortcut, industry chip, and ISO sample parsing on `localhost:3000`.
