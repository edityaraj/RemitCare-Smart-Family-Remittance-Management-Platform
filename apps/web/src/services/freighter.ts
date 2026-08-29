import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit";

export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export class FreighterNotInstalledError extends Error {
  constructor() {
    super("Freighter wallet extension is not installed.");
  }
}

export class WrongNetworkError extends Error {
  constructor(expected: string, actual: string) {
    super(`Wrong network: expected ${expected}, wallet is on ${actual}.`);
  }
}

export async function ensureFreighterInstalled() {
  // StellarWalletsKit handles installation prompts and checks internally
}

export async function connectWallet(): Promise<string> {
  const { address } = await kit.getAddress();
  return address;
}

export async function signXdr(xdr: string, networkPassphrase: string) {
  // Verify the wallet is on the correct network before signing
  try {
    const { networkPassphrase: walletPassphrase } = await kit.getNetwork();
    if (
      walletPassphrase &&
      walletPassphrase !== networkPassphrase
    ) {
      throw new Error(
        `Your Freighter wallet is on the wrong network!\n\nPlease open Freighter and switch to Testnet, then try again.\n\nWallet network: ${walletPassphrase}`
      );
    }
  } catch (e: any) {
    // If the error is our own, rethrow it
    if (e.message?.includes("Freighter")) throw e;
    // Otherwise it's a Freighter API error (wallet not connected etc), ignore and proceed
  }

  const { address } = await kit.getAddress();
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    address,
    networkPassphrase,
  });
  return signedTxXdr;
}

export function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
