"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Package,
    Building2,
    MapPin,
    Boxes,
    CalendarDays,
    Loader2,
    AlertCircle,
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    Clock,
} from "lucide-react";

type Material = {
    materialId: string;

    companyId?: string;
    companyName?: string;

    projectId?: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    materialName: string;
    category?: string;
    description?: string;

    unit?: string;

    quantity?: number;
    currentStock?: number;
    minimumStock?: number;

    unitPrice?: number;
    totalValue?: number;

    supplier?: string;
    supplierName?: string;
    supplierContact?: string;

    status?: "Active" | "Inactive";

    createdBy?: string;
    createdByName?: string;

    createdAt?: string;
    updatedAt?: string;
};

type MaterialTransaction = {
    transactionId?: string;

    materialId?: string;
    materialName?: string;

    projectId?: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    type:
        | "RECEIVE"
        | "ISSUE"
        | "TRANSFER";

    quantity: number;

    unit?: string;

    remarks?: string;

    createdBy?: string;
    createdByName?: string;

    createdAt?: string;
};

export default function MaterialDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const materialId = params?.materialId as string;

    const [material, setMaterial] =
        useState<Material | null>(null);

    const [transactions, setTransactions] =
        useState<MaterialTransaction[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingTransactions, setLoadingTransactions] =
        useState(false);

    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!materialId) return;

        loadMaterial();
    }, [materialId]);

    async function loadMaterial() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/construction/materials/${materialId}`,
                {
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load material"
                );
            }

            const loadedMaterial =
                data?.material || data;

            setMaterial(loadedMaterial);

            await loadTransactions(
                loadedMaterial?.materialId ||
                    materialId
            );
        } catch (err) {
            console.error(
                "Failed to load material:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load material"
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadTransactions(
        id: string
    ) {
        try {
            setLoadingTransactions(true);

            const response = await fetch(
                `/api/construction/material-transactions?materialId=${encodeURIComponent(
                    id
                )}`,
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                setTransactions([]);
                return;
            }

            const data = await response.json();

            setTransactions(
                data?.transactions || []
            );
        } catch (err) {
            console.error(
                "Failed to load material transactions:",
                err
            );

            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    }

    async function handleDelete() {
        if (!materialId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this material? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/construction/materials/${materialId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to delete material"
                );
            }

            router.push(
                "/DriWE-Construction/materials"
            );

            router.refresh();
        } catch (err) {
            console.error(
                "Failed to delete material:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete material"
            );

            setDeleting(false);
        }
    }

    function formatDate(date?: string) {
        if (!date) return "—";

        try {
            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return date;
        }
    }

    function formatDateTime(date?: string) {
        if (!date) return "—";

        try {
            return new Date(date).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        } catch {
            return date;
        }
    }

    function formatNumber(value?: number) {
        if (value === undefined || value === null) {
            return "0";
        }

        return new Intl.NumberFormat(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        ).format(value);
    }

    function formatCurrency(value?: number) {
        if (
            value === undefined ||
            value === null
        ) {
            return "₹0";
        }

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }
        ).format(value);
    }

    function getStockValue() {
        if (
            material?.currentStock !== undefined
        ) {
            return material.currentStock;
        }

        return material?.quantity || 0;
    }

    function getStockStatus() {
        const stock = getStockValue();

        const minimum =
            material?.minimumStock || 0;

        if (stock <= 0) {
            return {
                label: "Out of Stock",
                className:
                    "border-red-500/30 bg-red-500/10 text-red-400",
            };
        }

        if (
            minimum > 0 &&
            stock <= minimum
        ) {
            return {
                label: "Low Stock",
                className:
                    "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
            };
        }

        return {
            label: "In Stock",
            className:
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        };
    }

    function getTransactionType(
        type: MaterialTransaction["type"]
    ) {
        switch (type) {
            case "RECEIVE":
                return {
                    label: "Received",
                    icon: (
                        <ArrowDownToLine className="h-4 w-4" />
                    ),
                    className:
                        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                };

            case "ISSUE":
                return {
                    label: "Issued",
                    icon: (
                        <ArrowUpFromLine className="h-4 w-4" />
                    ),
                    className:
                        "border-red-500/30 bg-red-500/10 text-red-400",
                };

            case "TRANSFER":
                return {
                    label: "Transferred",
                    icon: (
                        <ArrowLeftRight className="h-4 w-4" />
                    ),
                    className:
                        "border-blue-500/30 bg-blue-500/10 text-blue-400",
                };

            default:
                return {
                    label: type,
                    icon: (
                        <ArrowLeftRight className="h-4 w-4" />
                    ),
                    className:
                        "border-zinc-700 bg-zinc-800 text-zinc-300",
                };
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>
                            Loading material...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (!material) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    <Link
                        href="/DriWE-Construction/materials"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Materials
                    </Link>

                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />

                            <div>
                                <h2 className="font-semibold text-red-300">
                                    Material not found
                                </h2>

                                <p className="mt-1 text-sm text-red-400/80">
                                    {error ||
                                        "The requested material could not be found."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const stock = getStockValue();

    const stockStatus =
        getStockStatus();

    const unit =
        material.unit || "Unit";

    const totalValue =
        material.totalValue !== undefined
            ? material.totalValue
            : material.unitPrice
            ? stock * material.unitPrice
            : 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back */}
                <Link
                    href="/DriWE-Construction/materials"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Materials
                </Link>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400" />

                            <p className="text-sm text-red-300">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                                <Package className="h-6 w-6 text-yellow-400" />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    {material.category && (
                                        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                                            {
                                                material.category
                                            }
                                        </span>
                                    )}

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${stockStatus.className}`}
                                    >
                                        {
                                            stockStatus.label
                                        }
                                    </span>

                                    {material.status && (
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                                material.status ===
                                                "Active"
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                                    : "border-zinc-700 bg-zinc-800 text-zinc-400"
                                            }`}
                                        >
                                            {
                                                material.status
                                            }
                                        </span>
                                    )}
                                </div>

                                <h1 className="break-words text-2xl font-bold text-white">
                                    {
                                        material.materialName
                                    }
                                </h1>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Material ID:{" "}
                                    {
                                        material.materialId
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                            <Link
                                href={`/DriWE-Construction/materials/${materialId}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-400"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}

                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stock Stats */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Current Stock
                            </p>

                            <Boxes className="h-4 w-4 text-yellow-400" />
                        </div>

                        <p className="text-2xl font-bold text-white">
                            {formatNumber(
                                stock
                            )}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            {unit}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Minimum Stock
                            </p>

                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                        </div>

                        <p className="text-2xl font-bold text-white">
                            {formatNumber(
                                material.minimumStock
                            )}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            {unit}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Unit Price
                            </p>

                            <Package className="h-4 w-4 text-yellow-400" />
                        </div>

                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(
                                material.unitPrice
                            )}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Per {unit}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Stock Value
                            </p>

                            <Boxes className="h-4 w-4 text-yellow-400" />
                        </div>

                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(
                                totalValue
                            )}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Current inventory value
                        </p>
                    </div>
                </div>

                {/* Main */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Project & Site */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
                                    <Building2 className="h-4 w-4 text-yellow-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Project & Site
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Where this material is stored or used
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
                                        Project
                                    </p>

                                    <p className="font-medium text-white">
                                        {material.projectName ||
                                            "—"}
                                    </p>

                                    {material.projectId && (
                                        <p className="mt-1 truncate text-xs text-zinc-600">
                                            {
                                                material.projectId
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                                    <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-zinc-500">
                                        <MapPin className="h-3 w-3" />
                                        Site
                                    </p>

                                    <p className="font-medium text-white">
                                        {material.siteName ||
                                            "No site assigned"}
                                    </p>

                                    {material.siteId && (
                                        <p className="mt-1 truncate text-xs text-zinc-600">
                                            {
                                                material.siteId
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Material Details */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <h2 className="mb-5 font-semibold text-white">
                                Material Details
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                                        Material Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-white">
                                        {
                                            material.materialName
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                                        Category
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-300">
                                        {material.category ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                                        Unit
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-300">
                                        {unit}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                                        Current Quantity
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-white">
                                        {formatNumber(
                                            stock
                                        )}{" "}
                                        {unit}
                                    </p>
                                </div>

                                {material.description && (
                                    <div className="sm:col-span-2">
                                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                                            Description
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-6 text-zinc-300">
                                            {
                                                material.description
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Supplier */}
                        {(material.supplier ||
                            material.supplierName ||
                            material.supplierContact) && (
                            <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                                <h2 className="mb-5 font-semibold text-white">
                                    Supplier Information
                                </h2>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                                            Supplier
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-white">
                                            {material.supplierName ||
                                                material.supplier ||
                                                "—"}
                                        </p>
                                    </div>

                                    {material.supplierContact && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                                                Contact
                                            </p>

                                            <p className="mt-1 text-sm text-zinc-300">
                                                {
                                                    material.supplierContact
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Transactions */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold text-white">
                                        Material Transactions
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Stock movement history
                                    </p>
                                </div>

                                <Link
                                    href={`/DriWE-Construction/materials/transactions/new?materialId=${materialId}`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-yellow-400"
                                >
                                    <ArrowDownToLine className="h-3.5 w-3.5" />
                                    Add Transaction
                                </Link>
                            </div>

                            {loadingTransactions ? (
                                <div className="flex items-center justify-center py-10 text-zinc-500">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading transactions...
                                </div>
                            ) : transactions.length ===
                              0 ? (
                                <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-10 text-center">
                                    <Package className="mx-auto mb-3 h-8 w-8 text-zinc-700" />

                                    <p className="text-sm font-medium text-zinc-400">
                                        No transactions yet
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        Material stock movements will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead>
                                            <tr className="border-b border-zinc-800 text-left">
                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                                    Type
                                                </th>

                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                                    Quantity
                                                </th>

                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                                    Site
                                                </th>

                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                                    Remarks
                                                </th>

                                                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {transactions.map(
                                                (
                                                    transaction,
                                                    index
                                                ) => {
                                                    const type =
                                                        getTransactionType(
                                                            transaction.type
                                                        );

                                                    return (
                                                        <tr
                                                            key={
                                                                transaction.transactionId ||
                                                                `${transaction.createdAt}-${index}`
                                                            }
                                                            className="border-b border-zinc-800/70 last:border-0"
                                                        >
                                                            <td className="px-3 py-4">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${type.className}`}
                                                                >
                                                                    {
                                                                        type.icon
                                                                    }
                                                                    {
                                                                        type.label
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td className="px-3 py-4 text-sm font-medium text-white">
                                                                {formatNumber(
                                                                    transaction.quantity
                                                                )}{" "}
                                                                {
                                                                    transaction.unit
                                                                }
                                                            </td>

                                                            <td className="px-3 py-4 text-sm text-zinc-300">
                                                                {transaction.siteName ||
                                                                    "—"}
                                                            </td>

                                                            <td className="max-w-[220px] truncate px-3 py-4 text-sm text-zinc-400">
                                                                {transaction.remarks ||
                                                                    "—"}
                                                            </td>

                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-400">
                                                                {formatDateTime(
                                                                    transaction.createdAt
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right */}
                    <div className="space-y-6">
                        {/* Stock Status */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <h2 className="mb-4 font-semibold text-white">
                                Stock Status
                            </h2>

                            <div
                                className={`mb-5 rounded-lg border p-4 ${stockStatus.className}`}
                            >
                                <p className="text-xs uppercase tracking-wide opacity-70">
                                    Current Status
                                </p>

                                <p className="mt-1 text-lg font-semibold">
                                    {
                                        stockStatus.label
                                    }
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-zinc-500">
                                        Current Stock
                                    </span>

                                    <span className="text-sm font-medium text-white">
                                        {formatNumber(
                                            stock
                                        )}{" "}
                                        {unit}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-zinc-500">
                                        Minimum Stock
                                    </span>

                                    <span className="text-sm font-medium text-white">
                                        {formatNumber(
                                            material.minimumStock
                                        )}{" "}
                                        {unit}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-zinc-500">
                                        Unit Price
                                    </span>

                                    <span className="text-sm font-medium text-white">
                                        {formatCurrency(
                                            material.unitPrice
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-zinc-800 pt-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-medium text-zinc-300">
                                            Total Value
                                        </span>

                                        <span className="text-lg font-bold text-yellow-400">
                                            {formatCurrency(
                                                totalValue
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Dates */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <h2 className="mb-4 font-semibold text-white">
                                Activity
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {formatDateTime(
                                                material.createdAt
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Last Updated
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-300">
                                            {formatDateTime(
                                                material.updatedAt
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Created By */}
                        {(material.createdByName ||
                            material.createdBy) && (
                            <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                                <h2 className="mb-4 font-semibold text-white">
                                    Created By
                                </h2>

                                <p className="break-words text-sm text-zinc-300">
                                    {material.createdByName ||
                                        material.createdBy}
                                </p>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}