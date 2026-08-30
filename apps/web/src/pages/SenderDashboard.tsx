import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import BalanceCard from "@/components/dashboard/BalanceCard";
import PlanCard from "@/components/plans/PlanCard";
import type { RemittancePlan } from "@/types";

export default function SenderDashboard() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showTutorial, setShowTutorial] = useState(false);

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
    <div className="mx-auto max-w-6xl px-4 py-10 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-navy">Sender dashboard</h1>
          <button 
            onClick={() => setShowTutorial(true)}
            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
          >
            How it works
          </button>
        </div>
        <Link to="/sender/plans/new" className="rounded-md bg-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors shadow-sm">
          + New plan
        </Link>
      </div>

      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            
            <h2 className="text-xl font-bold text-navy mb-2">Welcome to RemitCare</h2>
            <p className="text-slate-500 text-sm mb-6">Follow these 3 simple steps to start supporting your family securely via the Stellar network.</p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">1</div>
                <div>
                  <h4 className="text-sm font-medium text-navy">Create a Plan</h4>
                  <p className="text-xs text-slate-500">Click '+ New plan' and set a budget for specific needs like tuition or rent.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">2</div>
                <div>
                  <h4 className="text-sm font-medium text-navy">Fund via Wallet</h4>
                  <p className="text-xs text-slate-500">Lock the funds securely into the smart contract using Freighter.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">3</div>
                <div>
                  <h4 className="text-sm font-medium text-navy">Approve Claims</h4>
                  <p className="text-xs text-slate-500">Review requests from your receiver and release funds instantly with zero hidden fees.</p>
                </div>
              </div>
            </div>
            
            <button onClick={() => setShowTutorial(false)} className="mt-8 w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
              Got it, let's go!
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
