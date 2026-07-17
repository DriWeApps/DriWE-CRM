import Link from "next/link";
import { ArrowRight, Users, Target, Award } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
              </span>
              Premium CRM Platform
            </div>

            <h1 className="text-6xl lg:text-7xl font-semibold tracking-tighter leading-none">
              Your clients.<br />
              Your deals.<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                One beautiful hub.
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-lg">
              DriWE CRM helps you manage clients, track opportunities, and stay on top of every follow-up — all in a sleek, modern workspace.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center gap-3 rounded-2xl bg-white text-black px-8 py-4 font-semibold text-lg hover:bg-white/90 transition-all active:scale-95"
              >
                Go to Dashboard
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/companies"
                className="rounded-2xl border border-slate-700 hover:border-slate-500 px-8 py-4 font-semibold transition-all hover:bg-white/5"
              >
                Browse Companies
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="pt-6 flex items-center gap-8 text-sm text-slate-400">
              <div>Trusted by fast-growing teams</div>
              <div className="flex -space-x-3">
                <div className="h-7 w-7 rounded-full border-2 border-zinc-950 bg-slate-700"></div>
                <div className="h-7 w-7 rounded-full border-2 border-zinc-950 bg-slate-600"></div>
                <div className="h-7 w-7 rounded-full border-2 border-zinc-950 bg-slate-500"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Stats Dashboard Preview */}
          <div className="relative">
            <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 backdrop-blur-xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-cyan-400 text-sm font-medium">THIS MONTH</p>
                  <p className="text-5xl font-semibold mt-1">₹ 18.4L</p>
                  <p className="text-emerald-400 text-sm">+24% from last month</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">128 Active Clients</div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-zinc-950 p-5 border border-slate-800">
                  <Users className="h-8 w-8 text-cyan-400 mb-4" />
                  <div className="text-3xl font-semibold">142</div>
                  <div className="text-xs text-slate-500 mt-1">Total Clients</div>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5 border border-slate-800">
                  <Target className="h-8 w-8 text-amber-400 mb-4" />
                  <div className="text-3xl font-semibold">37</div>
                  <div className="text-xs text-slate-500 mt-1">Deals in Pipeline</div>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5 border border-slate-800">
                  <Award className="h-8 w-8 text-emerald-400 mb-4" />
                  <div className="text-3xl font-semibold">91%</div>
                  <div className="text-xs text-slate-500 mt-1">Task Completion</div>
                </div>
              </div>

              <div className="mt-10 text-center text-xs text-slate-500 tracking-widest">
                REAL-TIME • SECURE • BEAUTIFUL
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 h-48 w-48 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </main>
  );
}