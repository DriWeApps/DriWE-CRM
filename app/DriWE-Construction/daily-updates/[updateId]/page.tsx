"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    Edit,
    FileText,
    Loader2,
    Package,
    Users,
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

    photos?: string[];

    note?: string;

    submittedBy: string;
    submittedByName?: string;

    createdAt: string;
    updatedAt: string;
}

export default function DailyUpdateDetailPage() {
    const params = useParams();

    const updateId = params.updateId as string;

    const [update, setUpdate] =
        useState<DailySiteUpdate | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!updateId) return;

        loadUpdate();
    }, [updateId]);

    async function loadUpdate() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(
                `/api/construction/daily-updates/${updateId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to load daily update"
                );
            }

            setUpdate(data.update);
        } catch (err: any) {
            setError(
                err.message ||
                    "Failed to load daily update"
            );
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
                <div className="flex items-center gap-3">
                    <Loader2
                        size={24}
                        className="animate-spin"
                    />
                    Loading daily update...
                </div>
            </div>
        );
    }

    if (error || !update) {
        return (
            <div className="min-h-screen bg-zinc-950 p-6 text-white">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/DriWE-Construction/daily-updates"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft size={17} />
                        Back to Daily Updates
                    </Link>

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <h2 className="font-semibold text-red-300">
                            Unable to load daily update
                        </h2>

                        <p className="mt-2 text-sm text-red-400">
                            {error ||
                                "Daily update not found."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-white">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href="/DriWE-Construction/daily-updates"
                            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                        >
                            <ArrowLeft size={17} />
                            Back to Daily Updates
                        </Link>

                        <Link
                            href={`/DriWE-Construction/daily-updates/${update.updateId}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-orange-400"
                        >
                            <Edit size={17} />
                            Edit Update
                        </Link>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                            <FileText
                                size={24}
                                className="text-orange-400"
                            />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold">
                                Daily Site Update
                            </h1>

                            <p className="mt-1 text-lg text-zinc-300">
                                {update.projectName ||
                                    "Project"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500">
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
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <MetricCard
                        icon={
                            <Users size={20} />
                        }
                        label="Workers Present"
                        value={
                            update.workersPresent
                        }
                    />

                    <MetricCard
                        icon={
                            <ClipboardList
                                size={20}
                            />
                        }
                        label="Tasks Completed"
                        value={
                            update.tasksCompleted
                        }
                    />

                    <MetricCard
                        icon={
                            <Package size={20} />
                        }
                        label="Material Received"
                        value={
                            update.materialReceived
                        }
                    />

                    <MetricCard
                        icon={
                            <AlertTriangle
                                size={20}
                            />
                        }
                        label="Issues"
                        value={update.issues}
                    />
                </div>

                {/* Material */}
                <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                    <h2 className="mb-5 text-lg font-semibold">
                        Material Movement
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoBox
                            label="Material Received"
                            value={`${update.materialReceived}`}
                        />

                        <InfoBox
                            label="Material Used"
                            value={`${update.materialUsed}`}
                        />
                    </div>
                </section>

                {/* Site Issues */}
                <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                    <div className="mb-5 flex items-center gap-2">
                        <AlertTriangle
                            size={19}
                            className="text-orange-400"
                        />

                        <h2 className="text-lg font-semibold">
                            Site Issues
                        </h2>
                    </div>

                    {update.issues > 0 ? (
                        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
                            <div className="mb-3">
                                <span className="text-2xl font-bold text-orange-400">
                                    {update.issues}
                                </span>

                                <span className="ml-2 text-sm text-zinc-400">
                                    issue
                                    {update.issues !==
                                    1
                                        ? "s"
                                        : ""}{" "}
                                    reported
                                </span>
                            </div>

                            {update.issueDescription ? (
                                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                    {
                                        update.issueDescription
                                    }
                                </p>
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    No issue description
                                    was provided.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
                            No site issues were reported
                            for this update.
                        </div>
                    )}
                </section>

                {/* Site Note */}
                <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Site Note
                    </h2>

                    {update.note ? (
                        <div className="rounded-xl bg-zinc-950 p-5">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                                {update.note}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500">
                            No site note was added.
                        </p>
                    )}
                </section>

                {/* Photos */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Site Photos
                    </h2>

                    {update.photos &&
                    update.photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {update.photos.map(
                                (photo, index) => (
                                    <a
                                        key={index}
                                        href={photo}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                                    >
                                        <img
                                            src={photo}
                                            alt={`Site photo ${index + 1}`}
                                            className="h-40 w-full object-cover transition hover:scale-105"
                                        />
                                    </a>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-zinc-950 p-5 text-sm text-zinc-500">
                            No site photos uploaded.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-orange-400">
                {icon}
                <span className="text-xs text-zinc-500">
                    {label}
                </span>
            </div>

            <p className="text-2xl font-bold">
                {value}
            </p>
        </div>
    );
}

function InfoBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold">
                {value}
            </p>
        </div>
    );
}