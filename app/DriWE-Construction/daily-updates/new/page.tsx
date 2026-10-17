"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    Loader2,
    Package,
    Save,
    Users,
    AlertTriangle,
    FileText,
    Plus,
    Trash2,
} from "lucide-react";

interface Project {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
}

interface Material {
    materialId: string;
    materialName: string;
    unit?: string;
    quantity: number;
    projectId: string;
    status?: string;
}

interface MaterialUseEntry {
    materialId: string;
    quantity: string;
}

export default function NewDailyUpdatePage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [materialsUsed, setMaterialsUsed] = useState<MaterialUseEntry[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [loadingProjects, setLoadingProjects] =
        useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        projectId: "",
        projectName: "",

        date: new Date()
            .toISOString()
            .split("T")[0],

        workersPresent: "0",
        tasksCompleted: "0",

        materialReceived: "0",

        issues: "0",
        issueDescription: "",

        note: "",
    });

    async function loadProjects() {
        try {
            const res = await fetch(
                "/api/construction/projects",
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to load projects"
                );
            }

            setProjects(data.projects || []);
        } catch (err: any) {
            setError(
                err.message ||
                    "Failed to load projects"
            );
        } finally {
            setLoadingProjects(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    function updateField(
        field: string,
        value: string
    ) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function handleProjectChange(
        projectId: string
    ) {
        const project = projects.find(
            (item) =>
                item.projectId === projectId
        );

        setForm((prev) => ({
            ...prev,
            projectId,
            projectName:
                project?.projectName || "",
        }));

        setMaterialsUsed([]);
        setMaterials([]);
        if (projectId) {
            void loadProjectMaterials(projectId);
        }
    }

    async function loadProjectMaterials(projectId: string) {
        try {
            setLoadingMaterials(true);
            const response = await fetch(
                `/api/construction/materials?projectId=${encodeURIComponent(projectId)}`,
                { cache: "no-store", credentials: "include" }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || "Failed to load project materials.");
            }
            setMaterials(
                (Array.isArray(data?.materials) ? data.materials : [])
                    .filter((material: Material) => material.status !== "Inactive")
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load project materials.");
            setMaterials([]);
        } finally {
            setLoadingMaterials(false);
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!form.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!form.date) {
            setError("Please select a date.");
            return;
        }

        const usageTotals = new Map<string, number>();
        for (const item of materialsUsed) {
            const quantity = Number(item.quantity);
            const material = materials.find((candidate) => candidate.materialId === item.materialId);
            if (!item.materialId || !Number.isFinite(quantity) || quantity <= 0) {
                setError("Select a material and enter a valid quantity for each material used.");
                return;
            }
            const totalForMaterial = (usageTotals.get(item.materialId) || 0) + quantity;
            usageTotals.set(item.materialId, totalForMaterial);
            if (!material || totalForMaterial > Number(material.quantity || 0)) {
                setError(`${material?.materialName || "Material"} is not available in the requested quantity.`);
                return;
            }
        }

        try {
            setSaving(true);

            const res = await fetch(
                "/api/construction/daily-updates",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        projectId:
                            form.projectId,

                        projectName:
                            form.projectName,

                        date: form.date,

                        workersPresent:
                            Number(
                                form.workersPresent
                            ),

                        tasksCompleted:
                            Number(
                                form.tasksCompleted
                            ),

                        materialReceived:
                            Number(
                                form.materialReceived
                            ),

                        materialUsed: materialsUsed.reduce(
                            (total, item) => total + Number(item.quantity || 0),
                            0
                        ),

                        materialsUsed: materialsUsed.map((item) => ({
                            materialId: item.materialId,
                            quantity: Number(item.quantity),
                        })),

                        issues: Number(
                            form.issues
                        ),

                        issueDescription:
                            form.issueDescription,

                        note: form.note,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to create daily update"
                );
            }

            router.push(
                `/DriWE-Construction/daily-updates`
            );
        } catch (err: any) {
            setError(
                err.message ||
                    "Failed to create daily update"
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-white">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/DriWE-Construction/daily-updates"
                        className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft size={17} />
                        Back to Daily Updates
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
                            <FileText
                                size={22}
                                className="text-orange-400"
                            />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold">
                                New Daily Site Update
                            </h1>

                            <p className="mt-1 text-sm text-zinc-400">
                                Record today's site
                                progress.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Project & Date */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold">
                                Basic Information
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Select the project and
                                update date.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Project *
                                </label>

                                <select
                                    value={
                                        form.projectId
                                    }
                                    onChange={(e) =>
                                        handleProjectChange(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        loadingProjects
                                    }
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
                                >
                                    <option value="">
                                        {loadingProjects
                                            ? "Loading projects..."
                                            : "Select project"}
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

                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Date *
                                </label>

                                <div className="relative">
                                    <CalendarDays
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                                    />

                                    <input
                                        type="date"
                                        value={
                                            form.date
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "date",
                                                e.target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Progress */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold">
                                Today's Progress
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Enter the progress recorded
                                at the site.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <NumberField
                                label="Workers Present"
                                icon={
                                    <Users
                                        size={17}
                                    />
                                }
                                value={
                                    form.workersPresent
                                }
                                onChange={(value) =>
                                    updateField(
                                        "workersPresent",
                                        value
                                    )
                                }
                            />

                            <NumberField
                                label="Tasks Completed"
                                icon={
                                    <ClipboardList
                                        size={17}
                                    />
                                }
                                value={
                                    form.tasksCompleted
                                }
                                onChange={(value) =>
                                    updateField(
                                        "tasksCompleted",
                                        value
                                    )
                                }
                            />

                            <NumberField
                                label="Material Received"
                                icon={
                                    <Package
                                        size={17}
                                    />
                                }
                                value={
                                    form.materialReceived
                                }
                                onChange={(value) =>
                                    updateField(
                                        "materialReceived",
                                        value
                                    )
                                }
                            />

                            <div className="sm:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-medium text-zinc-200">Materials Used</h3>
                                        <p className="mt-1 text-xs text-zinc-500">Choose each material and quantity. Stock is deducted when this update is saved.</p>
                                    </div>
                                    <button type="button" disabled={!form.projectId || loadingMaterials || materials.length === 0} onClick={() => setMaterialsUsed((items) => [...items, { materialId: "", quantity: "" }])} className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 px-3 py-2 text-xs font-medium text-orange-300 hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                                        <Plus size={15} /> Add Material
                                    </button>
                                </div>
                                {loadingMaterials ? (
                                    <p className="text-sm text-zinc-500">Loading project materials...</p>
                                ) : materials.length === 0 ? (
                                    <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-300">No materials available for this project.</p>
                                ) : materialsUsed.length === 0 ? (
                                    <p className="text-sm text-zinc-500">No materials recorded as used.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {materialsUsed.map((entry, index) => {
                                            const selectedMaterial = materials.find((material) => material.materialId === entry.materialId);
                                            return (
                                                <div key={`${entry.materialId || "material"}-${index}`} className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
                                                    <div>
                                                        <select value={entry.materialId} onChange={(event) => setMaterialsUsed((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, materialId: event.target.value } : item))} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500">
                                                            <option value="">Select material</option>
                                                            {materials.map((material) => <option key={material.materialId} value={material.materialId}>{material.materialName} — available {material.quantity} {material.unit || ""}</option>)}
                                                        </select>
                                                        {selectedMaterial && Number(selectedMaterial.quantity) <= 0 && (
                                                            <p className="mt-1 text-xs text-red-400">Material is not available.</p>
                                                        )}
                                                    </div>
                                                    <input type="number" min="0.01" step="any" max={selectedMaterial?.quantity} value={entry.quantity} onChange={(event) => setMaterialsUsed((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: event.target.value } : item))} placeholder={`Quantity${selectedMaterial?.unit ? ` (${selectedMaterial.unit})` : ""}`} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500" />
                                                    <button type="button" aria-label="Remove material" onClick={() => setMaterialsUsed((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-3 text-zinc-400 hover:border-red-500/40 hover:text-red-400">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Issues */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                        <div className="mb-6">
                            <h2 className="flex items-center gap-2 text-lg font-semibold">
                                <AlertTriangle
                                    size={19}
                                    className="text-orange-400"
                                />
                                Site Issues
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Record any issues found
                                during today's work.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <NumberField
                                label="Number of Issues"
                                icon={
                                    <AlertTriangle
                                        size={17}
                                    />
                                }
                                value={
                                    form.issues
                                }
                                onChange={(value) =>
                                    updateField(
                                        "issues",
                                        value
                                    )
                                }
                            />

                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Issue Description
                                </label>

                                <textarea
                                    value={
                                        form.issueDescription
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "issueDescription",
                                            e.target
                                                .value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Describe the issues reported at the site..."
                                    className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Note */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold">
                                Site Note
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Add a short summary of
                                today's site activities.
                            </p>
                        </div>

                        <textarea
                            value={form.note}
                            onChange={(e) =>
                                updateField(
                                    "note",
                                    e.target.value
                                )
                            }
                            rows={5}
                            placeholder="Example: Foundation work completed for Block A. Electrical work started on the first floor..."
                            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-500"
                        />
                    </section>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/DriWE-Construction/daily-updates"
                            className="rounded-xl border border-zinc-700 px-6 py-3 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-900"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Submit Daily Update
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function NumberField({
    label,
    icon,
    value,
    onChange,
}: {
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <span className="text-orange-400">
                    {icon}
                </span>

                {label}
            </label>

            <input
                type="number"
                min="0"
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
        </div>
    );
}