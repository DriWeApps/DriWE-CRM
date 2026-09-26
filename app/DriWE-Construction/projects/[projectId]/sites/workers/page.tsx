"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Users,
    UserPlus,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    MapPin,
    Building2,
    Phone,
    Wallet,
    UserCheck,
    UserX,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
};

type Site = {
    siteId: string;
    projectId: string;
    siteName: string;
    location?: string;
    active: boolean;
};

type Worker = {
    workerId: string;
    companyId: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    name: string;
    phone: string;

    role?: string;
    workerType:
        | "Employee"
        | "Contract Worker"
        | "Daily Wage"
        | "Subcontractor";

    salary: number;
    dailyWage?: number;

    active: boolean;

    createdAt: string;
    updatedAt: string;
};

export default function ProjectWorkersPage() {
    const params = useParams();
    const router = useRouter();

    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [sites, setSites] = useState<Site[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [selectedSite, setSelectedSite] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const [error, setError] = useState("");

    async function loadData(showRefresh = false) {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [projectRes, sitesRes, workersRes] = await Promise.all([
                fetch(`/api/construction/projects/${projectId}`, {
                    credentials: "include",
                    cache: "no-store",
                }),

                fetch(
                    `/api/construction/sites?projectId=${encodeURIComponent(
                        projectId
                    )}`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                ),

                fetch(
                    `/api/construction/workers?projectId=${encodeURIComponent(
                        projectId
                    )}`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                ),
            ]);

            if (!projectRes.ok) {
                throw new Error("Failed to load project.");
            }

            if (!sitesRes.ok) {
                throw new Error("Failed to load sites.");
            }

            if (!workersRes.ok) {
                throw new Error("Failed to load workers.");
            }

            const projectData = await projectRes.json();
            const sitesData = await sitesRes.json();
            const workersData = await workersRes.json();

            setProject(projectData.project || null);
            setSites(sitesData.sites || []);
            setWorkers(workersData.workers || []);
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while loading workers."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    const filteredWorkers = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return workers.filter((worker) => {
            const matchesSearch =
                !searchText ||
                worker.name.toLowerCase().includes(searchText) ||
                worker.phone.toLowerCase().includes(searchText) ||
                (worker.workerType || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (worker.role || "").toLowerCase().includes(searchText) ||
                (worker.siteName || "").toLowerCase().includes(searchText);

            const matchesSite =
                selectedSite === "all" ||
                worker.siteId === selectedSite;

            const matchesStatus =
                selectedStatus === "all" ||
                (selectedStatus === "active" && worker.active) ||
                (selectedStatus === "inactive" && !worker.active);

            return matchesSearch && matchesSite && matchesStatus;
        });
    }, [workers, search, selectedSite, selectedStatus]);

    const activeWorkers = workers.filter((worker) => worker.active).length;

    const inactiveWorkers = workers.filter(
        (worker) => !worker.active
    ).length;

    const totalSalary = workers.reduce(
        (total, worker) => total + Number(worker.salary || 0),
        0
    );

    const groupedWorkers = useMemo(() => {
        const groups: Record<string, Worker[]> = {};

        filteredWorkers.forEach((worker) => {
            const key = worker.siteId || "unassigned";

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(worker);
        });

        return groups;
    }, [filteredWorkers]);

    async function handleDelete(worker: Worker) {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${worker.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/construction/workers/${worker.workerId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to delete worker."
                );
            }

            setWorkers((current) =>
                current.filter(
                    (item) => item.workerId !== worker.workerId
                )
            );
        } catch (err) {
            console.error(err);

            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to delete worker."
            );
        }
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Loading project workers...
                    </div>
                </div>
            </div>
        );
    }

    if (error && !project) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                        <p className="text-sm text-red-400">{error}</p>

                        <button
                            onClick={() => loadData()}
                            className="mt-4 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        <Link
                            href="/DriWE-Construction/projects"
                            className="transition hover:text-yellow-400"
                        >
                            Projects
                        </Link>

                        <span>/</span>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}`}
                            className="transition hover:text-yellow-400"
                        >
                            {project?.projectName || "Project"}
                        </Link>

                        <span>/</span>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites`}
                            className="transition hover:text-yellow-400"
                        >
                            Sites
                        </Link>

                        <span>/</span>

                        <span className="text-zinc-300">
                            Workers
                        </span>
                    </div>

                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div>
                            <button
                                onClick={() =>
                                    router.push(
                                        `/DriWE-Construction/projects/${projectId}/sites`
                                    )
                                }
                                className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sites
                            </button>

                            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
                                <Users className="h-8 w-8 text-yellow-400" />
                                Project Workers
                            </h1>

                            <p className="mt-2 text-zinc-400">
                                {project?.projectName || "Project"}
                                {project?.location
                                    ? ` • ${project.location}`
                                    : ""}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => loadData(true)}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />
                                Refresh
                            </button>

                            <Link
                                href={`/DriWE-Construction/projects/${projectId}/sites`}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
                            >
                                <MapPin className="h-4 w-4" />
                                View Sites
                            </Link>

                            <Link
                                href={`/DriWE-Construction/people/new?projectId=${projectId}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add Worker
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Total Workers
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                    {workers.length}
                                </p>
                            </div>

                            <div className="rounded-lg bg-yellow-500/10 p-3">
                                <Users className="h-5 w-5 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Active Workers
                                </p>
                                <p className="mt-2 text-2xl font-bold text-green-400">
                                    {activeWorkers}
                                </p>
                            </div>

                            <div className="rounded-lg bg-green-500/10 p-3">
                                <UserCheck className="h-5 w-5 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Inactive Workers
                                </p>
                                <p className="mt-2 text-2xl font-bold text-zinc-400">
                                    {inactiveWorkers}
                                </p>
                            </div>

                            <div className="rounded-lg bg-zinc-800 p-3">
                                <UserX className="h-5 w-5 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Total Salary / Wage
                                </p>
                                <p className="mt-2 text-xl font-bold">
                                    {formatCurrency(totalSalary)}
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-500/10 p-3">
                                <Wallet className="h-5 w-5 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search worker, phone, type or site..."
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
                            />
                        </div>

                        {/* Site */}
                        <select
                            value={selectedSite}
                            onChange={(event) =>
                                setSelectedSite(event.target.value)
                            }
                            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500"
                        >
                            <option value="all">
                                All Sites
                            </option>

                            {sites.map((site) => (
                                <option
                                    key={site.siteId}
                                    value={site.siteId}
                                >
                                    {site.siteName}
                                </option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500"
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>
                    </div>

                    <div className="mt-3 text-xs text-zinc-500">
                        Showing{" "}
                        <span className="font-medium text-zinc-300">
                            {filteredWorkers.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-zinc-300">
                            {workers.length}
                        </span>{" "}
                        workers
                    </div>
                </div>

                {/* Workers */}
                {filteredWorkers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
                        <Users className="mx-auto h-12 w-12 text-zinc-700" />

                        <h3 className="mt-4 text-lg font-semibold text-zinc-300">
                            No workers found
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                            {workers.length === 0
                                ? "No workers have been added to this project yet."
                                : "Try changing your search or filters."}
                        </p>

                        {workers.length === 0 && (
                            <Link
                                href={`/DriWE-Construction/people/new?projectId=${projectId}`}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add First Worker
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedWorkers).map(
                            ([siteId, siteWorkers]) => {
                                const site = sites.find(
                                    (item) =>
                                        item.siteId === siteId
                                );

                                const siteName =
                                    site?.siteName ||
                                    siteWorkers[0]?.siteName ||
                                    "Unassigned Site";

                                return (
                                    <div
                                        key={siteId}
                                        className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70"
                                    >
                                        {/* Site Header */}
                                        <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-5 py-4 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-yellow-500/10 p-2.5">
                                                    <Building2 className="h-5 w-5 text-yellow-400" />
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="font-semibold text-white">
                                                            {siteName}
                                                        </h2>

                                                        {site && (
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                                    site.active
                                                                        ? "bg-green-500/10 text-green-400"
                                                                        : "bg-zinc-800 text-zinc-500"
                                                                }`}
                                                            >
                                                                {site.active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {site?.location && (
                                                        <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                                            <MapPin className="h-3 w-3" />
                                                            {site.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-sm text-zinc-400">
                                                {siteWorkers.length}{" "}
                                                {siteWorkers.length === 1
                                                    ? "worker"
                                                    : "workers"}
                                            </div>
                                        </div>

                                        {/* Desktop Table */}
                                        <div className="hidden overflow-x-auto md:block">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                                                        <th className="px-5 py-3 font-medium">
                                                            Worker
                                                        </th>

                                                        <th className="px-5 py-3 font-medium">
                                                            Contact
                                                        </th>

                                                        <th className="px-5 py-3 font-medium">
                                                            Worker Type
                                                        </th>

                                                        <th className="px-5 py-3 font-medium">
                                                            Salary / Wage
                                                        </th>

                                                        <th className="px-5 py-3 font-medium">
                                                            Status
                                                        </th>

                                                        <th className="px-5 py-3 text-right font-medium">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {siteWorkers.map(
                                                        (worker) => (
                                                            <tr
                                                                key={
                                                                    worker.workerId
                                                                }
                                                                className="border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-800/30"
                                                            >
                                                                <td className="px-5 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-yellow-400">
                                                                            {worker.name
                                                                                ?.charAt(
                                                                                    0
                                                                                )
                                                                                ?.toUpperCase()}
                                                                        </div>

                                                                        <div>
                                                                            <p className="font-medium text-white">
                                                                                {
                                                                                    worker.name
                                                                                }
                                                                            </p>

                                                                            {worker.role && (
                                                                                <p className="mt-0.5 text-xs text-zinc-500">
                                                                                    {
                                                                                        worker.role
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                                        <Phone className="h-3.5 w-3.5 text-zinc-500" />
                                                                        {
                                                                            worker.phone
                                                                        }
                                                                    </div>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                                                                        {
                                                                            worker.workerType
                                                                        }
                                                                    </span>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-zinc-200">
                                                                            {formatCurrency(
                                                                                Number(
                                                                                    worker.salary ||
                                                                                        0
                                                                                )
                                                                            )}
                                                                        </p>

                                                                        {worker.workerType ===
                                                                            "Daily Wage" && (
                                                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                                                Per
                                                                                day
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                            worker.active
                                                                                ? "bg-green-500/10 text-green-400"
                                                                                : "bg-zinc-800 text-zinc-500"
                                                                        }`}
                                                                    >
                                                                        {worker.active
                                                                            ? "Active"
                                                                            : "Inactive"}
                                                                    </span>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <div className="flex justify-end gap-1">
                                                                        <Link
                                                                            href={`/DriWE-Construction/people/${worker.workerId}`}
                                                                            title="View Worker"
                                                                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Link>

                                                                        <Link
                                                                            href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                                                                            title="Edit Worker"
                                                                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-yellow-400"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Link>

                                                                        <button
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    worker
                                                                                )
                                                                            }
                                                                            title="Delete Worker"
                                                                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="divide-y divide-zinc-800 md:hidden">
                                            {siteWorkers.map(
                                                (worker) => (
                                                    <div
                                                        key={
                                                            worker.workerId
                                                        }
                                                        className="p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-semibold text-yellow-400">
                                                                    {worker.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()}
                                                                </div>

                                                                <div>
                                                                    <p className="font-medium text-white">
                                                                        {
                                                                            worker.name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-0.5 text-xs text-zinc-500">
                                                                        {
                                                                            worker.workerType
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                                                    worker.active
                                                                        ? "bg-green-500/10 text-green-400"
                                                                        : "bg-zinc-800 text-zinc-500"
                                                                }`}
                                                            >
                                                                {worker.active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </div>

                                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                            <div className="rounded-lg bg-zinc-950 p-3">
                                                                <p className="text-xs text-zinc-500">
                                                                    Phone
                                                                </p>

                                                                <p className="mt-1 flex items-center gap-1.5 text-zinc-300">
                                                                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                                                                    {
                                                                        worker.phone
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div className="rounded-lg bg-zinc-950 p-3">
                                                                <p className="text-xs text-zinc-500">
                                                                    Salary /
                                                                    Wage
                                                                </p>

                                                                <p className="mt-1 font-medium text-zinc-300">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            worker.salary ||
                                                                                0
                                                                        )
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex justify-end gap-2">
                                                            <Link
                                                                href={`/DriWE-Construction/people/${worker.workerId}`}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                View
                                                            </Link>

                                                            <Link
                                                                href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </Link>

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        worker
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}