import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";

export default function Receivers() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ receiverWallet: "", nickname: "", relationship: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["receivers"],
    queryFn: async () => (await api.get("/receivers")).data.receivers as any[],
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/receivers", form);
      toast.success("Receiver added");
      setForm({ receiverWallet: "", nickname: "", relationship: "" });
      qc.invalidateQueries({ queryKey: ["receivers"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not add receiver");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">Receivers</h1>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <input
          required
          placeholder="Wallet address (G...)"
          value={form.receiverWallet}
          onChange={(e) => setForm({ ...form, receiverWallet: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          required
          placeholder="Nickname"
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Relationship"
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 sm:col-span-4">
          Add receiver
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (data ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">No receivers yet.</p>
        ) : (
          (data ?? []).map((r) => (
            <div key={r._id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div>
                <p className="font-medium text-navy">{r.nickname}</p>
                <p className="text-slate-400">{r.receiverWallet}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-500">{r.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
