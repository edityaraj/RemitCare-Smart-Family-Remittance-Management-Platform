import { Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/services/freighter";

export default function WalletConnectButton() {
  const { address, balance, connecting, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-1.5 text-sm font-medium text-emerald-700">
        <Wallet className="h-4 w-4" />
        <span className="font-semibold">{balance ? `${parseFloat(balance).toFixed(2)} XLM` : "..."}</span>
        <span className="text-emerald-900/60 opacity-80 mx-1">|</span>
        <span className="font-mono">{shortenAddress(address)}</span>
        <button
          onClick={disconnect}
          className="ml-2 hover:bg-emerald-200/50 p-1 rounded-full transition-colors text-emerald-800"
          title="Disconnect Wallet"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald/20 disabled:opacity-60 transition-colors"
    >
      <Wallet className="h-4 w-4" />
      {connecting ? "Connecting…" : "Connect Freighter"}
    </button>
  );
}
