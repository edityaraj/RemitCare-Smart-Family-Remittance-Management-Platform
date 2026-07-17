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

| Action / Description | Wallet Address | Stellar.Expert Link |
|---|---|---|
| **Plan Creation & Funding** | `GCEEVR6W3LPTPQ3UFSAP43UMBXAOMTVWPUOERWZF3MQQOSOOJLE4XFJD` | [be9266a...](https://stellar.expert/explorer/testnet/tx/be9266a6d7df7af935170df2c1d586fb6c484aa01328aadb58ef3973fbea3411) |
| **Allocation Approval** | `GCEEVR6W3LPTPQ3UFSAP43UMBXAOMTVWPUOERWZF3MQQOSOOJLE4XFJD` | [e304423...](https://stellar.expert/explorer/testnet/tx/e304423a4f604f05eb1deaee6bb7389825033c1bb46c70146f5f33ba2cdbdbab) |
| **Allocation Claim (Transfer)** | `GCC3M4JQTMRE7RTD7SIIGLA3UQVNIAV5GEOVLUYBO5PZYNXBLITLCJR4` | [24cae0b...](https://stellar.expert/explorer/testnet/tx/24cae0bf3fd6c87bccdb14253d9763569f22a50e72e6e93ebfed4515206125cc) |
| **Plan Creation: Monthly Family Support** | `GD3HSTZ27L7DWP7O2R2ATMAOLOPUIGCDSMT64TDETN4RI62VWQOIGI7F` | [0ee133e...](https://stellar.expert/explorer/testnet/tx/0ee133e0ef9f2979cc65ea6a8202fd63a9a99b44c596992eb0fb1f1dfaf802e2) |
| **Plan Creation: Emergency Medical Fund** | `GAJ2QIUJDOZXC2MH2A5BFJIY5JIPR4YS4CTARPK7RGHSSMOW3ECDM5HC` | [f01eef3...](https://stellar.expert/explorer/testnet/tx/f01eef36a5ffbdd16fac28d9007115bc148c2ff68bc78ba718bbaea04b5b55b6) |
| **Plan Creation: College Tuition & Rent** | `GDUTHXWDZYTCQIRZBX5NXSPFVUX6557WAQR23RDJGONV372RAKLWJ5BA` | [9f6bc73...](https://stellar.expert/explorer/testnet/tx/9f6bc73a9e50c987f0e4fdaac9d0ca2950f5928ac46384d3d39c8e34219be4ea) |
| **Plan Creation: Housing Renovation** | `GCMEP5X6OSWKEKM54MUX3P45GCXMN6L5HHKICWMIIGFUEEAFE3KLBG3X` | [14ba649...](https://stellar.expert/explorer/testnet/tx/14ba649273e2e5b2ace14712408c1a3eae86f24009b9adc215842ae934274dd5) |
| **Plan Creation: Grandparents Care Fund** | `GABKSGCQEFGT44YEGUYQ5KEATFFXJBZEBPFNTBQW6HCPD7K7BFYTJDCO` | [948efce...](https://stellar.expert/explorer/testnet/tx/948efcecf9242ba3709615b491ff06b3ec3064a16d1aa48efc0c89410b8d92b7) |
| **Plan Creation: Startup Seed Capital** | `GAPNZGQEZBHLJXOGALD5E7C7QASHR7U3SAZIZQRN4LZZR4G33HKRBJSQ` | [61f552e...](https://stellar.expert/explorer/testnet/tx/61f552ee010f982bcf1b5fde9e1cd377c3690ca910d1d7b0c58e8b96c5c2788e) |
| **Plan Creation: Community Charity Drive** | `GCSAPI32TRCP7XSYKMPO2PQ5ZKHYOGL2CCRLNRCHB5CACPH5M6DSRZ3B` | [1f3eae8...](https://stellar.expert/explorer/testnet/tx/1f3eae8b94c846370ed394d46b09735f46714cb461a9955e55472edd8747bba5) |
| **Plan Creation: Quarterly Allowance** | `GDIG5IHYSFAG6CVGS3XYSORLVUPCDR6C2YYJDW2YAOIU25GDV7P3POYW` | [01e50fc...](https://stellar.expert/explorer/testnet/tx/01e50fcb36236d6f2243f07ce1c3a2deb819524b8bb17c66bf4d9d84fa5fd906) |

## Users Onboarded

Below is the list of users who actively tested the platform and provided feedback:

| User | Role | Wallet Address | Feedback Summary |
|---|---|---|---|
| Anshu | Sender | `GCEEVR6W3LPTPQ3UFSAP43UMBXAOMTVWPUOERWZF3MQQOSOOJLE4XFJD` | The ability to organize funds by purpose and see exactly when they are claimed is a game changer for family support. |
| Malika | Receiver | `GCC3M4JQTMRE7RTD7SIIGLA3UQVNIAV5GEOVLUYBO5PZYNXBLITLCJR4` | Freighter connection was seamless, and the instant on-chain release of funds makes it incredibly reliable to get support when I need it. |
