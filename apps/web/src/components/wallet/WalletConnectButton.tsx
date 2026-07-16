import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/services/freighter";

export default function WalletConnectButton() {
  const { address, connecting, connect } = useWallet();

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald/20 disabled:opacity-60"
    >
      <Wallet className="h-4 w-4" />
      {connecting ? "Connecting…" : address ? shortenAddress(address) : "Connect Freighter"}
    </button>
  );
}
