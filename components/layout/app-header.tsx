"use client";

import { Bell, Search, UserCircle2, ChevronDown } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-zinc-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors"
            size={18}
          />

          <input
            type="text"
            placeholder="Search employees, companies, tasks..."
            className="
              w-full
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              py-3
              pl-11
              pr-4
              text-sm
              text-white
              placeholder:text-slate-500
              outline-none
              transition-all
              duration-300
              focus:border-cyan-500
              focus:bg-slate-900
              focus:shadow-lg
              focus:shadow-cyan-500/20
            "
          />
        </div>

        {/* Right Side */}
        <div className="ml-6 flex items-center gap-4">

          {/* Notification */}
          <button
            className="
              group
              relative
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              p-3
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-cyan-500/40
              hover:bg-slate-800
              hover:shadow-lg
              hover:shadow-cyan-500/20
            "
          >
            <Bell
              size={19}
              className="text-slate-300 transition group-hover:text-cyan-400"
            />

            {/* Notification Dot */}
            <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </span>
          </button>

          {/* User Profile */}
          <button
            className="
              group
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              px-3
              py-2
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-cyan-500/40
              hover:bg-slate-800
              hover:shadow-lg
              hover:shadow-cyan-500/20
            "
          >
            <UserCircle2
              size={34}
              className="text-cyan-400 transition-transform duration-300 group-hover:scale-110"
            />

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-white">
                Administrator
              </p>

              <p className="text-xs text-slate-400">
                Admin Panel
              </p>
            </div>

            <ChevronDown
              size={16}
              className="text-slate-500 transition duration-300 group-hover:rotate-180 group-hover:text-cyan-400"
            />
          </button>

        </div>
      </div>
    </header>
  );
}