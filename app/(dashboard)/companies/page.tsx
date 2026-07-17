'use client';

import React from 'react';
import CompanyTable from "@/components/companies/company-table";
import { Building2, Plus } from 'lucide-react';

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Top Navigation / Header Area */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="w-full px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Client Management</h1>
              <p className="text-xs text-slate-500">Company Hub • CRM</p>
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all active:scale-95">
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Main Content - Full Width Optimized */}
      <div className="w-full px-6 pt-8">
        <div className="mb-10">
          <p className="text-sm font-mono uppercase tracking-[0.125em] text-cyan-400">
            COMPANY HUB
          </p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tighter text-white">
            Client Management
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-2xl">
            Track opportunities, contacts and account health from one elegant dashboard.
          </p>
        </div>

        {/* Company Table Container - Clean & Spacious */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-2 shadow-2xl">
          <CompanyTable />
        </div>
      </div>
    </div>
  );
}