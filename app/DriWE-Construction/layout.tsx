
"use client";

import { ReactNode, useEffect, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HardHat, LogOut, Building2, ChevronRight } from "lucide-react";

export default function ConstructionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [lastConstructionPath, setLastConstructionPath] = useState("");

  useEffect(() => {
    const currentKey = "driwe-construction-current-path";
    const previousKey = "driwe-construction-previous-path";
    const previousPath = window.sessionStorage.getItem(currentKey) || "";

    if (
      previousPath.startsWith("/DriWE-Construction/") &&
      previousPath !== pathname
    ) {
      window.sessionStorage.setItem(previousKey, previousPath);
    }

    window.sessionStorage.setItem(currentKey, pathname);
    setLastConstructionPath(
      window.sessionStorage.getItem(previousKey) || ""
    );
  }, [pathname]);

  function handleBackNavigation(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const label = anchor.textContent?.trim() || "";
    if (!/^back(?:\s|$)/i.test(label)) return;

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    const targetPath = `${destination.pathname}${destination.search}${destination.hash}`;
    const previousPath =
      lastConstructionPath && lastConstructionPath !== pathname
        ? lastConstructionPath
        : targetPath;
    router.push(previousPath);
  }

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

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="flex min-h-[76px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Brand */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black shadow-sm transition-transform duration-200 hover:scale-105">
                <HardHat className="h-6 w-6 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-bold tracking-tight text-black sm:text-lg">
                    DriWE Construction
                  </h1>
                  <ChevronRight className="hidden h-4 w-4 text-gray-400 sm:block" />
                  <span className="hidden text-xs font-medium text-gray-500 sm:block">
                    Portal
                  </span>
                </div>

                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  Construction Management Platform
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-gray-600">
                  Workspace
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
              >
                {loggingOut ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                )}

                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </div>

          {/* Subtle bottom accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </header>

      <main
        className="construction-content min-h-[calc(100vh-77px)] w-full"
        onClickCapture={handleBackNavigation}
      >
        {children}
      </main>
    </div>
  );
}