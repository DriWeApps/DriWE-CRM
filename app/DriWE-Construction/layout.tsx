
"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { HardHat, LogOut } from "lucide-react";

export default function ConstructionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.replace("/login");
    }
  }

  const isDashboard =
    pathname === "/DriWE-Construction/dashboard";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {!isDashboard && (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
                <HardHat className="h-5 w-5 text-black" />
              </div>

              <div>
                <p className="font-bold">DriWE Construction</p>
                <p className="text-xs text-zinc-500">
                  Construction Management Platform
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-600 bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:border-red-500 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>
      )}

      {children}
    </div>
  );
}