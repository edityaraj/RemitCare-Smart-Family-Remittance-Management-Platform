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
