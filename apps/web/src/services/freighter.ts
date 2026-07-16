// @ts-nocheck
import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

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
  const { isConnected: connected } = await isConnected();
  if (!connected) throw new FreighterNotInstalledError();
}

export async function connectWallet(): Promise<string> {
  await ensureFreighterInstalled();

  const { isAllowed: allowed } = await isAllowed();
  if (!allowed) await setAllowed();

  const access = await requestAccess();
  if (access.error) throw new Error(access.error);

  const network = await getNetwork();
  if (network.networkPassphrase && !network.network?.includes("TESTNET")) {
    throw new WrongNetworkError("TESTNET", network.network ?? "unknown");
  }

  const { address, error } = await getAddress();
  if (error) throw new Error(error);
  return address;
}

export async function signXdr(xdr: string, networkPassphrase: string) {
  const result = await signTransaction(xdr, { networkPassphrase });
  if (result.error) throw new Error(result.error);
  return result.signedTxXdr;
}

export function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
