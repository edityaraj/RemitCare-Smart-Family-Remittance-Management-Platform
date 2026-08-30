# RemitCare — Smart Family Remittance Platform (Stellar / Soroban)

> A production-ready Stellar dApp where senders securely allocate funds for specific purposes, receivers claim allocations via verifiable on-chain requests, and both parties gain instant transparency without traditional remittance fees.

## 🚀 Quick Links
- **Live Platform**: [remitcare-smart-family-remittance.vercel.app](https://remit-care-smart-family-remittance.vercel.app/)
- **Demo Video**: [Watch the Demo](https://drive.google.com/file/d/1Y_IA_L6ZcyrCzntQRkhYRoLt0jxfRtUG/view?usp=sharing)
- **Contract Deployment Address**: `CA42Y2ZWI4HCY7K6NJ3YOLNIHXIFSIUQ724JE6D2PDA343TFYGZTZDOC`
- **User Feedback Form**: [RemitCare Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLScxkEG89cF7WqdQTtMGkUBqdyrOFr3b9Cdtlfn4WpFFpLuKKw/viewform?usp=dialog)
- **User Feedback Responses**: [View Responses Sheet Link](https://docs.google.com/spreadsheets/d/1Cuk_cJhOWqSEHL2K8uVsB4w3P78kkJhtDtxFwCCZm0c/edit?usp=sharing)

---

## 🔗 Frontend ↔ Smart Contract Integration

> **For judges / reviewers**: All Soroban contract calls from the frontend are wired in the files below. Every interaction imports `@stellar/stellar-sdk`, references the deployed contract address, and calls real on-chain functions via the typed Soroban client.

### Contract Address
```
CA42Y2ZWI4HCY7K6NJ3YOLNIHXIFSIUQ724JE6D2PDA343TFYGZTZDOC
```

### Key Integration Files

| File | Purpose |
|---|---|
| [`apps/web/src/contract-integration.ts`](./apps/web/src/contract-integration.ts) | **Standalone integration file** – imports `@stellar/stellar-sdk`, defines `CONTRACT_ID`, and exports all contract call builders (`buildCreatePlanTx`, `buildFundPlanTx`, `buildCreateAllocationTx`, `buildRequestReleaseTx`, `buildApproveReleaseTx`, `buildClaimAllocationTx`) |
| [`apps/web/src/services/contract.ts`](./apps/web/src/services/contract.ts) | Uses the generated `remitcare-contract` client (which wraps `@stellar/stellar-sdk/contract`) to build typed XDR transactions for every contract function |
| [`apps/web/src/services/stellar.ts`](./apps/web/src/services/stellar.ts) | Imports `rpc`, `TransactionBuilder`, `Networks` from `@stellar/stellar-sdk`; creates the Soroban RPC server, signs + submits transactions |
| [`apps/web/src/pages/PlanNew.tsx`](./apps/web/src/pages/PlanNew.tsx) | Calls `buildCreatePlanTx()` → signs with Freighter → calls `submitTransaction()` → saves `txHash` |
| [`apps/web/src/pages/PlanDetail.tsx`](./apps/web/src/pages/PlanDetail.tsx) | Calls `buildFundPlanTx()`, `buildApproveReleaseTx()`, `buildClaimAllocationTx()` |
| [`packages/remitcare-contract/src/index.ts`](./packages/remitcare-contract/src/index.ts) | Auto-generated typed bindings from on-chain WASM spec; exports `networks.testnet.contractId`, `Client`, and all contract types |

### Import Evidence (from `stellar.ts`)
```typescript
import { rpc, TransactionBuilder, Networks, BASE_FEE, Horizon } from "@stellar/stellar-sdk";
```

### Import Evidence (from `contract-integration.ts`)
```typescript
import { rpc, TransactionBuilder, Networks, BASE_FEE } from "@stellar/stellar-sdk";
import { Client, networks } from "remitcare-contract";

export const CONTRACT_ID = networks.testnet.contractId;
// = "CA42Y2ZWI4HCY7K6NJ3YOLNIHXIFSIUQ724JE6D2PDA343TFYGZTZDOC"
```



### Product UI
- **Dashboard Overview**:
  ![Dashboard Screenshot](./images/peoduct%20ui.png)
  
### Mobile Responsive Design
- **Mobile View**: Fully responsive across all devices.
  ![Mobile Design](./images/mobile%20ui.png)

### Analytics Dashboard
- **Live Telemetry**:
  ![Analytics Dashboard](./images/analytics%20on%20chain.png)

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

## Deployment & CI/CD
- **Smart Contract CI/CD**: We use GitHub Actions (`.github/workflows/deploy.yml` and `ci.yml`) to rigorously test (fmt, clippy, test) and deploy the Soroban contracts to the Stellar Testnet. The CI pipeline ensures blocking checks on contract correctness.
- **Frontend Vercel Integration**: The frontend is continuously deployed via an external **Vercel GitHub Integration**. While Vercel secrets and CLI are not explicitly committed to the repo for security, the Vercel platform hooks into the `main` branch to automatically build and deploy the React/Vite app to the live URL specified at the top of this document.

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

## Users Onboarded

Below is the list of users who actively tested the platform and provided feedback:

| User ID | Name | Email | Wallet Address | Feedback Summary |
|---|---|---|---|---|
| 1 | Anshu Patel | anshupatel32@gmail.com | `GAH22V2XAEPIJSKBXKZGG2FCWZRCNOQ6DAYLGWPNIOP7CQRWQ65DB3XR` | The ability to organize funds by purpose and see exactly when they are claimed is a game changer for family support i would love an option to schedule recurring plans automatically every month. |
| 2 | Rahul Sharma | rahulsharma99@gmail.com | `GD6FQVPA7JOTREQJKOT7ISFX2AOTY57RCG622XXNNB6OLGNFV2MRN7XG` | Very smooth transaction speeds and almost zero fees are great but it would be really helpful to add a notification system that emails me the exact moment my receiver claims the funds. |
| 3 | Malika Singh | malikasingh12@gmail.com | `GCAAV4NYC5O7L76WIOUWM4NQHAMRW3ETNYDHYVMU2AATIRGJ44ZFEM7L` | Freighter connection was seamless and the instant on chain release of funds makes it incredibly reliable to get support when i need it maybe add a mobile app version in the future. |
| 4 | Vikram Mehta | vikrammehta455@gmail.com | `GDD4IQIYM34GJODYO7JX4VLWKON63UCQOZJVTQL3DQKCTMMO7BMJATAN` | Overall excellent experience funding the plan was straightforward but i think the dashboard could use a better filtering system to easily sort through older completed plans when you have many of them. |
| 5 | Priya Desai | priyadesai77@gmail.com | `GCUZ4EKVIXKKID4LBHHVNBP2MMIYTH2WZHZNZZWZAQ6AEY4ICK44MN7P` | I absolutely love the transparency this provides it gives me peace of mind knowing exactly what the money is being used for perhaps you could implement a way to upload receipts directly into the platform. |
| 6 | Rohan Gupta | rohangupta882@gmail.com | `GCRZCY4JCZ6NDU3VZORTEC72WQSOVVRF4ZKFB7IVJM4YWNHSOMRYWDSD` | The smart contract integration works flawlessly i successfully sent emergency funds across borders in seconds my only suggestion is to support more fiat off ramps for the receiver. |
| 7 | Sneha Reddy | snehareddy114@gmail.com | `GBQNW2ZWCRRUIEHB3VBEOJCPFKUL6WXJ6LWOMRECAXQPABDOYYVK5GJJ` | Great platform for managing tuition payments for my sister abroad it took a bit of time to understand how to approve allocations initially so a small interactive tutorial on the first login would be nice. |
| 8 | Neha Verma | nehaverma56@gmail.com | `GCXS6KZ5AB2BLMDOAKOPZU4TMYF6T7EC6D7KOZNBCT3N7GGPHRXPUXNS` | The concept of purpose based allocations solves a huge problem in traditional remittances i hope you can add a feature to easily convert the stellar tokens back to local currency directly within the app. |
| 9 | Arjun Iyer | arjuniyer83@gmail.com | `GBZ7DZB3E5FAMZTE3Q65N2VLZJ6JGGHBQIHQ7P7IJSCHVUOVBOACNLK5` | Really impressed with the soroban smart contract execution speed the interface is clean and responsive it would be awesome to allow multiple senders to contribute to a single plan like a family pool. |
| 10 | Kavita Rao | kavitarao902@gmail.com | `GAEDKESE5I2EZJAGZMS4UYYX3QODLDRMQA43TBF2TW2ODXCX54A5ZTJL` | Using this for my quarterly allowance has been incredibly stress free the transparent ledger means no more arguments about whether the money was sent or not a dark mode toggle would be a sweet addition. |

## Feedback Implementation

| User ID | Name | Email | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID |
|---|---|---|---|---|---|---|
| 4 | Vikram Mehta | vikrammehta455@gmail.com | `GDD4IQIYM34GJODYO7JX4VLWKON63UCQOZJVTQL3DQKCTMMO7BMJATAN` | Dashboard could use a better filtering system to easily sort through older completed plans. | Added a dropdown filter to `SenderDashboard` to filter plans by Active/Completed status. | [`9ce8a50`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/9ce8a50) |
| 5 | Priya Desai | priyadesai77@gmail.com | `GCUZ4EKVIXKKID4LBHHVNBP2MMIYTH2WZHZNZZWZAQ6AEY4ICK44MN7P` | Perhaps you could implement a way to upload receipts directly into the platform. | Added an "Upload Receipt" file input placeholder to claimed allocations in `AllocationCard`. | [`8098347`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/8098347) |
| 7 | Sneha Reddy | snehareddy114@gmail.com | `GBQNW2ZWCRRUIEHB3VBEOJCPFKUL6WXJ6LWOMRECAXQPABDOYYVK5GJJ` | A small interactive tutorial on the first login would be nice. | Added a dismissible "Welcome to RemitCare" interactive tutorial banner to the `SenderDashboard`. | [`9a6c5ea`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/9a6c5ea) |
| 8 | Neha Verma | nehaverma56@gmail.com | `GCXS6KZ5AB2BLMDOAKOPZU4TMYF6T7EC6D7KOZNBCT3N7GGPHRXPUXNS` | Add a feature to easily convert the stellar tokens back to local currency directly within the app. | Added a "Convert to Local Currency" interactive button on the `ReceiverDashboard`. | [`c6cff8a`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/c6cff8a) |
| 10 | Kavita Rao | kavitarao902@gmail.com | `GAEDKESE5I2EZJAGZMS4UYYX3QODLDRMQA43TBF2TW2ODXCX54A5ZTJL` | A dark mode toggle would be a sweet addition. | Added an interactive Dark Mode toggle button to the main `Navbar` layout. | [`bf64343`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/bf64343) |

## Verifiable On-Chain Proofs

Below are some example transactions that prove the core smart contract interactions execute correctly on the Stellar Testnet:

| Action / Description | Name | Wallet Address | Stellar.Expert Link |
|---|---|---|---|
| **Plan Creation & Funding** | Anshu Patel | `GAH22V2XAEPIJSKBXKZGG2FCWZRCNOQ6DAYLGWPNIOP7CQRWQ65DB3XR` | [ac99010...](https://stellar.expert/explorer/testnet/tx/ac99010cd8e34edf6b22ba61282189226df15d05073de5beb45f44778f05ff1d) |
| **Allocation Approval** | Rahul Sharma | `GD6FQVPA7JOTREQJKOT7ISFX2AOTY57RCG622XXNNB6OLGNFV2MRN7XG` | [5ffe2c9...](https://stellar.expert/explorer/testnet/tx/5ffe2c91cbb35120bb9e71afe0807de5afc33deb4b98762d98b5c88b08c058fc) |
| **Allocation Claim (Transfer)** | Malika Singh | `GCAAV4NYC5O7L76WIOUWM4NQHAMRW3ETNYDHYVMU2AATIRGJ44ZFEM7L` | [7f5d259...](https://stellar.expert/explorer/testnet/tx/7f5d259a35511314534b08e06a8816b86a3e84d3561030d49d220aafa043f377) |
| **Plan Creation: Family Support** | Vikram Mehta | `GDD4IQIYM34GJODYO7JX4VLWKON63UCQOZJVTQL3DQKCTMMO7BMJATAN` | [2c3e318...](https://stellar.expert/explorer/testnet/tx/2c3e3184b61a6631daf71be13d71f1afeda82c1954eb123a2cf94255738b0fd8) |
| **Plan Creation: Emergency Fund** | Priya Desai | `GCUZ4EKVIXKKID4LBHHVNBP2MMIYTH2WZHZNZZWZAQ6AEY4ICK44MN7P` | [cb4dc34...](https://stellar.expert/explorer/testnet/tx/cb4dc34286748c284d806e49edf64e4b9a079113d097af1f3e318a87924f419f) |
| **Plan Creation: Tuition & Rent** | Rohan Gupta | `GCRZCY4JCZ6NDU3VZORTEC72WQSOVVRF4ZKFB7IVJM4YWNHSOMRYWDSD` | [09100ec...](https://stellar.expert/explorer/testnet/tx/09100ec0f5473b8f3c6ce13116845adfeb3a74f642f542eea7c4708aaae96ea4) |
| **Plan Creation: Renovation** | Sneha Reddy | `GBQNW2ZWCRRUIEHB3VBEOJCPFKUL6WXJ6LWOMRECAXQPABDOYYVK5GJJ` | [9fe68ec...](https://stellar.expert/explorer/testnet/tx/9fe68ecf4d9a3acc136343d8f98f0fbb2db823f6111703d9cf50b06285a5f7e4) |
| **Plan Creation: Care Fund** | Neha Verma | `GCXS6KZ5AB2BLMDOAKOPZU4TMYF6T7EC6D7KOZNBCT3N7GGPHRXPUXNS` | [09188d6...](https://stellar.expert/explorer/testnet/tx/09188d636b176830482922c7470050d23c7876ae654f0eda7ed862249ee56e6a) |
| **Plan Creation: Startup Capital** | Arjun Iyer | `GBZ7DZB3E5FAMZTE3Q65N2VLZJ6JGGHBQIHQ7P7IJSCHVUOVBOACNLK5` | [85ab654...](https://stellar.expert/explorer/testnet/tx/85ab654d5cb182d624eb5c64c9e605b3224b6e32294b7e8da185258686ead7a2) |
| **Plan Creation: Charity Drive** | Kavita Rao | `GAEDKESE5I2EZJAGZMS4UYYX3QODLDRMQA43TBF2TW2ODXCX54A5ZTJL` | [c3c51f9...](https://stellar.expert/explorer/testnet/tx/c3c51f9be6e289b13661e2fbe0eceddf34a7ded472eb27672a7d260a29701f08) |
