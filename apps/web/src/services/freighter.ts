import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit";
import { Networks, TransactionBuilder, Transaction } from "@stellar/stellar-sdk";
import { getNetworkDetails, requestAccess, signTransaction } from "@stellar/freighter-api";

// Only load Freighter — avoids MetaMask/Binance broadcast channel errors
export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule()],
});

export class FreighterNotInstalledError extends Error {
  constructor() {
    super("Freighter wallet extension is not installed.");
  }
}

export class WrongNetworkError extends Error {
  constructor(actual: string) {
    super(
      `Your Freighter wallet is on: "${actual}".\n\nPlease open Freighter → click network name → switch to "Test SDF Network" (Testnet). Then try again.`
    );
  }
}

export async function ensureFreighterInstalled() {
  // handled by kit
}

export async function connectWallet(): Promise<string> {
  const { address } = await kit.getAddress();
  return address;
}

export async function signXdr(xdr: string, networkPassphrase: string): Promise<string> {
  // Check network first
  try {
    const networkInfo = await getNetworkDetails();
    const walletPassphrase: string = networkInfo?.networkPassphrase ?? networkInfo?.network ?? "";
    if (walletPassphrase && walletPassphrase !== Networks.TESTNET) {
      throw new WrongNetworkError(walletPassphrase);
    }
  } catch (e: any) {
    if (e instanceof WrongNetworkError) throw e;
    // getNetworkDetails failed — proceed optimistically
  }

  // Get the ACTIVE account in Freighter
  const activeKey = await requestAccess();
  if (!activeKey) throw new FreighterNotInstalledError();

  // Extract source account from XDR to ensure it matches Freighter's active account.
  // Mismatches are the #1 cause of txBadAuth (-6).
  const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase) as Transaction;
  if (tx.source !== activeKey) {
    throw new Error(`Account mismatch! Please open Freighter and switch to account ${shortenAddress(tx.source)} to sign.`);
  }

  // Use freighter-api directly because it natively handles Soroban auth entries
  const result: any = await signTransaction(xdr, {
    networkPassphrase,
    accountToSign: activeKey,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result.signedTransaction ?? result.signedTxXdr ?? result;
}

export function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
