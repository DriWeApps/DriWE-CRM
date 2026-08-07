

"use client";

import {
  CalendarDays,
  Clock,
  Plus,
  Users,
  Video,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
// import router from "next/dist/shared/lib/router/router";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Meeting {
  meetingId: string;
  title: string;
  companyName: string;

  createdBy?: string;
  createdByEmail?: string;
  createdByName?: string;

  employeeName?: string;

  participants?: {
    employeeId: string;
    employeeName: string;
    employeeEmail?: string;
    joined: boolean;
    joinedAt?: string;
  }[];

  meetingLink?: string;
  description?: string;
  decision?: string;
  actionTaken?: string;
  date: string;
  time: string;
  status: string;
}

interface User {
  userId: string;
  employeeId?: string;
  email: string;
  role: string;
  pageAccess: string[];
}

export default function Meetings() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  async function fetchUser() {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });

    const data = await res.json();

    if (!data.authenticated || !data.user) {
      router.push("/login");
      return;
    }

    // Admin can access everything
    if (data.user.role?.toLowerCase() !== "admin") {
      const pageAccess = data.user.pageAccess || [];

      if (!pageAccess.includes("meetings")) {
        alert("You don't have permission to access Meetings.");
        router.replace("/dashboard");
        return;
      }
    }

    setUser(data.user);
  } catch (error) {
    console.error("Failed to fetch current user", error);
    router.replace("/dashboard");
  } finally {
    setUserLoading(false);
  }
}




  async function fetchMeetings() {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();

      if (data.success) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error("Failed to fetch meetings", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchMeetings();
  }, []);

  async function handleDelete(meetingId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meeting?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete meeting");
        return;
      }

      setMeetings((prev) =>
        prev.filter((meeting) => meeting.meetingId !== meetingId)
      );
    } catch (error) {
      console.error("Delete meeting error:", error);
      alert("Failed to delete meeting");
    }
  }

  const role = user?.role?.toLowerCase();

  // const canManageMeetings =
  //   role === "admin" || role === "manager";

  const canManageMeeting = (meeting: Meeting) => {
    const isAdminOrManager =
      role === "admin" || role === "manager";

    const isCreator =
      meeting.createdBy === user?.userId;

    return isAdminOrManager || isCreator;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Meetings
          </h1>

          <p className="text-slate-400">
            Manage scheduled meetings
          </p>
        </div>

       {user &&
  (user.role?.toLowerCase() === "admin" ||
    user.pageAccess?.includes("meetings")) && (
    <Link
      href="/meetings/add"
      className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
    >
      <Plus size={18} />
      Add Meeting
    </Link>
)}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <CalendarDays className="text-cyan-400" />

          <h2 className="mt-2 text-2xl font-bold text-white">
            {meetings.length}
          </h2>

          <p className="text-slate-400">
            Total Meetings
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <Clock className="text-yellow-400" />

          <h2 className="mt-2 text-2xl font-bold text-white">
            {
              meetings.filter(
                (m) => m.status === "Scheduled"
              ).length
            }
          </h2>

          <p className="text-slate-400">
            Upcoming
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <Video className="text-green-400" />

          <h2 className="mt-2 text-2xl font-bold text-white">
            {
              meetings.filter(
                (m) => m.status === "Completed"
              ).length
            }
          </h2>

          <p className="text-slate-400">
            Completed
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <Users className="text-purple-400" />

          <h2 className="mt-2 text-2xl font-bold text-white">
            {new Set(
              meetings.map((m) => m.employeeName)
            ).size}
          </h2>

          <p className="text-slate-400">
            Employees
          </p>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-800">
              <tr className="text-left text-slate-400">
                <th className="p-4">Meeting</th>
                <th className="p-4">Company</th>
                <th className="p-4">Date</th>
                <th className="p-4">Participants</th>
                <th className="p-4">Meeting Link</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading || userLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-5 text-slate-400"
                  >
                    Loading meetings...
                  </td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-5 text-slate-400"
                  >
                    No meetings scheduled yet
                  </td>
                </tr>
              ) : (
                meetings.map((meeting) => (
                  <tr
                    key={meeting.meetingId}
                    className="border-b border-slate-800 text-white transition hover:bg-slate-900"
                  >
                    {/* Meeting */}
                    <td className="p-4">
                      <div className="font-semibold">
                        {meeting.title}
                      </div>

                      <div className="text-xs text-slate-500">
                        {meeting.description}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="p-4">
                      {meeting.companyName}
                    </td>

                    {/* Date */}
                    <td className="p-4">
                      {meeting.date}

                      <br />

                      <span className="text-xs text-slate-500">
                        {meeting.time}
                      </span>
                    </td>

                    {/* Participants */}
                    <td className="p-4">
                      {meeting.participants?.length || 0} Employees
                    </td>

                    {/* Meeting Link */}
                    <td className="p-4">
                      {meeting.meetingLink ? (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${meeting.status === "Completed"
                          ? "bg-green-500/20 text-green-400"
                          : meeting.status === "Scheduled"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-cyan-500/20 text-cyan-300"
                          }`}
                      >
                        {meeting.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">

                        {/* VIEW - Everyone */}
                        <Link
                          href={`/meetings/${meeting.meetingId}`}
                          title="View Meeting"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                        >
                          <Eye size={17} />
                        </Link>

                        {/* EDIT - Admin / Manager / Meeting Creator */}
                        {canManageMeeting(meeting) && (
                          <Link
                            href={`/meetings/${meeting.meetingId}/edit`}
                            title="Edit Meeting"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-yellow-400 transition hover:border-yellow-500 hover:bg-yellow-500/10"
                          >
                            <Pencil size={17} />
                          </Link>
                        )}

                        {/* DELETE - Admin / Manager ONLY */}
                        {(role === "admin" || role === "manager") && (
                          <button
                            type="button"
                            title="Delete Meeting"
                            onClick={() =>
                              handleDelete(meeting.meetingId)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}