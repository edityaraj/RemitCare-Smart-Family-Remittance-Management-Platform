# RemitCare — Smart Family Remittance Platform (Stellar / Soroban)

> Testnet smart-allocation & remittance **prototype**. Not a licensed real-money remittance service. See [Limitations](#limitations).

## Problem
Traditional remittances are slow, costly, and give senders no visibility into how funds are actually used after arrival. RemitCare lets a sender (e.g. a parent) send funds and organize them into purpose-based allocations (education, healthcare, rent, food, allowance), with every allocation, request, approval, and claim recorded on-chain via a Soroban smart contract.

## Live Links
- Frontend: _add Vercel URL_
- Backend health: _add Render URL_/api/v1/health
- Contract ID (Testnet): _add after Phase 8 deploy_
- Demo video: _add link_

## Why Stellar
Fast finality, low fees, native Soroban smart contracts for programmable escrow/allowance logic, and Freighter for non-custodial browser signing — well suited to small, frequent, purpose-tagged family transfers.

## User Roles
- **Sender** — creates plans, funds them, adds purpose allocations, approves release requests.
- **Receiver** — requests/claims allocations, uploads optional proof.
- **Admin** — read-only oversight, disputes, feedback review. Admin never controls user funds.

## Architecture
```
Browser (React + Freighter) ──sign XDR──> Stellar Testnet / Soroban RPC
        │                                         ▲
        ▼                                         │
   Express API  ───────record-only────────────────┘
        │
   MongoDB Atlas (mirrors on-chain state for UX; contract is source of truth for balances)
```
See `docs/architecture.md`, `docs/user-flow.md`, `docs/contract-state.md` (fill in with your diagrams from Phase 1).

## Contract Flow
`create_plan → fund_plan → create_allocation → request_release → approve_release → claim_allocation → (cancel_allocation | refund_remaining)`
Full rules in `contracts/remitcare_allowance/src/lib.rs`.

## Tech Stack
Frontend: React, Vite, TS, Tailwind, shadcn/ui, TanStack Query, React Hook Form + Zod, @stellar/stellar-sdk, @stellar/freighter-api, PostHog, Sentry.
Backend: Node/Express/TS, MongoDB Atlas/Mongoose, JWT, Zod, Helmet, CORS, rate-limiting, Pino, Sentry.
Contract: Rust/Soroban on Stellar Testnet.

## Folder Structure
See repo tree — mirrors the Level-4 roadmap exactly (`apps/web`, `apps/api`, `contracts/remitcare_allowance`).

## Local Setup
```bash
git clone <repo>
cd remitcare
npm install

# contract
cd contracts/remitcare_allowance
cargo test
stellar contract build

# backend
cd apps/api
cp .env.example .env   # fill in values
npm run dev

# frontend
cd apps/web
cp .env.example .env
npm run dev
```

## Environment Variables
See `apps/web/.env.example` and `apps/api/.env.example`.

## Contract Deployment
```bash
stellar keys generate deployer --network testnet
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/remitcare_allowance.wasm \
  --source deployer --network testnet
stellar contract bindings typescript \
  --network testnet --contract-id <CONTRACT_ID> \
  --output-dir packages/remitcare-contract
```
Record the real Contract ID, deployment tx hash, admin wallet, and token contract ID here — never invent these.

## Testing
- Contract: `cargo test`
- Backend: `npm run test` (apps/api)
- Frontend: `npm run test` (apps/web)
- `npm run lint && npm run typecheck && npm run build` in both apps.

## API Routes
See `docs/api.md` (generated from `apps/api/src/routes`).

## Screenshots
_Add desktop, mobile, PostHog, Sentry screenshots here._

## 10-User Wallet Evidence
_Fill in the evidence table from real Testnet interactions — see `docs/user-testing-template.md`._

## Feedback Summary
_Fill in after collecting real feedback — see `docs/feedback-template.md`._

## Limitations
- Testnet only; no fiat on/off-ramp (would require Stellar anchors + SEP-24 + KYC).
- Cannot restrict what a receiver does with funds once claimed to their personal wallet.
- Admin has no custody of funds; disputes are informational only.

## Future Roadmap
- Mainnet + anchor (SEP-24) fiat on/off-ramp.
- Scheduled/recurring allowances.
- Multi-currency support (multiple Soroban tokens).
- Merchant-restricted spending for select purposes.

## License
MIT
