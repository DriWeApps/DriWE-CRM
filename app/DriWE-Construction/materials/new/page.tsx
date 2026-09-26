"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Package,
    Building2,
    MapPin,
    Save,
    Loader2,
    AlertCircle,
    IndianRupee,
    Boxes,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
};

type Site = {
    siteId: string;
    projectId: string;
    siteName: string;
    location?: string;
    active?: boolean;
};

type MaterialCategory =
    | "Cement"
    | "Steel"
    | "Sand"
    | "Bricks"
    | "Aggregate"
    | "Electrical"
    | "Plumbing"
    | "Tiles"
    | "Paint"
    | "Hardware"
    | "Other";

type MaterialStatus =
    | "Active"
    | "Inactive";

export default function NewConstructionMaterialPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>(
        []
    );

    const [sites, setSites] = useState<Site[]>([]);

    const [loadingProjects, setLoadingProjects] =
        useState(true);

    const [loadingSites, setLoadingSites] =
        useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        projectId: "",
        siteId: "",

        materialName: "",
        category: "Other" as MaterialCategory,
        description: "",

        unit: "",

        quantity: "",
        minimumStock: "",

        unitPrice: "",

        supplier: "",
        supplierContact: "",

        status: "Active" as MaterialStatus,
    });

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        try {
            setLoadingProjects(true);
            setError("");

            const response = await fetch(
                "/api/construction/projects",
                {
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load projects"
                );
            }

            setProjects(data?.projects || []);
        } catch (err) {
            console.error(
                "Failed to load projects:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load projects"
            );
        } finally {
            setLoadingProjects(false);
        }
    }

    async function loadSites(projectId: string) {
        try {
            setLoadingSites(true);
            setSites([]);

            const response = await fetch(
                `/api/construction/sites?projectId=${encodeURIComponent(
                    projectId
                )}`,
                {
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load sites"
                );
            }

            setSites(data?.sites || []);
        } catch (err) {
            console.error(
                "Failed to load sites:",
                err
            );

            setSites([]);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load sites"
            );
        } finally {
            setLoadingSites(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement |
                HTMLTextAreaElement |
                HTMLSelectElement
        >
    ) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleProjectChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const projectId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            projectId,
            siteId: "",
        }));

        setSites([]);
        setError("");

        if (projectId) {
            await loadSites(projectId);
        }
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setError("");

        if (!formData.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!formData.siteId) {
            setError("Please select a site.");
            return;
        }

        if (!formData.materialName.trim()) {
            setError(
                "Material name is required."
            );
            return;
        }

        if (!formData.unit.trim()) {
            setError("Unit is required.");
            return;
        }

        const quantity = Number(
            formData.quantity
        );

        const minimumStock = Number(
            formData.minimumStock || 0
        );

        const unitPrice = Number(
            formData.unitPrice || 0
        );

        if (
            Number.isNaN(quantity) ||
            quantity < 0
        ) {
            setError(
                "Quantity must be a valid number."
            );
            return;
        }

        if (
            Number.isNaN(minimumStock) ||
            minimumStock < 0
        ) {
            setError(
                "Minimum stock must be a valid number."
            );
            return;
        }

        if (
            Number.isNaN(unitPrice) ||
            unitPrice < 0
        ) {
            setError(
                "Unit price must be a valid number."
            );
            return;
        }

        try {
            setSaving(true);

            const selectedProject =
                projects.find(
                    (project) =>
                        project.projectId ===
                        formData.projectId
                );

            const selectedSite = sites.find(
                (site) =>
                    site.siteId ===
                    formData.siteId
            );

            const payload = {
                projectId:
                    formData.projectId,

                projectName:
                    selectedProject?.projectName ||
                    "",

                siteId:
                    formData.siteId,

                siteName:
                    selectedSite?.siteName ||
                    "",

                materialName:
                    formData.materialName.trim(),

                category:
                    formData.category,

                description:
                    formData.description.trim(),

                unit:
                    formData.unit.trim(),

                quantity,

                currentStock: quantity,

                minimumStock,

                unitPrice,

                totalValue:
                    quantity * unitPrice,

                supplier:
                    formData.supplier.trim(),

                supplierContact:
                    formData.supplierContact.trim(),

                status:
                    formData.status,
            };

            const response = await fetch(
                "/api/construction/materials",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        payload
                    ),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to create material"
                );
            }

            const createdMaterial =
                data?.material || data;

            const materialId =
                createdMaterial?.materialId;

            if (materialId) {
                router.push(
                    `/DriWE-Construction/materials/${materialId}`
                );
            } else {
                router.push(
                    "/DriWE-Construction/materials"
                );
            }

            router.refresh();
        } catch (err) {
            console.error(
                "Failed to create material:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create material"
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back */}
                <Link
                    href="/DriWE-Construction/materials"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Materials
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10">
                            <Package className="h-5 w-5 text-yellow-400" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Add New Material
                            </h1>

                            <p className="mt-1 text-sm text-zinc-500">
                                Add construction material to a project site
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                            <p className="text-sm text-red-300">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
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
                                        Select where this material belongs
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                {/* Project */}
                                <div>
                                    <label
                                        htmlFor="projectId"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Project
                                        <span className="ml-1 text-yellow-400">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="projectId"
                                        name="projectId"
                                        value={
                                            formData.projectId
                                        }
                                        onChange={
                                            handleProjectChange
                                        }
                                        disabled={
                                            loadingProjects
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">
                                            {loadingProjects
                                                ? "Loading projects..."
                                                : "Select Project"}
                                        </option>

                                        {projects.map(
                                            (project) => (
                                                <option
                                                    key={
                                                        project.projectId
                                                    }
                                                    value={
                                                        project.projectId
                                                    }
                                                >
                                                    {
                                                        project.projectName
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Site */}
                                <div>
                                    <label
                                        htmlFor="siteId"
                                        className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
                                    >
                                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                                        Site
                                        <span className="text-yellow-400">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="siteId"
                                        name="siteId"
                                        value={
                                            formData.siteId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            !formData.projectId ||
                                            loadingSites
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">
                                            {loadingSites
                                                ? "Loading sites..."
                                                : !formData.projectId
                                                ? "Select project first"
                                                : sites.length ===
                                                  0
                                                ? "No sites found"
                                                : "Select Site"}
                                        </option>

                                        {sites
                                            .filter(
                                                (site) =>
                                                    site.active !==
                                                        false
                                            )
                                            .map(
                                                (
                                                    site
                                                ) => (
                                                    <option
                                                        key={
                                                            site.siteId
                                                        }
                                                        value={
                                                            site.siteId
                                                        }
                                                    >
                                                        {
                                                            site.siteName
                                                        }
                                                        {site.location
                                                            ? ` — ${site.location}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Material Information */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <div className="mb-5">
                                <h2 className="font-semibold text-white">
                                    Material Information
                                </h2>

                                <p className="text-xs text-zinc-500">
                                    Enter the basic material details
                                </p>
                            </div>

                            <div className="space-y-5">
                                {/* Name / Category */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="materialName"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Material Name
                                            <span className="ml-1 text-yellow-400">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="materialName"
                                            name="materialName"
                                            type="text"
                                            value={
                                                formData.materialName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. OPC 53 Grade Cement"
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="category"
                                            className="mb-2 block text-sm font-medium text-zinc-300"
                                        >
                                            Category
                                        </label>

                                        <select
                                            id="category"
                                            name="category"
                                            value={
                                                formData.category
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                        >
                                            <option value="Cement">
                                                Cement
                                            </option>

                                            <option value="Steel">
                                                Steel
                                            </option>

                                            <option value="Sand">
                                                Sand
                                            </option>

                                            <option value="Bricks">
                                                Bricks
                                            </option>

                                            <option value="Aggregate">
                                                Aggregate
                                            </option>

                                            <option value="Electrical">
                                                Electrical
                                            </option>

                                            <option value="Plumbing">
                                                Plumbing
                                            </option>

                                            <option value="Tiles">
                                                Tiles
                                            </option>

                                            <option value="Paint">
                                                Paint
                                            </option>

                                            <option value="Hardware">
                                                Hardware
                                            </option>

                                            <option value="Other">
                                                Other
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Unit */}
                                <div>
                                    <label
                                        htmlFor="unit"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Unit
                                        <span className="ml-1 text-yellow-400">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="unit"
                                        name="unit"
                                        type="text"
                                        value={
                                            formData.unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Bags, Kg, Ton, Nos, Sq Ft"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Add material description..."
                                        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Stock & Pricing */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
                                    <Boxes className="h-4 w-4 text-yellow-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Stock & Pricing
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Set the opening inventory and pricing
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">
                                {/* Quantity */}
                                <div>
                                    <label
                                        htmlFor="quantity"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Opening Quantity
                                    </label>

                                    <input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Minimum Stock */}
                                <div>
                                    <label
                                        htmlFor="minimumStock"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Minimum Stock
                                    </label>

                                    <input
                                        id="minimumStock"
                                        name="minimumStock"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.minimumStock
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Unit Price */}
                                <div>
                                    <label
                                        htmlFor="unitPrice"
                                        className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
                                    >
                                        <IndianRupee className="h-3.5 w-3.5 text-zinc-500" />
                                        Unit Price
                                    </label>

                                    <input
                                        id="unitPrice"
                                        name="unitPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.unitPrice
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0.00"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                                            Opening Stock Value
                                        </p>

                                        <p className="mt-1 text-lg font-semibold text-white">
                                            ₹
                                            {(
                                                Number(
                                                    formData.quantity ||
                                                        0
                                                ) *
                                                Number(
                                                    formData.unitPrice ||
                                                        0
                                                )
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </p>
                                    </div>

                                    <Package className="h-5 w-5 text-yellow-400" />
                                </div>
                            </div>
                        </section>

                        {/* Supplier */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <div className="mb-5">
                                <h2 className="font-semibold text-white">
                                    Supplier Information
                                </h2>

                                <p className="text-xs text-zinc-500">
                                    Optional supplier details
                                </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="supplier"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Supplier Name
                                    </label>

                                    <input
                                        id="supplier"
                                        name="supplier"
                                        type="text"
                                        value={
                                            formData.supplier
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter supplier name"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="supplierContact"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Supplier Contact
                                    </label>

                                    <input
                                        id="supplierContact"
                                        name="supplierContact"
                                        type="text"
                                        value={
                                            formData.supplierContact
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Phone or email"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Status */}
                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
                            <div className="mb-5">
                                <h2 className="font-semibold text-white">
                                    Material Status
                                </h2>
                            </div>

                            <div className="max-w-md">
                                <label
                                    htmlFor="status"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Status
                                </label>

                                <select
                                    id="status"
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                >
                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
                            <Link
                                href="/DriWE-Construction/materials"
                                className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Create Material
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}