import { Link } from "react-router-dom";
import type { RemittancePlan } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";

export default function PlanCard({ plan }: { plan: RemittancePlan }) {
  const pct = Math.min(100, Math.round((Number(plan.releasedAmount) / Number(plan.totalAmount || "1")) * 100));
  return (
    <Link
      to={`/plans/${plan._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-navy">{plan.title}</h3>
        <StatusBadge status={plan.status} />
      </div>
      {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{plan.releasedAmount} released</span>
          <span>{plan.totalAmount} total</span>
        </div>
      </div>
    </Link>
  );
}
