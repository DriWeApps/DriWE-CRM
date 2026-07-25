"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

interface AppError {
  errorId: string;
  module: string;
 errorTitle: string;
  occurredError: string;
  expectedError: string;
  status: string;
  reportedBy: string;
  reportedByName: string;
  reportedByEmail: string;
  createdAt: string;
}

export default function AppErrorTable() {
  const router = useRouter();

  const [errors, setErrors] = useState<AppError[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadErrors();
  }, []);

  async function loadUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();

    if (data.user) {
      setUser(data.user);
    }
  }

  async function loadErrors() {
    setLoading(true);

    const res = await fetch("/api/app-errors");
    const data = await res.json();

    if (data.success) {
      setErrors(data.errors);
    }

    setLoading(false);
  }

  async function deleteError(id: string) {
    if (!confirm("Delete this error?")) return;

    const res = await fetch(`/api/app-errors/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      loadErrors();
    } else {
      alert(data.message);
    }
  }

  function canEdit(error: AppError) {
    if (!user) return false;

    const role = user.role?.toLowerCase();

    return (
      role === "admin" ||
      role === "manager" ||
      user.employeeId === error.reportedBy
    );
  }

  function canDelete() {
    if (!user) return false;

    const role = user.role?.toLowerCase();

    return role === "admin" || role === "manager";
  }

  function statusClass(status: string) {
    switch (status) {
      case "Pass":
        return "bg-green-500/20 text-green-400";

      case "Fail":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-yellow-500/20 text-yellow-300";
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-slate-900 p-8 text-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr className="text-left text-sm uppercase text-slate-400">

              <th className="p-4">Application</th>

              <th className="p-4">Title</th>

              <th className="p-4">Reported By</th>

              <th className="p-4">Status</th>

              <th className="p-4">Date</th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {errors.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-400"
                >
                  No errors found.
                </td>
              </tr>
            )}

            {errors.map((error) => (
              <tr
                key={error.errorId}
                className="border-t border-slate-800 hover:bg-slate-800/40"
              >
                <td className="p-4">
                  {error.module}
                </td>

                <td className="p-4 font-medium text-white">
                  {error.errorTitle}
                </td>

                <td className="p-4">
                  {error.reportedByName}
                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${statusClass(
                      error.status
                    )}`}
                  >
                    {error.status}
                  </span>

                </td>

                <td className="p-4 whitespace-nowrap">
                  {new Date(
                    error.createdAt
                  ).toLocaleString()}
                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <Link
                      href={`/app-errors/${error.errorId}`}
                      className="rounded-lg bg-cyan-500 p-2 text-black hover:bg-cyan-400"
                    >
                      <Eye size={18} />
                    </Link>

                    {canEdit(error) && (
                      <Link
                        href={`/app-errors/${error.errorId}/edit`}
                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-500"
                      >
                        <Pencil size={18} />
                      </Link>
                    )}

                    {canDelete() && (
                      <button
                        onClick={() =>
                          deleteError(error.errorId)
                        }
                        className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                  </div>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}