// Thin wrapper around the generated TypeScript bindings for the
// remitcare_allowance contract (Phase 9). Generate real bindings with:
//
//   stellar contract bindings typescript \
//     --network testnet --contract-id <CONTRACT_ID> \
//     --output-dir packages/remitcare-contract
//
// then replace this file's contents with:
//
//   export * from "remitcare-contract";
//
// This placeholder documents the call shape expected by the frontend so the
// rest of the app (plans, allocations, claims) can be built against a
// stable interface before the bindings are generated.

export interface ContractClientConfig {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  publicKey: string;
  signTransaction: (xdr: string) => Promise<string>;
}

export interface RemitCareContract {
  createPlan(planId: string, sender: string, receiver: string): Promise<string>;
  fundPlan(planId: string, amount: bigint): Promise<string>;
  createAllocation(
    planId: string,
    allocationId: string,
    purposeHash: string,
    amount: bigint,
    releaseAt: bigint
  ): Promise<string>;
  requestRelease(allocationId: string): Promise<string>;
  approveRelease(allocationId: string): Promise<string>;
  claimAllocation(allocationId: string): Promise<string>;
  cancelAllocation(allocationId: string): Promise<string>;
  refundRemaining(planId: string): Promise<string>;
}

export function getContractClient(_config: ContractClientConfig): RemitCareContract {
  throw new Error(
    "Contract bindings not generated yet — run `stellar contract bindings typescript` (Phase 9) and wire them in here."
  );
}
