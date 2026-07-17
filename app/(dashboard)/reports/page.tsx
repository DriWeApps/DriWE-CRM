"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  CalendarDays,
  PhoneCall,
  ArrowRight,
} from "lucide-react";

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [myReport, setMyReport] = useState<any>(null);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      const reportRes = await fetch("/api/reports");
      const reportData = await reportRes.json();

      if (!reportData.success) return;

      setRole(reportData.role);

      // Employee Login
      if (reportData.role !== "ADMIN") {
        setMyReport(reportData.reports);
      }

      // Admin Login
      if (reportData.role === "ADMIN") {
        const empRes = await fetch("/api/reports/employees");
        const empData = await empRes.json();

        if (empData.success) {
          setEmployees(empData.employees);
        }
      }
    } catch (err) {
      console.log(err);
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

      <h1 className="text-3xl font-bold text-white mb-8">
        Reports
      </h1>

      {role === "ADMIN" ? (

        <>
          <h2 className="text-xl font-semibold text-white mb-6">
            Employee Reports
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {employees.map((emp) => (

              <div
                key={emp.employeeId}
                className="rounded-xl border border-slate-800 bg-slate-950 p-6"
              >
                <Users className="text-cyan-400 mb-4" size={32} />

                <h3 className="text-xl font-bold text-white">
                  {emp.firstName} {emp.lastName}
                </h3>

                <p className="text-slate-400 mt-1">
                  {emp.designation}
                </p>

                <Link
                  href={`/reports/employee/${emp.employeeId}`}
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
        </>

      ) : (

        <>
          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <ClipboardList className="text-cyan-400" />
              <h2 className="mt-3 text-3xl font-bold text-white">
                {myReport.summary.totalTasks}
              </h2>
              <p className="text-slate-400">Tasks</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <CalendarDays className="text-green-400" />
              <h2 className="mt-3 text-3xl font-bold text-white">
                {myReport.summary.totalMeetings}
              </h2>
              <p className="text-slate-400">Meetings</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <PhoneCall className="text-yellow-400" />
              <h2 className="mt-3 text-3xl font-bold text-white">
                {myReport.summary.totalFollowups}
              </h2>
              <p className="text-slate-400">Follow-ups</p>
            </div>

          </div>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6">

            <h2 className="mb-4 text-xl font-semibold text-white">
              Activity Summary
            </h2>

            <p className="text-slate-300">
              Completed Tasks : {myReport.summary.completedTasks}
            </p>

            <p className="mt-2 text-slate-300">
              Pending Tasks : {myReport.summary.pendingTasks}
            </p>

            <p className="mt-2 text-slate-300">
              Meetings : {myReport.summary.totalMeetings}
            </p>

            <p className="mt-2 text-slate-300">
              Follow-ups : {myReport.summary.totalFollowups}
            </p>

          </div>
        </>

      )}

    </div>
  );
}