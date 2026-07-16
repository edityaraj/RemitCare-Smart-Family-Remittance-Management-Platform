import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import BalanceCard from "@/components/dashboard/BalanceCard";

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">Admin overview</h1>
      <p className="mt-1 text-sm text-slate-400">Read-only. Admin never holds custody of user funds.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <BalanceCard label="Total users" value={String(data?.totalUsers ?? "—")} />
        <BalanceCard label="Total plans" value={String(data?.totalPlans ?? "—")} />
        <BalanceCard label="Feedback entries" value={String(data?.totalFeedback ?? "—")} />
        <BalanceCard label="Avg. rating" value={data?.averageRating ? data.averageRating.toFixed(1) : "—"} />
      </div>
    </div>
  );
}
