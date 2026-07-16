"use client";

import Link from "next/link";
import { Company } from "@/types/company";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface Props {
  companies: Company[];
}

export default function CompanyTable({ companies }: Props) {
  async function handleDelete(companyId: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this company?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`/api/companies/${companyId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Failed to delete company");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-4 text-left">Company</th>
            <th className="p-4 text-left">Contact</th>
            <th className="p-4 text-left">City</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <tr key={company.companyId} className="border-t">
              <td className="p-4">{company.companyName}</td>
              <td className="p-4">{company.contactPerson}</td>
              <td className="p-4">{company.city}</td>

              <td className="p-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    company.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {company.status}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-center gap-3">
                  <Link href={`/companies/${company.companyId}`}>
                    <Eye className="h-5 w-5 text-blue-600" />
                  </Link>

                  <Link href={`/companies/${company.companyId}/edit`}>
                    <Pencil className="h-5 w-5 text-amber-600" />
                  </Link>

                  <button
                    onClick={() => handleDelete(company.companyId)}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}