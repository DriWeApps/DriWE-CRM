"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Users,
    Plus,
    Search,
    UserCheck,
    UserX,
    CalendarCheck,
    Loader2,
    Pencil,
    Phone,
    BriefcaseBusiness,
} from "lucide-react";

type Worker = {
    workerId?: string;
    personId?: string;
    personType?: "Worker" | "Project Manager" | "Project Creator";
    companyId: string;
    name: string;
    phone: string;
    role: string;
    workerType:
        | "Employee"
        | "Contract Worker"
        | "Daily Wage"
        | "Subcontractor";
    dailyWage: number;
    salary?: number;
    projectId: string;
    projectName?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

type Compensation = {
    label: string;
    amount: number;
};

function getCompensation(worker: Worker): Compensation {
    if (worker.workerType === "Daily Wage") {
        return {
            label: "Daily Wage",
            amount: Number(
                worker.dailyWage || worker.salary || 0
            ),
        };
    }

    return {
        label: "Salary",
        amount: Number(worker.salary || 0),
    };
}

function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PeoplePage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "All" | "Active" | "Inactive"
    >("All");

    async function loadWorkers() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(
                "/api/construction/workers",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch workers"
                );
            }

            const workerEntries = Array.isArray(data.workers)
                ? data.workers.filter(
                    (worker: Worker) =>
                        worker.personType === "Worker" ||
                        (!worker.personType && Boolean(worker.workerId))
                )
                : [];

            setWorkers(
                workerEntries.map((worker: Worker) => ({
                    ...worker,
                    workerId: worker.workerId || worker.personId,
                }))
            );
        } catch (err) {
            console.error("Load workers error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load workers"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWorkers();
    }, []);

    const filteredWorkers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return workers.filter((worker) => {
            const matchesSearch =
                !query ||
                worker.name?.toLowerCase().includes(query) ||
                worker.phone?.toLowerCase().includes(query) ||
                worker.role?.toLowerCase().includes(query) ||
                worker.workerType?.toLowerCase().includes(query) ||
                worker.projectName?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "All" ||
                (statusFilter === "Active" && worker.active) ||
                (statusFilter === "Inactive" && !worker.active);

            return matchesSearch && matchesStatus;
        });
    }, [workers, search, statusFilter]);

    const activeWorkers = workers.filter(
        (worker) => worker.active
    ).length;

    const inactiveWorkers = workers.filter(
        (worker) => !worker.active
    ).length;

    const activeDailyWages = workers
        .filter(
            (worker) =>
                worker.active &&
                worker.workerType === "Daily Wage"
        )
        .reduce(
            (total, worker) =>
                total + getCompensation(worker).amount,
            0
        );

    const activeSalaries = workers
        .filter(
            (worker) =>
                worker.active &&
                worker.workerType !== "Daily Wage"
        )
        .reduce(
            (total, worker) =>
                total + getCompensation(worker).amount,
            0
        );

    return (
        <div className="min-h-screen bg-zinc-950 p-4 text-white md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                            <Users className="h-5 w-5 text-yellow-400" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                People
                            </h1>

                            <p className="text-sm text-zinc-400">
                                Manage construction workers and site workforce
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/DriWE-Construction/people/attendance"
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                        >
                            <CalendarCheck className="h-4 w-4" />
                            Attendance
                        </Link>

                        <Link
                            href="/DriWE-Construction/people/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400"
                        >
                            <Plus className="h-4 w-4" />
                            Add Worker
                        </Link>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Total Workers
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {workers.length}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                <Users className="h-5 w-5 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Active Workers
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {activeWorkers}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                <UserCheck className="h-5 w-5 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Inactive Workers
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {inactiveWorkers}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                                <UserX className="h-5 w-5 text-red-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Active Daily Wage Total
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {formatCurrency(activeDailyWages)}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Sum of recorded daily rates, not actual attendance cost
                                </p>
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                                <BriefcaseBusiness className="h-5 w-5 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salary summary */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                    <p className="text-sm text-zinc-400">
                        Active non-daily-wage salary total
                    </p>
                    <p className="mt-1 text-xl font-bold text-white">
                        {formatCurrency(activeSalaries)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Sum of salary amounts recorded for active non-daily-wage workers.
                    </p>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search worker, phone, role, type or project..."
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as
                                        | "All"
                                        | "Active"
                                        | "Inactive"
                                )
                            }
                            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-500"
                        >
                            <option value="All">All Workers</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* Workforce table */}
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
                    <div className="border-b border-zinc-800 px-5 py-4">
                        <h2 className="font-semibold">Workforce</h2>

                        <p className="mt-1 text-xs text-zinc-500">
                            {filteredWorkers.length} worker
                            {filteredWorkers.length !== 1 ? "s" : ""} shown
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-zinc-400">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading workers...
                        </div>
                    ) : filteredWorkers.length === 0 ? (
                        <div className="py-16 text-center">
                            <Users className="mx-auto h-10 w-10 text-zinc-700" />

                            <p className="mt-3 text-zinc-300">
                                No workers found
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                                Add a worker or change your filters.
                            </p>
                        </div>
                    ) : (
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
                                            Type
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Project
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Salary / Wage
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredWorkers.map((worker, index) => {
                                        const compensation =
                                            getCompensation(worker);

                                        return (
                                            <tr
                                                key={`${worker.workerId || `${worker.companyId}-${worker.phone || worker.name || "worker"}`}-${index}`}
                                                className="border-b border-zinc-800/70 last:border-0 hover:bg-zinc-800/30"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-white">
                                                        {worker.name}
                                                    </div>

                                                    <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                                        <Phone className="h-3 w-3" />
                                                        {worker.phone || "—"}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-zinc-300">
                                                    {worker.role || "—"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                                                        {worker.workerType || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-zinc-400">
                                                    {worker.projectName || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-zinc-200">
                                                    <div className="font-medium">
                                                        {formatCurrency(
                                                            compensation.amount
                                                        )}
                                                    </div>
                                                    <div className="mt-1 text-xs text-zinc-500">
                                                        {compensation.label}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {worker.active ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs text-green-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        href={`/DriWE-Construction/people/${worker.workerId || worker.personId}/edit`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}