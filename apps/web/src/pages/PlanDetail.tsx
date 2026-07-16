import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import StatusBadge from "@/components/dashboard/StatusBadge";
import AllocationCard from "@/components/allocations/AllocationCard";
import type { Allocation, RemittancePlan } from "@/types";

export default function PlanDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [showNewAllocation, setShowNewAllocation] = useState(false);

  const { data: plan } = useQuery({
    queryKey: ["plan", id],
    queryFn: async () => (await api.get<{ plan: RemittancePlan }>(`/plans/${id}`)).data.plan,
  });

  const { data: allocations, isLoading } = useQuery({
    queryKey: ["allocations", id],
    queryFn: async () => (await api.get<{ allocations: Allocation[] }>(`/plans/${id}/allocations`)).data.allocations,
    enabled: !!id,
  });

  async function handleAction(allocation: Allocation, action: "request" | "approve" | "claim" | "cancel") {
    try {
      // NOTE: each of these should first call the matching contract method
      // (request_release / approve_release / claim_allocation /
      // cancel_allocation), await confirmation, then hit the *-record
      // endpoint below with the real tx hash. Simplified here for scaffold
      // clarity — see contracts/remitcare_allowance/src/lib.rs for the
      // on-chain rules each call enforces.
      const txHash = `PENDING_${crypto.randomUUID()}`;
      const endpoint =
        action === "request"
          ? `/allocations/${allocation.allocationId}/request`
          : action === "approve"
          ? `/allocations/${allocation.allocationId}/approve-record`
          : action === "claim"
          ? `/allocations/${allocation.allocationId}/claim-record`
          : `/allocations/${allocation.allocationId}/cancel-record`;

      await api.post(endpoint, action === "cancel" ? {} : { txHash });
      toast.success(`Allocation ${action} recorded`);
      qc.invalidateQueries({ queryKey: ["allocations", id] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? `Could not ${action} allocation`);
    }
  }

  async function handleFundPlan() {
    try {
      // Mocking the on-chain funding for the prototype
      const txHash = `FUND_${crypto.randomUUID()}`;
      await api.post(`/plans/${id}/fund-record`, { amount: plan?.totalAmount, txHash });
      toast.success("Plan funded successfully!");
      qc.invalidateQueries({ queryKey: ["plan", id] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not fund plan");
    }
  }

  if (!plan) return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-slate-400">Loading plan…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{plan.title}</h1>
          {plan.description && <p className="mt-1 text-slate-500">{plan.description}</p>}
        </div>
        <div className="flex items-center gap-4">
          {plan.status === "draft" && (
            <button
              onClick={handleFundPlan}
              className="rounded-md bg-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              Fund Plan
            </button>
          )}
          <StatusBadge status={plan.status} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">Funded</p>
          <p className="text-lg font-semibold text-navy">{plan.fundedAmount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">Released</p>
          <p className="text-lg font-semibold text-navy">{plan.releasedAmount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">Remaining</p>
          <p className="text-lg font-semibold text-navy">{plan.remainingAmount}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-medium text-navy">Allocations</h2>
        <button
          onClick={() => setShowNewAllocation((v) => !v)}
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          {showNewAllocation ? "Close" : "+ Add allocation"}
        </button>
      </div>

      {showNewAllocation && <NewAllocationForm planId={id!} onCreated={() => qc.invalidateQueries({ queryKey: ["allocations", id] })} />}

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-400">Loading allocations…</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(allocations ?? []).map((a) => (
            <AllocationCard key={a._id} allocation={a} onAction={(action) => handleAction(a, action)} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewAllocationForm({ planId, onCreated }: { planId: string; onCreated: () => void }) {
  const [form, setForm] = useState({ purpose: "education", title: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/plans/${planId}/allocations`, {
        ...form,
        allocationId: crypto.randomUUID().replace(/-/g, ""),
      });
      toast.success("Allocation created");
      onCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not create allocation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <select
        value={form.purpose}
        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        {["education", "healthcare", "food", "rent", "allowance", "other"].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <input
        required
        placeholder="Title (e.g. College fee)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        required
        type="number"
        min="0"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <button disabled={submitting} className="rounded-md bg-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
        {submitting ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
