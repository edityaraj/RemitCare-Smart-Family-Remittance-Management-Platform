const STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  active: "bg-emerald/10 text-emerald-600",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  created: "bg-slate-100 text-slate-600",
  requested: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  claimed: "bg-emerald/10 text-emerald-600",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
