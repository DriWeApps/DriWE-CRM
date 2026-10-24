"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Package,
    Building2,
    Save,
    Loader2,
    AlertCircle,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
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

export default function NewConstructionMaterialPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        projectId: "",
        materialName: "",
        category: "Other" as MaterialCategory,
        description: "",
        unit: "",
        quantity: "0",
    });

    async function loadProjects() {
        try {
            setLoadingProjects(true);
            setError("");

            const response = await fetch("/api/construction/projects", {
                cache: "no-store",
            });

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
            console.error("Failed to load projects:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load projects"
            );
        } finally {
            setLoadingProjects(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleProjectChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const projectId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            projectId,
        }));

        setError("");
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!formData.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!formData.materialName.trim()) {
            setError("Material name is required.");
            return;
        }

        if (!formData.unit.trim()) {
            setError("Unit is required.");
            return;
        }

        if (!/[a-zA-Z]/.test(formData.unit)) {
            setError(
                "Enter a unit such as kg, bags, or pieces. Enter stock quantity in the Quantity field."
            );
            return;
        }

        const quantity = Number(formData.quantity);

        if (!Number.isFinite(quantity) || quantity < 0) {
            setError(
                "Quantity must be a valid number greater than or equal to zero."
            );
            return;
        }

        try {
            setSaving(true);

            const selectedProject = projects.find(
                (project) => project.projectId === formData.projectId
            );

            const payload = {
                projectId: formData.projectId,
                projectName: selectedProject?.projectName || "",
                materialName: formData.materialName.trim(),
                category: formData.category,
                description: formData.description.trim(),
                unit: formData.unit.trim(),
                quantity,
                currentStock: quantity,
            };

            const response = await fetch("/api/construction/materials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to create material"
                );
            }

            const createdMaterial = data?.material || data;
            const materialId = createdMaterial?.materialId;

            if (materialId) {
                router.push(
                    `/DriWE-Construction/materials/${materialId}`
                );
            } else {
                router.push("/DriWE-Construction/materials");
            }

            router.refresh();
        } catch (err) {
            console.error("Failed to create material:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create material"
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70";

    const labelClass =
        "mb-2 block text-sm font-medium text-gray-700";

    const primaryButtonClass =
        "inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";

    const secondaryButtonClass =
        "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:border-black hover:bg-gray-100";

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="w-full px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
                {/* Back */}
                <Link
                    href="/DriWE-Construction/materials"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Materials
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                            <Package className="h-5 w-5 text-black" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-black">
                                Add New Material
                            </h1>

                            <p className="mt-1 text-sm text-gray-600">
                                Add construction material to a project
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />

                            <p className="text-sm text-red-800">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Project Assignment */}
                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                    <Building2 className="h-4 w-4 text-black" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-black">
                                        Project
                                    </h2>

                                    <p className="text-xs text-gray-600">
                                        Select the project this material belongs to
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="projectId"
                                        className={labelClass}
                                    >
                                        Project
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="projectId"
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleProjectChange}
                                        disabled={loadingProjects}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingProjects
                                                ? "Loading projects..."
                                                : "Select Project"}
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
                                </div>
                            </div>
                        </section>

                        {/* Material Information */}
                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-5">
                                <h2 className="font-semibold text-black">
                                    Material Information
                                </h2>

                                <p className="text-xs text-gray-600">
                                    Enter the basic material details
                                </p>
                            </div>

                            <div className="space-y-5">
                                {/* Name / Category */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="materialName"
                                            className={labelClass}
                                        >
                                            Material Name
                                            <span className="ml-1 text-red-600">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="materialName"
                                            name="materialName"
                                            type="text"
                                            value={formData.materialName}
                                            onChange={handleChange}
                                            placeholder="e.g. OPC 53 Grade Cement"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="category"
                                            className={labelClass}
                                        >
                                            Category
                                        </label>

                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="Cement">Cement</option>
                                            <option value="Steel">Steel</option>
                                            <option value="Sand">Sand</option>
                                            <option value="Bricks">Bricks</option>
                                            <option value="Aggregate">Aggregate</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Plumbing">Plumbing</option>
                                            <option value="Tiles">Tiles</option>
                                            <option value="Paint">Paint</option>
                                            <option value="Hardware">Hardware</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Unit / Quantity */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="unit"
                                            className={labelClass}
                                        >
                                            Unit
                                            <span className="ml-1 text-red-600">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="unit"
                                            name="unit"
                                            type="text"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            placeholder="e.g. Bags, Kg, Ton, Nos, Sq Ft"
                                            className={inputClass}
                                        />

                                        <p className="mt-1 text-xs text-gray-500">
                                            Measurement unit only, not the quantity.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="quantity"
                                            className={labelClass}
                                        >
                                            Available Quantity
                                        </label>

                                        <input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        htmlFor="description"
                                        className={labelClass}
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Add material description..."
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
                            <Link
                                href="/DriWE-Construction/materials"
                                className={secondaryButtonClass}
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className={primaryButtonClass}
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
