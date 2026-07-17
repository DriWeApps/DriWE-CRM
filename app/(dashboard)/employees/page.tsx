'use client';

import React, { useState } from 'react';
import EmployeeList from "@/components/employees/employee-list";
import { Users, Plus, RefreshCw, Search } from 'lucide-react';

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Team Management</h1>
              <p className="text-xs text-slate-500">People Hub • Employee Directory</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-all active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button className="flex items-center gap-2 rounded-2xl bg-white text-black hover:bg-white/90 transition-all px-6 py-2.5 text-sm font-semibold active:scale-95">
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-sm font-mono uppercase tracking-[0.125em] text-violet-400">
                PEOPLE HUB
              </p>
              <h1 className="mt-3 text-5xl font-semibold tracking-tighter text-white">
                Employee Management
              </h1>
              <p className="mt-3 max-w-lg text-lg text-slate-400">
                Keep your team aligned, active, and easy to manage from one polished workspace.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-slate-700 pl-11 py-3.5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 shadow-xl overflow-hidden">
          <EmployeeList 
            key={refreshKey} 
            searchTerm={searchTerm} 
          />
        </div>
      </div>
    </div>
  );
}