import { Client, networks } from "remitcare-contract";
import { Buffer } from "buffer";

export const contractClient = new Client({
  ...networks.testnet,
  rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL as string,
});

export function padId(id: string): Buffer {
  const buf = Buffer.alloc(32);
  buf.write(id, 0, "utf-8");
  return buf;
}

export async function buildFundPlanTx(planId: string, amount: string, publicKey: string) {
  const tx = await contractClient.fund_plan(
    { plan_id: padId(planId), amount: BigInt(amount) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

export async function buildCreateAllocationTx(
  planId: string,
  allocationId: string,
  purpose: string,
  amount: string,
  publicKey: string
) {
  const tx = await contractClient.create_allocation(
    {
      plan_id: padId(planId),
      allocation_id: padId(allocationId),
      purpose_hash: padId(purpose),
      amount: BigInt(amount),
      release_at: 0n,
    },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

export async function buildRequestReleaseTx(allocationId: string, publicKey: string) {
  const tx = await contractClient.request_release(
    { allocation_id: padId(allocationId) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

export async function buildApproveReleaseTx(allocationId: string, publicKey: string) {
  const tx = await contractClient.approve_release(
    { allocation_id: padId(allocationId) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

export async function buildClaimAllocationTx(allocationId: string, publicKey: string) {
  const tx = await contractClient.claim_allocation(
    { allocation_id: padId(allocationId) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

export async function buildCancelAllocationTx(allocationId: string, publicKey: string) {
  const tx = await contractClient.cancel_allocation(
    { allocation_id: padId(allocationId) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}
