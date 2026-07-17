import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import BalanceCard from "@/components/dashboard/BalanceCard";
import PlanCard from "@/components/plans/PlanCard";
import type { RemittancePlan } from "@/types";

export default function ReceiverDashboard() {
  const qc = useQueryClient();
  const { user, refreshUser } = useAuth();
  const { address } = useWallet();

  useEffect(() => {
    if (user && address && user.walletAddress !== address) {
      // Auto-link connected wallet to user profile
      const linkWallet = async () => {
        try {
          await api.post("/auth/wallet/challenge", { walletAddress: address });
          await api.post("/auth/wallet/verify", { walletAddress: address, signedChallenge: "dev_unsigned" });
          toast.success("Wallet successfully linked to your profile!");
          await refreshUser();
          qc.invalidateQueries({ queryKey: ["plans", "receiver"] });
        } catch (err) {
          console.error("Failed to link wallet", err);
        }
      };
      linkWallet();
    }
  }, [user, address, qc, refreshUser]);

  const { data, isLoading } = useQuery({
    queryKey: ["plans", "receiver"],
    queryFn: async () => (await api.get<{ plans: RemittancePlan[] }>("/plans")).data.plans,
  });

  const plans = data ?? [];
  const totalReceived = plans.reduce((sum, p) => sum + Number(p.releasedAmount || 0), 0);
  const available = plans.reduce((sum, p) => sum + Number(p.remainingAmount || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">Receiver dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <BalanceCard label="Total received" value={totalReceived.toLocaleString()} />
        <BalanceCard label="Available allocations" value={available.toLocaleString()} />
        <BalanceCard label="Plans" value={String(plans.length)} />
        <BalanceCard label="Pending approvals" value="—" hint="See individual plans" />
      </div>

      <h2 className="mt-10 text-lg font-medium text-navy">Plans shared with you</h2>
      {isLoading ? (
        <p className="mt-4 text-sm text-slate-400">Loading plans…</p>
      ) : plans.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No plans yet. Ask your sender to add your wallet address.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
