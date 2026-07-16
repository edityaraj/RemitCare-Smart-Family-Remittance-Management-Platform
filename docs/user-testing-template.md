# 10-User Testing Evidence

Fill this in with **real** Testnet interactions — never invent transaction hashes, wallet addresses, or dates. Judges typically spot-check hashes on a Testnet explorer (e.g. Stellar Expert), so fabricated evidence is both against the rules and easy to catch.

## Participants (5 senders + 5 receivers)

| # | Role | Truncated wallet | Action | Contract function | Tx hash | Explorer link | Date | Feedback submitted |
|---|------|-------------------|--------|--------------------|---------|----------------|------|---------------------|
| 1 | sender | GABC…WXYZ | Created + funded plan | create_plan / fund_plan | | | | ☐ |
| 2 | receiver | GDEF…UVWX | Requested + claimed allocation | request_release / claim_allocation | | | | ☐ |
| ... | | | | | | | | |

## How to collect this
1. Have each tester connect Freighter and complete their role's flow end to end.
2. Copy each transaction hash from Freighter's confirmation or from Stellar Expert after the tx lands.
3. Link to `https://stellar.expert/explorer/testnet/tx/<hash>` for each row.
4. Ask each tester to also submit the in-app feedback form (Section 24 of the roadmap).

Do not publish testers' full legal names, emails, or complete financial details — truncate wallet addresses as shown.
