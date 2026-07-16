import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({ rating: 5, usabilityRating: 5, trustRating: 5, message: "", suggestion: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/feedback", { ...form, role: user?.role ?? "sender" });
      setSent(true);
      toast.success("Thanks for the feedback!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-500">Feedback submitted — thank you!</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">Share your feedback</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {(["rating", "usabilityRating", "trustRating"] as const).map((field) => (
          <label key={field} className="block text-sm text-slate-600">
            {field === "rating" ? "Overall rating" : field === "usabilityRating" ? "Ease of use" : "Trust in the payment flow"}
            <input
              type="range"
              min={1}
              max={5}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
              className="mt-1 w-full"
            />
            <span className="text-xs text-slate-400">{form[field]} / 5</span>
          </label>
        ))}
        <textarea
          required
          placeholder="What did you think? Most useful feature, main difficulty..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Suggested improvement (optional)"
          value={form.suggestion}
          onChange={(e) => setForm({ ...form, suggestion: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button disabled={submitting} className="w-full rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90">
          {submitting ? "Submitting…" : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}
