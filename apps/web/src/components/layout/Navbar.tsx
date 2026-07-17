import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:bg-slate-900/90 dark:border-slate-800">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-navy dark:text-white">
          <HeartHandshake className="h-5 w-5 text-emerald" />
          RemitCare
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <>
              <WalletConnectButton />
              <Link
                to={`/${user.role}/dashboard`}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-navy hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-1.5 text-sm font-medium text-navy hover:bg-slate-100">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-navy/90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
