"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    ArrowLeft,
    Building2,
    MapPin,
    Users,
    UserPlus,
    Pencil,
    Trash2,
    Loader2,
    RefreshCw,
    Phone,
    IndianRupee,
    BriefcaseBusiness,
    ExternalLink,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
};

type Site = {
    siteId: string;
    companyId: string;
    projectId: string;
    projectName?: string;
    siteName: string;
    location?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
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

export default function SiteDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const projectId =
        params?.projectId as string;

    const siteId =
        params?.siteId as string;

    const [project, setProject] =
        useState<Project | null>(null);

    const [site, setSite] =
        useState<Site | null>(null);

    const [workers, setWorkers] =
        useState<Worker[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState("");

    /* =========================================================
       LOAD SITE DATA
    ========================================================= */

    async function loadData() {
        if (!projectId || !siteId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [
                projectResponse,
                siteResponse,
                workersResponse,
            ] = await Promise.all([
                fetch(
                    `/api/construction/projects/${projectId}`,
                    {
                        cache: "no-store",
                    }
                ),

                fetch(
                    `/api/construction/sites/${siteId}`,
                    {
                        cache: "no-store",
                    }
                ),

                fetch(
                    `/api/construction/workers?siteId=${encodeURIComponent(
                        siteId
                    )}`,
                    {
                        cache: "no-store",
                    }
                ),
            ]);

            const projectData =
                await projectResponse.json();

            const siteData =
                await siteResponse.json();

            const workersData =
                await workersResponse.json();

            if (!projectResponse.ok) {
                throw new Error(
                    projectData?.message ||
                        "Failed to load project."
                );
            }

            if (!siteResponse.ok) {
                throw new Error(
                    siteData?.message ||
                        "Failed to load site."
                );
            }

            if (!workersResponse.ok) {
                throw new Error(
                    workersData?.message ||
                        "Failed to load workers."
                );
            }

            setProject(
                projectData.project || null
            );

            setSite(
                siteData.site || null
            );

            setWorkers(
                workersData.workers ||
                    workersData.data ||
                    []
            );
        } catch (err: any) {
            console.error(
                "Failed to load site:",
                err
            );

            setError(
                err?.message ||
                    "Failed to load site."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [projectId, siteId]);

    /* =========================================================
       DELETE SITE
    ========================================================= */

    async function handleDeleteSite() {
        if (!site) {
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${site.siteName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);

            const response =
                await fetch(
                    `/api/construction/sites/${site.siteId}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Failed to delete site."
                );
            }

            router.push(
                `/DriWE-Construction/projects/${projectId}/sites`
            );
        } catch (err: any) {
            console.error(
                "Delete site error:",
                err
            );

            alert(
                err?.message ||
                    "Failed to delete site."
            );
        } finally {
            setDeleting(false);
        }
    }

    /* =========================================================
       FORMAT SALARY
    ========================================================= */

    function formatSalary(
        value: number
    ) {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value || 0);
    }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin" />

                        <span>
                            Loading site...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error || !site) {
        return (
            <div className="min-h-screen bg-zinc-950 px-6 py-8 text-white">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href={`/DriWE-Construction/projects/${projectId}/sites`}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sites
                    </Link>

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <h2 className="text-lg font-semibold text-red-400">
                            Unable to load site
                        </h2>

                        <p className="mt-2 text-sm text-red-300/80">
                            {error ||
                                "Site not found."}
                        </p>

                        <button
                            onClick={loadData}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       STATS
    ========================================================= */

    const activeWorkers =
        workers.filter(
            (worker) => worker.active
        ).length;

    const inactiveWorkers =
        workers.length -
        activeWorkers;

    const totalSalary =
        workers.reduce(
            (total, worker) =>
                total +
                Number(
                    worker.salary || 0
                ),
            0
        );

    /* =========================================================
       MAIN UI
    ========================================================= */

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    BREADCRUMB
                ================================================= */}

                <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="transition hover:text-white"
                    >
                        Projects
                    </Link>

                    <span>/</span>

                    <Link
                        href={`/DriWE-Construction/projects/${projectId}`}
                        className="max-w-[220px] truncate transition hover:text-white"
                    >
                        {project?.projectName ||
                            "Project"}
                    </Link>

                    <span>/</span>

                    <Link
                        href={`/DriWE-Construction/projects/${projectId}/sites`}
                        className="transition hover:text-white"
                    >
                        Sites
                    </Link>

                    <span>/</span>

                    <span className="max-w-[220px] truncate text-zinc-300">
                        {site.siteName}
                    </span>
                </div>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites`}
                            className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sites
                        </Link>

                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/10">
                                <Building2 className="h-7 w-7 text-yellow-400" />
                            </div>

                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                        {site.siteName}
                                    </h1>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            site.active
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-zinc-800 text-zinc-500"
                                        }`}
                                    >
                                        {site.active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
                                    {site.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-zinc-500" />

                                            <span>
                                                {
                                                    site.location
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {project?.projectName && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-zinc-500" />

                                            <span>
                                                {
                                                    project.projectName
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={loadData}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites/${siteId}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Site
                        </Link>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites/${siteId}/workers`}
                            className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                        >
                            <UserPlus className="h-4 w-4" />
                            Manage Workers
                        </Link>
                    </div>
                </div>

                {/* =================================================
                    SITE INFORMATION
                ================================================= */}

                <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Site Information
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Basic information about this
                                construction site.
                            </p>
                        </div>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites/${siteId}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Site Name
                            </p>

                            <p className="mt-2 font-medium text-white">
                                {
                                    site.siteName
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Location
                            </p>

                            <p className="mt-2 font-medium text-white">
                                {site.location ||
                                    "Not specified"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Project
                            </p>

                            <p className="mt-2 font-medium text-white">
                                {project?.projectName ||
                                    site.projectName ||
                                    "Unknown"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Status
                            </p>

                            <p
                                className={`mt-2 font-medium ${
                                    site.active
                                        ? "text-emerald-400"
                                        : "text-zinc-500"
                                }`}
                            >
                                {site.active
                                    ? "Active"
                                    : "Inactive"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Total Workers */}

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Total Workers
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {
                                        workers.length
                                    }
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-500/10 p-3">
                                <Users className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Active Workers */}

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Active Workers
                                </p>

                                <p className="mt-2 text-3xl font-bold text-emerald-400">
                                    {
                                        activeWorkers
                                    }
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-500/10 p-3">
                                <Users className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Inactive Workers */}

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Inactive Workers
                                </p>

                                <p className="mt-2 text-3xl font-bold text-zinc-400">
                                    {
                                        inactiveWorkers
                                    }
                                </p>
                            </div>

                            <div className="rounded-xl bg-zinc-800 p-3">
                                <Users className="h-6 w-6 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    {/* Salary */}

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Total Salary / Wage
                                </p>

                                <p className="mt-2 text-2xl font-bold text-yellow-400">
                                    {formatSalary(
                                        totalSalary
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-yellow-500/10 p-3">
                                <IndianRupee className="h-6 w-6 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    WORKERS SECTION
                ================================================= */}

                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Site Workers
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Workers assigned to{" "}
                            <span className="text-zinc-300">
                                {site.siteName}
                            </span>
                        </p>
                    </div>

                    <Link
                        href={`/DriWE-Construction/projects/${projectId}/sites/${siteId}/workers`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Worker
                    </Link>
                </div>

                {/* =================================================
                    NO WORKERS
                ================================================= */}

                {workers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                            <Users className="h-8 w-8 text-blue-400" />
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                            No workers assigned
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                            Add workers to this site.
                            Workers added here will
                            automatically belong to
                            this site and its project.
                        </p>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites/${siteId}/workers`}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add First Worker
                        </Link>
                    </div>
                ) : (
                    /* =================================================
                       WORKER TABLE
                    ================================================= */

                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-950/70">
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Worker
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Contact
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Worker Type
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Salary / Wage
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {workers.map(
                                        (
                                            worker
                                        ) => (
                                            <tr
                                                key={
                                                    worker.workerId
                                                }
                                                className="border-b border-zinc-800/70 transition hover:bg-zinc-800/30"
                                            >
                                                {/* Worker */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-yellow-400">
                                                            {worker.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                                "W"}
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

                                                {/* Phone */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                        <Phone className="h-4 w-4 text-zinc-600" />

                                                        {
                                                            worker.phone
                                                        }
                                                    </div>
                                                </td>

                                                {/* Worker Type */}

                                                <td className="px-5 py-4">
                                                    <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300">
                                                        <BriefcaseBusiness className="h-3.5 w-3.5" />

                                                        {
                                                            worker.workerType
                                                        }
                                                    </div>
                                                </td>

                                                {/* Salary */}

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">
                                                            {formatSalary(
                                                                worker.salary
                                                            )}
                                                        </p>

                                                        {worker.workerType ===
                                                            "Daily Wage" &&
                                                            worker.dailyWage && (
                                                                <p className="mt-0.5 text-xs text-zinc-500">
                                                                    Daily wage
                                                                </p>
                                                            )}
                                                    </div>
                                                </td>

                                                {/* Status */}

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            worker.active
                                                                ? "bg-emerald-500/10 text-emerald-400"
                                                                : "bg-zinc-800 text-zinc-500"
                                                        }`}
                                                    >
                                                        {worker.active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                {/* Action */}

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end">
                                                        <Link
                                                            href={`/DriWE-Construction/people/${worker.workerId}`}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                                                        >
                                                            View
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* =================================================
                    DANGER ZONE
                ================================================= */}

                <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-semibold text-red-400">
                                Delete Site
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                                Delete this site from the
                                project.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleDeleteSite
                            }
                            disabled={deleting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}

                            {deleting
                                ? "Deleting..."
                                : "Delete Site"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}