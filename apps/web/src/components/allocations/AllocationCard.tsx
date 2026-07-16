import type { Allocation } from "@/types";
import StatusBadge from "@/components/dashboard/StatusBadge";

const PURPOSE_COLORS: Record<string, string> = {
  education: "bg-indigo-50 text-indigo-700",
  healthcare: "bg-rose-50 text-rose-700",
  food: "bg-amber-50 text-amber-700",
  rent: "bg-cyan-50 text-cyan-700",
  allowance: "bg-emerald/10 text-emerald-600",
  other: "bg-slate-100 text-slate-600",
};

export default function AllocationCard({
  allocation,
  onAction,
}: {
  allocation: Allocation;
  onAction?: (action: "request" | "approve" | "claim" | "cancel") => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PURPOSE_COLORS[allocation.purpose]}`}>
          {allocation.purpose}
        </span>
        <StatusBadge status={allocation.status} />
      </div>
      <h4 className="mt-2 font-medium text-navy">{allocation.title}</h4>
      <p className="text-sm text-slate-500">{allocation.amount} tokens</p>
      {onAction && (
        <div className="mt-3 flex gap-2">
          {allocation.status === "created" && (
            <button onClick={() => onAction("request")} className="text-xs font-medium text-emerald-600 hover:underline">
              Request release
            </button>
          )}
          {allocation.status === "requested" && (
            <button onClick={() => onAction("approve")} className="text-xs font-medium text-emerald-600 hover:underline">
              Approve
            </button>
          )}
          {allocation.status === "approved" && (
            <button onClick={() => onAction("claim")} className="text-xs font-medium text-emerald-600 hover:underline">
              Claim
            </button>
          )}
          {["created", "requested"].includes(allocation.status) && (
            <button onClick={() => onAction("cancel")} className="text-xs font-medium text-red-500 hover:underline">
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
