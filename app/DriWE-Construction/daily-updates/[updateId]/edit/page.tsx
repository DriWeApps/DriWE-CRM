"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

type DailySiteUpdate = {
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
    submittedBy?: string;
    submittedByName?: string;
    createdAt?: string;
    updatedAt?: string;
};

const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

export default function EditDailyUpdatePage() {
    const params = useParams();
    const router = useRouter();

    const updateId =
        typeof params?.updateId === "string" ? params.updateId : "";

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
    const [materialsUsed, setMaterialsUsed] =
        useState<NonNullable<DailySiteUpdate["materialsUsed"]>>([]);

    useEffect(() => {
        if (!updateId) return;

        async function loadUpdate() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(
                    `/api/construction/daily-updates/${encodeURIComponent(updateId)}`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(
                        data.message || "Failed to load daily update"
                    );
                }

                const update: DailySiteUpdate = data.update;

                setProjectId(update.projectId || "");
                setProjectName(update.projectName || "");
                setMaterialsUsed(update.materialsUsed || []);

                setForm({
                    date: update.date || "",
                    workersPresent: String(update.workersPresent ?? 0),
                    tasksCompleted: String(update.tasksCompleted ?? 0),
                    materialReceived: String(update.materialReceived ?? 0),
                    materialUsed: String(update.materialUsed ?? 0),
                    issues: String(update.issues ?? 0),
                    issueDescription: update.issueDescription || "",
                    note: update.note || "",
                });
            } catch (err) {
                console.error("Load daily update error:", err);

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

    function updateField(field: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
                `/api/construction/daily-updates/${encodeURIComponent(updateId)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        date: form.date,
                        workersPresent: Number(form.workersPresent) || 0,
                        tasksCompleted: Number(form.tasksCompleted) || 0,
                        materialReceived: Number(form.materialReceived) || 0,
                        materialUsed: Number(form.materialUsed) || 0,
                        issues: Number(form.issues) || 0,
                        issueDescription: form.issueDescription.trim(),
                        note: form.note.trim(),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to update daily update"
                );
            }

            setSuccess("Daily site update updated successfully.");

            setTimeout(() => {
                router.push(
                    `/DriWE-Construction/daily-updates/${encodeURIComponent(updateId)}`
                );
                router.refresh();
            }, 700);
        } catch (err) {
            console.error("Update daily site update error:", err);

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
            <div className="flex min-h-screen items-center justify-center bg-white text-black">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading daily update...
                </div>
            </div>
        );
    }

    if (error && !projectId) {
        return (
            <div className="min-h-screen bg-white p-6 text-black">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/DriWE-Construction/daily-updates"
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Daily Updates
                    </Link>

                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 text-black">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link
                        href={`/DriWE-Construction/daily-updates/${encodeURIComponent(updateId)}`}
                        className="mb-5 inline-flex items-center gap-2 text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Daily Update
                    </Link>

                    <h1 className="text-2xl font-bold">
                        Edit Daily Site Update
                    </h1>

                    {projectName && (
                        <p className="mt-1 text-gray-600">
                            Project:{" "}
                            <span className="font-medium text-black">
                                {projectName}
                            </span>
                        </p>
                    )}
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className={labelClass}>Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                                updateField("date", e.target.value)
                            }
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>
                                Workers Present
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.workersPresent}
                                onChange={(e) =>
                                    updateField("workersPresent", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Tasks Completed
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.tasksCompleted}
                                onChange={(e) =>
                                    updateField("tasksCompleted", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Material Received
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.materialReceived}
                                onChange={(e) =>
                                    updateField("materialReceived", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="mb-2 text-sm font-medium text-gray-700">
                                Materials Used
                            </p>

                            {materialsUsed.length > 0 ? (
                                <ul className="space-y-2">
                                    {materialsUsed.map((item, index) => (
                                        <li
                                            key={`${item.materialId}-${index}`}
                                            className="flex justify-between gap-3 text-sm"
                                        >
                                            <span className="text-gray-700">
                                                {item.materialName}
                                            </span>
                                            <span className="text-black">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    {form.materialUsed} (legacy total)
                                </p>
                            )}

                            <p className="mt-2 text-xs text-gray-500">
                                Recorded material usage is preserved to keep
                                inventory accurate.
                            </p>
                        </div>

                        <div>
                            <label className={labelClass}>Issues</label>
                            <input
                                type="number"
                                min="0"
                                value={form.issues}
                                onChange={(e) =>
                                    updateField("issues", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Issue Description
                        </label>
                        <textarea
                            value={form.issueDescription}
                            onChange={(e) =>
                                updateField("issueDescription", e.target.value)
                            }
                            rows={4}
                            placeholder="Describe any site issues..."
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Site Note</label>
                        <textarea
                            value={form.note}
                            onChange={(e) =>
                                updateField("note", e.target.value)
                            }
                            rows={5}
                            placeholder="Enter daily site progress notes..."
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                        <Link
                            href={`/DriWE-Construction/daily-updates/${encodeURIComponent(updateId)}`}
                            className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-medium text-black transition-colors hover:bg-gray-100"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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