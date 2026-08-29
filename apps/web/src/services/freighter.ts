import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit";
import freighterApi from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";

// Only load Freighter — no MetaMask/Binance/WalletConnect broadcast errors
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
  constructor() {
    super(
      "Your Freighter wallet is on the WRONG network!\n\nPlease open Freighter, click the network name at the top, and switch to 'Test SDF Network' (Testnet). Then try again."
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
  // Verify Freighter is on the right network before we even try signing
  try {
    const currentNetwork = await freighterApi.getNetwork();
    // getNetwork() returns a string like "TESTNET" or the passphrase
    if (
      currentNetwork &&
      currentNetwork !== "TESTNET" &&
      currentNetwork !== Networks.TESTNET
    ) {
      throw new WrongNetworkError();
    }
  } catch (e: any) {
    if (e instanceof WrongNetworkError) throw e;
    // Otherwise Freighter API threw (not connected, etc.) — proceed optimistically
  }

  // Use @stellar/freighter-api directly for signing — full control, no noise
  const { address } = await kit.getAddress();
  const signedTxXdr = await freighterApi.signTransaction(xdr, {
    networkPassphrase,
    accountToSign: address,
  });

  if (!signedTxXdr) {
    throw new Error("Signing was cancelled or failed in Freighter.");
  }

  return signedTxXdr;
}

export function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
