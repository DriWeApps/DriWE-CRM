"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
    CalendarDays,
    ClipboardList,
    Edit,
    Eye,
    FileText,
    Loader2,
    Plus,
    RefreshCw,
    Trash2,
    Users,
    AlertTriangle,
    Package,
} from "lucide-react";

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

    note?: string;

    submittedBy: string;
    submittedByName?: string;

    createdAt: string;
    updatedAt: string;
}

export default function DailyUpdatesPage() {
    const [updates, setUpdates] = useState<DailySiteUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function loadUpdates() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(
                "/api/construction/daily-updates",
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to load daily updates"
                );
            }

            setUpdates(data.updates || []);
        } catch (err: any) {
            setError(
                err.message ||
                    "Failed to load daily updates"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUpdates();
    }, []);

    async function handleDelete(updateId: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this daily site update?"
        );

        if (!confirmed) return;

        try {
            setDeleting(updateId);

            const res = await fetch(
                `/api/construction/daily-updates/${updateId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to delete update"
                );
            }

            setUpdates((prev) =>
                prev.filter(
                    (item) =>
                        item.updateId !== updateId
                )
            );
        } catch (err: any) {
            alert(
                err.message ||
                    "Failed to delete daily update"
            );
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-white">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-orange-400">
                            <ClipboardList size={20} />
                            <span className="text-sm font-medium">
                                Construction Management
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold">
                            Daily Site Updates
                        </h1>

                        <p className="mt-2 text-sm text-zinc-400">
                            Monitor daily progress,
                            workers, materials and site
                            issues.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={loadUpdates}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                            Refresh
                        </button>

                        <Link
                            href="/DriWE-Construction/daily-updates/new"
                            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-orange-400"
                        >
                            <Plus size={18} />
                            New Daily Update
                        </Link>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="flex items-center gap-3 text-zinc-400">
                            <Loader2
                                className="animate-spin"
                                size={24}
                            />
                            Loading daily updates...
                        </div>
                    </div>
                ) : updates.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-12 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10">
                            <FileText
                                size={26}
                                className="text-orange-400"
                            />
                        </div>

                        <h2 className="text-xl font-semibold">
                            No daily updates yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                            Create your first daily site
                            update to start tracking
                            project progress.
                        </p>

                        <Link
                            href="/DriWE-Construction/daily-updates/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-black hover:bg-orange-400"
                        >
                            <Plus size={18} />
                            Create Daily Update
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {updates.map((update) => (
                            <div
                                key={update.updateId}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-lg font-semibold">
                                                {update.projectName ||
                                                    "Project"}
                                            </h2>

                                            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                                                Daily Update
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-400">
                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays
                                                    size={15}
                                                />
                                                {update.date}
                                            </span>

                                            <span>
                                                Submitted by:{" "}
                                                <span className="text-zinc-300">
                                                    {update.submittedByName ||
                                                        update.submittedBy}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/DriWE-Construction/daily-updates/${update.updateId}`}
                                            className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800"
                                            title="View"
                                        >
                                            <Eye
                                                size={17}
                                            />
                                        </Link>

                                        <Link
                                            href={`/DriWE-Construction/daily-updates/${update.updateId}/edit`}
                                            className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800"
                                            title="Edit"
                                        >
                                            <Edit
                                                size={17}
                                            />
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    update.updateId
                                                )
                                            }
                                            disabled={
                                                deleting ===
                                                update.updateId
                                            }
                                            className="rounded-lg border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deleting ===
                                            update.updateId ? (
                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Trash2
                                                    size={17}
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <StatCard
                                        icon={
                                            <Users
                                                size={18}
                                            />
                                        }
                                        label="Workers"
                                        value={
                                            update.workersPresent
                                        }
                                    />

                                    <StatCard
                                        icon={
                                            <ClipboardList
                                                size={18}
                                            />
                                        }
                                        label="Tasks Completed"
                                        value={
                                            update.tasksCompleted
                                        }
                                    />

                                    <StatCard
                                        icon={
                                            <Package
                                                size={18}
                                            />
                                        }
                                        label="Material Received"
                                        value={
                                            update.materialReceived
                                        }
                                    />

                                    <StatCard
                                        icon={
                                            <AlertTriangle
                                                size={18}
                                            />
                                        }
                                        label="Issues"
                                        value={
                                            update.issues
                                        }
                                    />
                                </div>

                                {update.note && (
                                    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                            Site Note
                                        </p>

                                        <p className="text-sm text-zinc-300">
                                            {update.note}
                                        </p>
                                    </div>
                                )}

                                {update.issues > 0 &&
                                    update.issueDescription && (
                                        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-red-400">
                                                Site Issues
                                            </p>

                                            <p className="text-sm text-zinc-300">
                                                {
                                                    update.issueDescription
                                                }
                                            </p>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-2 flex items-center gap-2 text-orange-400">
                {icon}
                <span className="text-xs text-zinc-500">
                    {label}
                </span>
            </div>

            <p className="text-xl font-bold">
                {value}
            </p>
        </div>
    );
}