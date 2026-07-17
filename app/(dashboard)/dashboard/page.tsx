'use client';

import React, { useState, useEffect } from 'react';
import DashboardCards from "@/components/dashboard/dashboard-cards";
import { RefreshCw, TrendingUp, Users, Building2 } from 'lucide-react';

async function getStats() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard`,
    { cache: "no-store" }
  );
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
    }
  };

  useEffect(() => {
    setLastUpdated(new Date());
    fetchStats();
  }, []);

  const refreshDashboard = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">CRM Dashboard</h1>
                <p className="text-xs text-slate-500">Business Intelligence • Real-time Overview</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <p className="text-slate-400">Last updated</p>
              <p className="text-emerald-400 font-mono">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>

            <button
              onClick={refreshDashboard}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-all active:scale-95 disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 space-y-8">
        {/* Hero Header */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-mono uppercase tracking-[0.125em] text-emerald-400">OVERVIEW</p>
              <h1 className="mt-3 text-5xl font-semibold tracking-tighter text-white">
                Welcome back
              </h1>
              <p className="mt-3 max-w-md text-lg text-slate-400">
                Here's what's happening with your clients and business today.
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 text-emerald-400 border border-emerald-500/20">
                <Users className="h-4 w-4" />
                <span>Active Clients</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-slate-400 border border-white/10">
                <Building2 className="h-4 w-4" />
                <span>Companies Tracked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        {stats ? (
          <DashboardCards stats={stats} />
        ) : (
          <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-800 bg-zinc-900/50">
            <div className="flex flex-col items-center gap-4">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
              <p className="text-slate-400">Loading dashboard statistics...</p>
            </div>
          </div>
        )}

        {/* Quick Insights Bar */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-6 flex flex-wrap gap-6 items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="px-3 py-1 bg-white/5 rounded-full">Pro Tip:</span>
            Click on any card to drill down into detailed analytics
          </div>
          <div className="text-emerald-400 text-xs font-mono tracking-widest">
            DATA REFRESHED IN REAL-TIME
          </div>
        </div>
      </div>
    </div>
  );
}