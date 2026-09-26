"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    ClipboardList,
    Building2,
    MapPin,
    CalendarDays,
    User,
    Clock,
    AlertCircle,
    Loader2,
    CheckCircle2,
    CircleDot,
    Timer,
} from "lucide-react";

type TaskStatus =
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Delayed";

type TaskPriority = "Low" | "Medium" | "High";

type Task = {
    taskId: string;

    companyId?: string;
    companyName?: string;

    projectId?: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    title: string;
    description?: string;

    priority?: TaskPriority;
    status?: TaskStatus;

    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;

    assignedBy?: string;
    assignedByName?: string;
    assignedByEmail?: string;

    startDate?: string;
    dueDate?: string;

    remarks?: string;

    completionDescription?: string;
    completionLink?: string;
    completedAt?: string;

    createdBy?: string;
    createdByName?: string;

    createdAt?: string;
    updatedAt?: string;
};

type Worker = {
    workerId: string;
    projectId?: string;
    siteId?: string;
    name: string;
    phone?: string;
    email?: string;
    workerType?: string;
    salary?: number;
    dailyWage?: number;
    active?: boolean;
};

export default function ConstructionTaskDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const taskId = params?.taskId as string;

    const [task, setTask] = useState<Task | null>(null);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    /*
     * Used only when older tasks do not have
     * assignedToName stored.
     */
    const [workerName, setWorkerName] = useState("");

    useEffect(() => {
        if (!taskId) return;

        loadTask();
    }, [taskId]);

    /*
     * Load Task
     */
    async function loadTask() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/construction/tasks/${taskId}`,
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
                        "Failed to load task"
                );
            }

            const loadedTask: Task =
                data?.task || data;

            setTask(loadedTask);

            /*
             * New tasks already contain assignedToName.
             *
             * For older tasks where assignedToName is missing,
             * try to find the worker from the selected site.
             */
            if (
                !loadedTask.assignedToName &&
                loadedTask.assignedTo &&
                loadedTask.siteId
            ) {
                await loadWorkerName(
                    loadedTask.siteId,
                    loadedTask.assignedTo
                );
            } else {
                setWorkerName(
                    loadedTask.assignedToName || ""
                );
            }
        } catch (err) {
            console.error(
                "Failed to load task:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load task"
            );
        } finally {
            setLoading(false);
        }
    }

    /*
     * Find worker name from selected site.
     *
     * This is mainly for older tasks which may only
     * have assignedTo = workerId.
     */
    async function loadWorkerName(
        siteId: string,
        workerId: string
    ) {
        try {
            const response = await fetch(
                `/api/construction/workers?siteId=${encodeURIComponent(
                    siteId
                )}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            const workers: Worker[] =
                data?.workers || [];

            const worker = workers.find(
                (item) =>
                    item.workerId === workerId
            );

            if (worker) {
                setWorkerName(worker.name);
            }
        } catch (err) {
            console.error(
                "Failed to load worker:",
                err
            );
        }
    }

    /*
     * Delete Task
     */
    async function handleDelete() {
        if (!taskId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this task? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/construction/tasks/${taskId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to delete task"
                );
            }

            router.push(
                "/DriWE-Construction/tasks"
            );

            router.refresh();
        } catch (err) {
            console.error(
                "Failed to delete task:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete task"
            );

            setDeleting(false);
        }
    }

    /*
     * Format date
     */
    function formatDate(date?: string) {
        if (!date) return "—";

        try {
            return new Date(
                date
            ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return date;
        }
    }

    /*
     * Format date + time
     */
    function formatDateTime(date?: string) {
        if (!date) return "—";

        try {
            return new Date(
                date
            ).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return date;
        }
    }

    /*
     * Status styles
     */
    function getStatusClasses(
        status?: TaskStatus
    ) {
        switch (status) {
            case "Completed":
                return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

            case "In Progress":
                return "border-blue-500/30 bg-blue-500/10 text-blue-400";

            case "Delayed":
                return "border-red-500/30 bg-red-500/10 text-red-400";

            case "Pending":
            default:
                return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
        }
    }

    /*
     * Priority styles
     */
    function getPriorityClasses(
        priority?: TaskPriority
    ) {
        switch (priority) {
            case "High":
                return "border-red-500/30 bg-red-500/10 text-red-400";

            case "Low":
                return "border-zinc-600 bg-zinc-800 text-zinc-300";

            case "Medium":
            default:
                return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
        }
    }

    /*
     * Status icon
     */
    function getStatusIcon(
        status?: TaskStatus
    ) {
        switch (status) {
            case "Completed":
                return (
                    <CheckCircle2 className="h-4 w-4" />
                );

            case "In Progress":
                return (
                    <Timer className="h-4 w-4" />
                );

            case "Delayed":
                return (
                    <AlertCircle className="h-4 w-4" />
                );

            case "Pending":
            default:
                return (
                    <CircleDot className="h-4 w-4" />
                );
        }
    }

    /*
     * Loading
     */
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin" />

                        <span>
                            Loading task...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * Task not found
     */
    if (!task) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    <Link
                        href="/DriWE-Construction/tasks"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />

                        Back to Tasks
                    </Link>

                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />

                            <div>
                                <h2 className="font-semibold text-red-300">
                                    Task not found
                                </h2>

                                <p className="mt-1 text-sm text-red-400/80">
                                    {error ||
                                        "The requested task could not be found."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const status =
        task.status || "Pending";

    const priority =
        task.priority || "Medium";

    /*
     * Worker name:
     *
     * 1. Use assignedToName from task
     * 2. Otherwise use fetched workerName
     * 3. Otherwise show Unassigned
     *
     * We intentionally DO NOT show worker ID/email.
     */
    const assignedWorkerName =
        task.assignedToName ||
        workerName ||
        "Unassigned";

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Back */}
                <Link
                    href="/DriWE-Construction/tasks"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                >
                    <ArrowLeft className="h-4 w-4" />

                    Back to Tasks
                </Link>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400" />

                            <p className="text-sm text-red-300">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="flex min-w-0 gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                                <ClipboardList className="h-6 w-6 text-yellow-400" />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                            status
                                        )}`}
                                    >
                                        {getStatusIcon(
                                            status
                                        )}

                                        {status}
                                    </span>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                                            priority
                                        )}`}
                                    >
                                        {priority} Priority
                                    </span>
                                </div>

                                <h1 className="break-words text-2xl font-bold text-white">
                                    {task.title}
                                </h1>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Task ID: {task.taskId}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 gap-2">

                            {/* Edit */}
                            <Link
                                href={`/DriWE-Construction/tasks/${taskId}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-400"
                            >
                                <Pencil className="h-4 w-4" />

                                Edit
                            </Link>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}

                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* LEFT */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Project / Site */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
                                    <Building2 className="h-4 w-4 text-yellow-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Project & Site
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Location assigned to this task
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">

                                {/* Project */}
                                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
                                        Project
                                    </p>

                                    <p className="font-medium text-white">
                                        {task.projectName ||
                                            "—"}
                                    </p>
                                </div>

                                {/* Site */}
                                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                                    <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-zinc-500">
                                        <MapPin className="h-3 w-3" />

                                        Site
                                    </p>

                                    <p className="font-medium text-white">
                                        {task.siteName ||
                                            "No site assigned"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <h2 className="mb-4 font-semibold text-white">
                                Task Description
                            </h2>

                            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">

                                {task.description ? (
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                        {
                                            task.description
                                        }
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-zinc-600">
                                        No description provided.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Remarks */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <h2 className="mb-4 font-semibold text-white">
                                Remarks
                            </h2>

                            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">

                                {task.remarks ? (
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                        {task.remarks}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-zinc-600">
                                        No remarks added.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Completion Details */}
                        {(task.completionDescription ||
                            task.completionLink ||
                            task.completedAt) && (
                            <section className="rounded-xl border border-emerald-500/20 bg-zinc-900/60 p-5 shadow-lg">

                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-white">
                                            Completion Details
                                        </h2>

                                        <p className="text-xs text-zinc-500">
                                            Submitted completion information
                                        </p>
                                    </div>
                                </div>

                                {/* Completion Description */}
                                {task.completionDescription && (
                                    <div className="mb-4">

                                        <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                                            Completion Description
                                        </p>

                                        <p className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-6 text-zinc-300">
                                            {
                                                task.completionDescription
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Completion Link */}
                                {task.completionLink && (
                                    <div className="mb-4">

                                        <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                                            Completion Link
                                        </p>

                                        <a
                                            href={
                                                task.completionLink
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block truncate rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-yellow-400 transition hover:bg-zinc-900 hover:underline"
                                        >
                                            {
                                                task.completionLink
                                            }
                                        </a>
                                    </div>
                                )}

                                {/* Completed At */}
                                {task.completedAt && (
                                    <div>

                                        <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
                                            Completed At
                                        </p>

                                        <p className="text-sm text-zinc-300">
                                            {formatDateTime(
                                                task.completedAt
                                            )}
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">

                        {/* Task Information */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <h2 className="mb-4 font-semibold text-white">
                                Task Information
                            </h2>

                            <div className="space-y-4">

                                {/* Priority */}
                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                        <AlertCircle className="h-4 w-4 text-zinc-400" />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs text-zinc-500">
                                            Priority
                                        </p>

                                        <p className="mt-0.5 text-sm font-medium text-white">
                                            {priority}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                        {getStatusIcon(
                                            status
                                        )}
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs text-zinc-500">
                                            Status
                                        </p>

                                        <p className="mt-0.5 text-sm font-medium text-white">
                                            {status}
                                        </p>
                                    </div>
                                </div>

                                {/* Start Date */}
                                {task.startDate && (
                                    <div className="flex items-start gap-3">

                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                            <CalendarDays className="h-4 w-4 text-zinc-400" />
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs text-zinc-500">
                                                Start Date
                                            </p>

                                            <p className="mt-0.5 text-sm font-medium text-white">
                                                {formatDate(
                                                    task.startDate
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Due Date */}
                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                        <CalendarDays className="h-4 w-4 text-zinc-400" />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs text-zinc-500">
                                            Due Date
                                        </p>

                                        <p className="mt-0.5 text-sm font-medium text-white">
                                            {formatDate(
                                                task.dueDate
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Assignment */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <div className="mb-4 flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
                                    <User className="h-4 w-4 text-yellow-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Assignment
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Worker assigned to this task
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">

                                {/* Assigned Worker */}
                                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">

                                    <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                                        Assigned Worker
                                    </p>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/10">
                                            <User className="h-5 w-5 text-yellow-400" />
                                        </div>

                                        <p className="text-sm font-medium text-white">
                                            {assignedWorkerName}
                                        </p>
                                    </div>
                                </div>

                                {/* Assigned By */}
                                {(task.assignedByName ||
                                    task.createdByName) && (
                                    <div className="border-t border-zinc-800 pt-4">

                                        <p className="text-xs text-zinc-500">
                                            Assigned By
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {task.assignedByName ||
                                                task.createdByName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Activity */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <h2 className="mb-4 font-semibold text-white">
                                Activity
                            </h2>

                            <div className="space-y-4">

                                {/* Created */}
                                <div className="flex items-start gap-3">

                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {formatDateTime(
                                                task.createdAt
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Updated */}
                                <div className="flex items-start gap-3">

                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Last Updated
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {formatDateTime(
                                                task.updatedAt
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}