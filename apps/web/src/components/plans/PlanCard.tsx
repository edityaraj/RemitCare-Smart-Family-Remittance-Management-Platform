import { Link } from "react-router-dom";
import type { RemittancePlan } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";

function getCategoryBadge(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("medic") || lower.includes("health")) return { label: "Medical", emoji: "🏥", color: "bg-red-50 text-red-600" };
  if (lower.includes("edu") || lower.includes("tuition") || lower.includes("school")) return { label: "Education", emoji: "📚", color: "bg-blue-50 text-blue-600" };
  if (lower.includes("rent") || lower.includes("hous") || lower.includes("renovat")) return { label: "Housing", emoji: "🏠", color: "bg-orange-50 text-orange-600" };
  if (lower.includes("food") || lower.includes("grocer")) return { label: "Groceries", emoji: "🛒", color: "bg-green-50 text-green-600" };
  if (lower.includes("tech") || lower.includes("util") || lower.includes("electric")) return { label: "Utilities", emoji: "🔌", color: "bg-purple-50 text-purple-600" };
  return { label: "General", emoji: "💰", color: "bg-slate-50 text-slate-600" };
}

export default function PlanCard({ plan }: { plan: RemittancePlan }) {
  const pct = Math.min(100, Math.round((Number(plan.releasedAmount) / Number(plan.totalAmount || "1")) * 100));
  const category = getCategoryBadge(plan.title + " " + (plan.description || ""));
  
  return (
    <Link
      to={`/plans/${plan._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-navy">{plan.title}</h3>
          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${category.color}`}>
            {category.emoji} {category.label}
          </span>
        </div>
        <StatusBadge status={plan.status} />
      </div>
      {plan.description && <p className="mt-2 text-sm text-slate-500 line-clamp-2">{plan.description}</p>}
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
