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
    name: string;
    phone: string;
    role: string;
    workerType: string;
    dailyWage: number;
    projectId: string;
    projectName?: string;
    active: boolean;
};

type Project = {
    projectId: string;
    projectName: string;
    location: string;
    status: string;
};

type AttendanceStatus =
    | "Present"
    | "Absent"
    | "Half Day";

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

    const [selectedProject, setSelectedProject] =
        useState("");

    const [selectedDate, setSelectedDate] =
        useState(
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

            const [workersRes, projectsRes] =
                await Promise.all([
                    fetch(
                        "/api/construction/workers",
                        {
                            credentials: "include",
                            cache: "no-store",
                        }
                    ),
                    fetch(
                        "/api/construction/projects",
                        {
                            credentials: "include",
                            cache: "no-store",
                        }
                    ),
                ]);

            const workersData =
                await workersRes.json();

            const projectsData =
                await projectsRes.json();

            if (
                !workersRes.ok ||
                !workersData.success
            ) {
                throw new Error(
                    workersData.message ||
                        "Failed to load workers"
                );
            }

            if (
                !projectsRes.ok ||
                !projectsData.success
            ) {
                throw new Error(
                    projectsData.message ||
                        "Failed to load projects"
                );
            }

            setWorkers(
                workersData.workers || []
            );

            setProjects(
                projectsData.projects || []
            );

            if (
                !selectedProject &&
                projectsData.projects?.length
            ) {
                setSelectedProject(
                    projectsData.projects[0].projectId
                );
            }
        } catch (err) {
            console.error(
                "Load attendance data error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load attendance data"
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadExistingAttendance(
        projectId: string,
        date: string
    ) {
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

            if (!res.ok) {
                return;
            }

            const data = await res.json();

            if (!data.success) {
                return;
            }

            const existing =
                data.attendance || [];

            const mapped: Record<
                string,
                AttendanceStatus
            > = {};

            existing.forEach(
                (item: AttendanceRow) => {
                    mapped[item.workerId] =
                        item.status;
                }
            );

            setAttendance(mapped);
        } catch (err) {
            console.error(
                "Load existing attendance error:",
                err
            );
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedProject && selectedDate) {
            loadExistingAttendance(
                selectedProject,
                selectedDate
            );
        }
    }, [selectedProject, selectedDate]);

    const projectWorkers = useMemo(() => {
        return workers.filter(
            (worker) =>
                worker.active &&
                worker.projectId ===
                    selectedProject
        );
    }, [workers, selectedProject]);

    const presentCount = projectWorkers.filter(
        (worker) =>
            attendance[worker.workerId] ===
            "Present"
    ).length;

    const absentCount = projectWorkers.filter(
        (worker) =>
            attendance[worker.workerId] ===
            "Absent"
    ).length;

    const halfDayCount = projectWorkers.filter(
        (worker) =>
            attendance[worker.workerId] ===
            "Half Day"
    ).length;

    const labourCost = projectWorkers.reduce(
        (total, worker) => {
            const status =
                attendance[worker.workerId];

            if (status === "Present") {
                return (
                    total +
                    Number(worker.dailyWage || 0)
                );
            }

            if (status === "Half Day") {
                return (
                    total +
                    Number(worker.dailyWage || 0) *
                        0.5
                );
            }

            return total;
        },
        0
    );

    function setWorkerStatus(
        workerId: string,
        status: AttendanceStatus
    ) {
        setAttendance((prev) => ({
            ...prev,
            [workerId]: status,
        }));
    }

    function markAll(
        status: AttendanceStatus
    ) {
        const updated: Record<
            string,
            AttendanceStatus
        > = {};

        projectWorkers.forEach((worker) => {
            updated[worker.workerId] =
                status;
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

            const records = projectWorkers.map(
                (worker) => {
                    const status =
                        attendance[
                            worker.workerId
                        ] || "Absent";

                    let labourCost = 0;

                    if (
                        status === "Present"
                    ) {
                        labourCost =
                            Number(
                                worker.dailyWage ||
                                    0
                            );
                    }

                    if (
                        status === "Half Day"
                    ) {
                        labourCost =
                            Number(
                                worker.dailyWage ||
                                    0
                            ) * 0.5;
                    }

                    return {
                        workerId:
                            worker.workerId,
                        workerName:
                            worker.name,
                        projectId:
                            worker.projectId,
                        projectName:
                            worker.projectName,
                        date: selectedDate,
                        status,
                        dailyWage:
                            Number(
                                worker.dailyWage ||
                                    0
                            ),
                        labourCost,
                    };
                }
            );

            const res = await fetch(
                "/api/construction/attendance",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        projectId:
                            selectedProject,
                        date: selectedDate,
                        records,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to save attendance"
                );
            }

            setSuccess(
                "Attendance saved successfully."
            );

            await loadExistingAttendance(
                selectedProject,
                selectedDate
            );
        } catch (err) {
            console.error(
                "Save attendance error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save attendance"
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Link
                            href="/DriWE-Construction/people"
                            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to People
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                <CalendarCheck className="h-5 w-5 text-yellow-400" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">
                                    Attendance
                                </h1>

                                <p className="text-sm text-zinc-400">
                                    Manage daily workforce attendance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Project
                            </label>

                            <select
                                value={
                                    selectedProject
                                }
                                onChange={(e) =>
                                    setSelectedProject(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                            >
                                <option value="">
                                    Select Project
                                </option>

                                {projects.map(
                                    (project) => (
                                        <option
                                            key={
                                                project.projectId
                                            }
                                            value={
                                                project.projectId
                                            }
                                        >
                                            {
                                                project.projectName
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Attendance Date
                            </label>

                            <input
                                type="date"
                                value={
                                    selectedDate
                                }
                                onChange={(e) =>
                                    setSelectedDate(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                        {success}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Present
                                </p>

                                <p className="text-2xl font-bold mt-1">
                                    {presentCount}
                                </p>
                            </div>

                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Half Day
                                </p>

                                <p className="text-2xl font-bold mt-1">
                                    {halfDayCount}
                                </p>
                            </div>

                            <Clock3 className="h-6 w-6 text-yellow-400" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Absent
                                </p>

                                <p className="text-2xl font-bold mt-1">
                                    {absentCount}
                                </p>
                            </div>

                            <XCircle className="h-6 w-6 text-red-400" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Labour Cost
                                </p>

                                <p className="text-2xl font-bold mt-1">
                                    ₹
                                    {labourCost.toLocaleString(
                                        "en-IN"
                                    )}
                                </p>
                            </div>

                            <Users className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Attendance */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 overflow-hidden">

                    <div className="px-5 py-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">
                                Daily Attendance
                            </h2>

                            <p className="text-xs text-zinc-500 mt-1">
                                {projectWorkers.length} active
                                worker
                                {projectWorkers.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                assigned to this project
                            </p>
                        </div>

                        {projectWorkers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        markAll(
                                            "Present"
                                        )
                                    }
                                    className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/20"
                                >
                                    Mark All Present
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        markAll(
                                            "Absent"
                                        )
                                    }
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20"
                                >
                                    Mark All Absent
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-16 text-zinc-400">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Loading attendance...
                        </div>
                    ) : !selectedProject ? (
                        <div className="py-16 text-center text-zinc-500">
                            Select a project to view workers.
                        </div>
                    ) : projectWorkers.length ===
                      0 ? (
                        <div className="py-16 text-center">
                            <Users className="h-10 w-10 mx-auto text-zinc-700" />

                            <p className="mt-3 text-zinc-300">
                                No active workers found
                            </p>

                            <p className="text-sm text-zinc-500 mt-1">
                                Assign workers to this project first.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-left text-zinc-500">
                                            <th className="px-5 py-3 font-medium">
                                                Worker
                                            </th>

                                            <th className="px-5 py-3 font-medium">
                                                Role
                                            </th>

                                            <th className="px-5 py-3 font-medium">
                                                Daily Wage
                                            </th>

                                            <th className="px-5 py-3 font-medium">
                                                Attendance
                                            </th>

                                            <th className="px-5 py-3 font-medium">
                                                Labour Cost
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {projectWorkers.map(
                                            (
                                                worker
                                            ) => {
                                                const status =
                                                    attendance[
                                                        worker
                                                            .workerId
                                                    ];

                                                let cost = 0;

                                                if (
                                                    status ===
                                                    "Present"
                                                ) {
                                                    cost =
                                                        Number(
                                                            worker.dailyWage ||
                                                                0
                                                        );
                                                } else if (
                                                    status ===
                                                    "Half Day"
                                                ) {
                                                    cost =
                                                        Number(
                                                            worker.dailyWage ||
                                                                0
                                                        ) *
                                                        0.5;
                                                }

                                                return (
                                                    <tr
                                                        key={
                                                            worker.workerId
                                                        }
                                                        className="border-b border-zinc-800/70 last:border-0"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-white">
                                                                {
                                                                    worker.name
                                                                }
                                                            </div>

                                                            <div className="text-xs text-zinc-500 mt-1">
                                                                {
                                                                    worker.phone
                                                                }
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4 text-zinc-400">
                                                            {
                                                                worker.role
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-zinc-300">
                                                            ₹
                                                            {Number(
                                                                worker.dailyWage ||
                                                                    0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setWorkerStatus(
                                                                            worker.workerId,
                                                                            "Present"
                                                                        )
                                                                    }
                                                                    className={`rounded-lg px-3 py-2 text-xs font-medium border ${
                                                                        status ===
                                                                        "Present"
                                                                            ? "border-green-500 bg-green-500 text-black"
                                                                            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                                                                    }`}
                                                                >
                                                                    Present
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setWorkerStatus(
                                                                            worker.workerId,
                                                                            "Half Day"
                                                                        )
                                                                    }
                                                                    className={`rounded-lg px-3 py-2 text-xs font-medium border ${
                                                                        status ===
                                                                        "Half Day"
                                                                            ? "border-yellow-500 bg-yellow-500 text-black"
                                                                            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                                                                    }`}
                                                                >
                                                                    Half Day
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setWorkerStatus(
                                                                            worker.workerId,
                                                                            "Absent"
                                                                        )
                                                                    }
                                                                    className={`rounded-lg px-3 py-2 text-xs font-medium border ${
                                                                        status ===
                                                                        "Absent"
                                                                            ? "border-red-500 bg-red-500 text-white"
                                                                            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                                                                    }`}
                                                                >
                                                                    Absent
                                                                </button>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4 font-medium text-zinc-200">
                                                            ₹
                                                            {cost.toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Save */}
                            <div className="border-t border-zinc-800 px-5 py-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={
                                        saveAttendance
                                    }
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
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