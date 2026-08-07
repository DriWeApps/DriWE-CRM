"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
}

export default function ReportsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      const reportRes = await fetch("/api/reports");
      const reportData = await reportRes.json();

      if (!reportData.success) {
        setLoading(false);
        return;
      }

      setRole(reportData.role);

      const reportRole = reportData.role?.toUpperCase();

      if (reportRole !== "ADMIN" && reportRole !== "MANAGER") {
        router.replace(`/reports/employee/${reportData.employeeId}`);
        return;
      }

      const empRes = await fetch("/api/reports/employees");
      const empData = await empRes.json();

      if (empData.success) {
        setEmployees(empData.employees);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">

      <h1 className="mb-8 text-3xl font-bold text-white">
        Reports
      </h1>

      <h2 className="mb-6 text-xl font-semibold text-white">
        Employee Reports
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {employees.map((employee) => (
          <div
            key={employee.employeeId}
            className="rounded-xl border border-slate-800 bg-slate-950 p-6"
          >
            <Users
              size={32}
              className="mb-4 text-cyan-400"
            />

            <h3 className="text-xl font-bold text-white">
              {employee.firstName} {employee.lastName}
            </h3>

            <p className="mt-1 text-slate-400">
              {employee.designation}
            </p>

            <Link
              href={`/reports/employee/${employee.employeeId}`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400"
            >
              View Report
              <ArrowRight size={18} />
            </Link>
          </div>
        ))}

        {employees.length === 0 && (
          <div className="text-slate-400">
            No employees found.
          </div>
        )}
      </div>

    </div>
  );
}