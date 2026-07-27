// 'use client';

// import React, { useState, useEffect } from 'react';
// import DashboardCards from "@/components/dashboard/dashboard-cards";
// import { RefreshCw, TrendingUp, Users, Building2 } from 'lucide-react';

// async function getStats() {
//   const res = await fetch("/api/dashboard", {
//     cache: "no-store",
//     credentials: "include",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch dashboard");
//   }

//   return res.json();
// }
// export default function DashboardPage() {
//   const [stats, setStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const fetchStats = async () => {
//     try {
//       setIsRefreshing(true);
//       const data = await getStats();
//       setStats(data);
//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error("Failed to fetch dashboard stats");
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     setLastUpdated(new Date());
//     fetchStats();
//   }, []);

//   const refreshDashboard = () => {
//     fetchStats();
//   };

//   return (
//     <div className="min-h-screen bg-zinc-950 pb-12">
//       {/* Top Navigation Bar */}
//       <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
//         <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
//           <div>
//             <div className="flex items-center gap-3">
//               <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
//                 <TrendingUp className="h-5 w-5 text-black" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-semibold tracking-tight text-white">CRM Dashboard</h1>
//                 <p className="text-xs text-slate-500">Business Intelligence • Real-time Overview</p>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="text-right text-xs">
//               <p className="text-slate-400">Last updated</p>
//               <p className="text-emerald-400 font-mono">
//                 {lastUpdated
//                   ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                   : '--:--'}
//               </p>
//             </div>

//             <button
//               onClick={refreshDashboard}
//               disabled={isRefreshing}
//               className="flex items-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-all active:scale-95 disabled:opacity-70"
//             >
//               <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
//               Refresh
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="mx-auto max-w-7xl px-6 pt-8 space-y-8">
//         {/* Hero Header */}
//         <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-8 md:p-10 shadow-2xl shadow-black/40">
//           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//             <div>
//               <p className="text-sm font-mono uppercase tracking-[0.125em] text-emerald-400">OVERVIEW</p>
//               <h1 className="mt-3 text-5xl font-semibold tracking-tighter text-white">
//                 Welcome back
//               </h1>
//               <p className="mt-3 max-w-md text-lg text-slate-400">
//                 Here's what's happening with your clients and business today.
//               </p>
//             </div>

//             <div className="flex items-center gap-4 text-sm">
//               <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 text-emerald-400 border border-emerald-500/20">
//                 <Users className="h-4 w-4" />
//                 <span>Active Clients</span>
//               </div>
//               <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-slate-400 border border-white/10">
//                 <Building2 className="h-4 w-4" />
//                 <span>Companies Tracked</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Dashboard Cards */}
//         {stats ? (
//           <DashboardCards stats={stats} />
//         ) : (
//           <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-800 bg-zinc-900/50">
//             <div className="flex flex-col items-center gap-4">
//               <div className="h-9 w-9 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
//               <p className="text-slate-400">Loading dashboard statistics...</p>
//             </div>
//           </div>
//         )}

//         {/* Quick Insights Bar */}
//         <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-6 flex flex-wrap gap-6 items-center justify-between text-sm">
//           <div className="flex items-center gap-3 text-slate-400">
//             <span className="px-3 py-1 bg-white/5 rounded-full">Pro Tip:</span>
//             Click on any card to drill down into detailed analytics
//           </div>
//           <div className="text-emerald-400 text-xs font-mono tracking-widest">
//             DATA REFRESHED IN REAL-TIME
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import React, { useState, useEffect } from 'react';
import DashboardCards from "@/components/dashboard/dashboard-cards";
import {
  RefreshCw,
  TrendingUp,
  Users,
  Building2,
} from 'lucide-react';

async function getStats() {
  const res = await fetch("/api/dashboard", {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  return res.json();
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);

      const data = await getStats();

      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard stats");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshDashboard = () => {
    fetchStats();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 pb-12 text-white">

      {/* =========================================================
          BACKGROUND GLOW
      ========================================================== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[140px]" />

        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[150px]" />

        <div className="absolute bottom-[-250px] left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-400/5 blur-[150px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(39,39,42,0.35),transparent_55%)]" />
      </div>

      {/* =========================================================
          TOP NAVIGATION
      ========================================================== */}
      <div className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* Dashboard Title */}
          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 shadow-lg shadow-emerald-500/5">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  CRM Dashboard
                </h1>

                <p className="text-xs text-zinc-500">
                  Business Intelligence • Real-time Overview
                </p>
              </div>

            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {/* Last Updated */}
            <div className="hidden text-right text-xs sm:block">
              <p className="text-zinc-500">
                Last updated
              </p>

              <p className="font-mono font-medium text-emerald-400">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--:--'}
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshDashboard}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium text-zinc-200 shadow-lg shadow-black/20 transition-all hover:border-emerald-400/30 hover:bg-zinc-800 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? 'animate-spin text-emerald-400' : ''
                }`}
              />

              Refresh
            </button>

          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-6 pt-8">

        {/* =====================================================
            HERO HEADER
        ====================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-10">

          {/* Glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">

            {/* Left */}
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.125em] text-emerald-400">
                OVERVIEW
              </p>

              <h1 className="mt-3 text-5xl font-semibold tracking-tighter text-white">
                Welcome back
              </h1>

              <p className="mt-3 max-w-md text-lg leading-7 text-zinc-400">
                Here's what's happening with your clients and business today.
              </p>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3 text-sm">

              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-400">
                <Users className="h-4 w-4" />

                <span>
                  Active Clients
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-zinc-400">
                <Building2 className="h-4 w-4" />

                <span>
                  Companies Tracked
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            DASHBOARD CARDS
        ====================================================== */}
        {stats ? (
          <div className="rounded-3xl">
            <DashboardCards stats={stats} />
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-xl shadow-black/20 backdrop-blur-xl">

            <div className="flex flex-col items-center gap-4">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-400" />

              <p className="text-sm text-zinc-500">
                {loading
                  ? "Loading dashboard statistics..."
                  : "Unable to load dashboard statistics"}
              </p>

            </div>
          </div>
        )}

        {/* =====================================================
            QUICK INSIGHTS
        ====================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">

          <div className="flex items-center gap-3 text-sm text-zinc-500">

            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-400">
              Pro Tip
            </span>

            <span>
              Click on any card to drill down into detailed analytics
            </span>

          </div>

          <div className="font-mono text-xs tracking-widest text-emerald-400">
            DATA REFRESHED IN REAL-TIME
          </div>

        </div>

      </div>
    </div>
  );
}
