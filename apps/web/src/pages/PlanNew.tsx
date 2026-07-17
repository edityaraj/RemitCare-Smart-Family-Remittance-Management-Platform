import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useWallet } from "@/hooks/useWallet";
import { buildCreatePlanTx } from "@/services/contract";
import { signXdr } from "@/services/freighter";
import { submitTransaction } from "@/services/stellar";

// Flow (Phase 10): validate form -> generate plan id -> create_plan() on
// contract -> sign with Freighter -> wait for confirmation -> fund_plan() ->
// sign token transfer -> save tx hashes -> mark plan active in the backend.
// The contract-call wiring below is left as clearly marked TODOs since it
// depends on the generated bindings from Phase 9 (see services/contract.ts).

export default function PlanNew() {
  const { address, connect } = useWallet();
  const navigate = useNavigate();
  const [form, setForm] = useState({ receiverWallet: "", title: "", description: "", totalAmount: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) {
      toast.error("Connect your Freighter wallet first");
      await connect();
      return;
    }
    setSubmitting(true);
    try {
      const contractPlanId = crypto.randomUUID().replace(/-/g, "");
      toast.info("Generating contract transaction...");
      const xdr = await buildCreatePlanTx(contractPlanId, address, form.receiverWallet, address);
      
      toast.info("Please sign the transaction in Freighter...");
      const signedXdr = await signXdr(xdr, import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015");
      
      toast.info("Submitting transaction to Stellar network...");
      const txHash = await submitTransaction(signedXdr);

      const { data } = await api.post("/plans", {
        ...form,
        senderWallet: address,
        tokenContractId: import.meta.env.VITE_TOKEN_CONTRACT_ID || "PENDING_DEPLOYMENT",
        contractPlanId,
        creationTxHash: txHash,
      });
      toast.success("Plan created on-chain! You can now fund it.");
      navigate(`/plans/${data.plan._id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err?.message || "Could not create plan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">Create a remittance plan</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          required
          placeholder="Receiver Stellar wallet address (G...)"
          value={form.receiverWallet}
          onChange={(e) => setForm({ ...form, receiverWallet: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Plan title (e.g. Priya's monthly support)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          min="0"
          step="0.0000001"
          placeholder="Total amount (tokens)"
          value={form.totalAmount}
          onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          disabled={submitting}
          className="w-full rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create plan"}
        </button>
      </form>
    </div>
  );
}
