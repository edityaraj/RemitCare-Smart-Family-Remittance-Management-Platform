# Architecture Diagram (placeholder)

Replace with your actual diagram (Figma/draw.io export or Mermaid). Suggested shape:

```
[Freighter Wallet] <--sign XDR--> [React/Vite Frontend] <--REST--> [Express API] <--> [MongoDB Atlas]
        |                                                                 |
        +-------------------- submits signed tx -------------------------+
                                     |
                                     v
                        [Stellar Testnet / Soroban RPC]
                                     |
                                     v
                    [remitcare_allowance contract + token contract]
```
