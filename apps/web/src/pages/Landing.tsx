import { Link } from "react-router-dom";
import { ShieldCheck, GraduationCap, HeartPulse, Home as HomeIcon, Wallet2 } from "lucide-react";

const PURPOSES = [
  { icon: GraduationCap, label: "Education" },
  { icon: HeartPulse, label: "Healthcare" },
  { icon: HomeIcon, label: "Rent" },
  { icon: Wallet2, label: "Allowance" },
];

export default function Landing() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          Support your family with clarity and control.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
          Send fast Stellar-based allowances and organize funds for education, healthcare, rent, and everyday needs —
          with full transparency for both sides.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="rounded-md bg-navy px-5 py-3 text-sm font-medium text-white hover:bg-navy/90">
            Get started
          </Link>
          <Link to="/how-it-works" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-medium text-navy hover:bg-slate-100">
            How it works
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
          Purpose-based allocations
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PURPOSES.map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <Icon className="mx-auto h-6 w-6 text-emerald" />
              <p className="mt-2 text-sm font-medium text-navy">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <ShieldCheck className="h-8 w-8 text-emerald" />
          <h2 className="mt-3 text-xl font-semibold text-navy">Every transfer is on-chain</h2>
          <p className="mt-2 text-slate-500">
            Funds sit in a Soroban smart contract, not a database. Allocations, requests, approvals, and claims are
            each a signed transaction your family can verify independently on Stellar Testnet.
          </p>
        </div>
      </section>
    </div>
  );
}
