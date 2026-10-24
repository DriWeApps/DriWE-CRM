
"use client";

import { useCallback, useEffect, useState } from "react";
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

type TaskStatus = "Pending" | "In Progress" | "Completed" | "Delayed";
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

type AuthUser = {
    role?: string;
    email?: string;
    employeeId?: string;
    userId?: string;
};

export default function ConstructionTaskDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params?.taskId as string;

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [workerName, setWorkerName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [authLoaded, setAuthLoaded] = useState(false);

    const isConstructionWorker =
        userRole.trim().toUpperCase() === "CONSTRUCTIONEMPLOYEE";

    const loadTask = useCallback(async () => {
        if (!taskId) return;

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/construction/tasks/${encodeURIComponent(taskId)}`,
                { cache: "no-store", credentials: "include" }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to load task");
            }

            const loadedTask: Task = data?.task || data;
            setTask(loadedTask);

            if (
                !loadedTask.assignedToName &&
                loadedTask.assignedTo &&
                loadedTask.siteId
            ) {
                await loadWorkerName(loadedTask.siteId, loadedTask.assignedTo);
            } else {
                setWorkerName(loadedTask.assignedToName || "");
            }
        } catch (err) {
            console.error("Failed to load task:", err);
            setError(err instanceof Error ? err.message : "Failed to load task");
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        if (!taskId) return;
        void loadTask();
    }, [taskId, loadTask]);

    useEffect(() => {
        let cancelled = false;

        async function loadCurrentUser() {
            try {
                const response = await fetch("/api/auth/me", {
                    cache: "no-store",
                    credentials: "include",
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error || "Could not identify current user");
                }

                const user: AuthUser = data?.user || data;
                if (!cancelled) setUserRole(user?.role || "");
            } catch (err) {
                console.error("Failed to load current user role:", err);
                if (!cancelled) setUserRole("");
            } finally {
                if (!cancelled) setAuthLoaded(true);
            }
        }

        void loadCurrentUser();
        return () => {
            cancelled = true;
        };
    }, []);

    async function loadWorkerName(siteId: string, workerId: string) {
        try {
            const response = await fetch(
                `/api/construction/workers?siteId=${encodeURIComponent(siteId)}`,
                { cache: "no-store", credentials: "include" }
            );
            if (!response.ok) return;

            const data = await response.json();
            const workers: Worker[] = Array.isArray(data?.workers) ? data.workers : [];
            const worker = workers.find((item) => item.workerId === workerId);
            if (worker) setWorkerName(worker.name);
        } catch (err) {
            console.error("Failed to load worker:", err);
        }
    }

    async function handleDelete() {
        if (!taskId || isConstructionWorker) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this task? This action cannot be undone."
        );
        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/construction/tasks/${encodeURIComponent(taskId)}`,
                { method: "DELETE", credentials: "include" }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to delete task");
            }

            router.push("/DriWE-Construction/tasks");
            router.refresh();
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError(err instanceof Error ? err.message : "Failed to delete task");
            setDeleting(false);
        }
    }

    function formatDate(date?: string) {
        if (!date) return "—";
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime())
            ? date
            : parsed.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              });
    }

    function formatDateTime(date?: string) {
        if (!date) return "—";
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime())
            ? date
            : parsed.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              });
    }

    function getStatusClasses(status?: TaskStatus) {
        switch (status) {
            case "Completed":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";
            case "In Progress":
                return "border-blue-200 bg-blue-50 text-blue-700";
            case "Delayed":
                return "border-red-200 bg-red-50 text-red-700";
            default:
                return "border-amber-200 bg-amber-50 text-amber-800";
        }
    }

    function getPriorityClasses(priority?: TaskPriority) {
        switch (priority) {
            case "High":
                return "border-red-200 bg-red-50 text-red-700";
            case "Low":
                return "border-gray-200 bg-gray-50 text-gray-700";
            default:
                return "border-amber-200 bg-amber-50 text-amber-800";
        }
    }

    function getStatusIcon(status?: TaskStatus) {
        switch (status) {
            case "Completed":
                return <CheckCircle2 className="h-4 w-4" />;
            case "In Progress":
                return <Timer className="h-4 w-4" />;
            case "Delayed":
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <CircleDot className="h-4 w-4" />;
        }
    }

    if (loading || !authLoaded) {
        return (
            <div className="min-h-screen bg-white text-black">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading task...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-white text-black">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    <Link
                        href="/DriWE-Construction/tasks"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tasks
                    </Link>
                    <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                            <div>
                                <h2 className="font-semibold text-red-700">Task not found</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    {error || "The requested task could not be found."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const status = task.status || "Pending";
    const priority = task.priority || "Medium";
    const assignedWorkerName = task.assignedToName || workerName || "Unassigned";

    const cardClass =
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";
    const insetClass =
        "rounded-lg border border-gray-200 bg-gray-50 p-4";

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <Link
                    href="/DriWE-Construction/tasks"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tasks
                </Link>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <header className={`${cardClass} mb-6`}>
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <ClipboardList className="h-6 w-6 text-black" />
                            </div>
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(status)}`}
                                    >
                                        {getStatusIcon(status)} {status}
                                    </span>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityClasses(priority)}`}
                                    >
                                        {priority} Priority
                                    </span>
                                </div>
                                <h1 className="break-words text-2xl font-bold text-black">
                                    {task.title}
                                </h1>
                                <p className="mt-1 break-all text-sm text-gray-500">
                                    Task ID: {task.taskId}
                                </p>
                            </div>
                        </div>

                        {!isConstructionWorker && (
                            <div className="flex shrink-0 gap-2">
                                <Link
                                    href={`/DriWE-Construction/tasks/${taskId}/edit`}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                    Delete
                                </button>
                            </div>
                        )}

                        {isConstructionWorker && (
                            <Link
                                href={`/DriWE-Construction/tasks/${taskId}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                <Pencil className="h-4 w-4" />
                                Update Progress
                            </Link>
                        )}
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className={cardClass}>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                    <Building2 className="h-4 w-4 text-black" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-black">Project & Site</h2>
                                    <p className="text-xs text-gray-500">
                                        Location assigned to this task
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className={insetClass}>
                                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                                        Project
                                    </p>
                                    <p className="font-medium text-black">
                                        {task.projectName || "—"}
                                    </p>
                                </div>
                                <div className={insetClass}>
                                    <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                                        <MapPin className="h-3 w-3" /> Site
                                    </p>
                                    <p className="font-medium text-black">
                                        {task.siteName || "No site assigned"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className={cardClass}>
                            <h2 className="mb-4 font-semibold text-black">Task Description</h2>
                            <div className={insetClass}>
                                {task.description ? (
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                        {task.description}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-gray-500">
                                        No description provided.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className={cardClass}>
                            <h2 className="mb-4 font-semibold text-black">Remarks</h2>
                            <div className={insetClass}>
                                {task.remarks ? (
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                        {task.remarks}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-gray-500">
                                        No remarks added.
                                    </p>
                                )}
                            </div>
                        </section>

                        {(task.completionDescription || task.completionLink || task.completedAt) && (
                            <section className={`${cardClass} border-emerald-200`}>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-black">
                                            Completion Details
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Submitted completion information
                                        </p>
                                    </div>
                                </div>
                                {task.completionDescription && (
                                    <div className="mb-4">
                                        <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                                            Completion Description
                                        </p>
                                        <p className={`${insetClass} whitespace-pre-wrap text-sm leading-6 text-gray-700`}>
                                            {task.completionDescription}
                                        </p>
                                    </div>
                                )}
                                {task.completionLink && (
                                    <div className="mb-4">
                                        <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                                            Completion Link
                                        </p>
                                        <a
                                            href={task.completionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block break-all rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-black transition hover:bg-gray-100 hover:underline"
                                        >
                                            {task.completionLink}
                                        </a>
                                    </div>
                                )}
                                {task.completedAt && (
                                    <div>
                                        <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                                            Completed At
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {formatDateTime(task.completedAt)}
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <section className={cardClass}>
                            <h2 className="mb-4 font-semibold text-black">Task Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                        <AlertCircle className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Priority</p>
                                        <p className="mt-0.5 text-sm font-medium text-black">
                                            {priority}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-black">
                                        {getStatusIcon(status)}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Status</p>
                                        <p className="mt-0.5 text-sm font-medium text-black">
                                            {status}
                                        </p>
                                    </div>
                                </div>
                                {task.startDate && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                            <CalendarDays className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Start Date</p>
                                            <p className="mt-0.5 text-sm font-medium text-black">
                                                {formatDate(task.startDate)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                        <CalendarDays className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Due Date</p>
                                        <p className="mt-0.5 text-sm font-medium text-black">
                                            {formatDate(task.dueDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={cardClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                    <User className="h-4 w-4 text-black" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-black">Assignment</h2>
                                    <p className="text-xs text-gray-500">
                                        Worker assigned to this task
                                    </p>
                                </div>
                            </div>
                            <div className={`${insetClass} mb-4`}>
                                <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                                    Assigned Worker
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200">
                                        <User className="h-5 w-5 text-black" />
                                    </div>
                                    <p className="text-sm font-medium text-black">
                                        {assignedWorkerName}
                                    </p>
                                </div>
                            </div>
                            {(task.assignedByName || task.createdByName) && (
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-xs text-gray-500">Assigned By</p>
                                    <p className="mt-1 text-sm text-gray-700">
                                        {task.assignedByName || task.createdByName}
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className={cardClass}>
                            <h2 className="mb-4 font-semibold text-black">Activity</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Created</p>
                                        <p className="mt-1 text-sm text-gray-700">
                                            {formatDateTime(task.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Last Updated</p>
                                        <p className="mt-1 text-sm text-gray-700">
                                            {formatDateTime(task.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}

