/**
 * RemitCare – Soroban Smart Contract Integration
 *
 * This file is the canonical entry-point for all on-chain interactions.
 * It imports @stellar/stellar-sdk, defines the deployed contract address,
 * and exposes typed wrappers for every contract function.
 *
 * Deployed contract (Stellar Testnet):
 *   CA42Y2ZWI4HCY7K6NJ3YOLNIHXIFSIUQ724JE6D2PDA343TFYGZTZDOC
 */

import {
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { Client, networks } from "remitcare-contract";
import { Buffer } from "buffer";

// ─── Constants ────────────────────────────────────────────────────────────────

/** The deployed RemitCare Soroban contract address on Stellar Testnet. */
export const CONTRACT_ID = networks.testnet.contractId;
// = "CA42Y2ZWI4HCY7K6NJ3YOLNIHXIFSIUQ724JE6D2PDA343TFYGZTZDOC"

export const NETWORK_PASSPHRASE = Networks.TESTNET;
// = "Test SDF Network ; September 2015"

const RPC_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_STELLAR_RPC_URL) ||
  "https://soroban-testnet.stellar.org";

// ─── Soroban RPC client ───────────────────────────────────────────────────────

export const sorobanServer = new rpc.Server(RPC_URL, {
  allowHttp: RPC_URL.startsWith("http://"),
});

// ─── Contract client (generated bindings) ─────────────────────────────────────

/**
 * Typed contract client generated from the on-chain WASM spec.
 * Uses the contractId defined in `remitcare-contract` package.
 */
export const contractClient = new Client({
  ...networks.testnet, // { networkPassphrase, contractId }
  rpcUrl: RPC_URL,
});

// ─── Helper utilities ─────────────────────────────────────────────────────────

/** Pad a UTF-8 string into a 32-byte Buffer (used for plan/allocation IDs). */
export function padId(id: string): Buffer {
  const buf = Buffer.alloc(32);
  buf.write(id, 0, "utf-8");
  return buf;
}

/** Convert a decimal token amount string to stroops (1 token = 10^7 stroops). */
export function toStroops(amount: string): bigint {
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) throw new Error("Invalid token amount");
  return BigInt(Math.floor(parsed * 1e7));
}

// ─── Contract call builders ───────────────────────────────────────────────────

/**
 * Build a `create_plan` transaction XDR.
 * Calls the RemitCare contract to register a new remittance plan on-chain.
 *
 * @param planId    - Unique plan identifier (padded to 32 bytes)
 * @param sender    - Stellar address of the sender (G…)
 * @param receiver  - Stellar address of the receiver (G…)
 * @param publicKey - Freighter public key used to sign the transaction
 */
export async function buildCreatePlanTx(
  planId: string,
  sender: string,
  receiver: string,
  publicKey: string
): Promise<string> {
  const tx = await contractClient.create_plan(
    { plan_id: padId(planId), sender, receiver },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

/**
 * Build a `fund_plan` transaction XDR.
 * Transfers tokens into the plan escrow on-chain.
 *
 * @param planId    - The plan's 32-byte ID
 * @param amount    - Decimal token amount (e.g. "10.5")
 * @param publicKey - Signer's public key
 */
export async function buildFundPlanTx(
  planId: string,
  amount: string,
  publicKey: string
): Promise<string> {
  const tx = await contractClient.fund_plan(
    { plan_id: padId(planId), amount: toStroops(amount) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

/**
 * Build a `create_allocation` transaction XDR.
 * Allocates a portion of the plan to a specific purpose.
 */
export async function buildCreateAllocationTx(
  planId: string,
  allocationId: string,
  purpose: string,
  amount: string,
  publicKey: string
): Promise<string> {
  const tx = await contractClient.create_allocation(
    {
      plan_id: padId(planId),
      allocation_id: padId(allocationId),
      purpose_hash: padId(purpose),
      amount: toStroops(amount),
      release_at: 0n,
    },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

/**
 * Build a `request_release` transaction XDR.
 * Called by the receiver to request release of their allocation.
 */
export async function buildRequestReleaseTx(
  allocationId: string,
  publicKey: string
): Promise<string> {
  const tx = await contractClient.request_release(
    { allocation_id: padId(allocationId) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

/**
 * Build an `approve_release` transaction XDR.
 * Called by the sender to approve a receiver's release request.
 */
export async function buildApproveReleaseTx(
  allocationId: string,
  publicKey: string
): Promise<string> {
  const tx = await contractClient.approve_release(
    { allocation_id: padId(allocationId) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

/**
 * Build a `claim_allocation` transaction XDR.
 * Called by the receiver to claim approved funds.
 */
export async function buildClaimAllocationTx(
  allocationId: string,
  publicKey: string
): Promise<string> {
  const tx = await contractClient.claim_allocation(
    { allocation_id: padId(allocationId) },
    { publicKey, fee: "100000" }
  );
  return tx.built!.toXDR();
}

// ─── Transaction submission ───────────────────────────────────────────────────

/**
 * Submit a signed XDR transaction to the Soroban RPC and poll until confirmed.
 *
 * @param signedXdr - Base64-encoded signed transaction XDR from Freighter
 * @returns The confirmed transaction hash
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await sorobanServer.sendTransaction(tx);
  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${JSON.stringify(sendResult)}`);
  }
  return pollTransaction(sendResult.hash);
}

async function pollTransaction(hash: string, attempts = 10): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const res = await sorobanServer.getTransaction(hash);
    if (res.status === "SUCCESS") return hash;
    if (res.status === "FAILED") throw new Error("Transaction failed on-chain");
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Timed out waiting for transaction confirmation");
}
