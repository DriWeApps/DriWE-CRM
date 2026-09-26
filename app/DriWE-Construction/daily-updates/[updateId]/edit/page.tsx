"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Loader2,
} from "lucide-react";

type DailySiteUpdate = {
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
    submittedBy?: string;
    submittedByName?: string;
    createdAt?: string;
    updatedAt?: string;
};

export default function EditDailyUpdatePage() {
    const params = useParams();
    const router = useRouter();

    const updateId =
        typeof params?.updateId === "string"
            ? params.updateId
            : "";

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        date: "",
        workersPresent: "0",
        tasksCompleted: "0",
        materialReceived: "0",
        materialUsed: "0",
        issues: "0",
        issueDescription: "",
        note: "",
    });

    const [projectId, setProjectId] = useState("");
    const [projectName, setProjectName] = useState("");

    useEffect(() => {
        if (!updateId) return;

        async function loadUpdate() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(
                    `/api/construction/daily-updates/${encodeURIComponent(
                        updateId
                    )}`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(
                        data.message ||
                            "Failed to load daily update"
                    );
                }

                const update: DailySiteUpdate = data.update;

                setProjectId(update.projectId || "");
                setProjectName(update.projectName || "");

                setForm({
                    date: update.date || "",
                    workersPresent: String(
                        update.workersPresent ?? 0
                    ),
                    tasksCompleted: String(
                        update.tasksCompleted ?? 0
                    ),
                    materialReceived: String(
                        update.materialReceived ?? 0
                    ),
                    materialUsed: String(
                        update.materialUsed ?? 0
                    ),
                    issues: String(update.issues ?? 0),
                    issueDescription:
                        update.issueDescription || "",
                    note: update.note || "",
                });
            } catch (err) {
                console.error(
                    "Load daily update error:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load daily update"
                );
            } finally {
                setLoading(false);
            }
        }

        loadUpdate();
    }, [updateId]);

    function updateField(
        field: keyof typeof form,
        value: string
    ) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    async function handleSubmit(
        e: FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!updateId) {
            setError("Daily update ID is missing.");
            return;
        }

        if (!form.date) {
            setError("Date is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const res = await fetch(
                `/api/construction/daily-updates/${encodeURIComponent(
                    updateId
                )}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        date: form.date,
                        workersPresent:
                            Number(form.workersPresent) || 0,
                        tasksCompleted:
                            Number(form.tasksCompleted) || 0,
                        materialReceived:
                            Number(form.materialReceived) || 0,
                        materialUsed:
                            Number(form.materialUsed) || 0,
                        issues:
                            Number(form.issues) || 0,
                        issueDescription:
                            form.issueDescription.trim(),
                        note: form.note.trim(),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to update daily update"
                );
            }

            setSuccess(
                "Daily site update updated successfully."
            );

            setTimeout(() => {
                router.push(
                    `/DriWE-Construction/daily-updates/${encodeURIComponent(
                        updateId
                    )}`
                );

                router.refresh();
            }, 700);
        } catch (err) {
            console.error(
                "Update daily site update error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update daily site update"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="flex items-center gap-3 text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading daily update...
                </div>
            </div>
        );
    }

    if (error && !projectId) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/DriWE-Construction/daily-updates"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Daily Updates
                    </Link>

                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link
                        href={`/DriWE-Construction/daily-updates/${encodeURIComponent(
                            updateId
                        )}`}
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Daily Update
                    </Link>

                    <h1 className="text-2xl font-bold">
                        Edit Daily Site Update
                    </h1>

                    {projectName && (
                        <p className="text-zinc-400 mt-1">
                            Project:{" "}
                            <span className="text-yellow-400">
                                {projectName}
                            </span>
                        </p>
                    )}
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-6"
                >
                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">
                            Date
                        </label>

                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                                updateField(
                                    "date",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">
                                Workers Present
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    form.workersPresent
                                }
                                onChange={(e) =>
                                    updateField(
                                        "workersPresent",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">
                                Tasks Completed
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    form.tasksCompleted
                                }
                                onChange={(e) =>
                                    updateField(
                                        "tasksCompleted",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">
                                Material Received
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    form.materialReceived
                                }
                                onChange={(e) =>
                                    updateField(
                                        "materialReceived",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">
                                Material Used
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    form.materialUsed
                                }
                                onChange={(e) =>
                                    updateField(
                                        "materialUsed",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">
                                Issues
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={form.issues}
                                onChange={(e) =>
                                    updateField(
                                        "issues",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">
                            Issue Description
                        </label>

                        <textarea
                            value={
                                form.issueDescription
                            }
                            onChange={(e) =>
                                updateField(
                                    "issueDescription",
                                    e.target.value
                                )
                            }
                            rows={4}
                            placeholder="Describe any site issues..."
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">
                            Site Note
                        </label>

                        <textarea
                            value={form.note}
                            onChange={(e) =>
                                updateField(
                                    "note",
                                    e.target.value
                                )
                            }
                            rows={5}
                            placeholder="Enter daily site progress notes..."
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                        <Link
                            href={`/DriWE-Construction/daily-updates/${encodeURIComponent(
                                updateId
                            )}`}
                            className="px-5 py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}