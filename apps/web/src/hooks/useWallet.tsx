import { createContext, useContext, useState, type ReactNode } from "react";
import { connectWallet, FreighterNotInstalledError, WrongNetworkError } from "@/services/freighter";
import { toast } from "sonner";

interface WalletContextValue {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  async function connect() {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      toast.success("Freighter wallet connected");
    } catch (err) {
      if (err instanceof FreighterNotInstalledError) {
        toast.error("Freighter isn't installed. Install it from freighter.app to continue.");
      } else if (err instanceof WrongNetworkError) {
        toast.error(err.message + " Switch Freighter to Testnet.");
      } else {
        toast.error(err instanceof Error ? err.message : "Wallet connection failed");
      }
    } finally {
      setConnecting(false);
    }
  }

  return <WalletContext.Provider value={{ address, connecting, connect }}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
