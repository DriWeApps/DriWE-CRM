"use client";

import { ReactNode } from "react";
import AppSidebar from "./app-sidebar";
import AppHeader from "./app-header";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_40%),#020617] text-slate-100 md:flex-row">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />

        <main className="flex-1 overflow-auto bg-transparent p-3 sm:p-4 lg:p-6">
          <div className="w-full space-y-4 sm:space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}