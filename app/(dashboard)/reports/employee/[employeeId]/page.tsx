"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  CalendarDays,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

interface Report {
  employee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    designation: string;
    department: string;
    email: string;
  };

  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalMeetings: number;
    totalFollowups: number;
  };

  tasks: any[];
  meetings: any[];
  followups: any[];
}

export default function EmployeeReportPage() {
  const { employeeId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    try {
      const res = await fetch(`/api/reports/employee/${employeeId}`);
      const data = await res.json();

      if (data.success) {
        setReport(data.report);
      } else {
        alert(data.message);
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
        Loading report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-red-400">
        Report not found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}

      <div className="flex items-center gap-4">

        <Link
          href="/reports"
          className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
        >
          <ArrowLeft className="text-white" size={18} />
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Employee Report
          </h1>

          <p className="text-slate-400">
            Detailed performance report
          </p>
        </div>

      </div>

      {/* Employee Details */}

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">

        <h2 className="text-xl font-semibold text-white">
          Employee Details
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          <div>
            <p className="text-slate-400 text-sm">Name</p>
            <p className="text-white font-medium">
              {report.employee.firstName} {report.employee.lastName}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">Designation</p>
            <p className="text-white">
              {report.employee.designation}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">Department</p>
            <p className="text-white">
              {report.employee.department}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">Email</p>
            <p className="text-white">
              {report.employee.email}
            </p>
          </div>

        </div>

      </div>

      {/* Summary */}

      <div className="grid gap-5 md:grid-cols-5">

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
          <ClipboardList className="text-cyan-400" />
          <h2 className="mt-3 text-3xl font-bold text-white">
            {report.summary.totalTasks}
          </h2>
          <p className="text-slate-400">
            Total Tasks
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
          <CheckCircle2 className="text-green-400" />
          <h2 className="mt-3 text-3xl font-bold text-white">
            {report.summary.completedTasks}
          </h2>
          <p className="text-slate-400">
            Completed
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
          <ClipboardList className="text-yellow-400" />
          <h2 className="mt-3 text-3xl font-bold text-white">
            {report.summary.pendingTasks}
          </h2>
          <p className="text-slate-400">
            Pending
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
          <CalendarDays className="text-purple-400" />
          <h2 className="mt-3 text-3xl font-bold text-white">
            {report.summary.totalMeetings}
          </h2>
          <p className="text-slate-400">
            Meetings
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
          <PhoneCall className="text-pink-400" />
          <h2 className="mt-3 text-3xl font-bold text-white">
            {report.summary.totalFollowups}
          </h2>
          <p className="text-slate-400">
            Follow-ups
          </p>
        </div>

      </div>

      {/* Tasks */}

      <div className="rounded-xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 p-4">
          <h2 className="text-lg font-semibold text-white">
            Tasks
          </h2>
        </div>

        <div className="divide-y divide-slate-800">

          {report.tasks.length === 0 ? (
            <p className="p-5 text-slate-400">
              No tasks found.
            </p>
          ) : (
            report.tasks.map((task: any) => (
              <div
                key={task.taskId}
                className="p-5"
              >
                <h3 className="font-medium text-white">
                  {task.title}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Status : {task.status}
                </p>
              </div>
            ))
          )}

        </div>

      </div>

      {/* Meetings */}

      <div className="rounded-xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 p-4">
          <h2 className="text-lg font-semibold text-white">
            Meetings
          </h2>
        </div>

        <div className="divide-y divide-slate-800">

          {report.meetings.length === 0 ? (
            <p className="p-5 text-slate-400">
              No meetings found.
            </p>
          ) : (
            report.meetings.map((meeting: any) => (
              <div
                key={meeting.meetingId}
                className="p-5"
              >
                <h3 className="font-medium text-white">
                  {meeting.title}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  {meeting.date} • {meeting.time}
                </p>
              </div>
            ))
          )}

        </div>

      </div>

      {/* Follow-ups */}

      <div className="rounded-xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 p-4">
          <h2 className="text-lg font-semibold text-white">
            Follow-ups
          </h2>
        </div>

        <div className="divide-y divide-slate-800">

          {report.followups.length === 0 ? (
            <p className="p-5 text-slate-400">
              No follow-ups found.
            </p>
          ) : (
            report.followups.map((item: any) => (
              <div
                key={item.followUpId}
                className="p-5"
              >
                <h3 className="font-medium text-white">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  {item.followupDate}
                </p>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}