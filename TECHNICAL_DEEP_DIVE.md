# CaiSH: Technical Deep-Dive (v4.3)

## 1. System Architecture: The Unified Fabric

CaiSH is a full-stack financial operating system built on a **Modular Monolith** architecture. It leverages Vite + React for the frontend and Express + Drizzle ORM for the backend, ensuring a seamless type-safe bridge across the network boundary.

- **Frontend**: React 18, Tailwind CSS, motion/react (for state transitions), **Liquid Glass Surface Engine v2**.
- **Backend**: Express.js (TypeScript), Drizzle ORM, Better-SQLite3 (Dev).
- **Validation**: Zod (Strict schema enforcement for all I/O).
- **Context**: AsyncLocalStorage for Zero-Trust tenant propagation.

---

## 2. Persistence Layer: The Nexus & Bitemporality

### The 4-Layer Nexus Topology
Every data point in CaiSH is mapped to the **Nexus Topology**, enabling granular rolling-up of liquidity and risk:
1.  **Global (Tenants)**: Top-level institutional identity.
2.  **Subsidiary (Entities)**: Regional or functional business units.
3.  **Bank Partners**: Institutional counterparty relays.
4.  **Accounts**: Individual GL-coded ledger endpoints.

### Row-Level Security (RLS) Simulation
While targeting PostgreSQL RLS, the application implements a high-fidelity simulation using **AsyncLocalStorage**.
- **Middleware**: Intercepts `x-tenant-id` headers.
- **Provider**: Binds the ID to the execution context.
- **Enforcement**: All database queries are filtered by the active context, preventing cross-tenant data leaks at the service layer.

---

## 3. Security & Resilience

### The Shield Layer
- **Zod-First I/O**: Every route (Insurance, Retail, Energy) uses Zod to validate request bodies. `z.coerce.number()` is used to prevent floating-point crashes in sensitive quant engines.
- **Global Error propagation**: A custom `AppError` class captures `traceId` for audit logging, while a global middleware ensures consistent JSON error responses without exposing stack traces in production.

### Operational Safety
- **Terminal State Locking**: Once a payment or transaction reaches a 'Settled' or 'Verified' status, further client-side modifications are blocked via database-level checks and API logic.

---

## 4. Quantitative Engine: Proactive Foresight

### Energy Treasury v4.0 (Nodal & Basis Risk)
The latest iteration of the Energy Vertical introduces high-fidelity locational risk management:
- **Basis Hub Registry**: Tracks Henry Hub, Waha Hub, and SoCal Citygate benchmarks with integrated pipeline tariff modeling.
- **NPK-CVaR**: Non-Parametric Kernel Conditional Value-at-Risk using Gaussian smoothing on tail-loss distributions.
- **CVA/DVA Simulation**: Monte Carlo based Expected Positive Exposure (EPE) tracing for counterparty credit risk valuation.

### Merton's Jump-Diffusion Simulation
The **Liquidity Cockpit** uses a Monte Carlo simulation based on Jump-Diffusion models:
- **Drift**: Expected growth/shrinkage of cash.
- **Volatility**: Brownian motion representing market noise.
- **Jumps**: Poisson-distributed events representing "Black Swan" shocks.
- **Survival Analysis**: Calculates the "Chance of Survival" (cash > 0) over a 365-day dt increment.

### Asset-Liability Management (ALM)
- **Macaulay Duration**: Used to value the sensitivity of fixed cash-flow streams.
- **Duration Gap Analysis**: Calculates the mismatch between asset and liability durations relative to total assets.

---

## 5. Connectivity & Ingestion: The Global Nervous System

### ISO 20022 MX Transformer
The platform includes a native `fast-xml-parser` based engine to transform:
- **pacs.008**: High-value credit transfers into flattened `PaymentItem` entries for zero-latency monitoring.
- **camt.053**: End-of-day bank statements into structured `JournalEntry` records.

### Connectivity Manager & Relay Surveillance
- **Heartbeat Monitoring**: Real-time signal tracking for SWIFT gpi, SAP S/4HANA, and Bloomberg Terminal.
- **Latency Benchmarking**: Visualizes millisecond delays across the global nexus topology.

---

## 6. Frontend Architecture: The Liquid Glass UI

### Liquid Glass Surface Engine v2
Evolution of the "Nexus Dark" UI with hardened readability and cosmographic depth:
- **Global Pulse Map**: Integrated HUD for Earth payment routing, Off-Earth asset management, Orbital asset management, and the hidden Mars-Bridge override.
- **Color-Coded Theming**: Contextual color injection (Emerald, Purple, Amber, Blue) with high-contrast accessibility overrides in HUD cards.
- **Translucent Textures**: 40px+ backdrop blur with adaptive alpha surfaces (3-8% white).
- **Kinetic Accent Animations**: motion/react based particle paths and drop-shadow glow effects.

