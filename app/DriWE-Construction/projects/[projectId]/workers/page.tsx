
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ErrorPopup } from "@/components/ui/error-popup";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    Eye,
    MapPin,
    Pencil,
    Phone,
    RefreshCw,
    Search,
    Trash2,
    UserCheck,
    UserPlus,
    UserX,
    Users,
    Wallet,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
};

type Site = {
    siteId: string;
    projectId: string;
    projectName?: string;
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

            const [
                projectResponse,
                sitesResponse,
                workersResponse,
            ] = await Promise.all([
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

            const projectData = await projectResponse.json();
            const sitesData = await sitesResponse.json();
            const workersData = await workersResponse.json();

            if (!projectResponse.ok) {
                throw new Error(
                    projectData?.error || "Failed to load project."
                );
            }

            if (!sitesResponse.ok) {
                throw new Error(
                    sitesData?.error || "Failed to load sites."
                );
            }

            if (!workersResponse.ok) {
                throw new Error(
                    workersData?.error || "Failed to load workers."
                );
            }

            setProject(projectData.project || null);
            setSites(sitesData.sites || []);
            setWorkers(workersData.workers || []);
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load project workers."
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

    const activeWorkers = workers.filter(
        (worker) => worker.active
    ).length;

    const inactiveWorkers = workers.filter(
        (worker) => !worker.active
    ).length;

    const totalSalary = workers.reduce(
        (total, worker) => total + Number(worker.salary || 0),
        0
    );

    const filteredWorkers = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return workers.filter((worker) => {
            const matchesSearch =
                !searchText ||
                worker.name.toLowerCase().includes(searchText) ||
                worker.phone.toLowerCase().includes(searchText) ||
                worker.workerType.toLowerCase().includes(searchText) ||
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

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);
    }

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

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete worker. Please retry."
            );
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-black">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="flex items-center gap-3 text-gray-600">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Loading project workers...
                    </div>
                </div>
            </div>
        );
    }

    if (error && !project) {
        return (
            <div className="min-h-screen bg-white text-black">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm text-red-700">{error}</p>

                        <button
                            onClick={() => loadData()}
                            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <ErrorPopup message={error} onClose={() => setError("")} />
            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Breadcrumb */}
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="transition hover:text-black"
                    >
                        Projects
                    </Link>

                    <span>/</span>

                    <Link
                        href={`/DriWE-Construction/projects/${projectId}`}
                        className="transition hover:text-black"
                    >
                        {project?.projectName || "Project"}
                    </Link>

                    <span>/</span>

                    <span className="text-black">Workers</span>
                </div>

                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                        <button
                            onClick={() =>
                                router.push(
                                    `/DriWE-Construction/projects/${projectId}`
                                )
                            }
                            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Project
                        </button>

                        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-black">
                            <Users className="h-8 w-8 text-black" />
                            Project Workers
                        </h1>

                        <p className="mt-2 text-gray-600">
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
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </button>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites`}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
                        >
                            <MapPin className="h-4 w-4" />
                            View Sites
                        </Link>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites/workers/new`}
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Worker
                        </Link>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Workers
                                </p>
                                <p className="mt-2 text-2xl font-bold text-black">
                                    {workers.length}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-100 p-3">
                                <Users className="h-5 w-5 text-black" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Active Workers
                                </p>
                                <p className="mt-2 text-2xl font-bold text-green-700">
                                    {activeWorkers}
                                </p>
                            </div>

                            <div className="rounded-lg bg-green-50 p-3">
                                <UserCheck className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Inactive Workers
                                </p>
                                <p className="mt-2 text-2xl font-bold text-gray-600">
                                    {inactiveWorkers}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-100 p-3">
                                <UserX className="h-5 w-5 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Salary / Wage
                                </p>
                                <p className="mt-2 text-xl font-bold text-black">
                                    {formatCurrency(totalSalary)}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-100 p-3">
                                <Wallet className="h-5 w-5 text-black" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search worker, phone, type or site..."
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10"
                            />
                        </div>

                        <select
                            value={selectedSite}
                            onChange={(event) =>
                                setSelectedSite(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black/10"
                        >
                            <option value="all">All Sites</option>

                            {sites.map((site) => (
                                <option
                                    key={site.siteId}
                                    value={site.siteId}
                                >
                                    {site.siteName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black/10"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-black">
                            {filteredWorkers.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-black">
                            {workers.length}
                        </span>{" "}
                        workers
                    </div>
                </div>

                {/* Worker List */}
                {filteredWorkers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />

                        <h3 className="mt-4 text-lg font-semibold text-black">
                            No workers found
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                            {workers.length === 0
                                ? "No workers have been added to this project yet."
                                : "Try changing your search or filters."}
                        </p>

                        {workers.length === 0 && (
                            <Link
                                href={`/DriWE-Construction/projects/${projectId}/sites/workers/new`}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
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
                                    (item) => item.siteId === siteId
                                );

                                const siteName =
                                    site?.siteName ||
                                    siteWorkers[0]?.siteName ||
                                    "Unassigned Site";

                                return (
                                    <div
                                        key={siteId}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        {/* Site Header */}
                                        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-gray-200 p-2.5">
                                                    <Building2 className="h-5 w-5 text-black" />
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="font-semibold text-black">
                                                            {siteName}
                                                        </h2>

                                                        {site && (
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                                    site.active
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-200 text-gray-600"
                                                                }`}
                                                            >
                                                                {site.active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {site?.location && (
                                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                                                            <MapPin className="h-3 w-3" />
                                                            {site.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600">
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
                                                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-600">
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
                                                                key={worker.workerId}
                                                                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                                            >
                                                                <td className="px-5 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-black">
                                                                            {worker.name
                                                                                ?.charAt(0)
                                                                                ?.toUpperCase()}
                                                                        </div>

                                                                        <div>
                                                                            <p className="font-medium text-black">
                                                                                {worker.name}
                                                                            </p>

                                                                            {worker.role && (
                                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                                    {worker.role}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                                        {worker.phone}
                                                                    </div>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                                                                        {worker.workerType}
                                                                    </span>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-black">
                                                                            {formatCurrency(
                                                                                Number(
                                                                                    worker.salary || 0
                                                                                )
                                                                            )}
                                                                        </p>

                                                                        {worker.workerType ===
                                                                            "Daily Wage" && (
                                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                                Per day
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                            worker.active
                                                                                ? "bg-green-100 text-green-800"
                                                                                : "bg-gray-100 text-gray-600"
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
                                                                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Link>

                                                                        <Link
                                                                            href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                                                                            title="Edit Worker"
                                                                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Link>

                                                                        <button
                                                                            onClick={() =>
                                                                                handleDelete(worker)
                                                                            }
                                                                            title="Delete Worker"
                                                                            className="rounded-lg p-2 text-gray-600 transition hover:bg-red-50 hover:text-red-700"
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
                                        <div className="divide-y divide-gray-200 md:hidden">
                                            {siteWorkers.map((worker) => (
                                                <div
                                                    key={worker.workerId}
                                                    className="p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-black">
                                                                {worker.name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="font-medium text-black">
                                                                    {worker.name}
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                    {worker.workerType}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                                                worker.active
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {worker.active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                                        <div className="rounded-lg bg-gray-50 p-3">
                                                            <p className="text-xs text-gray-500">
                                                                Phone
                                                            </p>

                                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-800">
                                                                <Phone className="h-3.5 w-3.5 text-gray-500" />
                                                                {worker.phone}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-lg bg-gray-50 p-3">
                                                            <p className="text-xs text-gray-500">
                                                                Salary / Wage
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium text-black">
                                                                {formatCurrency(
                                                                    Number(
                                                                        worker.salary || 0
                                                                    )
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <Link
                                                            href={`/DriWE-Construction/people/${worker.workerId}`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs text-black transition hover:bg-gray-100"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View
                                                        </Link>

                                                        <Link
                                                            href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs text-black transition hover:bg-gray-100"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Edit
                                                        </Link>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(worker)
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 transition hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
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

