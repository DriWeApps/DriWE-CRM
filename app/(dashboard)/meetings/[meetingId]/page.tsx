"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Users,
  Video,
  CheckCircle2,
  XCircle,
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
  companyId: string;
  meetingLink: string;
  agenda: string;
  description: string;
  date: string;
  time: string;
  status: string;
  decision?: string;
  actionTaken?: string;
  participants: Participant[];
}

export default function MeetingDetailsPage() {
  const { meetingId } = useParams();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeeting();
  }, []);

  async function loadMeeting() {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      const data = await res.json();

      if (data.success) {
        setMeeting(data.meeting);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400">
        Loading meeting...
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-10 text-center text-red-400">
        Meeting not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">

      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/meetings"
            className="mb-4 inline-flex items-center gap-2 text-cyan-400"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <h1 className="text-3xl font-bold text-white">
            {meeting.title}
          </h1>

          <p className="text-slate-400">
            Meeting Details
          </p>
        </div>

        {meeting.meetingLink && (
          <a
            href={meeting.meetingLink}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
          >
            <Video size={18} />
            Join Meeting
          </a>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <Building2 className="text-cyan-400" />
          <p className="mt-2 text-sm text-slate-400">
            Company
          </p>
          <h2 className="text-lg font-semibold text-white">
            {meeting.companyName}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <Calendar className="text-green-400" />
          <p className="mt-2 text-sm text-slate-400">
            Date
          </p>
          <h2 className="text-lg font-semibold text-white">
            {meeting.date}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <Clock className="text-yellow-400" />
          <p className="mt-2 text-sm text-slate-400">
            Time
          </p>
          <h2 className="text-lg font-semibold text-white">
            {meeting.time}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <Users className="text-purple-400" />
          <p className="mt-2 text-sm text-slate-400">
            Participants
          </p>
          <h2 className="text-lg font-semibold text-white">
            {meeting.participants.length}
          </h2>
        </div>

      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-4 text-xl font-semibold text-white">
          Agenda
        </h2>

        <p className="whitespace-pre-wrap text-slate-300">
          {meeting.agenda || "-"}
        </p>

      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-4 text-xl font-semibold text-white">
          Description
        </h2>

        <p className="whitespace-pre-wrap text-slate-300">
          {meeting.description || "-"}
        </p>

      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="mb-6 text-xl font-semibold text-white">
          Participant Status
        </h2>

        <div className="space-y-4">

          {meeting.participants.map((participant) => (

            <div
              key={participant.employeeId}
              className="flex items-center justify-between rounded-xl border border-slate-800 p-4"
            >

              <div>
                <h3 className="font-semibold text-white">
                  {participant.employeeName}
                </h3>

                <p className="text-sm text-slate-400">
                  {participant.employeeEmail}
                </p>
              </div>

              <div className="text-right">

                {participant.joined ? (
                  <>
                    <div className="flex items-center justify-end gap-2 text-green-400">
                      <CheckCircle2 size={18} />
                      Joined
                    </div>

                    <p className="text-xs text-slate-500">
                      {participant.joinedAt}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-end gap-2 text-red-400">
                    <XCircle size={18} />
                    Not Joined
                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-4 text-xl font-semibold text-white">
            Decision
          </h2>

          <p className="text-slate-300 whitespace-pre-wrap">
            {meeting.decision || "No decision recorded yet."}
          </p>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-4 text-xl font-semibold text-white">
            Action Taken
          </h2>

          <p className="text-slate-300 whitespace-pre-wrap">
            {meeting.actionTaken || "No action recorded yet."}
          </p>

        </div>

      </div>

    </div>
  );
}