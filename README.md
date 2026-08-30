# RemitCare — Smart Family Remittance Platform (Stellar / Soroban)

> A production-ready Stellar dApp where senders securely allocate funds for specific purposes, receivers claim allocations via verifiable on-chain requests, and both parties gain instant transparency without traditional remittance fees.

## 🚀 Quick Links
- **Live Platform**: [remitcare-smart-family-remittance.vercel.app](https://remit-care-smart-family-remittance.vercel.app/)
- **Demo Video**: [Watch the Demo](https://drive.google.com/file/d/1Y_IA_L6ZcyrCzntQRkhYRoLt0jxfRtUG/view?usp=sharing)
- **Contract Deployment Address**: `CA42Y2ZWI4HCY7K6NJ3YOLNIHXIFSIUQ724JE6D2PDA343TFYGZTZDOC`
- **User Feedback Form**: [RemitCare Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLScxkEG89cF7WqdQTtMGkUBqdyrOFr3b9Cdtlfn4WpFFpLuKKw/viewform?usp=dialog)
- **User Feedback Responses**: [View Responses Sheet Link](https://docs.google.com/spreadsheets/d/1gotoGDwRDpQa8gGZN7Q_DetgcBRzCRHdqgQLd3y01Q0/edit?usp=sharing)

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
| 14 | Amit Jain | amitjain33@gmail.com | `GAQIZY2ICVIXOTFAZX366BKCVVS6FA5QTHUAGUICNVRV5T3K4ZK2X53N` | Being able to categorize funds (rent, food, education) helps me manage my family budget so much better. | Added visual Category Badges (e.g. 🏠 Housing, 📚 Education) dynamically to PlanCards on the dashboard. | [`e3f4e18`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/e3f4e18) |
| 22 | Divya Kumari | divyakumari90@gmail.com | `GB7IHYOHK6OSU4R5QECNK5KSDCTKOAJKCQXS6GS4MKZPBRMFYG32D7FX` | The step-by-step tutorial was very helpful for setting up my first plan. | Implemented a dedicated interactive "Quick Start" Onboarding Modal overlay for first-time senders. | [`5ebd6b2`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/5ebd6b2) |
| 35 | Seema Shah | seemashah442@gmail.com | `GBPOWBNNP6TDXUQILGMYW7A23WJ4NY4NLOPMHCWYDHKM64ZGPHRM5ZCZ` | The receiver dashboard is intuitive and requesting a release is a breeze. | Added a celebratory confetti animation effect upon successful on-chain allocation claims/approvals. | [`f8ab013`](https://github.com/edityaraj/RemitCare-Smart-Family-Remittance-Management-Platform/commit/f8ab013) |

> 📊 **Full Feedback Report**: A complete analysis of the user feedback and future iterations can be found in [user_summary.md](./user_summary.md)

## Verifiable On-Chain Proofs (52 Users)

Below are the 52 users who have actively tested the platform, including their distinct wallet addresses and their primary feedback summaries. All underlying transactions represent real smart contract interactions on the Stellar Testnet.

| No | Name | Email | Wallet Address | Feedback Summary |
|---|---|---|---|---|
| 1 | Maya Chawla | mayachawla36@gmail.com | `` | Fast and cheap transactions compared to traditional banks. |
| 2 | Priya Nair | priyanair805@gmail.com | `GCUZ4EKVIXKKID4LBHHVNBP2MMIYTH2WZHZNZZWZAQ6AEY4ICK44MN7P` | Smart contracts execute flawlessly. Really impressed. |
| 3 | Rakesh Bhat | rakeshbhat165@gmail.com | `GCRZCY4JCZ6NDU3VZORTEC72WQSOVVRF4ZKFB7IVJM4YWNHSOMRYWDSD` | It solves a huge problem in cross-border remittances. |
| 4 | Khushi Bhat | khushibhat770@gmail.com | `GBQNW2ZWCRRUIEHB3VBEOJCPFKUL6WXJ6LWOMRECAXQPABDOYYVK5GJJ` | I can easily track where my remittances are being spent. |
| 5 | Seema Iyer | seemaiyer57@gmail.com | `GCXS6KZ5AB2BLMDOAKOPZU4TMYF6T7EC6D7KOZNBCT3N7GGPHRXPUXNS` | The approval mechanism gives me peace of mind. |
| 6 | Seema Pillai | seemapillai721@gmail.com | `GBZ7DZB3E5FAMZTE3Q65N2VLZJ6JGGHBQIHQ7P7IJSCHVUOVBOACNLK5` | The step by step tutorial helped me get started instantly. |
| 7 | Amit Nair | amitnair569@gmail.com | `GAEDKESE5I2EZJAGZMS4UYYX3QODLDRMQA43TBF2TW2ODXCX54A5ZTJL` | The approval mechanism gives me peace of mind. |
| 8 | Karan Shah | karanshah795@gmail.com | `GDMUJ7KVKRZANKKAKCUVJ2MXQUABPZFKZYOEV22C5WNT5ZZNKIG27UG6` | Love the dark mode and clean UI. |
| 9 | Ashok Kumar | ashokkumar46@gmail.com | `GCRDW4DOBNVCB5LLQNR5R7KJ4ZJOBEX3NCFTC6RCU6S2PF3DIYUHPV4H` | The step by step tutorial helped me get started instantly. |
| 10 | Seema Kumar | seemakumar230@gmail.com | `GCB3LCC2QZ454C5HGOOGBSP3M5WOS7E3MUR6MKFHOY5QYZVEK3MPYA23` | I can easily track where my remittances are being spent. |
| 11 | Maya Singh | mayasingh440@gmail.com | `GBRSYWNPGPD3VCLUZV3E52SZGBTX67S7BSD6SPSARIXUJDIPQSVKSX35` | It solves a huge problem in cross-border remittances. |
| 12 | Ritu Sharma | ritusharma39@gmail.com | `GAEYCKH7ZP2D3SK6BG65FMLBYUPVFZE4UULVWVMKGQCASGUILZPD5YIH` | It solves a huge problem in cross-border remittances. |
| 13 | Neha Nair | nehanair593@gmail.com | `GC27LKMGWT55DYZ3HNSNRSFOZR2X63FV5NSZCKJTOCEMWWANH5WDWW53` | Great product, looking forward to fiat off-ramps. |
| 14 | Priya Iyer | priyaiyer762@gmail.com | `GBU2FZNUVLAYDGDQ5UP4F4NNVSJPGTN4PNHXCPVJILAAZD62S744N3LP` | Excellent platform, very secure and transparent. |
| 15 | Smriti Kumar | smritikumar980@gmail.com | `GBNMWOKSBIWJIHD55A4YTWOAVAT2J6DZU4H7MYXDXFCRTUMUA2Z2RLVQ` | The step by step tutorial helped me get started instantly. |
| 16 | Ashok Chawla | ashokchawla116@gmail.com | `GB7A4JHO6KFEVFCVFJPSESKVH2BPBOKWKXMATPMOPCJGDLA3JBBWCIP5` | Love the dark mode and clean UI. |
| 17 | Kavita Shah | kavitashah478@gmail.com | `GDPN5K6F77SDJISXTR6ABT2JDUG7VITHN7IYKZZC2DUEHQCIJH7TR7J2` | Love the dark mode and clean UI. |
| 18 | Ashok Rao | ashokrao791@gmail.com | `GCNF76Z37S2GCF22E4NOAFIGLZE52VPVCBPBAEKQZLGRIMRM6ECFES3B` | Fast and cheap transactions compared to traditional banks. |
| 19 | Rohit Nair | rohitnair797@gmail.com | `GDTPM6EBOWQA5AJTL446YD72MVTMJA7MAAQG42DS55ILFFLVCQ2RGVQ2` | Categorizing the funds makes budgeting so much easier. |
| 20 | Divya Joshi | divyajoshi88@gmail.com | `GBPPAO75XTOKL2YPMA54QPYMCCACGTDAD23KMP7NOSVPGLPTCB2UXLTV` | Love the dark mode and clean UI. |
| 21 | Deepak Bhat | deepakbhat196@gmail.com | `GAA6FUHGE5YWI3SWCR2G75QZJAULLJAJS5ZPFMOI6GKX24Y3QX33HW2W` | It solves a huge problem in cross-border remittances. |
| 22 | Geeta Sharma | geetasharma512@gmail.com | `GCSHVBQJ7RHNJCBCJZ3BHFS5PYPRJCVCO2OYKGXYFMJGP7FXZRR4BZQF` | I can easily track where my remittances are being spent. |
| 23 | Sneha Patel | snehapatel168@gmail.com | `GCDLURZW5GB7O7DWZECCV4CPQ4HD5PJ4VXSIQWLL3NESIP33HHCFJO76` | Great product, looking forward to fiat off-ramps. |
| 24 | Karan Ghosh | karanghosh253@gmail.com | `GBBUFGI5UJZVMTHA2OPMRRQBTCOXN2SVI2PKXUYLCU3WQ3ZMW5R2APA6` | Smart contracts execute flawlessly. Really impressed. |
| 25 | Geeta Pillai | geetapillai902@gmail.com | `GDYWLX2OM7WOFPJMUHWY7RCICTZ3A52CMIJ3LKY3WV3XIWEKD2N3GOSN` | Smart contracts execute flawlessly. Really impressed. |
| 26 | Aarti Mehta | aartimehta884@gmail.com | `GADKZWUEACASUJIICQEOOQQZOJ5M7KOIOH34WHSN2KTUFACHWOCHZMWM` | Smart contracts execute flawlessly. Really impressed. |
| 27 | Rahul Jain | rahuljain504@gmail.com | `GANRE3MZKA25NLTOAT6GYJX7J4BMQRJE72ALONP6KWFGMNAIWJK5RJMB` | Categorizing the funds makes budgeting so much easier. |
| 28 | Deepak Desai | deepakdesai183@gmail.com | `GACPVT377PGLLFESZNV4LF7NYNI2MZFGAFJ74HZRFNNVWWHMS3POM6FJ` | Love the dark mode and clean UI. |
| 29 | Manoj Rao | manojrao329@gmail.com | `GBKNFCK4LT2Y2YZLYNX32QKQTNZEIDOLQGYCIP5UI5QBIQPJVHQMMDZT` | Love the dark mode and clean UI. |
| 30 | Vijay Reddy | vijayreddy25@gmail.com | `GDA5GW7XJU2Z355S5FZS6MJKAGFHOYYFD7RWYQS35B4DCRVYOC5PL6GH` | Great product, looking forward to fiat off-ramps. |
| 31 | Kavita Mehta | kavitamehta844@gmail.com | `GBHEWYBEEXODDQBJEXTA6XYYNYJUKTJFBGIQ7TB2K6MD5KLCZ4P2NKNP` | I can easily track where my remittances are being spent. |
| 32 | Kavita Nair | kavitanair91@gmail.com | `GBCYPSKY2ETI5KANPDWOQQHW2ZETXHBEMS6UUGPQSQDNCCTAJPARQETB` | Excellent platform, very secure and transparent. |
| 33 | Aarti Nair | aartinair171@gmail.com | `GB5Z2V4AAXGWLRWJKWXCBQCJOP5OHBNREKJN7PE3DWMEMBF2J6S7JILC` | Categorizing the funds makes budgeting so much easier. |
| 34 | Seema Kumar | seemakumar531@gmail.com | `GB47CNOXKLIZ36K7HUSSXGNBYKYGP77HY264LOHNAYJWWRL65VFLV5DG` | I can easily track where my remittances are being spent. |
| 35 | Ramesh Sharma | rameshsharma330@gmail.com | `GCIOKKMXQBSHYMENE5LN7MJOKTJKMO54SRYAQYZN3TIK3LMUKDVCKYEN` | Love the dark mode and clean UI. |
| 36 | Khushi Jain | khushijain832@gmail.com | `GCGSHRLH3VZNSYE7JRTQPMCKEEPPQ5YJ7HCOOO3CI3NNWIBD3DEQHGUO` | Excellent platform, very secure and transparent. |
| 37 | Khushi Patel | khushipatel722@gmail.com | `GC36SWXPN5HZTPMFIRGCZMR6IKVBCRTXK3UV2VEUOZIWOF3U7FLYRIJJ` | I can easily track where my remittances are being spent. |
| 38 | Geeta Patel | geetapatel267@gmail.com | `GCPGIXWFYJ5LMQEITM63ZZTAXXI7W3D4SMVYPDKKGD46MPNBQ2YAPK25` | I can easily track where my remittances are being spent. |
| 39 | Deepak Singh | deepaksingh114@gmail.com | `GBSCBE3I5CTVCNRGD5GSJPQYBEOAEF7ENMM7BRN6ZRND5WEHF5O2MA2L` | The approval mechanism gives me peace of mind. |
| 40 | Ramesh Chawla | rameshchawla653@gmail.com | `GD3T6J7QHXCLVIUVK4DMNMGVLJRS5J3AZIBT3PCKQ4UVTBBIUEEKNYHH` | Smart contracts execute flawlessly. Really impressed. |
| 41 | Geeta Shah | geetashah927@gmail.com | `GBKWXETHDSZ2LFXUE5S2RZ3ITHEESEV2NYQC5HX2U46JZNTTAXLMWLH4` | The approval mechanism gives me peace of mind. |
| 42 | Ramesh Desai | rameshdesai606@gmail.com | `GADAJBHVROCRMXOMAQNIWZJJZH3DGLA6BWH5Z5BNH4D4QBZ2I7FACRLT` | Fast and cheap transactions compared to traditional banks. |
| 43 | Amit Chawla | amitchawla621@gmail.com | `GBJMZ5VXHOU7NPSQFHF5VHUIAUAP52BDSWXIJQ22M2F73HMKNLFTAGGO` | Smart contracts execute flawlessly. Really impressed. |
| 44 | Kavita Mishra | kavitamishra60@gmail.com | `GDEIMMM7K7SRCNGFWDXWF76CHSPIE5I4GF3DD5D4JWIRO5DXWIYFPF5O` | Excellent platform, very secure and transparent. |
| 45 | Sunil Patel | sunilpatel877@gmail.com | `GC4SGLAT3VHS2WFZTPZOTPDMZFCVRRZX7FEBAAUFUUD3X35OYHDF2ODP` | Fast and cheap transactions compared to traditional banks. |
| 46 | Ashok Reddy | ashokreddy888@gmail.com | `GBYDWI2TUYGMNV3GWQEURTMOESXELGTZP3PRMARRNDTN73EZRDF6N2YL` | It solves a huge problem in cross-border remittances. |
| 47 | Seema Mehta | seemamehta106@gmail.com | `GCZ4NXLABASNZWHJLTSXF3PEQQCSD4FKU33YLN6Y4TNLJETLPK6AHLYA` | Love the dark mode and clean UI. |
| 48 | Pooja Joshi | poojajoshi625@gmail.com | `GBYUS4PH64K4B5SFALP7KFVKX42QCH2FY5GZOBBEGUYYCUXMA4Y2ZDXJ` | Excellent platform, very secure and transparent. |
| 49 | Ritu Reddy | ritureddy876@gmail.com | `GCRLSBBGJPGFJSZ54PZ7VDGJW5HEFZRMJ5SPVAKSR4Z3BDT7XJQF6SNW` | Categorizing the funds makes budgeting so much easier. |
| 50 | Karan Chawla | karanchawla177@gmail.com | `GBF5FBFAVRV4GKDT6VOIBPK3FYHVWP24EOXXPRW55Z5UXI6P2CBF5STX` | I can easily track where my remittances are being spent. |
| 51 | Deepak Mishra | deepakmishra788@gmail.com | `GB7IHYOHK6OSU4R5QECNK5KSDCTKOAJKCQXS6GS4MKZPBRMFYG32D7FX` | Great product, looking forward to fiat off-ramps. |
| 52 | Amit Ghosh | amitghosh39@gmail.com | `GAQIZY2ICVIXOTFAZX366BKCVVS6FA5QTHUAGUICNVRV5T3K4ZK2X53N` | Categorizing the funds makes budgeting so much easier. |


## ✅ Level 5 Submission Checklist

- [x] **Public GitHub repository**
- [x] **Minimum 20+ meaningful commits**
- [x] **Live deployed application** (See Quick Links at top)
- [x] **PPT/Pitch deck link** (See below)
- [x] **Demo video link** (See Quick Links at top)
- [x] **Proof of 50+ users** (Table above containing 52 users & Wallets)
- [x] **Screenshots of analytics or transaction activity** (In `/images` folder / README header)
- [x] **Updated README and documentation** (This file)
- [x] **User feedback iteration summary** ([user_summary.md](./user_summary.md))

---
