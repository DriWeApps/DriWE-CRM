// 'use client';

// import React from 'react';
// import CompanyTable from "@/components/companies/company-table";
// import { Building2, Plus } from 'lucide-react';

// export default function CompaniesPage() {
//   return (
//     <div className="min-h-screen bg-zinc-950 pb-12">
//       {/* Top Navigation / Header Area */}
//       <div className="sticky top-0 z-50 border-b border-slate-800 bg-zinc-950/80 backdrop-blur-lg">
//         <div className="w-full px-6 py-5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
//               <Building2 className="h-5 w-5 text-black" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-semibold tracking-tight text-white">Client Management</h1>
//               <p className="text-xs text-slate-500">Company Hub • CRM</p>
//             </div>
//           </div>

//           <button className="flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all active:scale-95">
//             <Plus className="h-4 w-4" />
//             Add Company
//           </button>
//         </div>
//       </div>

//       {/* Main Content - Full Width Optimized */}
//       <div className="w-full px-6 pt-8">
//         <div className="mb-10">
//           <p className="text-sm font-mono uppercase tracking-[0.125em] text-cyan-400">
//             COMPANY HUB
//           </p>
//           <h1 className="mt-2 text-5xl font-semibold tracking-tighter text-white">
//             Client Management
//           </h1>
//           <p className="mt-3 text-lg text-slate-400 max-w-2xl">
//             Track opportunities, contacts and account health from one elegant dashboard.
//           </p>
//         </div>

//         {/* Company Table Container - Clean & Spacious */}
//         <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-2 shadow-2xl">
//           <CompanyTable />
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyTable from "@/components/companies/company-table";
import { Building2, Plus } from "lucide-react";

interface User {
  role: string;
  pageAccess?: string[];
}

export default function CompaniesPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (!data.authenticated || !data.user) {
          router.replace("/login");
          return;
        }

        const currentUser = data.user;
        const role = currentUser.role?.toUpperCase();

        // ADMIN has access to everything
        if (role !== "ADMIN") {
          const pageAccess = currentUser.pageAccess || [];

          if (!pageAccess.includes("companies")) {
            alert("You don't have permission to access Companies.");
            router.replace("/dashboard");
            return;
          }
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Permission check failed:", error);
        router.replace("/dashboard");
      } finally {
        setLoadingRole(false);
      }
    }

    checkPermission();
  }, [router]);

  if (loadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500" />
          <p className="text-slate-400">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = user.role?.toUpperCase();

  // ADMIN can add companies.
  // Other users need companies page access.
  const canAddCompany =
    role === "ADMIN" ||
    user.pageAccess?.includes("companies");

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
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Client Management
              </h1>

              <p className="text-xs text-slate-500">
                Company Hub • CRM
              </p>
            </div>
          </div>

          {/* Add Company */}
          {canAddCompany && (
            <button
              type="button"
              onClick={() => router.push("/companies/add")}
              className="flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 pt-8">
        <div className="mb-10">
          <p className="text-sm font-mono uppercase tracking-[0.125em] text-cyan-400">
            COMPANY HUB
          </p>

          <h1 className="mt-2 text-5xl font-semibold tracking-tighter text-white">
            Client Management
          </h1>

          <p className="mt-3 text-lg text-slate-400 max-w-2xl">
            Track opportunities, contacts and account health from one elegant
            dashboard.
          </p>
        </div>

        {/* Company Table */}
        <div className="rounded-3xl border border-slate-800 bg-zinc-900/50 p-2 shadow-2xl">
          <CompanyTable />
        </div>
      </div>
    </div>
  );
}