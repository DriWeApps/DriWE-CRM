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

    const [loadingProjects, setLoadingProjects] =
        useState(true);

    const [loadingSites, setLoadingSites] =
        useState(false);

    const [loadingWorkers, setLoadingWorkers] =
        useState(false);

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

    // =========================================================
    // LOAD PROJECTS
    // =========================================================

    useEffect(() => {
        async function loadProjects() {
            try {
                setLoadingProjects(true);
                setError("");

                const res = await fetch(
                    "/api/construction/projects",
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data?.error ||
                            "Failed to load projects"
                    );
                }

                setProjects(
                    Array.isArray(data?.projects)
                        ? data.projects
                        : []
                );
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

                setProjects([]);
            } finally {
                setLoadingProjects(false);
            }
        }

        loadProjects();
    }, []);

    // =========================================================
    // LOAD SITES WHEN PROJECT CHANGES
    // =========================================================

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
                    `/api/construction/sites?projectId=${encodeURIComponent(
                        formData.projectId
                    )}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data?.error ||
                            "Failed to load sites"
                    );
                }

                setSites(
                    Array.isArray(data?.sites)
                        ? data.sites
                        : []
                );

                // Worker list must be cleared
                // when project changes.
                setWorkers([]);
            } catch (err) {
                console.error(
                    "Failed to load sites:",
                    err
                );

                setSites([]);
                setWorkers([]);

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

    // =========================================================
    // LOAD WORKERS WHEN SITE CHANGES
    // =========================================================

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
                    `/api/construction/workers?siteId=${encodeURIComponent(
                        formData.siteId
                    )}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data?.error ||
                            "Failed to load workers"
                    );
                }

                const loadedWorkers: Worker[] =
                    Array.isArray(data?.workers)
                        ? data.workers
                        : [];

                /*
                 * Only workers belonging to the selected
                 * site are allowed.
                 *
                 * This additional frontend filter makes sure
                 * that even if the API accidentally returns
                 * workers from another site, they will not
                 * appear in this dropdown.
                 */
                const siteWorkers =
                    loadedWorkers.filter(
                        (worker) =>
                            worker.siteId ===
                            formData.siteId
                    );

                /*
                 * Show active workers only.
                 *
                 * If active is not present in an old record,
                 * the worker is still allowed.
                 */
                const activeWorkers =
                    siteWorkers.filter(
                        (worker) =>
                            worker.active !== false
                    );

                setWorkers(activeWorkers);
            } catch (err) {
                console.error(
                    "Failed to load workers:",
                    err
                );

                setWorkers([]);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load workers"
                );
            } finally {
                setLoadingWorkers(false);
            }
        }

        loadWorkers();
    }, [formData.siteId]);

    // =========================================================
    // INPUT CHANGE
    // =========================================================

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

        if (error) {
            setError("");
        }
    }

    // =========================================================
    // PROJECT CHANGE
    // =========================================================

    function handleProjectChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
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

    // =========================================================
    // SITE CHANGE
    // =========================================================

    function handleSiteChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const siteId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            siteId,
            assignedTo: "",
        }));

        setWorkers([]);
        setError("");
    }

    // =========================================================
    // SUBMIT
    // =========================================================

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setError("");

        // Project validation
        if (!formData.projectId) {
            setError("Please select a project.");
            return;
        }

        // Site validation
        if (!formData.siteId) {
            setError("Please select a site.");
            return;
        }

        // Task title validation
        if (!formData.title.trim()) {
            setError("Please enter a task title.");
            return;
        }

        // Worker validation
        if (!formData.assignedTo) {
            setError("Please select a worker.");
            return;
        }

        try {
            setSaving(true);

            // Find selected project
            const selectedProject = projects.find(
                (project) =>
                    project.projectId ===
                    formData.projectId
            );

            // Find selected site
            const selectedSite = sites.find(
                (site) =>
                    site.siteId ===
                    formData.siteId
            );

            // Find selected worker
            const selectedWorker = workers.find(
                (worker) =>
                    worker.workerId ===
                    formData.assignedTo
            );

            if (!selectedProject) {
                setError(
                    "Selected project could not be found."
                );
                return;
            }

            if (!selectedSite) {
                setError(
                    "Selected site could not be found."
                );
                return;
            }

            if (!selectedWorker) {
                setError(
                    "Selected worker could not be found."
                );
                return;
            }

            /*
             * Final safety check:
             * worker must belong to selected site.
             */
            if (
                selectedWorker.siteId !==
                formData.siteId
            ) {
                setError(
                    "Selected worker does not belong to the selected site."
                );
                return;
            }

            const payload = {
                projectId:
                    selectedProject.projectId,

                projectName:
                    selectedProject.projectName,

                siteId:
                    selectedSite.siteId,

                siteName:
                    selectedSite.siteName,

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim() ||
                    undefined,

                /*
                 * Worker ID is stored internally.
                 * User only sees worker name.
                 */
                assignedTo:
                    selectedWorker.workerId,

                /*
                 * Worker name is automatically taken
                 * from the selected worker.
                 */
                assignedToName:
                    selectedWorker.name,

                priority:
                    formData.priority,

                status:
                    formData.status,

                startDate:
                    formData.startDate ||
                    undefined,

                dueDate:
                    formData.dueDate ||
                    undefined,

                remarks:
                    formData.remarks.trim() ||
                    undefined,
            };

            console.log(
                "Creating construction task:",
                payload
            );

            const res = await fetch(
                "/api/construction/tasks",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.error ||
                        "Failed to create task"
                );
            }

            router.push(
                "/DriWE-Construction/tasks"
            );

            router.refresh();
        } catch (err) {
            console.error(
                "Failed to create task:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create task"
            );
        } finally {
            setSaving(false);
        }
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-white md:p-8">
            <div className="mx-auto max-w-5xl">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="mb-8 flex items-center gap-4">

                    <Link
                        href="/DriWE-Construction/tasks"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-yellow-500/50 hover:text-yellow-400"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <ClipboardList
                                size={24}
                                className="text-yellow-400"
                            />

                            <h1 className="text-2xl font-bold">
                                Create Construction Task
                            </h1>
                        </div>

                        <p className="mt-1 text-sm text-zinc-400">
                            Create and assign a task to a
                            worker under a specific site.
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    ERROR
                ====================================================== */}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* =================================================
                        ASSIGNMENT
                    ================================================== */}

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">

                        <h2 className="mb-6 text-lg font-semibold text-yellow-400">
                            Assignment
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                            {/* ================================
                                PROJECT
                            ================================= */}

                            <div>
                                <label
                                    htmlFor="projectId"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Project
                                    <span className="ml-1 text-red-400">
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
                                        loadingProjects ||
                                        saving
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
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

                            {/* ================================
                                SITE
                            ================================= */}

                            <div>
                                <label
                                    htmlFor="siteId"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Site
                                    <span className="ml-1 text-red-400">
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
                                        handleSiteChange
                                    }
                                    disabled={
                                        !formData.projectId ||
                                        loadingSites ||
                                        saving
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">
                                        {!formData.projectId
                                            ? "Select project first"
                                            : loadingSites
                                            ? "Loading sites..."
                                            : sites.length ===
                                              0
                                            ? "No sites found"
                                            : "Select Site"}
                                    </option>

                                    {sites.map(
                                        (site) => (
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
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* ================================
                                WORKER
                            ================================= */}

                            <div>
                                <label
                                    htmlFor="assignedTo"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Assign Worker
                                    <span className="ml-1 text-red-400">
                                        *
                                    </span>
                                </label>

                                <select
                                    id="assignedTo"
                                    name="assignedTo"
                                    value={
                                        formData.assignedTo
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        !formData.siteId ||
                                        loadingWorkers ||
                                        saving
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">
                                        {!formData.siteId
                                            ? "Select site first"
                                            : loadingWorkers
                                            ? "Loading workers..."
                                            : workers.length ===
                                              0
                                            ? "No workers found"
                                            : "Select Worker"}
                                    </option>

                                    {workers.map(
                                        (worker) => (
                                            <option
                                                key={
                                                    worker.workerId
                                                }
                                                value={
                                                    worker.workerId
                                                }
                                            >
                                                {worker.name}
                                            </option>
                                        )
                                    )}
                                </select>

                                <p className="mt-2 text-xs text-zinc-500">
                                    Only workers from the
                                    selected site are shown.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        TASK DETAILS
                    ================================================== */}

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">

                        <h2 className="mb-6 text-lg font-semibold text-yellow-400">
                            Task Details
                        </h2>

                        <div className="space-y-6">

                            {/* TASK TITLE */}

                            <div>
                                <label
                                    htmlFor="title"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Task Title
                                    <span className="ml-1 text-red-400">
                                        *
                                    </span>
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter task title"
                                    disabled={saving}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-yellow-500 disabled:opacity-50"
                                />
                            </div>

                            {/* DESCRIPTION */}

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
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe the task..."
                                    rows={4}
                                    disabled={saving}
                                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-yellow-500 disabled:opacity-50"
                                />
                            </div>

                            {/* PRIORITY + STATUS */}

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                {/* PRIORITY */}

                                <div>
                                    <label
                                        htmlFor="priority"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Priority
                                    </label>

                                    <select
                                        id="priority"
                                        name="priority"
                                        value={
                                            formData.priority
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={saving}
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 disabled:opacity-50"
                                    >
                                        <option value="Low">
                                            Low
                                        </option>

                                        <option value="Medium">
                                            Medium
                                        </option>

                                        <option value="High">
                                            High
                                        </option>
                                    </select>
                                </div>

                                {/* STATUS */}

                                <div>
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
                                        disabled={saving}
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 disabled:opacity-50"
                                    >
                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="In Progress">
                                            In Progress
                                        </option>

                                        <option value="Completed">
                                            Completed
                                        </option>

                                        <option value="Delayed">
                                            Delayed
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* DATES */}

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                {/* START DATE */}

                                <div>
                                    <label
                                        htmlFor="startDate"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Start Date
                                    </label>

                                    <input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={
                                            formData.startDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={saving}
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* DUE DATE */}

                                <div>
                                    <label
                                        htmlFor="dueDate"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Due Date
                                    </label>

                                    <input
                                        id="dueDate"
                                        name="dueDate"
                                        type="date"
                                        value={
                                            formData.dueDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={saving}
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* REMARKS */}

                            <div>
                                <label
                                    htmlFor="remarks"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Remarks
                                </label>

                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    value={
                                        formData.remarks
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Add any additional remarks..."
                                    rows={3}
                                    disabled={saving}
                                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-yellow-500 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        BUTTONS
                    ================================================== */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <Link
                            href="/DriWE-Construction/tasks"
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
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
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