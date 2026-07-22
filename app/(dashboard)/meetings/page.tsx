"use client";

import {
  CalendarDays,
  Clock,
  Plus,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";


interface Meeting {
  meetingId: string;
  title: string;
  companyName: string;
  employeeName?: string;

  participants?: {
    employeeId: string;
    employeeName: string;
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

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchMeetings();
  }, []);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Meetings
          </h1>

          <p className="text-slate-400">
            Manage scheduled meetings
          </p>
        </div>

        <Link
          href="/meetings/add"
          className="flex items-center gap-2 bg-cyan-500 text-slate-950 px-5 py-3 rounded-xl"
        >
          <Plus size={18} />
          Add Meeting
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">

        <div className="border border-slate-800 bg-slate-950 rounded-xl p-5">
          <CalendarDays className="text-cyan-400" />
          <h2 className="text-2xl text-white font-bold mt-2">
            {meetings.length}
          </h2>
          <p className="text-slate-400">
            Total Meetings
          </p>
        </div>

        <div className="border border-slate-800 bg-slate-950 rounded-xl p-5">
          <Clock className="text-yellow-400" />
          <h2 className="text-2xl text-white font-bold mt-2">
            {
              meetings.filter(
                m => m.status === "Scheduled"
              ).length
            }
          </h2>
          <p className="text-slate-400">
            Upcoming
          </p>
        </div>

        <div className="border border-slate-800 bg-slate-950 rounded-xl p-5">
          <Video className="text-green-400" />
          <h2 className="text-2xl text-white font-bold mt-2">
            {
              meetings.filter(
                m => m.status === "Completed"
              ).length
            }
          </h2>
          <p className="text-slate-400">
            Completed
          </p>
        </div>
        <div className="border border-slate-800 bg-slate-950 rounded-xl p-5">
          <Users className="text-purple-400" />
          <h2 className="text-2xl text-white font-bold mt-2">
            {new Set(meetings.map(m => m.employeeName)).size}
          </h2>
          <p className="text-slate-400">
            Employees
          </p>
        </div>

      </div>

      <div className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden">

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

            {loading ? (

              <tr>
                <td className="p-5 text-slate-400">
                  Loading meetings...
                </td>
              </tr>

            ) : meetings.length === 0 ? (

              <tr>
                <td className="p-5 text-slate-400">
                  No meetings scheduled yet
                </td>
              </tr>

            ) : (
              meetings.map((meeting) => (

               <tr
  key={meeting.meetingId}
  className="border-b border-slate-800 text-white hover:bg-slate-900 transition"
>
  <td className="p-4">
    <div className="font-semibold">
      {meeting.title}
    </div>

    <div className="text-xs text-slate-500">
      {meeting.description}
    </div>
  </td>

  <td className="p-4">
    {meeting.companyName}
  </td>

  <td className="p-4">
    {meeting.date}

    <br />

    <span className="text-xs text-slate-500">
      {meeting.time}
    </span>
  </td>

  <td className="p-4">
    {meeting.participants?.length || 0} Employees
  </td>

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

  <td className="p-4">
    <span
      className={`rounded-full px-3 py-1 text-xs
        ${
          meeting.status === "Completed"
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
    <Link
      href={`/meetings/${meeting.meetingId}`}
      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-400"
    >
      View
    </Link>
  </td>
</tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}