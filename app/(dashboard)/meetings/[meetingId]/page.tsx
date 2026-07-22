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

    decision?: string;
    actionTaken?: string;
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

    const [decision, setDecision] = useState("");
    const [actionTaken, setActionTaken] = useState("");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("Scheduled");

    useEffect(() => {
        loadMeeting();
    }, []);

    async function saveMeetingNotes() {
        try {
            setSaving(true);

            const res = await fetch(`/api/meetings/${meetingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                    decision,
                    actionTaken,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert("Meeting notes updated");
                loadMeeting();
            }

        } catch (error) {
            console.error(error);
            alert("Failed to update");
        } finally {
            setSaving(false);
        }
    }

    async function loadMeeting() {
        try {
            const res = await fetch(`/api/meetings/${meetingId}`);
            const data = await res.json();

            if (data.success) {
                setMeeting(data.meeting);

                setDecision(data.meeting.decision || "");
                setActionTaken(data.meeting.actionTaken || "");
                setStatus(data.meeting.status || "Scheduled");
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
                    Meeting Status
                </h2>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
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

                                {participant.decision && (
                                    <p className="mt-2 text-sm text-cyan-300">
                                        Decision: {participant.decision}
                                    </p>
                                )}

                                {participant.actionTaken && (
                                    <p className="mt-1 text-sm text-yellow-300">
                                        Action: {participant.actionTaken}
                                    </p>
                                )}
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

                    <textarea
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        placeholder="Enter final decision..."
                        rows={5}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-500"
                    />

                </div>


                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                    <h2 className="mb-4 text-xl font-semibold text-white">
                        Action Taken
                    </h2>

                    <textarea
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="Enter action items..."
                        rows={5}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-500"
                    />

                </div>


                <div className="lg:col-span-2 flex justify-end">

                    <button
                        onClick={saveMeetingNotes}
                        disabled={saving}
                        className="rounded-xl bg-cyan-500 px-8 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Meeting Notes"}
                    </button>

                </div>

            </div>

        </div>
    );
}