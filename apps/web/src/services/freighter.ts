import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit";
import { Networks } from "@stellar/stellar-sdk";

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
  // Talk directly to the Freighter browser extension via window.freighter
  // This bypasses @stellar/freighter-api package which MetaMask can intercept
  const freighter = (window as any).freighter;

  if (!freighter) {
    throw new FreighterNotInstalledError();
  }

  // Check network first
  try {
    const networkInfo = await freighter.getNetworkDetails();
    const walletPassphrase: string = networkInfo?.networkPassphrase ?? networkInfo?.network ?? "";
    if (walletPassphrase && walletPassphrase !== Networks.TESTNET) {
      throw new WrongNetworkError(walletPassphrase);
    }
  } catch (e: any) {
    if (e instanceof WrongNetworkError) throw e;
    // getNetworkDetails failed — proceed optimistically
  }

  // Sign the transaction directly via the extension
  const { publicKey } = await freighter.requestAccess();
  const result = await freighter.signTransaction(xdr, {
    networkPassphrase,
    accountToSign: publicKey,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result.signedTransaction ?? result;
}

export function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
