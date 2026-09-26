"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    Edit,
    Loader2,
    MapPin,
    Phone,
    Trash2,
    User,
    Wallet,
    XCircle,
} from "lucide-react";

type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

interface Worker {
    workerId: string;

    companyId: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    name: string;
    phone: string;

    role?: string;

    workerType: WorkerType;

    salary: number;
    dailyWage?: number;

    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}

interface Project {
    projectId: string;
    projectName: string;
    location?: string;
}

interface Site {
    siteId: string;
    projectId: string;
    siteName: string;
    location?: string;
    active: boolean;
}

export default function WorkerDetailPage() {
    const params = useParams();
    const router = useRouter();

    const workerId = params.workerId as string;

    const [worker, setWorker] = useState<Worker | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [site, setSite] = useState<Site | null>(null);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!workerId) return;

        loadWorker();
    }, [workerId]);

    async function loadWorker() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/construction/workers/${workerId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load worker"
                );
            }

            const loadedWorker: Worker =
                data.worker || data;

            setWorker(loadedWorker);

            if (loadedWorker.projectId) {
                loadProject(loadedWorker.projectId);
            }

            if (loadedWorker.siteId) {
                loadSite(loadedWorker.siteId);
            }
        } catch (err) {
            console.error("Load worker error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load worker"
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadProject(projectId: string) {
        try {
            const response = await fetch(
                `/api/construction/projects/${projectId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            if (!response.ok) return;

            const data = await response.json();

            setProject(data.project || data);
        } catch (err) {
            console.error("Load project error:", err);
        }
    }

    async function loadSite(siteId: string) {
        try {
            const response = await fetch(
                `/api/construction/sites/${siteId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            if (!response.ok) return;

            const data = await response.json();

            setSite(data.site || data);
        } catch (err) {
            console.error("Load site error:", err);
        }
    }

    async function handleDelete() {
        if (!worker) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${worker.name}"?`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/construction/workers/${worker.workerId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to delete worker"
                );
            }

            router.push("/DriWE-Construction/people");
            router.refresh();
        } catch (err) {
            console.error("Delete worker error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete worker"
            );
        } finally {
            setDeleting(false);
        }
    }

    function formatCurrency(value?: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(Number(value ?? 0));
    }

    function formatDate(value?: string) {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function getWorkerTypeLabel(type?: WorkerType) {
        if (!type) return "-";

        return type;
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
                <div className="flex items-center gap-3">
                    <Loader2
                        size={24}
                        className="animate-spin text-yellow-400"
                    />

                    <span>Loading worker...</span>
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/DriWE-Construction/people"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                    >
                        <ArrowLeft size={17} />
                        Back to People
                    </Link>

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
                        <User className="mx-auto mb-4 h-12 w-12 text-red-400" />

                        <h1 className="text-xl font-semibold text-white">
                            Worker not found
                        </h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            {error ||
                                "The requested worker could not be found."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back */}
                <Link
                    href="/DriWE-Construction/people"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                    <ArrowLeft size={17} />
                    Back to People
                </Link>

                {/* Header */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                            <User className="h-8 w-8 text-yellow-400" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    {worker.name}
                                </h1>

                                {worker.active ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                        <CheckCircle2 size={13} />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
                                        <XCircle size={13} />
                                        Inactive
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 text-sm text-zinc-400">
                                Worker ID:{" "}
                                <span className="font-mono text-zinc-500">
                                    {worker.workerId}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-yellow-500/30 hover:bg-zinc-800 hover:text-yellow-400"
                        >
                            <Edit size={16} />
                            Edit
                        </Link>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Trash2 size={16} />
                            )}

                            Delete
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Main information */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Personal Information */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 lg:col-span-2">
                        <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                                    <User className="h-5 w-5 text-blue-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Worker Information
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Basic worker details
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-x-8 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:px-6">
                            {/* Name */}
                            <div>
                                <p className="text-xs uppercase tracking-wider text-zinc-600">
                                    Worker Name
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <User className="h-4 w-4 text-zinc-600" />

                                    <p className="text-sm font-medium text-white">
                                        {worker.name}
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <p className="text-xs uppercase tracking-wider text-zinc-600">
                                    Mobile Number
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-zinc-600" />

                                    <a
                                        href={`tel:${worker.phone}`}
                                        className="text-sm font-medium text-zinc-200 transition hover:text-yellow-400"
                                    >
                                        {worker.phone}
                                    </a>
                                </div>
                            </div>

                            {/* Worker Type */}
                            <div>
                                <p className="text-xs uppercase tracking-wider text-zinc-600">
                                    Worker Type
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <BriefcaseBusiness className="h-4 w-4 text-zinc-600" />

                                    <span className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                                        {getWorkerTypeLabel(
                                            worker.workerType
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Salary */}
                            <div>
                                <p className="text-xs uppercase tracking-wider text-zinc-600">
                                    Salary / Wage
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-zinc-600" />

                                    <p className="text-sm font-semibold text-yellow-400">
                                        {formatCurrency(
                                            worker.salary
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Daily Wage */}
                            {worker.workerType ===
                                "Daily Wage" &&
                                worker.dailyWage !== undefined && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-zinc-600">
                                            Daily Wage
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-zinc-600" />

                                            <p className="text-sm font-semibold text-yellow-400">
                                                {formatCurrency(
                                                    worker.dailyWage
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* Role */}
                            {worker.role && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                        Role
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <BriefcaseBusiness className="h-4 w-4 text-zinc-600" />

                                        <p className="text-sm text-zinc-300">
                                            {worker.role}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Status */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70">
                        <div className="border-b border-zinc-800 px-5 py-4">
                            <h2 className="font-semibold text-white">
                                Status
                            </h2>

                            <p className="mt-1 text-xs text-zinc-500">
                                Current worker status
                            </p>
                        </div>

                        <div className="p-5">
                            <div
                                className={`rounded-xl border p-5 ${
                                    worker.active
                                        ? "border-emerald-500/20 bg-emerald-500/5"
                                        : "border-zinc-700 bg-zinc-950"
                                }`}
                            >
                                {worker.active ? (
                                    <>
                                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />

                                        <p className="mt-4 text-lg font-semibold text-emerald-400">
                                            Active
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            This worker is currently
                                            active and available for
                                            construction operations.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-8 w-8 text-zinc-500" />

                                        <p className="mt-4 text-lg font-semibold text-zinc-300">
                                            Inactive
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            This worker is currently
                                            inactive.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Assignment */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70">
                    <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                                <Building2 className="h-5 w-5 text-orange-400" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">
                                    Project & Site Assignment
                                </h2>

                                <p className="text-xs text-zinc-500">
                                    Current construction hierarchy
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                        {/* Project */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                                    <Building2 className="h-5 w-5 text-orange-400" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                        Project
                                    </p>

                                    <p className="mt-1 truncate text-base font-semibold text-white">
                                        {project?.projectName ||
                                            worker.projectName ||
                                            "-"}
                                    </p>

                                    {project?.location && (
                                        <div className="mt-2 flex items-start gap-1.5 text-xs text-zinc-500">
                                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                                            <span>
                                                {
                                                    project.location
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Site */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                                    <MapPin className="h-5 w-5 text-yellow-400" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                        Site
                                    </p>

                                    <p className="mt-1 truncate text-base font-semibold text-white">
                                        {site?.siteName ||
                                            worker.siteName ||
                                            "-"}
                                    </p>

                                    {(site?.location ||
                                        worker.siteName) && (
                                        <div className="mt-2 flex items-start gap-1.5 text-xs text-zinc-500">
                                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                                            <span>
                                                {site?.location ||
                                                    "Construction site"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dates */}
                <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70">
                    <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
                                <CalendarDays className="h-5 w-5 text-zinc-400" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">
                                    Record Information
                                </h2>

                                <p className="text-xs text-zinc-500">
                                    Worker record timestamps
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Created
                            </p>

                            <p className="mt-2 text-sm text-zinc-300">
                                {formatDate(worker.createdAt)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Last Updated
                            </p>

                            <p className="mt-2 text-sm text-zinc-300">
                                {formatDate(worker.updatedAt)}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bottom actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Link
                        href="/DriWE-Construction/people"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                        <ArrowLeft size={17} />
                        Back to People
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-yellow-500/30 hover:text-yellow-400"
                        >
                            <Edit size={17} />
                            Edit Worker
                        </Link>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : (
                                <Trash2 size={17} />
                            )}

                            Delete Worker
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}