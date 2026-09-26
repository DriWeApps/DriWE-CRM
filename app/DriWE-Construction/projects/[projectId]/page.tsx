"use client";

import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    ClipboardList,
    Package,
    Users,
    AlertTriangle,
    IndianRupee,
    Loader2,
    MapPin,
    Camera,
    RefreshCw,
    FileText,
    CheckCircle2,
} from "lucide-react";

interface Project {
    projectId: string;
    projectName: string;
    location: string;
    projectManagerName?: string;
    siteSupervisorName?: string;
    startDate: string;
    expectedCompletion: string;
    status: string;
    description?: string;
}

interface DashboardStats {
    workersToday: number;
    tasksCompleted: number;
    tasksTotal: number;
    materialMovement: number;
    labourCost: number;
}

interface DailySiteUpdate {
    updateId: string;

    projectId: string;
    projectName?: string;

    date: string;

    workersPresent: number;
    tasksCompleted: number;

    materialReceived: number;
    materialUsed: number;

    issues: number;
    issueDescription?: string;

    photos?: string[];

    note?: string;

    submittedBy: string;
    submittedByName?: string;

    createdAt: string;
    updatedAt: string;
}

export default function ProjectDashboardPage() {
    const params = useParams();

    const projectId = params.projectId as string;

    const [project, setProject] =
        useState<Project | null>(null);

    const [stats, setStats] =
        useState<DashboardStats>({
            workersToday: 0,
            tasksCompleted: 0,
            tasksTotal: 0,
            materialMovement: 0,
            labourCost: 0,
        });

    const [latestUpdate, setLatestUpdate] =
        useState<DailySiteUpdate | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [statsLoading, setStatsLoading] =
        useState(true);

    const [updateLoading, setUpdateLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    async function loadProject() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/construction/projects/${projectId}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load project"
                );
            }

            if (data.success) {
                setProject(data.project);
            } else {
                throw new Error(
                    data?.error ||
                        "Project not found"
                );
            }
        } catch (error) {
            console.error(
                "Failed to load project:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load project"
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadProjectStats() {
        try {
            setStatsLoading(true);

            const response = await fetch(
                `/api/construction/dashboard?projectId=${encodeURIComponent(
                    projectId
                )}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load project statistics"
                );
            }

            setStats({
                workersToday: Number(
                    data.workersToday || 0
                ),

                tasksCompleted: Number(
                    data.tasksCompleted || 0
                ),

                tasksTotal: Number(
                    data.tasksTotal || 0
                ),

                materialMovement: Number(
                    data.materialMovement || 0
                ),

                labourCost: Number(
                    data.labourCost || 0
                ),
            });
        } catch (error) {
            console.error(
                "Failed to load project statistics:",
                error
            );
        } finally {
            setStatsLoading(false);
        }
    }

    async function loadLatestUpdate() {
        try {
            setUpdateLoading(true);

            const response = await fetch(
                `/api/construction/daily-updates?projectId=${encodeURIComponent(
                    projectId
                )}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load daily updates"
                );
            }

            const updates: DailySiteUpdate[] =
                Array.isArray(data.updates)
                    ? data.updates
                    : [];

            if (updates.length > 0) {
                /*
                 * The service already sorts the updates
                 * newest first, so the first item is
                 * the latest update.
                 */
                setLatestUpdate(updates[0]);
            } else {
                setLatestUpdate(null);
            }
        } catch (error) {
            console.error(
                "Failed to load latest site update:",
                error
            );

            setLatestUpdate(null);
        } finally {
            setUpdateLoading(false);
        }
    }

    async function loadAll() {
        await Promise.all([
            loadProject(),
            loadProjectStats(),
            loadLatestUpdate(),
        ]);
    }

    useEffect(() => {
        if (!projectId) return;

        loadAll();
    }, [projectId]);

    function formatNumber(value: number) {
        return new Intl.NumberFormat(
            "en-IN"
        ).format(value);
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value);
    }

    function formatDate(date: string) {
        if (!date) return "—";

        const parsed = new Date(
            `${date}T00:00:00`
        );

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(parsed);
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-400" />

                    <p className="text-sm text-zinc-500">
                        Loading project...
                    </p>
                </div>
            </main>
        );
    }

    if (!project) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>

                    <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <p className="text-red-400">
                            {error ||
                                "Project not found."}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-7xl px-6 py-8">

                {/* Back */}
                <Link
                    href="/DriWE-Construction/projects"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Link>

                {/* Project Header */}
                <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-7">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10">
                                <Building2 className="h-7 w-7 text-orange-400" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-3">

                                    <h1 className="text-3xl font-bold">
                                        {project.projectName}
                                    </h1>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            project.status ===
                                            "Active"
                                                ? "bg-green-500/10 text-green-400"
                                                : project.status ===
                                                  "Completed"
                                                ? "bg-blue-500/10 text-blue-400"
                                                : project.status ===
                                                  "Cancelled"
                                                ? "bg-red-500/10 text-red-400"
                                                : "bg-zinc-800 text-zinc-400"
                                        }`}
                                    >
                                        {project.status}
                                    </span>

                                </div>

                                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                                    <MapPin className="h-4 w-4" />
                                    {project.location}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">

                            <button
                                type="button"
                                onClick={loadAll}
                                disabled={
                                    loading ||
                                    statsLoading ||
                                    updateLoading
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-orange-500/40 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        statsLoading ||
                                        updateLoading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />

                                Refresh
                            </button>

                           <Link
  href={`/DriWE-Construction/projects/${projectId}/edit`}
  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
>
  <Pencil className="h-4 w-4" />
  Edit Project
</Link>

                        </div>

                    </div>

                    <div className="mt-7 grid gap-4 border-t border-zinc-800 pt-6 sm:grid-cols-2 lg:grid-cols-4">

                        <Info
                            label="Project Manager"
                            value={
                                project.projectManagerName ||
                                "Not assigned"
                            }
                        />

                        <Info
                            label="Site Supervisor"
                            value={
                                project.siteSupervisorName ||
                                "Not assigned"
                            }
                        />

                        <Info
                            label="Start Date"
                            value={formatDate(
                                project.startDate
                            )}
                        />

                        <Info
                            label="Expected Completion"
                            value={formatDate(
                                project.expectedCompletion
                            )}
                        />

                    </div>

                    {project.description && (
                        <div className="mt-6 border-t border-zinc-800 pt-6">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Project Description
                            </p>

                            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-400">
                                {project.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Project Modules */}
                <div className="mt-6 grid gap-6 lg:grid-cols-2">

                    <ModuleCard
                        icon={Users}
                        title="People & Attendance"
                        description="Manage workers and today's attendance."
                        href={`/DriWE-Construction/people?projectId=${projectId}`}
                    />

                    <ModuleCard
                        icon={ClipboardList}
                        title="Project Tasks"
                        description="Track pending, active and completed tasks."
                        href={`/DriWE-Construction/tasks?projectId=${projectId}`}
                    />

                    <ModuleCard
                        icon={Package}
                        title="Materials & Inventory"
                        description="View stock and material movement."
                        href={`/DriWE-Construction/materials?projectId=${projectId}`}
                    />

                    <ModuleCard
                        icon={Camera}
                        title="Daily Site Updates"
                        description="View daily site activity and photos."
                        href={`/DriWE-Construction/daily-updates?projectId=${projectId}`}
                    />

                </div>

                {/* Site Issues */}
                <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

                    <div className="flex items-center gap-3">

                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                latestUpdate?.issues
                                    ? "bg-red-500/10"
                                    : "bg-green-500/10"
                            }`}
                        >
                            {latestUpdate?.issues ? (
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            )}
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Site Issues
                            </h2>

                            <p className="text-sm text-zinc-500">
                                Issues reported from this project.
                            </p>
                        </div>

                    </div>

                    <div className="mt-5">

                        {updateLoading ? (
                            <div className="flex items-center gap-2 rounded-xl bg-zinc-950 p-5 text-sm text-zinc-500">
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />

                                Loading site issues...
                            </div>
                        ) : !latestUpdate ? (
                            <div className="rounded-xl bg-zinc-950 p-5">
                                <p className="text-sm text-zinc-500">
                                    No daily site update has
                                    been submitted yet.
                                </p>
                            </div>
                        ) : latestUpdate.issues > 0 ? (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">

                                <div className="flex flex-wrap items-center gap-3">

                                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-400">
                                        {latestUpdate.issues}{" "}
                                        {latestUpdate.issues ===
                                        1
                                            ? "Issue"
                                            : "Issues"}
                                    </span>

                                    <span className="text-xs text-zinc-600">
                                        From update on{" "}
                                        {formatDate(
                                            latestUpdate.date
                                        )}
                                    </span>

                                </div>

                                {latestUpdate.issueDescription ? (
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                        {
                                            latestUpdate.issueDescription
                                        }
                                    </p>
                                ) : (
                                    <p className="mt-4 text-sm text-zinc-500">
                                        Issues were reported,
                                        but no description was
                                        provided.
                                    </p>
                                )}

                                <Link
                                    href={`/DriWE-Construction/daily-updates/${latestUpdate.updateId}`}
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300"
                                >
                                    View Daily Update
                                    <span>→</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">

                                <div className="flex items-center gap-3">

                                    <CheckCircle2 className="h-5 w-5 text-green-400" />

                                    <div>
                                        <p className="text-sm font-medium text-green-400">
                                            No issues reported
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-600">
                                            Latest update:{" "}
                                            {formatDate(
                                                latestUpdate.date
                                            )}
                                        </p>
                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                </div>

                {/* Latest Site Update */}
                <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                                <CalendarDays className="h-5 w-5 text-orange-400" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Latest Site Update
                                </h2>

                                <p className="text-sm text-zinc-500">
                                    Most recent progress reported
                                    from this site.
                                </p>
                            </div>

                        </div>

                        <Link
                            href={`/DriWE-Construction/daily-updates?projectId=${projectId}`}
                            className="text-sm font-medium text-orange-400 hover:text-orange-300"
                        >
                            View All Updates →
                        </Link>

                    </div>

                    <div className="mt-5">

                        {updateLoading ? (
                            <div className="flex items-center gap-2 rounded-xl bg-zinc-950 p-5 text-sm text-zinc-500">
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />

                                Loading latest update...
                            </div>
                        ) : !latestUpdate ? (
                            <div className="rounded-xl bg-zinc-950 p-6 text-center">

                                <FileText className="mx-auto h-8 w-8 text-zinc-700" />

                                <p className="mt-3 text-sm text-zinc-500">
                                    No daily update submitted
                                    yet.
                                </p>

                                <Link
                                    href={`/DriWE-Construction/daily-updates/new?projectId=${projectId}`}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
                                >
                                    Submit First Update
                                </Link>

                            </div>
                        ) : (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                                {/* Update Header */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">

                                            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                                                {formatDate(
                                                    latestUpdate.date
                                                )}
                                            </span>

                                            <span className="text-xs text-zinc-600">
                                                Submitted by{" "}
                                                <span className="text-zinc-400">
                                                    {latestUpdate.submittedByName ||
                                                        latestUpdate.submittedBy}
                                                </span>
                                            </span>

                                        </div>
                                    </div>

                                    <Link
                                        href={`/DriWE-Construction/daily-updates/${latestUpdate.updateId}`}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300"
                                    >
                                        View Details
                                        <span>→</span>
                                    </Link>

                                </div>

                                {/* Update Metrics */}
                                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

                                    <MiniMetric
                                        icon={Users}
                                        label="Workers"
                                        value={formatNumber(
                                            latestUpdate.workersPresent
                                        )}
                                    />

                                    <MiniMetric
                                        icon={ClipboardList}
                                        label="Tasks Completed"
                                        value={formatNumber(
                                            latestUpdate.tasksCompleted
                                        )}
                                    />

                                    <MiniMetric
                                        icon={Package}
                                        label="Material Received"
                                        value={formatNumber(
                                            latestUpdate.materialReceived
                                        )}
                                    />

                                    <MiniMetric
                                        icon={Package}
                                        label="Material Used"
                                        value={formatNumber(
                                            latestUpdate.materialUsed
                                        )}
                                    />

                                </div>

                                {/* Note */}
                                {latestUpdate.note && (
                                    <div className="mt-5 border-t border-zinc-800 pt-5">

                                        <p className="text-xs uppercase tracking-wider text-zinc-600">
                                            Site Note
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                                            {latestUpdate.note}
                                        </p>

                                    </div>
                                )}

                                {/* Photos */}
                                {latestUpdate.photos &&
                                    latestUpdate.photos.length >
                                        0 && (
                                        <div className="mt-5 border-t border-zinc-800 pt-5">

                                            <div className="flex items-center gap-2">
                                                <Camera className="h-4 w-4 text-orange-400" />

                                                <p className="text-xs uppercase tracking-wider text-zinc-600">
                                                    Site Photos
                                                </p>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-3">

                                                {latestUpdate.photos
                                                    .slice(0, 4)
                                                    .map(
                                                        (
                                                            photo,
                                                            index
                                                        ) => (
                                                            <a
                                                                key={
                                                                    index
                                                                }
                                                                href={
                                                                    photo
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="overflow-hidden rounded-lg border border-zinc-800"
                                                            >
                                                                <img
                                                                    src={
                                                                        photo
                                                                    }
                                                                    alt={`Site photo ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    className="h-20 w-20 object-cover transition hover:scale-105"
                                                                />
                                                            </a>
                                                        )
                                                    )}

                                            </div>

                                        </div>
                                    )}

                            </div>
                        )}

                    </div>

                </div>

            </div>
        </main>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wider text-zinc-600">
                {label}
            </p>

            <p className="mt-1 text-sm text-zinc-300">
                {value}
            </p>
        </div>
    );
}

function KpiCard({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-orange-500/20">

            <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                    <Icon className="h-5 w-5 text-orange-400" />
                </div>

            </div>

            <p className="mt-5 text-sm text-zinc-500">
                {label}
            </p>

            <p className="mt-1 text-2xl font-bold">
                {value}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
                {description}
            </p>

        </div>
    );
}

function ModuleCard({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/30"
        >
            <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                    <Icon className="h-6 w-6 text-orange-400" />
                </div>

                <span className="text-zinc-700 transition group-hover:text-orange-400">
                    →
                </span>

            </div>

            <h2 className="mt-5 text-lg font-bold">
                {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
                {description}
            </p>

        </Link>
    );
}

function MiniMetric({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">

            <div className="flex items-center gap-2">

                <Icon className="h-4 w-4 text-orange-400" />

                <span className="text-xs text-zinc-500">
                    {label}
                </span>

            </div>

            <p className="mt-2 text-lg font-bold">
                {value}
            </p>

        </div>
    );
}