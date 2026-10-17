"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    AlertCircle,
    Loader2,
    Package,
    Pencil,
    Trash2,
} from "lucide-react";

type Material = {
    materialId: string;
    projectId?: string;
    projectName?: string;
    materialName: string;
    category?: string;
    description?: string;
    unit?: string;
    quantity?: number;
    currentStock?: number;
};

export default function MaterialDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const materialId = String(params?.materialId || "");

    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!materialId) return;

        async function loadMaterial() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/construction/materials/${encodeURIComponent(materialId)}`,
                    { cache: "no-store", credentials: "include" }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || data?.error || "Failed to load material."
                    );
                }

                setMaterial(data?.material || data);
            } catch (loadError) {
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Failed to load material."
                );
            } finally {
                setLoading(false);
            }
        }

        void loadMaterial();
    }, [materialId]);

    async function handleDelete() {
        if (!materialId || !window.confirm("Delete this material? This cannot be undone.")) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            const response = await fetch(
                `/api/construction/materials/${encodeURIComponent(materialId)}`,
                { method: "DELETE", credentials: "include" }
            );
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message || data?.error || "Failed to delete material."
                );
            }

            router.push("/DriWE-Construction/materials");
            router.refresh();
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Failed to delete material."
            );
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-zinc-950 text-zinc-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading material...
            </div>
        );
    }

    if (!material) {
        return (
            <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/DriWE-Construction/materials"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Materials
                    </Link>
                    <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error || "Material not found."}</span>
                    </div>
                </div>
            </main>
        );
    }

    const availableQuantity = Number(
        material.quantity ?? material.currentStock ?? 0
    );

    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/DriWE-Construction/materials"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Materials
                </Link>

                {error && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertCircle className="h-5 w-5" /> {error}
                    </div>
                )}

                <section className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                            <Package className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-bold">
                                {material.materialName}
                            </h1>
                            {material.category && (
                                <p className="mt-1 text-sm text-zinc-400">
                                    {material.category}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Link
                            href={`/DriWE-Construction/materials/${encodeURIComponent(materialId)}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-yellow-500/50 hover:text-yellow-400"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </Link>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                        </button>
                    </div>
                </section>

                <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <h2 className="mb-4 font-semibold">Project</h2>
                    <p className="text-lg font-medium text-white">
                        {material.projectName || "—"}
                    </p>
                </section>

                <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <h2 className="mb-5 font-semibold">Material Details</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">Material Name</p>
                            <p className="mt-1 font-medium">{material.materialName}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">Category</p>
                            <p className="mt-1 text-zinc-300">{material.category || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">Unit</p>
                            <p className="mt-1 text-zinc-300">
                                {material.unit && /[a-zA-Z]/.test(material.unit)
                                    ? material.unit
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">Available Quantity</p>
                            <p className={`mt-1 text-lg font-semibold ${availableQuantity <= 0 ? "text-red-400" : "text-white"}`}>
                                {availableQuantity} {material.unit || ""}
                                {availableQuantity <= 0 && (
                                    <span className="ml-2 text-sm">Material is not available</span>
                                )}
                            </p>
                        </div>
                        {material.description && (
                            <div className="sm:col-span-2">
                                <p className="text-xs uppercase tracking-wide text-zinc-500">Description</p>
                                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-6 text-zinc-300">
                                    {material.description}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}