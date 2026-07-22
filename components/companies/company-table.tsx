"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit2, Eye, Loader2, Trash2 } from "lucide-react";
import type { Company } from "@/types/company";

export default function CompanyTable() {
  const [role, setRole] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompanies();

    async function getCurrentUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data?.authenticated) {
          setRole(data.user.role);
        }
      } catch (error) {
        console.error(error);
      }
    }

    getCurrentUser();
  }, []);

  const handleDelete = async (companyId: string) => {
    if (!confirm("Delete this company profile?")) return;

    const res = await fetch(`/api/companies/${companyId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchCompanies();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 text-slate-300">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading companies...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-2xl shadow-black/40">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Clients</h2>
          <p className="text-sm text-slate-400">Manage your CRM contacts in one view.</p>
        </div>

        <Link
          href="/companies/add"
          className="inline-flex items-center rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Add Company
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/80 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 bg-slate-900/60">
            {companies.map((company) => {
              const companyId = company.companyId ?? company.id ?? "";

              return (
                <tr key={companyId} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{company.companyName}</div>
                    <div className="text-xs text-slate-400">{company.companyType || "Client"}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-200">{company.contactPerson || "—"}</div>
                    <div className="text-xs text-slate-400">{company.email || "—"}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {company.city ? `${company.city}, ${company.state}` : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${company.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                        }`}
                    >
                      {company.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/companies/${companyId}`}
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/companies/${companyId}/edit`}
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>

                      {role === "ADMIN" && (
                        <button
                          onClick={() => handleDelete(companyId)}
                          className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {companies.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 py-10 text-center text-slate-400">
          No companies found yet. Add your first client to get started.
        </div>
      )}
    </div>
  );
}
