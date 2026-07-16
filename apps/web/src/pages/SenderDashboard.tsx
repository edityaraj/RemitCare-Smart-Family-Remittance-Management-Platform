import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import BalanceCard from "@/components/dashboard/BalanceCard";
import PlanCard from "@/components/plans/PlanCard";
import type { RemittancePlan } from "@/types";

export default function SenderDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["plans", "sender"],
    queryFn: async () => (await api.get<{ plans: RemittancePlan[] }>("/plans")).data.plans,
  });

  const plans = data ?? [];
  const totalSent = plans.reduce((sum, p) => sum + Number(p.fundedAmount || 0), 0);
  const remaining = plans.reduce((sum, p) => sum + Number(p.remainingAmount || 0), 0);
  const active = plans.filter((p) => p.status === "active").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">Sender dashboard</h1>
        <Link to="/sender/plans/new" className="rounded-md bg-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
          + New plan
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <BalanceCard label="Total sent" value={totalSent.toLocaleString()} />
        <BalanceCard label="Active plans" value={String(active)} />
        <BalanceCard label="Remaining locked" value={remaining.toLocaleString()} />
        <BalanceCard label="Total plans" value={String(plans.length)} />
      </div>

      <h2 className="mt-10 text-lg font-medium text-navy">Your plans</h2>
      {isLoading ? (
        <p className="mt-4 text-sm text-slate-400">Loading plans…</p>
      ) : plans.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No plans yet. Create your first remittance plan to get started.</p>
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
