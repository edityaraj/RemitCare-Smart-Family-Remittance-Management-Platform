# RemitCare — Smart Family Remittance Platform (Stellar / Soroban)

> A production-ready Stellar dApp where senders securely allocate funds for specific purposes, receivers claim allocations via verifiable on-chain requests, and both parties gain instant transparency without traditional remittance fees.

## 🚀 Quick Links
- **Live Platform**: [remitcare-smart-family-remittance.vercel.app](https://remit-care-smart-family-remittance.vercel.app/)
- **Demo Video**: [Watch the Demo](https://drive.google.com/file/d/1Y_IA_L6ZcyrCzntQRkhYRoLt0jxfRtUG/view?usp=sharing)
- **Contract Deployment Address**: `CDAPWBOKK5BUOIQB3NH5RHEOGBP3OQ66YCDNYGD7Q3EO3XBESX7HS7NH`

---

## Why this exists

Traditional family remittances are slow, costly, and give senders zero visibility into how funds are actually used after they arrive. High wire transfer fees and terrible forex conversion rates plague cross-border support, leaving both senders and receivers frustrated. 

RemitCare solves this by natively merging purpose-based budgeting with the payment layer. By leveraging the Stellar network and Soroban smart contracts, a sender (e.g. a parent supporting a student abroad) can send funds and organize them into purpose-based allocations (education, healthcare, rent, food). Receivers claim these allocations, and funds move directly peer-to-peer. It's fast, virtually feeless, and immediately provides transparent on-chain proof for both parties.

## How money actually moves

```
   Sender                                            Receiver
      │  fund_plan() & approve_release()                ▲
      ▼                                                 │  
┌──────────────────────┐                                │ 
│ Stellar Testnet      │  native XLM transfer          │
│ (Soroban RPC)        │                               │
└──────────────────────┘                                │
      │  claim_allocation() executes transfer            │
      └─────────────────────────────────────────────────┘
```

- **Sender → Contract**: Senders create a plan and fund it natively. Funds are locked securely in the Soroban smart contract.
- **Contract → Receiver**: Receivers request a release for a specific purpose. Once the sender approves, the receiver claims it, and the contract executes a native Stellar payment operation to the receiver's wallet.
- Every action produces a real `txHash` you can look up on [stellar.expert](https://stellar.expert/explorer/testnet).

## Architecture

```
apps/web/   React + Vite + Tailwind CSS — responsive dual-role dashboards (Sender & Receiver)
apps/api/    Node.js + Express + MongoDB — auth, plan management, API
contracts/  Soroban (Rust) — smart contract managing escrow and release logic
```

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Wallet | Freighter |
| Blockchain | Stellar Testnet |
| Smart Contract | Soroban (Rust) |
| Deployment | Vercel (frontend) |

## Verifiable On-Chain Proofs

Below are some example transactions that prove the core smart contract interactions execute correctly on the Stellar Testnet:

- **Plan Creation & Funding Transaction**: [be9266a6d7df7af935170df2c1d586fb6c484aa01328aadb58ef3973fbea3411](https://stellar.expert/explorer/testnet/tx/be9266a6d7df7af935170df2c1d586fb6c484aa01328aadb58ef3973fbea3411)
- **Allocation Approval Transaction**: [e304423a4f604f05eb1deaee6bb7389825033c1bb46c70146f5f33ba2cdbdbab](https://stellar.expert/explorer/testnet/tx/e304423a4f604f05eb1deaee6bb7389825033c1bb46c70146f5f33ba2cdbdbab)
- **Allocation Claim (Transfer) Transaction**: [24cae0bf3fd6c87bccdb14253d9763569f22a50e72e6e93ebfed4515206125cc](https://stellar.expert/explorer/testnet/tx/24cae0bf3fd6c87bccdb14253d9763569f22a50e72e6e93ebfed4515206125cc)

## Users Onboarded

Below is the list of users who actively tested the platform and provided feedback:

| User | Role | Wallet Address | Feedback Summary |
|---|---|---|---|
| Anshu | Sender | `GCEEVR6W3LPTPQ3UFSAP43UMBXAOMTVWPUOERWZF3MQQOSOOJLE4XFJD` | The ability to organize funds by purpose and see exactly when they are claimed is a game changer for family support. |
| Malika | Receiver | `GCC3M4JQTMRE7RTD7SIIGLA3UQVNIAV5GEOVLUYBO5PZYNXBLITLCJR4` | Freighter connection was seamless, and the instant on-chain release of funds makes it incredibly reliable to get support when I need it. |
