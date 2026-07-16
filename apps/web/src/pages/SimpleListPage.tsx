import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface Props {
  title: string;
  endpoint: string;
  emptyLabel: string;
  renderItem: (item: any) => React.ReactNode;
}

export default function SimpleListPage({ title, endpoint, emptyLabel, renderItem }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await api.get(endpoint)).data,
  });

  const items: any[] = data ? Object.values(data)[0] as any[] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">{title}</h1>
      {isLoading ? (
        <p className="mt-4 text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-2">{items.map(renderItem)}</div>
      )}
    </div>
  );
}
