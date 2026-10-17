"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ClipboardList,
    Loader2,
    Save,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
};

type Site = {
    siteId: string;
    projectId: string;
    siteName: string;
    location?: string;
};

type Worker = {
    workerId: string;
    companyId?: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    name: string;
    phone?: string;
    role?: string;
    workerType?: string;
    salary?: number;
    dailyWage?: number;
    active?: boolean;
};

type FormData = {
    projectId: string;
    siteId: string;
    title: string;
    description: string;
    assignedTo: string;
    priority: "Low" | "Medium" | "High";
    status:
        | "Pending"
        | "In Progress"
        | "Completed"
        | "Delayed";
    startDate: string;
    dueDate: string;
    remarks: string;
};

export default function NewConstructionTaskPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingSites, setLoadingSites] = useState(false);
    const [loadingWorkers, setLoadingWorkers] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState<FormData>({
        projectId: "",
        siteId: "",
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium",
        status: "Pending",
        startDate: "",
        dueDate: "",
        remarks: "",
    });

    // Load projects
    useEffect(() => {
        async function loadProjects() {
            try {
                setLoadingProjects(true);
                setError("");

                const res = await fetch("/api/construction/projects", {
                    method: "GET",
                    cache: "no-store",
                    credentials: "include",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load projects");
                }

                setProjects(Array.isArray(data?.projects) ? data.projects : []);
            } catch (err) {
                console.error("Failed to load projects:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load projects"
                );
                setProjects([]);
            } finally {
                setLoadingProjects(false);
            }
        }

        loadProjects();
    }, []);

    // Load sites when project changes
    useEffect(() => {
        if (!formData.projectId) {
            setSites([]);
            setWorkers([]);
            setLoadingSites(false);
            setLoadingWorkers(false);
            return;
        }

        async function loadSites() {
            try {
                setLoadingSites(true);
                setError("");

                const res = await fetch(
                    `/api/construction/sites?projectId=${encodeURIComponent(formData.projectId)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load sites");
                }

                setSites(Array.isArray(data?.sites) ? data.sites : []);
                setWorkers([]);
            } catch (err) {
                console.error("Failed to load sites:", err);
                setSites([]);
                setWorkers([]);
                setError(
                    err instanceof Error ? err.message : "Failed to load sites"
                );
            } finally {
                setLoadingSites(false);
            }
        }

        loadSites();
    }, [formData.projectId]);

    // Load workers when site changes
    useEffect(() => {
        if (!formData.siteId) {
            setWorkers([]);
            setLoadingWorkers(false);
            return;
        }

        async function loadWorkers() {
            try {
                setLoadingWorkers(true);
                setError("");

                const res = await fetch(
                    `/api/construction/workers?siteId=${encodeURIComponent(formData.siteId)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load workers");
                }

                const loadedWorkers: Worker[] = Array.isArray(data?.workers)
                    ? data.workers
                    : [];

                const siteWorkers = loadedWorkers.filter(
                    (worker) => worker.siteId === formData.siteId
                );

                // Keep active workers; legacy records without active remain eligible.
                setWorkers(
                    siteWorkers.filter((worker) => worker.active !== false)
                );
            } catch (err) {
                console.error("Failed to load workers:", err);
                setWorkers([]);
                setError(
                    err instanceof Error ? err.message : "Failed to load workers"
                );
            } finally {
                setLoadingWorkers(false);
            }
        }

        loadWorkers();
    }, [formData.siteId]);

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

        if (error) setError("");
    }

    function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const projectId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            projectId,
            siteId: "",
            assignedTo: "",
        }));

        setSites([]);
        setWorkers([]);
        setError("");
    }

    function handleSiteChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const siteId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            siteId,
            assignedTo: "",
        }));

        setWorkers([]);
        setError("");
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

        if (!formData.title.trim()) {
            setError("Please enter a task title.");
            return;
        }

        if (!formData.assignedTo) {
            setError("Please select a worker.");
            return;
        }

        try {
            setSaving(true);

            const selectedProject = projects.find(
                (project) => project.projectId === formData.projectId
            );
            const selectedSite = sites.find(
                (site) => site.siteId === formData.siteId
            );
            const selectedWorker = workers.find(
                (worker) => worker.workerId === formData.assignedTo
            );

            if (!selectedProject) {
                setError("Selected project could not be found.");
                return;
            }

            if (!selectedSite) {
                setError("Selected site could not be found.");
                return;
            }

            if (!selectedWorker) {
                setError("Selected worker could not be found.");
                return;
            }

            if (selectedWorker.siteId !== formData.siteId) {
                setError(
                    "Selected worker does not belong to the selected site."
                );
                return;
            }

            const payload = {
                projectId: selectedProject.projectId,
                projectName: selectedProject.projectName,
                siteId: selectedSite.siteId,
                siteName: selectedSite.siteName,
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                assignedTo: selectedWorker.workerId,
                assignedToName: selectedWorker.name,
                priority: formData.priority,
                status: formData.status,
                startDate: formData.startDate || undefined,
                dueDate: formData.dueDate || undefined,
                remarks: formData.remarks.trim() || undefined,
            };

            console.log("Creating construction task:", payload);

            const res = await fetch("/api/construction/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to create task");
            }

            router.push("/DriWE-Construction/tasks");
            router.refresh();
        } catch (err) {
            console.error("Failed to create task:", err);
            setError(
                err instanceof Error ? err.message : "Failed to create task"
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClassName =
        "w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 disabled:cursor-not-allowed disabled:opacity-50";
    const labelClassName = "mb-2 block text-sm font-medium text-zinc-300";
    const sectionClassName =
        "rounded-xl border border-zinc-800 bg-black p-6 shadow-lg shadow-black/20";

    return (
        <div className="min-h-screen bg-black p-6 text-white md:p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/DriWE-Construction/tasks"
                        aria-label="Back to construction tasks"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 transition hover:border-yellow-500/50 hover:text-yellow-400"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <ClipboardList
                                size={24}
                                className="text-yellow-400"
                            />
                            <h1 className="text-2xl font-bold text-white">
                                Create Construction Task
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            Create and assign a task to a worker under a specific site.
                        </p>
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className={sectionClassName}>
                        <h2 className="mb-6 text-lg font-semibold text-yellow-400">
                            Assignment
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <label htmlFor="projectId" className={labelClassName}>
                                    Project <span className="ml-1 text-red-400">*</span>
                                </label>
                                <select
                                    id="projectId"
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleProjectChange}
                                    disabled={loadingProjects || saving}
                                    className={inputClassName}
                                >
                                    <option value="" className="bg-black text-white">
                                        {loadingProjects
                                            ? "Loading projects..."
                                            : "Select Project"}
                                    </option>
                                    {projects.map((project) => (
                                        <option
                                            key={project.projectId}
                                            value={project.projectId}
                                            className="bg-black text-white"
                                        >
                                            {project.projectName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="siteId" className={labelClassName}>
                                    Site <span className="ml-1 text-red-400">*</span>
                                </label>
                                <select
                                    id="siteId"
                                    name="siteId"
                                    value={formData.siteId}
                                    onChange={handleSiteChange}
                                    disabled={!formData.projectId || loadingSites || saving}
                                    className={inputClassName}
                                >
                                    <option value="" className="bg-black text-white">
                                        {!formData.projectId
                                            ? "Select project first"
                                            : loadingSites
                                            ? "Loading sites..."
                                            : sites.length === 0
                                            ? "No sites found"
                                            : "Select Site"}
                                    </option>
                                    {sites.map((site) => (
                                        <option
                                            key={site.siteId}
                                            value={site.siteId}
                                            className="bg-black text-white"
                                        >
                                            {site.siteName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="assignedTo" className={labelClassName}>
                                    Assign Worker <span className="ml-1 text-red-400">*</span>
                                </label>
                                <select
                                    id="assignedTo"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    disabled={!formData.siteId || loadingWorkers || saving}
                                    className={inputClassName}
                                >
                                    <option value="" className="bg-black text-white">
                                        {!formData.siteId
                                            ? "Select site first"
                                            : loadingWorkers
                                            ? "Loading workers..."
                                            : workers.length === 0
                                            ? "No workers found"
                                            : "Select Worker"}
                                    </option>
                                    {workers.map((worker) => (
                                        <option
                                            key={worker.workerId}
                                            value={worker.workerId}
                                            className="bg-black text-white"
                                        >
                                            {worker.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-zinc-500">
                                    Only workers from the selected site are shown.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClassName}>
                        <h2 className="mb-6 text-lg font-semibold text-yellow-400">
                            Task Details
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="title" className={labelClassName}>
                                    Task Title <span className="ml-1 text-red-400">*</span>
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter task title"
                                    disabled={saving}
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className={labelClassName}>
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the task..."
                                    rows={4}
                                    disabled={saving}
                                    className={`${inputClassName} resize-none`}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="priority" className={labelClassName}>
                                        Priority
                                    </label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className={inputClassName}
                                    >
                                        <option value="Low" className="bg-black text-white">Low</option>
                                        <option value="Medium" className="bg-black text-white">Medium</option>
                                        <option value="High" className="bg-black text-white">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="status" className={labelClassName}>
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className={inputClassName}
                                    >
                                        <option value="Pending" className="bg-black text-white">Pending</option>
                                        <option value="In Progress" className="bg-black text-white">In Progress</option>
                                        <option value="Completed" className="bg-black text-white">Completed</option>
                                        <option value="Delayed" className="bg-black text-white">Delayed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="startDate" className={labelClassName}>
                                        Start Date
                                    </label>
                                    <input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="dueDate" className={labelClassName}>
                                        Due Date
                                    </label>
                                    <input
                                        id="dueDate"
                                        name="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className={inputClassName}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="remarks" className={labelClassName}>
                                    Remarks
                                </label>
                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="Add any additional remarks..."
                                    rows={3}
                                    disabled={saving}
                                    className={`${inputClassName} resize-none`}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/DriWE-Construction/tasks"
                            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
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
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Create Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
