
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarCheck,
    CheckCircle2,
    Clock3,
    Loader2,
    Save,
    Users,
    XCircle,
} from "lucide-react";

type Worker = {
    workerId: string;
    personId?: string;
    personType?: "Worker" | "Project Manager" | "Project Creator";
    name: string;
    phone: string;
    role: string;
    workerType: string;
    dailyWage: number;
    projectId: string;
    projectName?: string;
    active: boolean;
};

function getWorkerId(worker: Worker): string {
    return (worker.workerId || "").trim() || worker.personId?.trim() || "";
}

type Project = {
    projectId: string;
    projectName: string;
    location: string;
    status: string;
};

type AttendanceStatus = "Present" | "Absent" | "Half Day";

type AttendanceRow = {
    workerId: string;
    workerName: string;
    projectId: string;
    projectName?: string;
    date: string;
    status: AttendanceStatus;
    dailyWage: number;
    labourCost: number;
};

export default function AttendancePage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [attendance, setAttendance] = useState<
        Record<string, AttendanceStatus>
    >({});

    const [selectedProject, setSelectedProject] = useState("");

    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [workersRes, projectsRes] = await Promise.all([
                fetch("/api/construction/workers", {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch("/api/construction/projects", {
                    credentials: "include",
                    cache: "no-store",
                }),
            ]);

            const workersData = await workersRes.json();
            const projectsData = await projectsRes.json();

            if (!workersRes.ok || !workersData.success) {
                throw new Error(
                    workersData.message || "Failed to load workers"
                );
            }

            if (!projectsRes.ok || !projectsData.success) {
                throw new Error(
                    projectsData.message || "Failed to load projects"
                );
            }

            const workerEntries = Array.isArray(workersData.workers)
                ? workersData.workers.filter(
                      (worker: Worker) =>
                          worker.personType === "Worker" ||
                          (!worker.personType && Boolean(worker.workerId))
                  )
                : [];

            setWorkers(
                workerEntries
                    .filter((worker: Worker) => Boolean(getWorkerId(worker)))
                    .map((worker: Worker) => ({
                        ...worker,
                        workerId: getWorkerId(worker),
                    }))
            );

            setProjects(projectsData.projects || []);

            if (!selectedProject && projectsData.projects?.length) {
                setSelectedProject(projectsData.projects[0].projectId);
            }
        } catch (err) {
            console.error("Load attendance data error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load attendance data"
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadExistingAttendance(projectId: string, date: string) {
        if (!projectId || !date) return;

        try {
            const res = await fetch(
                `/api/construction/attendance?projectId=${encodeURIComponent(
                    projectId
                )}&date=${encodeURIComponent(date)}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            if (!res.ok) return;

            const data = await res.json();

            if (!data.success) return;

            const existing = data.attendance || [];

            const mapped: Record<string, AttendanceStatus> = {};

            existing.forEach((item: AttendanceRow) => {
                mapped[item.workerId] = item.status;
            });

            setAttendance(mapped);
        } catch (err) {
            console.error("Load existing attendance error:", err);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedProject && selectedDate) {
            loadExistingAttendance(selectedProject, selectedDate);
        }
    }, [selectedProject, selectedDate]);

    const projectWorkers = useMemo(() => {
        return workers.filter(
            (worker) =>
                worker.active && worker.projectId === selectedProject
        );
    }, [workers, selectedProject]);

    const presentCount = projectWorkers.filter(
        (worker) => attendance[worker.workerId] === "Present"
    ).length;

    const absentCount = projectWorkers.filter(
        (worker) => attendance[worker.workerId] === "Absent"
    ).length;

    const halfDayCount = projectWorkers.filter(
        (worker) => attendance[worker.workerId] === "Half Day"
    ).length;

    function setWorkerStatus(workerId: string, status: AttendanceStatus) {
        setAttendance((prev) => ({
            ...prev,
            [workerId]: status,
        }));
    }

    function markAll(status: AttendanceStatus) {
        const updated: Record<string, AttendanceStatus> = {};

        projectWorkers.forEach((worker) => {
            updated[worker.workerId] = status;
        });

        setAttendance(updated);
    }

    async function saveAttendance() {
        if (!selectedProject) {
            setError("Please select a project.");
            return;
        }

        if (!selectedDate) {
            setError("Please select a date.");
            return;
        }

        if (!projectWorkers.length) {
            setError(
                "There are no active workers assigned to this project."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const records = projectWorkers.map((worker) => {
                const status = attendance[worker.workerId] || "Absent";

                let labourCost = 0;

                if (status === "Present") {
                    labourCost = Number(worker.dailyWage || 0);
                }

                if (status === "Half Day") {
                    labourCost = Number(worker.dailyWage || 0) * 0.5;
                }

                return {
                    workerId: worker.workerId,
                    workerName: worker.name,
                    projectId: worker.projectId,
                    projectName: worker.projectName,
                    date: selectedDate,
                    status,
                    dailyWage: Number(worker.dailyWage || 0),
                    labourCost,
                };
            });

            const res = await fetch("/api/construction/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    projectId: selectedProject,
                    date: selectedDate,
                    records,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to save attendance"
                );
            }

            setSuccess("Attendance saved successfully.");

            await loadExistingAttendance(selectedProject, selectedDate);
        } catch (err) {
            console.error("Save attendance error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save attendance"
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black";

    const cardClass = "rounded-xl border border-gray-200 bg-white shadow-sm";

    return (
        <div className="min-h-screen bg-white p-4 text-black md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            href="/DriWE-Construction/people"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to People
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                                <CalendarCheck className="h-5 w-5 text-black" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-black">
                                    Attendance
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Manage daily workforce attendance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className={`${cardClass} p-5`}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black">
                                Project
                            </label>

                            <select
                                value={selectedProject}
                                onChange={(e) =>
                                    setSelectedProject(e.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Select Project</option>

                                {projects.map((project) => (
                                    <option
                                        key={project.projectId}
                                        value={project.projectId}
                                    >
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-black">
                                Attendance Date
                            </label>

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                    >
                        {success}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <div className={`${cardClass} p-5`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Present
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black">
                                    {presentCount}
                                </p>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                    </div>

                    <div className={`${cardClass} p-5`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Half Day
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black">
                                    {halfDayCount}
                                </p>
                            </div>
                            <Clock3 className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>

                    <div className={`${cardClass} p-5`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Absent
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black">
                                    {absentCount}
                                </p>
                            </div>
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Daily Attendance */}
                <div className={`${cardClass} overflow-hidden`}>
                    <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold text-black">
                                Daily Attendance
                            </h2>
                            <p className="mt-1 text-xs text-gray-600">
                                {projectWorkers.length} active worker
                                {projectWorkers.length !== 1 ? "s" : ""}{" "}
                                assigned to this project
                            </p>
                        </div>

                        {projectWorkers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => markAll("Present")}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100"
                                >
                                    Mark All Present
                                </button>

                                <button
                                    type="button"
                                    onClick={() => markAll("Absent")}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100"
                                >
                                    Mark All Absent
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-gray-600">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading attendance...
                        </div>
                    ) : !selectedProject ? (
                        <div className="py-16 text-center text-gray-600">
                            Select a project to view workers.
                        </div>
                    ) : projectWorkers.length === 0 ? (
                        <div className="py-16 text-center">
                            <Users className="mx-auto h-10 w-10 text-gray-400" />
                            <p className="mt-3 text-gray-800">
                                No active workers found
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                Assign workers to this project first.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-700">
                                            <th className="px-5 py-3 font-medium">
                                                Worker
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Role
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Attendance
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {projectWorkers.map(
                                            (worker, index) => {
                                                const workerId =
                                                    getWorkerId(worker);
                                                const status =
                                                    attendance[workerId];

                                                return (
                                                    <tr
                                                        key={`${workerId}-${index}`}
                                                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-black">
                                                                {worker.name}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-600">
                                                                {worker.phone}
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-700">
                                                            {worker.role}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setWorkerStatus(
                                                                            workerId,
                                                                            "Present"
                                                                        )
                                                                    }
                                                                    aria-pressed={
                                                                        status ===
                                                                        "Present"
                                                                    }
                                                                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                                        status ===
                                                                        "Present"
                                                                            ? "border-black bg-black text-white"
                                                                            : "border-gray-300 bg-white text-black hover:bg-gray-100"
                                                                    }`}
                                                                >
                                                                    Present
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setWorkerStatus(
                                                                            workerId,
                                                                            "Half Day"
                                                                        )
                                                                    }
                                                                    aria-pressed={
                                                                        status ===
                                                                        "Half Day"
                                                                    }
                                                                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                                        status ===
                                                                        "Half Day"
                                                                            ? "border-black bg-black text-white"
                                                                            : "border-gray-300 bg-white text-black hover:bg-gray-100"
                                                                    }`}
                                                                >
                                                                    Half Day
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setWorkerStatus(
                                                                            workerId,
                                                                            "Absent"
                                                                        )
                                                                    }
                                                                    aria-pressed={
                                                                        status ===
                                                                        "Absent"
                                                                    }
                                                                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                                        status ===
                                                                        "Absent"
                                                                            ? "border-black bg-black text-white"
                                                                            : "border-gray-300 bg-white text-black hover:bg-gray-100"
                                                                    }`}
                                                                >
                                                                    Absent
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Save Attendance */}
                            <div className="flex justify-end border-t border-gray-200 px-5 py-4">
                                <button
                                    type="button"
                                    onClick={saveAttendance}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Attendance
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
