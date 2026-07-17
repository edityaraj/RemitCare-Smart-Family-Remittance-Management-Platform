import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import BalanceCard from "@/components/dashboard/BalanceCard";
import PlanCard from "@/components/plans/PlanCard";
import type { RemittancePlan } from "@/types";

export default function SenderDashboard() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showBanner, setShowBanner] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["plans", "sender"],
    queryFn: async () => (await api.get<{ plans: RemittancePlan[] }>("/plans")).data.plans,
  });

  const plans = data ?? [];
  const totalSent = plans.reduce((sum, p) => sum + Number(p.fundedAmount || 0), 0);
  const remaining = plans.reduce((sum, p) => sum + Number(p.remainingAmount || 0), 0);
  const active = plans.filter((p) => p.status === "active").length;

  const filteredPlans = plans.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">Sender dashboard</h1>
        <Link to="/sender/plans/new" className="rounded-md bg-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
          + New plan
        </Link>
      </div>

      {showBanner && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-emerald-800">Welcome to RemitCare! 👋</h3>
              <div className="mt-2 text-sm text-emerald-700">
                <p>Getting started is simple:</p>
                <ul className="ml-5 mt-1 list-disc space-y-1">
                  <li>Click <strong>+ New plan</strong> to create a remittance budget (e.g. "College Tuition").</li>
                  <li>Fund the plan using your Stellar wallet.</li>
                  <li>Your receiver will request allocations, and you approve them right here!</li>
                </ul>
              </div>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-emerald-500 hover:text-emerald-700">
              <span className="sr-only">Dismiss</span>
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <BalanceCard label="Total sent" value={totalSent.toLocaleString()} />
        <BalanceCard label="Active plans" value={String(active)} />
        <BalanceCard label="Remaining locked" value={remaining.toLocaleString()} />
        <BalanceCard label="Total plans" value={String(plans.length)} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-medium text-navy">Your plans</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 bg-white"
        >
          <option value="all">All Plans</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {isLoading ? (
        <p className="mt-4 text-sm text-slate-400">Loading plans…</p>
      ) : filteredPlans.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No plans found matching the filter.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
