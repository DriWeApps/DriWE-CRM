
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
            amount: Number(worker.dailyWage || worker.salary || 0),
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

            const res = await fetch("/api/construction/workers", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch workers");
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
                err instanceof Error ? err.message : "Failed to load workers"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadWorkers();
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

    const activeWorkers = workers.filter((worker) => worker.active).length;

    const inactiveWorkers = workers.filter((worker) => !worker.active).length;

    const activeDailyWages = workers
        .filter(
            (worker) =>
                worker.active && worker.workerType === "Daily Wage"
        )
        .reduce(
            (total, worker) => total + getCompensation(worker).amount,
            0
        );

    const activeSalaries = workers
        .filter(
            (worker) =>
                worker.active && worker.workerType !== "Daily Wage"
        )
        .reduce(
            (total, worker) => total + getCompensation(worker).amount,
            0
        );

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

    const cardClass =
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

    return (
<div className="min-h-screen w-full min-w-0 bg-white p-4 text-black sm:p-6 lg:p-8">
    <div className="w-full min-w-0 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                            <Users className="h-5 w-5 text-black" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-black">
                                People
                            </h1>

                            <p className="text-sm text-gray-600">
                                Manage construction workers and site workforce
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/DriWE-Construction/people/attendance"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
                        >
                            <CalendarCheck className="h-4 w-4" />
                            Attendance
                        </Link>

                        <Link
                            href="/DriWE-Construction/people/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <Plus className="h-4 w-4" />
                            Add Worker
                        </Link>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className={cardClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Workers
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black">
                                    {workers.length}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <Users className="h-5 w-5 text-black" />
                            </div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Active Workers
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black">
                                    {activeWorkers}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                                <UserCheck className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Inactive Workers
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black">
                                    {inactiveWorkers}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                                <UserX className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Active Daily Wage Total
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black">
                                    {formatCurrency(activeDailyWages)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Sum of recorded daily rates, not actual
                                    attendance cost
                                </p>
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <BriefcaseBusiness className="h-5 w-5 text-black" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salary Summary */}
                <div className={cardClass}>
                    <p className="text-sm text-gray-600">
                        Active non-daily-wage salary total
                    </p>

                    <p className="mt-1 text-xl font-bold text-black">
                        {formatCurrency(activeSalaries)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Sum of salary amounts recorded for active
                        non-daily-wage workers.
                    </p>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search worker, phone, role, type or project..."
                                className={`${inputClass} pl-10`}
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
                            className={`${inputClass} md:w-48`}
                        >
                            <option value="All">All Workers</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Workforce Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="font-semibold text-black">
                            Workforce
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            {filteredWorkers.length} worker
                            {filteredWorkers.length !== 1 ? "s" : ""} shown
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-gray-600">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-black" />
                            Loading workers...
                        </div>
                    ) : filteredWorkers.length === 0 ? (
                        <div className="py-16 text-center">
                            <Users className="mx-auto h-10 w-10 text-gray-300" />

                            <p className="mt-3 font-medium text-black">
                                No workers found
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a worker or change your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
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
                                                key={`${
                                                    worker.workerId ||
                                                    `${
                                                        worker.companyId
                                                    }-${
                                                        worker.phone ||
                                                        worker.name ||
                                                        "worker"
                                                    }`
                                                }-${index}`}
                                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-black">
                                                        {worker.name}
                                                    </div>

                                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                        <Phone className="h-3 w-3" />
                                                        {worker.phone || "—"}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-gray-700">
                                                    {worker.role || "—"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                                                        {worker.workerType || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {worker.projectName || "—"}
                                                </td>

                                                <td className="px-5 py-4 text-black">
                                                    <div className="font-medium">
                                                        {formatCurrency(
                                                            compensation.amount
                                                        )}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {compensation.label}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {worker.active ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        href={`/DriWE-Construction/people/${encodeURIComponent(
                                                            worker.workerId ||
                                                                worker.personId ||
                                                                ""
                                                        )}/edit`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100"
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
