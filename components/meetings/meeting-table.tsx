"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Edit,
  Trash2,
  Video,
  Users,
} from "lucide-react";

interface Participant {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  joined?: boolean;
  joinedAt?: string;
}

interface Meeting {
  meetingId: string;
  title: string;
  companyName: string;
  meetingLink: string;
  date: string;
  time: string;
  status: string;
  agenda?: string;
  description?: string;
  decision?: string;
  actionTaken?: string;
  participants: Participant[];
}

export default function MeetingTable() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMeetings() {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();

      if (data.success) {
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeetings();
  }, []);

  async function deleteMeeting(id: string) {
    if (!confirm("Delete this meeting?")) return;

    const res = await fetch(`/api/meetings/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      loadMeetings();
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
        Loading meetings...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <table className="min-w-full">
        <thead className="bg-slate-950">
          <tr className="text-left text-slate-400">
            <th className="p-4">Meeting</th>
            <th className="p-4">Company</th>
            <th className="p-4">Date</th>
            <th className="p-4">Participants</th>
            <th className="p-4">Joined</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {meetings.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="p-8 text-center text-slate-500"
              >
                No meetings found.
              </td>
            </tr>
          ) : (
            meetings.map((meeting) => {
              const joinedCount =
                meeting.participants?.filter(
                  (p) => p.joined
                ).length || 0;

              return (
                <tr
                  key={meeting.meetingId}
                  className="border-t border-slate-800"
                >
                  <td className="p-4">
                    <p className="font-semibold text-white">
                      {meeting.title}
                    </p>

                    {meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        className="mt-2 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                      >
                        <Video size={16} />
                        Join Link
                      </a>
                    )}
                  </td>

                  <td className="p-4 text-slate-300">
                    {meeting.companyName}
                  </td>

                  <td className="p-4 text-slate-300">
                    <div>{meeting.date}</div>
                    <div className="text-xs text-slate-500">
                      {meeting.time}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      {meeting.participants?.map((p) => (
                        <div
                          key={p.employeeId}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Users size={14} />

                          <span className="text-slate-200">
                            {p.employeeName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-400">
                      {joinedCount} / {meeting.participants?.length || 0}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300">
                      {meeting.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/meetings/${meeting.meetingId}`}
                        className="rounded-lg border border-slate-700 p-2 hover:border-cyan-500"
                      >
                        <Eye size={16} />
                      </Link>

                      <Link
                        href={`/meetings/${meeting.meetingId}/edit`}
                        className="rounded-lg border border-slate-700 p-2 hover:border-yellow-500"
                      >
                        <Edit size={16} />
                      </Link>

                      <button
                        onClick={() =>
                          deleteMeeting(meeting.meetingId)
                        }
                        className="rounded-lg border border-slate-700 p-2 hover:border-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}