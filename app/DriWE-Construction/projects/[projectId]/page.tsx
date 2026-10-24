
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

    const [project, setProject] = useState<Project | null>(null);

    const [stats, setStats] = useState<DashboardStats>({
        workersToday: 0,
        tasksCompleted: 0,
        tasksTotal: 0,
        materialMovement: 0,
        labourCost: 0,
    });

    const [latestUpdate, setLatestUpdate] =
        useState<DailySiteUpdate | null>(null);

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(true);
    const [error, setError] = useState("");

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
                    data?.error || "Project not found"
                );
            }
        } catch (error) {
            console.error("Failed to load project:", error);

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
                workersToday: Number(data.workersToday || 0),
                tasksCompleted: Number(data.tasksCompleted || 0),
                tasksTotal: Number(data.tasksTotal || 0),
                materialMovement: Number(data.materialMovement || 0),
                labourCost: Number(data.labourCost || 0),
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
        return new Intl.NumberFormat("en-IN").format(value);
    }

    function formatDate(date: string) {
        if (!date) return "—";

        const parsed = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(parsed);
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                    <p className="text-sm text-gray-500">
                        Loading project...
                    </p>
                </div>
            </main>
        );
    }

    if (!project) {
        return (
            <main className="min-h-screen bg-white px-6 py-10 text-black">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>

                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className="text-red-700">
                            {error || "Project not found."}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-black">
            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Back */}
                <Link
                    href="/DriWE-Construction/projects"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Link>

                {/* Project Header */}
                <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                                <Building2 className="h-7 w-7 text-black" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl font-bold text-black">
                                        {project.projectName}
                                    </h1>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            project.status === "Active"
                                                ? "bg-green-100 text-green-800"
                                                : project.status === "Completed"
                                                ? "bg-blue-100 text-blue-800"
                                                : project.status === "Cancelled"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {project.status}
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    {project.location}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={loadAll}
                                disabled={
                                    loading ||
                                    statsLoading ||
                                    updateLoading
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        statsLoading || updateLoading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />
                                Refresh
                            </button>

                            <Link
                                href={`/DriWE-Construction/projects/${projectId}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Project
                            </Link>
                        </div>
                    </div>

                    <div className="mt-7 grid gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
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
                            value={formatDate(project.startDate)}
                        />

                        <Info
                            label="Expected Completion"
                            value={formatDate(
                                project.expectedCompletion
                            )}
                        />
                    </div>

                    {project.description && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <p className="text-xs uppercase tracking-wider text-gray-500">
                                Project Description
                            </p>

                            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-700">
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
                <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                latestUpdate?.issues
                                    ? "bg-red-50"
                                    : "bg-green-50"
                            }`}
                        >
                            {latestUpdate?.issues ? (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                        </div>

                        <div>
                            <h2 className="font-semibold text-black">
                                Site Issues
                            </h2>
                            <p className="text-sm text-gray-600">
                                Issues reported from this project.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        {updateLoading ? (
                            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-5 text-sm text-gray-600">
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                                Loading site issues...
                            </div>
                        ) : !latestUpdate ? (
                            <div className="rounded-xl bg-gray-50 p-5">
                                <p className="text-sm text-gray-600">
                                    No daily site update has been
                                    submitted yet.
                                </p>
                            </div>
                        ) : latestUpdate.issues > 0 ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                                        {latestUpdate.issues}{" "}
                                        {latestUpdate.issues === 1
                                            ? "Issue"
                                            : "Issues"}
                                    </span>

                                    <span className="text-xs text-gray-600">
                                        From update on{" "}
                                        {formatDate(latestUpdate.date)}
                                    </span>
                                </div>

                                {latestUpdate.issueDescription ? (
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                                        {latestUpdate.issueDescription}
                                    </p>
                                ) : (
                                    <p className="mt-4 text-sm text-gray-600">
                                        Issues were reported, but no
                                        description was provided.
                                    </p>
                                )}

                                <Link
                                    href={`/DriWE-Construction/daily-updates/${latestUpdate.updateId}`}
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-black underline underline-offset-4 hover:text-gray-600"
                                >
                                    View Daily Update
                                    <span>→</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />

                                    <div>
                                        <p className="text-sm font-medium text-green-800">
                                            No issues reported
                                        </p>

                                        <p className="mt-1 text-xs text-gray-600">
                                            Latest update:{" "}
                                            {formatDate(latestUpdate.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Latest Site Update */}
                <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                <CalendarDays className="h-5 w-5 text-black" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-black">
                                    Latest Site Update
                                </h2>

                                <p className="text-sm text-gray-600">
                                    Most recent progress reported from
                                    this site.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={`/DriWE-Construction/daily-updates?projectId=${projectId}`}
                            className="text-sm font-medium text-black underline underline-offset-4 hover:text-gray-600"
                        >
                            View All Updates →
                        </Link>
                    </div>

                    <div className="mt-5">
                        {updateLoading ? (
                            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-5 text-sm text-gray-600">
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                                Loading latest update...
                            </div>
                        ) : !latestUpdate ? (
                            <div className="rounded-xl bg-gray-50 p-6 text-center">
                                <FileText className="mx-auto h-8 w-8 text-gray-400" />

                                <p className="mt-3 text-sm text-gray-600">
                                    No daily update submitted yet.
                                </p>

                                <Link
                                    href={`/DriWE-Construction/daily-updates/new?projectId=${projectId}`}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Submit First Update
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                {/* Update Header */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800">
                                                {formatDate(latestUpdate.date)}
                                            </span>

                                            <span className="text-xs text-gray-600">
                                                Submitted by{" "}
                                                <span className="font-medium text-black">
                                                    {latestUpdate.submittedByName ||
                                                        latestUpdate.submittedBy}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/DriWE-Construction/daily-updates/${latestUpdate.updateId}`}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-black underline underline-offset-4 hover:text-gray-600"
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
                                    <div className="mt-5 border-t border-gray-200 pt-5">
                                        <p className="text-xs uppercase tracking-wider text-gray-500">
                                            Site Note
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {latestUpdate.note}
                                        </p>
                                    </div>
                                )}

                                {/* Photos */}
                                {latestUpdate.photos &&
                                    latestUpdate.photos.length > 0 && (
                                        <div className="mt-5 border-t border-gray-200 pt-5">
                                            <div className="flex items-center gap-2">
                                                <Camera className="h-4 w-4 text-black" />

                                                <p className="text-xs uppercase tracking-wider text-gray-500">
                                                    Site Photos
                                                </p>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {latestUpdate.photos
                                                    .slice(0, 4)
                                                    .map((photo, index) => (
                                                        <a
                                                            key={index}
                                                            href={photo}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                                                        >
                                                            <img
                                                                src={photo}
                                                                alt={`Site photo ${
                                                                    index + 1
                                                                }`}
                                                                className="h-20 w-20 object-cover transition hover:scale-105"
                                                            />
                                                        </a>
                                                    ))}
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
            <p className="text-xs uppercase tracking-wider text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-sm text-black">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-400">
            <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <Icon className="h-5 w-5 text-black" />
                </div>
            </div>

            <p className="mt-5 text-sm text-gray-600">
                {label}
            </p>

            <p className="mt-1 text-2xl font-bold text-black">
                {value}
            </p>

            <p className="mt-1 text-xs text-gray-500">
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
            className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gray-400 hover:shadow-md"
        >
            <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <Icon className="h-6 w-6 text-black" />
                </div>

                <span className="text-gray-400 transition group-hover:text-black">
                    →
                </span>
            </div>

            <h2 className="mt-5 text-lg font-bold text-black">
                {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
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
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-black" />

                <span className="text-xs text-gray-600">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-lg font-bold text-black">
                {value}
            </p>
        </div>
    );
}
