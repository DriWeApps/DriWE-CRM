"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    UserPlus,
    User,
    Phone,
    BriefcaseBusiness,
    IndianRupee,
    MapPin,
    Building2,
    Loader2,
    CheckCircle2,
    AlertCircle,
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
    active: boolean;
};

type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

export default function NewWorkerPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [sites, setSites] = useState<Site[]>([]);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingSites, setLoadingSites] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        projectId: "",
        siteId: "",
        name: "",
        phone: "",
        workerType: "Employee" as WorkerType,
        salary: "",
        active: true,
    });

    // ------------------------------------------------------------
    // Load Projects
    // ------------------------------------------------------------
    useEffect(() => {
        async function loadProjects() {
            try {
                setLoadingProjects(true);
                setError("");

                const res = await fetch("/api/construction/projects", {
                    cache: "no-store",
                    credentials: "include",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data?.error || "Failed to load projects"
                    );
                }

                setProjects(data.projects || []);
            } catch (err) {
                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load projects"
                );
            } finally {
                setLoadingProjects(false);
            }
        }

        loadProjects();
    }, []);

    // ------------------------------------------------------------
    // Load Sites when Project changes
    // ------------------------------------------------------------
    useEffect(() => {
        async function loadSites() {
            if (!formData.projectId) {
                setSites([]);
                return;
            }

            try {
                setLoadingSites(true);
                setError("");

                const res = await fetch(
                    `/api/construction/sites?projectId=${encodeURIComponent(
                        formData.projectId
                    )}`,
                    {
                        cache: "no-store",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data?.error || "Failed to load sites"
                    );
                }

                setSites(data.sites || []);
            } catch (err) {
                console.error(err);

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

        loadSites();
    }, [formData.projectId]);

    // ------------------------------------------------------------
    // Handle Project Change
    // ------------------------------------------------------------
    function handleProjectChange(projectId: string) {
        setFormData((prev) => ({
            ...prev,
            projectId,
            siteId: "",
        }));

        setSites([]);
        setError("");
    }

    // ------------------------------------------------------------
    // Handle Worker Type Change
    // ------------------------------------------------------------
    function handleWorkerTypeChange(workerType: WorkerType) {
        setFormData((prev) => ({
            ...prev,
            workerType,
            salary: "",
        }));
    }

    // ------------------------------------------------------------
    // Submit
    // ------------------------------------------------------------
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const phone = formData.phone.replace(/\D/g, "");
        const salary = Number(formData.salary);

        // -------------------------
        // Validation
        // -------------------------

        if (!formData.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!formData.siteId) {
            setError("Please select a site.");
            return;
        }

        if (!name) {
            setError("Worker name is required.");
            return;
        }

        if (!phone) {
            setError("Worker mobile number is required.");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (!formData.salary) {
            setError("Salary / wage is required.");
            return;
        }

        if (!Number.isFinite(salary) || salary <= 0) {
            setError("Salary / wage must be greater than 0.");
            return;
        }

        try {
            setSaving(true);

            const selectedSite = sites.find(
                (site) => site.siteId === formData.siteId
            );

            if (!selectedSite) {
                setError("Selected site was not found.");
                return;
            }

            const res = await fetch("/api/construction/workers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    siteId: selectedSite.siteId,
                    name,
                    phone,
                    workerType: formData.workerType,
                    salary,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.error || "Failed to create worker"
                );
            }

            setSuccess("Worker created successfully.");

            // Redirect to worker detail after successful creation.
            setTimeout(() => {
                if (data?.worker?.workerId) {
                    router.push(
                        `/DriWE-Construction/people/${data.worker.workerId}`
                    );
                } else {
                    router.push(
                        `/DriWE-Construction/projects/${formData.projectId}/workers`
                    );
                }
            }, 500);
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create worker"
            );
        } finally {
            setSaving(false);
        }
    }

    const selectedProject = projects.find(
        (project) => project.projectId === formData.projectId
    );

    const selectedSite = sites.find(
        (site) => site.siteId === formData.siteId
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Link
                            href="/DriWE-Construction/people"
                            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-yellow-400" />

                                <span className="text-sm font-medium text-yellow-400">
                                    Construction People
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Add New Worker
                            </h1>

                            <p className="mt-1 text-sm text-zinc-400">
                                Add a worker and assign them to a project site.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div>
                            <p className="font-medium">Unable to create worker</p>
                            <p className="mt-1 text-sm text-red-300/80">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
                        <CheckCircle2 className="h-5 w-5" />

                        <p className="font-medium">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* ------------------------------------------------ */}
                        {/* Project & Site */}
                        {/* ------------------------------------------------ */}

                        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl">
                            <div className="border-b border-zinc-800 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10">
                                        <Building2 className="h-5 w-5 text-yellow-400" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-white">
                                            Project & Site Assignment
                                        </h2>

                                        <p className="text-sm text-zinc-500">
                                            Select where this worker will work.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                                {/* Project */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        Project
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={formData.projectId}
                                        onChange={(e) =>
                                            handleProjectChange(
                                                e.target.value
                                            )
                                        }
                                        disabled={loadingProjects || saving}
                                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="">
                                            {loadingProjects
                                                ? "Loading projects..."
                                                : "Select project"}
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

                                    {selectedProject?.location && (
                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {selectedProject.location}
                                        </p>
                                    )}
                                </div>

                                {/* Site */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        Site
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={formData.siteId}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                siteId: e.target.value,
                                            }))
                                        }
                                        disabled={
                                            !formData.projectId ||
                                            loadingSites ||
                                            saving
                                        }
                                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="">
                                            {!formData.projectId
                                                ? "Select project first"
                                                : loadingSites
                                                ? "Loading sites..."
                                                : sites.length === 0
                                                ? "No sites available"
                                                : "Select site"}
                                        </option>

                                        {sites
                                            .filter((site) => site.active)
                                            .map((site) => (
                                                <option
                                                    key={site.siteId}
                                                    value={site.siteId}
                                                >
                                                    {site.siteName}
                                                </option>
                                            ))}
                                    </select>

                                    {selectedSite?.location && (
                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {selectedSite.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* ------------------------------------------------ */}
                        {/* Worker Information */}
                        {/* ------------------------------------------------ */}

                        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl">
                            <div className="border-b border-zinc-800 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10">
                                        <User className="h-5 w-5 text-yellow-400" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-white">
                                            Worker Information
                                        </h2>

                                        <p className="text-sm text-zinc-500">
                                            Enter the worker's basic details.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                                {/* Name */}
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        Worker Name
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter worker name"
                                            disabled={saving}
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        Mobile Number
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 10),
                                                }))
                                            }
                                            placeholder="10-digit mobile number"
                                            disabled={saving}
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                {/* Worker Type */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        Worker Type
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                        <select
                                            value={formData.workerType}
                                            onChange={(e) =>
                                                handleWorkerTypeChange(
                                                    e.target.value as WorkerType
                                                )
                                            }
                                            disabled={saving}
                                            className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60"
                                        >
                                            <option value="Employee">
                                                Employee
                                            </option>

                                            <option value="Contract Worker">
                                                Contract Worker
                                            </option>

                                            <option value="Daily Wage">
                                                Daily Wage
                                            </option>

                                            <option value="Subcontractor">
                                                Subcontractor
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Salary */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        {formData.workerType === "Daily Wage"
                                            ? "Daily Wage"
                                            : "Salary / Wage"}
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.salary}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    salary: e.target.value,
                                                }))
                                            }
                                            placeholder={
                                                formData.workerType ===
                                                "Daily Wage"
                                                    ? "Enter daily wage"
                                                    : "Enter salary / wage"
                                            }
                                            disabled={saving}
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60"
                                        />
                                    </div>

                                    <p className="mt-2 text-xs text-zinc-500">
                                        Enter amount in Indian Rupees (₹).
                                    </p>
                                </div>

                                {/* Active */}
                                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                                    <input
                                        id="active"
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                active: e.target.checked,
                                            }))
                                        }
                                        disabled={saving}
                                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-yellow-400 accent-yellow-400"
                                    />

                                    <label
                                        htmlFor="active"
                                        className="cursor-pointer"
                                    >
                                        <span className="block text-sm font-medium text-zinc-200">
                                            Active Worker
                                        </span>

                                        <span className="block text-xs text-zinc-500">
                                            Worker is currently working on the
                                            project.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* ------------------------------------------------ */}
                        {/* Assignment Preview */}
                        {/* ------------------------------------------------ */}

                        {selectedProject && selectedSite && (
                            <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-yellow-400" />

                                    <h3 className="font-semibold text-white">
                                        Assignment Preview
                                    </h3>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-zinc-500">
                                            Project
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-zinc-200">
                                            {selectedProject.projectName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-zinc-500">
                                            Site
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-zinc-200">
                                            {selectedSite.siteName}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ------------------------------------------------ */}
                        {/* Actions */}
                        {/* ------------------------------------------------ */}

                        <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
                            <Link
                                href="/DriWE-Construction/people"
                                className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating Worker...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Create Worker
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