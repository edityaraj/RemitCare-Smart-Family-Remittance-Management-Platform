import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { connectWallet, FreighterNotInstalledError, WrongNetworkError } from "@/services/freighter";
import { fetchNativeBalance, subscribeToAccountUpdates } from "@/services/stellar";
import { toast } from "sonner";

interface WalletContextValue {
  address: string | null;
  balance: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("remitcare_wallet_address");
    if (saved) {
      setAddress(saved);
    }
  }, []);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }

    let isSubscribed = true;
    let closeStream: (() => void) | undefined;

    async function loadBalance() {
      const bal = await fetchNativeBalance(address!);
      if (isSubscribed) setBalance(bal);
    }

    loadBalance();

    closeStream = subscribeToAccountUpdates(address, () => {
      loadBalance();
    });

    return () => {
      isSubscribed = false;
      if (closeStream) closeStream();
    };
  }, [address]);

  async function connect() {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      localStorage.setItem("remitcare_wallet_address", addr);
      toast.success("Wallet connected");
    } catch (err: any) {
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

  function disconnect() {
    setAddress(null);
    setBalance(null);
    localStorage.removeItem("remitcare_wallet_address");
    toast.success("Wallet disconnected");
  }

  return (
    <WalletContext.Provider value={{ address, balance, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
