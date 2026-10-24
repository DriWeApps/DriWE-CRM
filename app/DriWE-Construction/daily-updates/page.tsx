
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
    MapPin,
    ChevronRight,
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
        <main className="min-h-screen w-full bg-white text-black">
            <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 2xl:px-14">
                {/* Header */}
                <header className="mb-8 flex flex-col gap-5 border-b border-gray-200 pb-7 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                            <ClipboardList size={15} className="text-black" />
                            Construction Management
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                            Daily Site Updates
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                            Monitor daily project progress, workforce attendance,
                            material movement, and site issues in one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={loadUpdates}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:border-black hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <Link
                            href="/DriWE-Construction/daily-updates/new"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                        >
                            <Plus size={17} />
                            New Daily Update
                        </Link>
                    </div>
                </header>

                {/* Summary */}
                {!loading && !error && updates.length > 0 && (
                    <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            icon={<FileText size={19} />}
                            label="Total Updates"
                            value={updates.length}
                            description="Recorded site reports"
                        />
                        <SummaryCard
                            icon={<Users size={19} />}
                            label="Workers Present"
                            value={updates.reduce(
                                (sum, update) => sum + (Number(update.workersPresent) || 0),
                                0
                            )}
                            description="Combined across listed updates"
                        />
                        <SummaryCard
                            icon={<ClipboardList size={19} />}
                            label="Tasks Completed"
                            value={updates.reduce(
                                (sum, update) => sum + (Number(update.tasksCompleted) || 0),
                                0
                            )}
                            description="Reported completed tasks"
                        />
                        <SummaryCard
                            icon={<AlertTriangle size={19} />}
                            label="Reported Issues"
                            value={updates.reduce(
                                (sum, update) => sum + (Number(update.issues) || 0),
                                0
                            )}
                            description="Issues recorded in updates"
                        />
                    </section>
                )}

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-700"
                            />
                            <div>
                                <p className="font-semibold text-red-900">
                                    Couldn&apos;t load daily updates
                                </p>
                                <p className="mt-1 text-sm text-red-800">
                                    {error}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={loadUpdates}
                            disabled={loading}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                        >
                            <RefreshCw size={15} />
                            Try again
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                            <Loader2
                                className="animate-spin text-black"
                                size={23}
                            />
                            Loading daily updates...
                        </div>
                    </div>
                ) : !error && updates.length === 0 ? (
                    /* Empty state */
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center sm:py-20">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <FileText size={29} className="text-black" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-black">
                            No daily updates yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                            Start tracking daily site activity by creating your
                            first update. You can record workforce attendance,
                            completed tasks, materials, and site issues.
                        </p>

                        <Link
                            href="/DriWE-Construction/daily-updates/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                        >
                            <Plus size={17} />
                            Create Daily Update
                        </Link>
                    </div>
                ) : !error ? (
                    /* Updates list */
                    <section className="space-y-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-base font-bold text-black">
                                Update Records
                            </h2>
                            <p className="text-sm text-gray-500">
                                {updates.length} {updates.length === 1 ? "record" : "records"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
                            {updates.map((update) => (
                                <article
                                    key={update.updateId}
                                    className="group min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:border-gray-300 hover:shadow-md"
                                >
                                    {/* Card header */}
                                    <div className="p-5 sm:p-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                                                    <ClipboardList
                                                        size={21}
                                                        className="text-black"
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="break-words text-lg font-bold text-black">
                                                        {update.projectName || "Project"}
                                                    </h3>

                                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <CalendarDays
                                                                size={15}
                                                                className="shrink-0 text-gray-500"
                                                            />
                                                            {update.date || "Date not available"}
                                                        </span>

                                                        {update.projectId && (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <MapPin
                                                                    size={15}
                                                                    className="shrink-0 text-gray-500"
                                                                />
                                                                <span className="text-xs text-gray-500">
                                                                    Project record
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-2 break-words text-xs text-gray-500">
                                                        Submitted by{" "}
                                                        <span className="font-semibold text-gray-700">
                                                            {update.submittedByName ||
                                                                update.submittedBy}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                                Daily Update
                                            </span>
                                        </div>

                                        {/* Statistics */}
                                        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                                            <StatCard
                                                icon={<Users size={17} />}
                                                label="Workers Present"
                                                value={update.workersPresent}
                                            />

                                            <StatCard
                                                icon={<ClipboardList size={17} />}
                                                label="Tasks Completed"
                                                value={update.tasksCompleted}
                                            />

                                            <StatCard
                                                icon={<Package size={17} />}
                                                label="Material Received"
                                                value={update.materialReceived}
                                            />

                                            <StatCard
                                                icon={<AlertTriangle size={17} />}
                                                label="Issues"
                                                value={update.issues}
                                                alert={update.issues > 0}
                                            />
                                        </div>

                                        {/* Materials Used */}
                                        {update.materialsUsed &&
                                            update.materialsUsed.length > 0 && (
                                                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Package
                                                            size={15}
                                                            className="text-black"
                                                        />
                                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                            Materials Used
                                                        </p>
                                                    </div>

                                                    <ul className="space-y-3">
                                                        {update.materialsUsed.map(
                                                            (item, index) => (
                                                                <li
                                                                    key={`${item.materialId}-${index}`}
                                                                    className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2 text-sm last:border-0 last:pb-0"
                                                                >
                                                                    <span className="min-w-0 break-words text-gray-700">
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

                                        {/* Site note */}
                                        {update.note && (
                                            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                                    Site Note
                                                </p>
                                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                                                    {update.note}
                                                </p>
                                            </div>
                                        )}

                                        {/* Site issues */}
                                        {update.issues > 0 &&
                                            update.issueDescription && (
                                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <AlertTriangle
                                                            size={16}
                                                            className="text-red-700"
                                                        />
                                                        <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                                                            Site Issues
                                                        </p>
                                                    </div>
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-red-900">
                                                        {update.issueDescription}
                                                    </p>
                                                </div>
                                            )}
                                    </div>

                                    {/* Card actions */}
                                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
                                        <span className="text-xs text-gray-500">
                                            Daily site report
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/DriWE-Construction/daily-updates/${update.updateId}`}
                                                aria-label="View daily update"
                                                title="View update"
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-black transition hover:border-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                                            >
                                                <Eye size={16} />
                                                <span>View</span>
                                                <ChevronRight size={15} />
                                            </Link>

                                            <Link
                                                href={`/DriWE-Construction/daily-updates/${update.updateId}/edit`}
                                                aria-label="Edit daily update"
                                                title="Edit update"
                                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-black transition hover:border-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                                            >
                                                <Edit size={16} />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(update.updateId)
                                                }
                                                disabled={deleting === update.updateId}
                                                aria-label="Delete daily update"
                                                title="Delete update"
                                                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2.5 text-red-700 transition hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deleting === update.updateId ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </footer>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>
        </main>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    description,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-black">
                    {icon}
                </div>
                <p className="text-sm font-semibold text-gray-600">{label}</p>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-black">
                {value.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    alert = false,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    alert?: boolean;
}) {
    return (
        <div
            className={`min-w-0 rounded-xl border p-3 transition ${
                alert
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
            }`}
        >
            <div
                className={`mb-2 flex items-center gap-2 ${
                    alert ? "text-red-700" : "text-gray-600"
                }`}
            >
                {icon}
                <span className="text-xs font-medium leading-4">{label}</span>
            </div>
            <p
                className={`text-xl font-bold ${
                    alert ? "text-red-800" : "text-black"
                }`}
            >
                {Number(value) || 0}
            </p>
        </div>
    );
}