import { rpc, TransactionBuilder, Networks, BASE_FEE } from "@stellar/stellar-sdk";

const RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL as string;
export const NETWORK_PASSPHRASE = Networks.TESTNET;

export const sorobanServer = new rpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith("http://") });

export async function buildTransaction(sourceAccount: string, operation: any) {
  const account = await sorobanServer.getAccount(sourceAccount);
  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();
}

export async function submitTransaction(signedXdr: string) {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await sorobanServer.sendTransaction(tx);
  if (sendResult.status === "ERROR") {
    throw new Error("Transaction submission failed");
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
