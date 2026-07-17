"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 px-3 py-3 sm:px-4 lg:px-6 backdrop-blur">
      <div className="relative w-full max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />

        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/70 py-2 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full border border-slate-800 bg-slate-900/70 p-2 text-slate-300">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500"></span>
        </button>

        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-2">
          <UserCircle2 size={28} className="text-cyan-400" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}