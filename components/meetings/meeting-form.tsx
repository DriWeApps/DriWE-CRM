"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Company {
    companyId: string;
    companyName: string;
}

interface Employee {
    employeeId: string;
    fullName: string;
    email: string;
}

interface Participant {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    joined?: boolean;
    joinedAt?: string;
    decision?: string;
    actionTaken?: string;
}

interface Props {
    mode?: "create" | "edit";
    meetingId?: string;
}

export default function MeetingForm({
    mode = "create",
    meetingId,
}: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [participants, setParticipants] = useState<Participant[]>([]);

    const [form, setForm] = useState({
        title: "",
        companyId: "",
        companyName: "",
        meetingLink: "",
        agenda: "",
        description: "",
        decision: "",
        actionTaken: "",
        date: "",
        time: "",
        status: "Scheduled",
    });
    useEffect(() => {
        loadInitialData();

        if (mode === "edit" && meetingId) {
            loadMeeting();
        }
    }, [mode, meetingId]);

    async function loadInitialData() {
        try {
            const [companyRes, employeeRes] = await Promise.all([
                fetch("/api/companies"),
                fetch("/api/employees"),
            ]);

            const companyData = await companyRes.json();
            const employeeData = await employeeRes.json();

            setCompanies(companyData.companies || []);
            setEmployees(employeeData.employees || employeeData || []);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadMeeting() {
        try {
            const res = await fetch(`/api/meetings/${meetingId}`);
            const data = await res.json();

            const meeting = data.meeting;

            setForm({
                title: meeting.title || "",
                companyId: meeting.companyId || "",
                companyName: meeting.companyName || "",
                meetingLink: meeting.meetingLink || "",
                agenda: meeting.agenda || "",
                description: meeting.description || "",
                decision: meeting.decision || "",
                actionTaken: meeting.actionTaken || "",
                date: meeting.date || "",
                time: meeting.time || "",
                status: meeting.status || "Scheduled",
            });
            setParticipants(meeting.participants || []);
        } catch (err) {
            console.error(err);
        }
    }

    function updateField(field: string, value: string) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function handleCompany(companyId: string) {
        const company = companies.find(
            (c) => c.companyId === companyId
        );

        if (!company) return;

        setForm((prev) => ({
            ...prev,
            companyId: company.companyId,
            companyName: company.companyName,
        }));
    }

    function toggleEmployee(employee: Employee) {
        const exists = participants.find(
            (p) => p.employeeId === employee.employeeId
        );

        if (exists) {
            setParticipants((prev) =>
                prev.filter(
                    (p) => p.employeeId !== employee.employeeId
                )
            );
            return;
        }

        setParticipants((prev) => [
            ...prev,
            {
                employeeId: employee.employeeId,
                employeeName: employee.fullName,
                employeeEmail: employee.email,
                joined: false,
                joinedAt: "",
            },
        ]);
    }

    async function handleSubmit() {
        try {
            setLoading(true);

            const payload = {
                ...form,
                participants,
            };

            const res = await fetch(
                mode === "create"
                    ? "/api/meetings"
                    : `/api/meetings/${meetingId}`,
                {
                    method: mode === "create" ? "POST" : "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!data.success) {
                alert(data.message);
                return;
            }

            router.push("/meetings");
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Failed to save meeting.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
            <h2 className="mb-8 text-2xl font-bold text-white">
                {mode === "create" ? "Schedule Meeting" : "Edit Meeting"}
            </h2>

            {/* Meeting Title */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    Meeting Title
                </label>
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Weekly Review"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
            </div>


            <div>
                <label className="text-sm text-slate-300">
                    Decision
                </label>

                <textarea
                    rows={3}
                    value={form.decision}
                    onChange={(e) =>
                        updateField("decision", e.target.value)
                    }
                    placeholder="Enter meeting decision..."
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
            </div>


            <div>
                <label className="text-sm text-slate-300">
                    Action Taken
                </label>

                <textarea
                    rows={3}
                    value={form.actionTaken}
                    onChange={(e) =>
                        updateField("actionTaken", e.target.value)
                    }
                    placeholder="Enter action items..."
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
            </div>
            {/* Company */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    Company
                </label>
                <select
                    value={form.companyId}
                    onChange={(e) => handleCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                        <option
                            key={company.companyId}
                            value={company.companyId}
                        >
                            {company.companyName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Meeting Link */}
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    Meeting Link
                </label>
                <input
                    type="url"
                    value={form.meetingLink}
                    onChange={(e) => updateField("meetingLink", e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
            </div>

            {/* Agenda */}
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    Meeting Agenda
                </label>
                <textarea
                    rows={3}
                    value={form.agenda}
                    onChange={(e) => updateField("agenda", e.target.value)}
                    placeholder="Discuss project progress, pending work, next milestones..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        Meeting Date
                    </label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => updateField("date", e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        Meeting Time
                    </label>
                    <input
                        type="time"
                        value={form.time}
                        onChange={(e) => updateField("time", e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    />
                </div>
            </div>

            {/* Participants */}
            <div className="mt-8">
                <label className="mb-4 block text-sm font-medium text-slate-300">
                    Select Participants
                </label>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {employees.map((employee) => {
                        const checked = participants.some(
                            (p) => p.employeeId === employee.employeeId
                        );

                        return (
                            <label
                                key={employee.employeeId}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${checked
                                    ? "border-cyan-500 bg-cyan-500/10"
                                    : "border-slate-700 bg-slate-950"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleEmployee(employee)}
                                />
                                <div>
                                    <p className="font-medium text-white">
                                        {employee.fullName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {employee.email}
                                    </p>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Description */}
            <div className="mt-8">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    Description
                </label>
                <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Meeting notes, objectives, discussion points..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
            </div>

            {/* Selected Participants */}
            <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-white">
                    Selected Participants ({participants.length})
                </h3>

                {participants.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-400">
                        No employees selected.
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {participants.map((participant) => (
                            <div
                                key={participant.employeeId}
                                className="rounded-xl border border-slate-700 bg-slate-950 p-4"
                            >
                                <h4 className="font-semibold text-white">
                                    {participant.employeeName}
                                </h4>
                                <p className="mt-1 text-xs text-slate-400">
                                    {participant.employeeEmail}
                                </p>
                                <div className="mt-3">
                                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                                        Pending Join
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="mt-10 flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-xl bg-cyan-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : mode === "create"
                            ? "Create Meeting"
                            : "Update Meeting"}
                </button>
            </div>
        </div>
    );
}