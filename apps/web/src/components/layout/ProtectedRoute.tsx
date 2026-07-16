import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

export default function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="px-4 py-16 text-center text-sm text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
