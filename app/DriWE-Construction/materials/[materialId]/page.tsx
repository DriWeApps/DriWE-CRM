
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
        if (!materialId) {
            setLoading(false);
            return;
        }

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
                        data?.message ||
                            data?.error ||
                            "Failed to load material."
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
        if (
            !materialId ||
            !window.confirm(
                "Delete this material? This cannot be undone."
            )
        ) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/construction/materials/${encodeURIComponent(materialId)}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        "Failed to delete material."
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
            <div className="flex min-h-[70vh] items-center justify-center bg-white text-gray-600">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-black" />
                Loading material...
            </div>
        );
    }

    if (!material) {
        return (
            <main className="min-h-screen bg-white px-4 py-8 text-black sm:px-6">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/DriWE-Construction/materials"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Materials
                    </Link>

                    <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
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

    const detailLabel =
        "text-xs font-medium uppercase tracking-wide text-gray-500";

    const detailValue = "mt-1 font-medium text-black";

    return (
        <main className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/DriWE-Construction/materials"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Materials
                </Link>

                {error && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Material Header */}
                <section className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <Package className="h-6 w-6 text-black" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-bold text-black">
                                {material.materialName}
                            </h1>

                            {material.category && (
                                <p className="mt-1 text-sm text-gray-600">
                                    {material.category}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                            href={`/DriWE-Construction/materials/${encodeURIComponent(materialId)}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Link>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </section>

                {/* Project */}
                <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold text-black">
                        Project
                    </h2>

                    <p className="text-lg font-medium text-black">
                        {material.projectName || "—"}
                    </p>
                </section>

                {/* Material Details */}
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-5 font-semibold text-black">
                        Material Details
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <p className={detailLabel}>Material Name</p>
                            <p className={detailValue}>
                                {material.materialName}
                            </p>
                        </div>

                        <div>
                            <p className={detailLabel}>Category</p>
                            <p className="mt-1 text-gray-700">
                                {material.category || "—"}
                            </p>
                        </div>

                        <div>
                            <p className={detailLabel}>Unit</p>
                            <p className="mt-1 text-gray-700">
                                {material.unit &&
                                /[a-zA-Z]/.test(material.unit)
                                    ? material.unit
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <p className={detailLabel}>
                                Available Quantity
                            </p>

                            <p
                                className={`mt-1 text-lg font-semibold ${
                                    availableQuantity <= 0
                                        ? "text-red-600"
                                        : "text-black"
                                }`}
                            >
                                {availableQuantity} {material.unit || ""}

                                {availableQuantity <= 0 && (
                                    <span className="ml-2 text-sm font-normal">
                                        Material is not available
                                    </span>
                                )}
                            </p>
                        </div>

                        {material.description && (
                            <div className="sm:col-span-2">
                                <p className={detailLabel}>Description</p>

                                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
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
