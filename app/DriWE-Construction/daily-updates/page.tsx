"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

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
    materialsUsed?: Array<{
        materialId: string;
        materialName: string;
        quantity: number;
        unit: string;
    }>;
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

            const res = await fetch("/api/construction/daily-updates", {
                cache: "no-store",
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to load daily updates");
            }

            setUpdates(data.updates || []);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load daily updates"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadUpdates();
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
                throw new Error(data.error || "Failed to delete update");
            }

            setUpdates((prev) =>
                prev.filter((item) => item.updateId !== updateId)
            );
        } catch (err: unknown) {
            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to delete daily update"
            );
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="min-h-screen bg-white p-4 text-black sm:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-black">
                            <ClipboardList size={20} />
                            <span className="text-sm font-semibold">
                                Construction Management
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-black">
                            Daily Site Updates
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            Monitor daily progress, workers, materials and site
                            issues.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={loadUpdates}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <Link
                            href="/DriWE-Construction/daily-updates/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <Plus size={18} />
                            New Daily Update
                        </Link>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800"
                    >
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Loader2
                                className="animate-spin text-black"
                                size={24}
                            />
                            Loading daily updates...
                        </div>
                    </div>
                ) : updates.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center sm:p-12">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <FileText size={26} className="text-black" />
                        </div>

                        <h2 className="text-xl font-bold text-black">
                            No daily updates yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                            Create your first daily site update to start
                            tracking project progress.
                        </p>

                        <Link
                            href="/DriWE-Construction/daily-updates/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
                        >
                            <Plus size={18} />
                            Create Daily Update
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {updates.map((update) => (
                            <div
                                key={update.updateId}
                                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md sm:p-5"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-lg font-bold text-black">
                                                {update.projectName || "Project"}
                                            </h2>

                                            <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-semibold text-black">
                                                Daily Update
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays
                                                    size={15}
                                                    className="text-gray-500"
                                                />
                                                {update.date}
                                            </span>

                                            <span>
                                                Submitted by:{" "}
                                                <span className="font-semibold text-black">
                                                    {update.submittedByName ||
                                                        update.submittedBy}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/DriWE-Construction/daily-updates/${update.updateId}`}
                                            aria-label="View daily update"
                                            title="View"
                                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-black transition hover:bg-gray-100"
                                        >
                                            <Eye size={17} />
                                        </Link>

                                        <Link
                                            href={`/DriWE-Construction/daily-updates/${update.updateId}/edit`}
                                            aria-label="Edit daily update"
                                            title="Edit"
                                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-black transition hover:bg-gray-100"
                                        >
                                            <Edit size={17} />
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(update.updateId)
                                            }
                                            disabled={deleting === update.updateId}
                                            aria-label="Delete daily update"
                                            title="Delete"
                                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2.5 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deleting === update.updateId ? (
                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Trash2 size={17} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <StatCard
                                        icon={<Users size={18} />}
                                        label="Workers"
                                        value={update.workersPresent}
                                    />

                                    <StatCard
                                        icon={<ClipboardList size={18} />}
                                        label="Tasks Completed"
                                        value={update.tasksCompleted}
                                    />

                                    <StatCard
                                        icon={<Package size={18} />}
                                        label="Material Received"
                                        value={update.materialReceived}
                                    />

                                    <StatCard
                                        icon={<AlertTriangle size={18} />}
                                        label="Issues"
                                        value={update.issues}
                                    />
                                </div>

                                {/* Materials Used */}
                                {update.materialsUsed &&
                                    update.materialsUsed.length > 0 && (
                                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                Materials Used
                                            </p>

                                            <ul className="space-y-3">
                                                {update.materialsUsed.map(
                                                    (item, index) => (
                                                        <li
                                                            key={`${item.materialId}-${index}`}
                                                            className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2 text-sm last:border-0 last:pb-0"
                                                        >
                                                            <span className="text-gray-700">
                                                                {item.materialName}
                                                            </span>
                                                            <span className="shrink-0 font-semibold text-black">
                                                                {item.quantity}{" "}
                                                                {item.unit}
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {/* Site Note */}
                                {update.note && (
                                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Site Note
                                        </p>
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {update.note}
                                        </p>
                                    </div>
                                )}

                                {/* Site Issues */}
                                {update.issues > 0 &&
                                    update.issueDescription && (
                                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-red-800">
                                                Site Issues
                                            </p>
                                            <p className="whitespace-pre-wrap text-sm leading-6 text-red-900">
                                                {update.issueDescription}
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
    icon: ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-black">
                {icon}
                <span className="text-xs font-medium text-gray-600">
                    {label}
                </span>
            </div>

            <p className="text-xl font-bold text-black">{value}</p>
        </div>
    );
}