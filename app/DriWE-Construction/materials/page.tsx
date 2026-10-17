"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Package,
    Plus,
    Search,
    RefreshCw,
    Pencil,
    Trash2,
    Filter,
} from "lucide-react";

type MaterialStatus = "Active" | "Inactive";

interface Material {
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


    supplier?: string;
    supplierName?: string;
    supplierContact?: string;

    status?: MaterialStatus;

    createdBy?: string;
    createdByName?: string;

    createdAt?: string;
    updatedAt?: string;
}

interface Project {
    projectId: string;
    projectName: string;
}

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const loadData = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [materialsRes, projectsRes] = await Promise.all([
                fetch("/api/construction/materials", {
                    cache: "no-store",
                }),
                fetch("/api/construction/projects", {
                    cache: "no-store",
                }),
            ]);

            if (materialsRes.ok) {
                const data = await materialsRes.json();

                if (Array.isArray(data)) {
                    setMaterials(data);
                } else {
                    setMaterials(data.materials || []);
                }
            } else {
                setMaterials([]);
            }

            if (projectsRes.ok) {
                const data = await projectsRes.json();

                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    setProjects(data.projects || []);
                }
            }

        } catch (error) {
            console.error("Failed to load materials:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const categories = useMemo(() => {
        return Array.from(
            new Set(
                materials
                    .map((material) => material.category)
                    .filter(Boolean)
            )
        ).sort() as string[];
    }, [materials]);

    const filteredMaterials = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return materials.filter((material) => {
            const matchesSearch =
                !searchText ||
                material.materialName
                    ?.toLowerCase()
                    .includes(searchText) ||
                material.category
                    ?.toLowerCase()
                    .includes(searchText) ||
                material.projectName
                    ?.toLowerCase()
                    .includes(searchText) ||
                material.supplier
                    ?.toLowerCase()
                    .includes(searchText) ||
                material.supplierName
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesProject =
                !projectFilter ||
                material.projectId === projectFilter;

            const matchesCategory =
                !categoryFilter ||
                material.category === categoryFilter;

            const matchesStatus =
                !statusFilter ||
                material.status === statusFilter;

            return (
                matchesSearch &&
                matchesProject &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [
        materials,
        search,
        projectFilter,
        categoryFilter,
        statusFilter,
    ]);

    const formatNumber = (value: number | undefined) => {
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
        }).format(Number(value ?? 0));
    };

    const handleDelete = async (material: Material) => {
        if (!material.materialId) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${material.materialName}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(material.materialId);

            const response = await fetch(
                `/api/construction/materials/${material.materialId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to delete material"
                );
            }

            setMaterials((previous) =>
                previous.filter(
                    (item) =>
                        item.materialId !== material.materialId
                )
            );
        } catch (error) {
            console.error("Delete material error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete material"
            );
        } finally {
            setDeletingId(null);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setProjectFilter("");
        setCategoryFilter("");
        setStatusFilter("");
    };

    const hasFilters =
        search ||
        projectFilter ||
        categoryFilter ||
        statusFilter;

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex min-h-[500px] items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <RefreshCw className="h-8 w-8 animate-spin text-yellow-400" />

                            <p className="text-sm text-zinc-400">
                                Loading materials...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                                <Package className="h-6 w-6 text-yellow-400" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Materials
                                </h1>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Manage construction materials,
                                    inventory and stock levels
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            Refresh
                        </button>

                        <Link
                            href="/DriWE-Construction/materials/new"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300"
                        >
                            <Plus className="h-4 w-4" />
                            Add Material
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-yellow-400" />

                            <h2 className="text-sm font-semibold text-white">
                                Filters
                            </h2>
                        </div>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-xs font-medium text-yellow-400 hover:text-yellow-300"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                        {/* Search */}
                        <div className="relative lg:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search material, project, site..."
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500/50"
                            />
                        </div>

                        {/* Project */}
                        <select
                            value={projectFilter}
                            onChange={(e) =>
                                setProjectFilter(e.target.value)
                            }
                            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-yellow-500/50"
                        >
                            <option value="">
                                All Projects
                            </option>

                            {projects.map((project) => (
                                <option
                                    key={project.projectId}
                                    value={project.projectId}
                                >
                                    {project.projectName}
                                </option>
                            ))}
                        </select>

                        {/* Category */}
                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(e.target.value)
                            }
                            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-yellow-500/50"
                        >
                            <option value="">
                                All Categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-3">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-yellow-500/50 md:w-56"
                        >
                            <option value="">
                                All Status
                            </option>

                            <option value="Active">
                                Active
                            </option>

                            <option value="Inactive">
                                Inactive
                            </option>
                        </select>
                    </div>
                </div>

                {/* Result count */}
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-zinc-500">
                        Showing{" "}
                        <span className="font-medium text-zinc-300">
                            {filteredMaterials.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-zinc-300">
                            {materials.length}
                        </span>{" "}
                        materials
                    </p>
                </div>

                {/* Empty state */}
                {filteredMaterials.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900">
                            <Package className="h-7 w-7 text-zinc-600" />
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                            {materials.length === 0
                                ? "No materials added yet"
                                : "No materials found"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                            {materials.length === 0
                                ? "Start adding construction materials to manage inventory and stock levels."
                                : "Try changing your search or filters to find the material you are looking for."}
                        </p>

                        {materials.length === 0 && (
                            <Link
                                href="/DriWE-Construction/materials/new"
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300"
                            >
                                <Plus className="h-4 w-4" />
                                Add First Material
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 lg:block">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px]">
                                    <thead>
                                        <tr className="border-b border-zinc-800 bg-zinc-900">
                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                Material
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                Available Quantity
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-800">
                                        {filteredMaterials.map(
                                            (material) => {
                                                return (
                                                    <tr
                                                        key={
                                                            material.materialId
                                                        }
                                                        className="transition hover:bg-zinc-800/40"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                                                                    <Package className="h-5 w-5 text-yellow-400" />
                                                                </div>

                                                                <div className="min-w-0">
                                                                        <span className="block truncate font-semibold text-white">
                                                                        {
                                                                            material.materialName
                                                                        }
                                                                        </span>

                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="text-lg font-bold text-white">
                                                                {formatNumber(material.quantity ?? material.currentStock)} {material.unit || ""}
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Link
                                                                    href={`/DriWE-Construction/materials/${material.materialId}/edit`}
                                                                    title="Edit"
                                                                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-yellow-400"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    title="Delete"
                                                                    disabled={
                                                                        deletingId ===
                                                                        material.materialId
                                                                    }
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            material
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile / Tablet cards */}
                        <div className="grid grid-cols-1 gap-4 lg:hidden">
                            {filteredMaterials.map((material) => {
                                return (
                                    <div
                                        key={material.materialId}
                                        className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                                                    <Package className="h-5 w-5 text-yellow-400" />
                                                </div>

                                                <div className="min-w-0">
                                                    <span className="block truncate font-semibold text-white">
                                                        {
                                                            material.materialName
                                                        }
                                                    </span>

                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                                            <p className="text-[11px] uppercase tracking-wide text-zinc-500">Quantity</p>
                                            <p className="mt-1 text-xl font-bold text-white">
                                                {formatNumber(material.quantity ?? material.currentStock)} {material.unit || ""}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={`/DriWE-Construction/materials/${material.materialId}/edit`}
                                                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-yellow-400"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        deletingId ===
                                                        material.materialId
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            material
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}