### Widget Registry & Dynamic Canvas
The dashboard is powered by a **Custom Dashboard Engine** (`CustomDashboardEngine.tsx`) that hot-swaps widgets based on the contextually relevant industry vertical. The Oil & Gas demo state now injects hedge-effectiveness and basis-risk cards into the Liquidity Dashboard without duplicating saved user layout entries.

---

## 7. Series B Architectural Upgrades (v4.3)

### 7.1. Actionable Intelligence (Strategy Bridge)
Transformed Cerebro from a passive monitoring tool into an **Active Orchestration** engine. Every AI-driven move generates a pair of DEBIT/CREDIT ledger entries with unique transaction hashes.

### 7.2. Neural Search (Cmd+K Command Palette)
Implemented a high-speed navigation layer for complex corporate hierarchies with real-time indexing of Industry Verticals.

### 7.3. Global Scenario Sandbox (Sim Mode)
A unified state-interceptor for quantitative stress testing that renders the delta between "Production Data" and "What-if Scenarios" simultaneously.

### 7.4. Interactive ISO Ingestion Gateway
A dedicated facility for reconciling raw SWIFT messages with the Nexus Topology, using a split-view staged layout.

### 7.5. Asset-Management Pulse Modes
The Liquidity Dashboard's Global Pulse hero now supports three active operational modes:
- **Earth**: Live payment-route mesh across major treasury hubs.
- **Off-Earth**: Lunar/off-earth asset-management view for non-terrestrial treasury assets.
- **Orbital**: Orbital custody and telemetry control-plane view.

The Mars-Bridge remains a hidden easter egg override rather than a visible switcher item.

### 7.6. Demo Deployment Readiness
- **Health Probe**: `/api/health` returns app name, version, runtime mode, seed status, and timestamp for Render smoke tests.
- **Lazy Vertical Loading**: Heavy vertical cockpits, React Flow netting, and AI modules are lazy-loaded so the Liquidity Dashboard reaches first paint faster.
- **Demo Discovery Paths**: Liquidity Dashboard now exposes a Retail Netting shortcut, while ISO Ingestion includes an in-app sample `pacs.008` payload for judge-ready testing.

---

## 8. Adaptive Industry Verticals
CaiSH utilizes a dynamic injection pattern to reconfigure its quantitative core based on the selected industry vertical. This "Adaptive Fabric" approach ensures that relevant risk parameters and KPIs are prioritized automatically.

### Supported Verticals & Focus Areas:
- **Manufacturing**: Optimized for heavy capital expenditure and inventory liquidation. Focuses on Net Orderly Liquidation Value (NOLV).
- **Healthcare**: Targets the Revenue Cycle (Payor/Provider) complexity, tracking AR velocity and regulatory escrow compliance.
- **Real Estate**: Specialized in automated rent sweeps, property-level debt servicing, and OPEX reserve maintenance.
- **Retail**: Handles high-volume multilateral intercompany netting and consumer-to-treasury settlement cycles.
- **Technology**: Built for high-growth R&D entities, focusing on cash burn integrity, venture debt covenants, and global payroll runway.
- **Energy (Oil & Gas)**: The most complex module, handling nodal basis risk, commodity hedging, and volume integrity across global hubs.
- **Insurance**: A specialized ALM engine restricted to Solvency II matching and duration gap risk mitigation.

---

## 9. Appendix: Financial Invariants

| Vertical | Core Invariant | Primary Metric |
| :--- | :--- | :--- |
| **Manufacturing** | Inventory-to-Liquidity Liquidation | NOLV (Net Orderly Liquidation Value) |
| **Healthcare** | Revenue Cycle Lifecycle | AR Days / DSO |
| **Real Estate** | Property Debt Servicing | DSCR (Debt Service Coverage Ratio) |
| **Retail** | Multilateral Intercompany Netting | Settlement Cycle Efficiency |
| **Technology** | Burn Integrity & Runway | Cash Runway (Months) |
| **Energy** | Nodal Basis & Volume Integrity | BCVA / Basis Spread |
| **Insurance** | ALM Duration Matching | Solvency II Gap Ratio |

---
*Last Updated: 2026-05-22 13:30:00Z (Nexus Series B v4.3.0 Industry-Hardened)*
