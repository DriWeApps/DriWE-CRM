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
    materialsUsed?: Array<{
        materialId: string;
        materialName: string;
        quantity: number;
        unit: string;
    }>;
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

    const [update, setUpdate] = useState<DailySiteUpdate | null>(null);
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
                    data.error || "Failed to load daily update"
                );
            }

            setUpdate(data.update);
        } catch (err: any) {
            setError(err.message || "Failed to load daily update");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-black">
                <div className="flex items-center gap-3">
                    <Loader2 size={24} className="animate-spin" />
                    Loading daily update...
                </div>
            </div>
        );
    }

    if (error || !update) {
        return (
            <div className="min-h-screen bg-white p-6 text-black">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/DriWE-Construction/daily-updates"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                    >
                        <ArrowLeft size={17} />
                        Back to Daily Updates
                    </Link>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h2 className="font-semibold text-red-700">
                            Unable to load daily update
                        </h2>
                        <p className="mt-2 text-sm text-red-600">
                            {error || "Daily update not found."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 text-black">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href="/DriWE-Construction/daily-updates"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                        >
                            <ArrowLeft size={17} />
                            Back to Daily Updates
                        </Link>

                        <Link
                            href={`/DriWE-Construction/daily-updates/${update.updateId}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                        >
                            <Edit size={17} />
                            Edit Update
                        </Link>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <FileText size={24} className="text-black" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold">
                                Daily Site Update
                            </h1>

                            <p className="mt-1 text-lg text-gray-700">
                                {update.projectName || "Project"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays size={15} />
                                    {update.date}
                                </span>

                                <span>
                                    Submitted by:{" "}
                                    <span className="font-medium text-gray-800">
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
                        icon={<Users size={20} />}
                        label="Workers Present"
                        value={update.workersPresent}
                    />

                    <MetricCard
                        icon={<ClipboardList size={20} />}
                        label="Tasks Completed"
                        value={update.tasksCompleted}
                    />

                    <MetricCard
                        icon={<Package size={20} />}
                        label="Material Received"
                        value={update.materialReceived}
                    />

                    <MetricCard
                        icon={<AlertTriangle size={20} />}
                        label="Issues"
                        value={update.issues}
                    />
                </div>

                {/* Material */}
                <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold">
                        Material Movement
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoBox
                            label="Material Received"
                            value={`${update.materialReceived}`}
                        />

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Materials Used
                            </p>

                            {update.materialsUsed?.length ? (
                                <ul className="mt-3 space-y-2">
                                    {update.materialsUsed.map(
                                        (item, index) => (
                                            <li
                                                key={`${item.materialId}-${index}`}
                                                className="flex justify-between gap-3 text-sm"
                                            >
                                                <span className="text-gray-700">
                                                    {item.materialName}
                                                </span>
                                                <span className="shrink-0 font-medium text-black">
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <p className="mt-2 text-lg font-semibold text-black">
                                    {update.materialUsed || 0}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Site Issues */}
                <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <AlertTriangle size={19} className="text-black" />
                        <h2 className="text-lg font-semibold">
                            Site Issues
                        </h2>
                    </div>

                    {update.issues > 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <div className="mb-3">
                                <span className="text-2xl font-bold text-black">
                                    {update.issues}
                                </span>
                                <span className="ml-2 text-sm text-gray-600">
                                    issue{update.issues !== 1 ? "s" : ""} reported
                                </span>
                            </div>

                            {update.issueDescription ? (
                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                    {update.issueDescription}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No issue description was provided.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
                            No site issues were reported for this update.
                        </div>
                    )}
                </section>

                {/* Site Note */}
                <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">
                        Site Note
                    </h2>

                    {update.note ? (
                        <div className="rounded-xl bg-gray-50 p-5">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                                {update.note}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            No site note was added.
                        </p>
                    )}
                </section>

                {/* Photos */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">
                        Site Photos
                    </h2>

                    {update.photos && update.photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {update.photos.map((photo, index) => (
                                <a
                                    key={index}
                                    href={photo}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                >
                                    <img
                                        src={photo}
                                        alt={`Site photo ${index + 1}`}
                                        className="h-40 w-full object-cover transition hover:scale-105"
                                    />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-black">
                {icon}
                <span className="text-xs text-gray-500">{label}</span>
            </div>

            <p className="text-2xl font-bold text-black">{value}</p>
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
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-black">{value}</p>
        </div>
    );
}