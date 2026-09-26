"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Loader2,
    ClipboardList,
    Building2,
    MapPin,
    CalendarDays,
    AlertCircle,
    User,
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
    active?: boolean;
};

type Worker = {
    workerId: string;
    projectId: string;
    siteId: string;
    name: string;
    phone?: string;
    email?: string;
    workerType?: string;
    salary?: number;
    dailyWage?: number;
    active?: boolean;
};

type Task = {
    taskId: string;

    projectId: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    title: string;
    description?: string;

    priority?: "Low" | "Medium" | "High";

    status?:
        | "Pending"
        | "In Progress"
        | "Completed"
        | "Delayed";

    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;

    dueDate?: string;
    remarks?: string;
};

type FormData = {
    projectId: string;
    siteId: string;
    assignedTo: string;

    title: string;
    description: string;

    priority: "Low" | "Medium" | "High";

    status:
        | "Pending"
        | "In Progress"
        | "Completed"
        | "Delayed";

    dueDate: string;
    remarks: string;
};

export default function EditConstructionTaskPage() {
    const params = useParams();
    const router = useRouter();

    const taskId = params?.taskId as string;

    const [task, setTask] = useState<Task | null>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingSites, setLoadingSites] = useState(false);
    const [loadingWorkers, setLoadingWorkers] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState<FormData>({
        projectId: "",
        siteId: "",
        assignedTo: "",

        title: "",
        description: "",

        priority: "Medium",
        status: "Pending",

        dueDate: "",
        remarks: "",
    });

    /*
     * ---------------------------------------------------------
     * LOAD TASK + PROJECTS
     * ---------------------------------------------------------
     */
    useEffect(() => {
        if (!taskId) return;

        loadData();
    }, [taskId]);

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [taskResponse, projectsResponse] =
                await Promise.all([
                    fetch(
                        `/api/construction/tasks/${taskId}`,
                        {
                            cache: "no-store",
                            credentials: "include",
                        }
                    ),

                    fetch(
                        "/api/construction/projects",
                        {
                            cache: "no-store",
                            credentials: "include",
                        }
                    ),
                ]);

            const taskData = await taskResponse.json();
            const projectsData =
                await projectsResponse.json();

            if (!taskResponse.ok) {
                throw new Error(
                    taskData?.error ||
                        taskData?.message ||
                        "Failed to load task"
                );
            }

            if (!projectsResponse.ok) {
                throw new Error(
                    projectsData?.error ||
                        projectsData?.message ||
                        "Failed to load projects"
                );
            }

            const loadedTask: Task =
                taskData?.task || taskData;

            const loadedProjects: Project[] =
                projectsData?.projects || [];

            setTask(loadedTask);
            setProjects(loadedProjects);

            const projectId =
                loadedTask.projectId || "";

            const siteId =
                loadedTask.siteId || "";

            setFormData({
                projectId,
                siteId,

                /*
                 * assignedTo contains the workerId.
                 */
                assignedTo:
                    loadedTask.assignedTo || "",

                title:
                    loadedTask.title || "",

                description:
                    loadedTask.description || "",

                priority:
                    loadedTask.priority || "Medium",

                status:
                    loadedTask.status || "Pending",

                dueDate:
                    loadedTask.dueDate
                        ? String(
                              loadedTask.dueDate
                          ).slice(0, 10)
                        : "",

                remarks:
                    loadedTask.remarks || "",
            });

            /*
             * Load sites for existing project.
             */
            if (projectId) {
                const loadedSites =
                    await loadSites(projectId);

                /*
                 * Load workers for existing site.
                 */
                if (siteId) {
                    await loadWorkers(
                        siteId,
                        loadedSites
                    );
                }
            }
        } catch (err) {
            console.error(
                "Failed to load task:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load task"
            );
        } finally {
            setLoading(false);
        }
    }

    /*
     * ---------------------------------------------------------
     * LOAD SITES FOR PROJECT
     * ---------------------------------------------------------
     */
    async function loadSites(
        projectId: string
    ): Promise<Site[]> {
        try {
            setLoadingSites(true);

            const response = await fetch(
                `/api/construction/sites?projectId=${encodeURIComponent(
                    projectId
                )}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        "Failed to load sites"
                );
            }

            const loadedSites: Site[] =
                data?.sites || [];

            setSites(loadedSites);

            return loadedSites;
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

            return [];
        } finally {
            setLoadingSites(false);
        }
    }

    /*
     * ---------------------------------------------------------
     * LOAD WORKERS FOR SELECTED SITE
     * ---------------------------------------------------------
     */
    async function loadWorkers(
        siteId: string,
        availableSites?: Site[]
    ) {
        if (!siteId) {
            setWorkers([]);
            return;
        }

        try {
            setLoadingWorkers(true);

            const response = await fetch(
                `/api/construction/workers?siteId=${encodeURIComponent(
                    siteId
                )}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        "Failed to load workers"
                );
            }

            let loadedWorkers: Worker[] =
                data?.workers || [];

            /*
             * Safety check:
             * only keep workers that actually belong
             * to the selected site.
             */
            loadedWorkers =
                loadedWorkers.filter(
                    (worker) =>
                        worker.siteId ===
                        siteId
                );

            setWorkers(loadedWorkers);

            /*
             * Keep selected worker if it exists
             * in this site's workers.
             */
            setFormData((prev) => {
                if (!prev.assignedTo) {
                    return prev;
                }

                const workerExists =
                    loadedWorkers.some(
                        (worker) =>
                            worker.workerId ===
                            prev.assignedTo
                    );

                if (!workerExists) {
                    return {
                        ...prev,
                        assignedTo: "",
                    };
                }

                return prev;
            });
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

    /*
     * ---------------------------------------------------------
     * NORMAL INPUT CHANGE
     * ---------------------------------------------------------
     */
    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement |
                HTMLTextAreaElement |
                HTMLSelectElement
        >
    ) {
        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    }

    /*
     * ---------------------------------------------------------
     * PROJECT CHANGE
     * ---------------------------------------------------------
     *
     * Project changes:
     *   Project
     *      ↓
     *   Sites reset
     *      ↓
     *   Workers reset
     */
    async function handleProjectChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const projectId =
            e.target.value;

        setFormData((prev) => ({
            ...prev,
            projectId,
            siteId: "",
            assignedTo: "",
        }));

        setSites([]);
        setWorkers([]);

        setError("");

        if (!projectId) {
            return;
        }

        await loadSites(projectId);
    }

    /*
     * ---------------------------------------------------------
     * SITE CHANGE
     * ---------------------------------------------------------
     *
     * Site changes:
     *   Site
     *      ↓
     *   Load workers from that site only
     */
    async function handleSiteChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const siteId =
            e.target.value;

        setFormData((prev) => ({
            ...prev,
            siteId,
            assignedTo: "",
        }));

        setWorkers([]);

        setError("");

        if (!siteId) {
            return;
        }

        await loadWorkers(siteId);
    }

    /*
     * ---------------------------------------------------------
     * WORKER CHANGE
     * ---------------------------------------------------------
     *
     * Only worker name is visible.
     *
     * Internally:
     * assignedTo = workerId
     */
    function handleWorkerChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const workerId =
            e.target.value;

        setFormData((prev) => ({
            ...prev,
            assignedTo: workerId,
        }));

        if (error) {
            setError("");
        }
    }

    /*
     * ---------------------------------------------------------
     * SUBMIT
     * ---------------------------------------------------------
     */
    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setError("");

        if (!taskId) {
            setError(
                "Task ID is missing."
            );
            return;
        }

        if (!formData.projectId) {
            setError(
                "Please select a project."
            );
            return;
        }

        if (!formData.siteId) {
            setError(
                "Please select a site."
            );
            return;
        }

        if (!formData.assignedTo) {
            setError(
                "Please select a worker."
            );
            return;
        }

        if (!formData.title.trim()) {
            setError(
                "Task title is required."
            );
            return;
        }

        /*
         * Find selected worker.
         */
        const selectedWorker =
            workers.find(
                (worker) =>
                    worker.workerId ===
                    formData.assignedTo
            );

        if (!selectedWorker) {
            setError(
                "Selected worker could not be found for this site."
            );
            return;
        }

        /*
         * Find selected project.
         */
        const selectedProject =
            projects.find(
                (project) =>
                    project.projectId ===
                    formData.projectId
            );

        /*
         * Find selected site.
         */
        const selectedSite =
            sites.find(
                (site) =>
                    site.siteId ===
                    formData.siteId
            );

        if (!selectedSite) {
            setError(
                "Selected site could not be found."
            );
            return;
        }

        try {
            setSaving(true);

            /*
             * Send workerId internally.
             *
             * User sees only worker name.
             */
            const payload = {
                projectId:
                    formData.projectId,

                projectName:
                    selectedProject?.projectName ||
                    task?.projectName ||
                    "",

                siteId:
                    formData.siteId,

                siteName:
                    selectedSite.siteName,

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                priority:
                    formData.priority,

                status:
                    formData.status,

                /*
                 * Worker ID
                 */
                assignedTo:
                    selectedWorker.workerId,

                /*
                 * Worker name
                 */
                assignedToName:
                    selectedWorker.name,

                /*
                 * If worker email exists
                 * in DynamoDB, preserve it.
                 */
                assignedToEmail:
                    selectedWorker.email ||
                    "",

                dueDate:
                    formData.dueDate,

                remarks:
                    formData.remarks.trim(),
            };

            const response =
                await fetch(
                    `/api/construction/tasks/${taskId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials: "include",

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
                        "Failed to update task"
                );
            }

            router.push(
                `/DriWE-Construction/tasks/${taskId}`
            );

            router.refresh();
        } catch (err) {
            console.error(
                "Failed to update task:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update task"
            );
        } finally {
            setSaving(false);
        }
    }

    /*
     * ---------------------------------------------------------
     * LOADING
     * ---------------------------------------------------------
     */
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>
                            Loading task...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * ---------------------------------------------------------
     * TASK NOT FOUND
     * ---------------------------------------------------------
     */
    if (!task) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-3xl px-4 py-10">
                    <Link
                        href="/DriWE-Construction/tasks"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tasks
                    </Link>

                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400" />

                            <p className="text-red-300">
                                {error ||
                                    "Task not found."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * ---------------------------------------------------------
     * PAGE
     * ---------------------------------------------------------
     */
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={`/DriWE-Construction/tasks/${taskId}`}
                        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Task
                    </Link>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                                    <ClipboardList className="h-5 w-5 text-yellow-400" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-white">
                                        Edit Task
                                    </h1>

                                    <p className="text-sm text-zinc-400">
                                        Update construction task details
                                    </p>
                                </div>
                            </div>
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

                        {/* ================================================= */}
                        {/* PROJECT / SITE / WORKER */}
                        {/* ================================================= */}

                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
                                    <Building2 className="h-4 w-4 text-yellow-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Assignment
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Select project, site and worker
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">

                                {/* ================================================= */}
                                {/* PROJECT */}
                                {/* ================================================= */}

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
                                            saving
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">
                                            Select Project
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

                                {/* ================================================= */}
                                {/* SITE */}
                                {/* ================================================= */}

                                <div>
                                    <label
                                        htmlFor="siteId"
                                        className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
                                    >
                                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />

                                        Site

                                        <span className="text-red-400">
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
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                    {site.siteName}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* ================================================= */}
                                {/* WORKER */}
                                {/* ================================================= */}

                                <div>
                                    <label
                                        htmlFor="assignedTo"
                                        className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
                                    >
                                        <User className="h-3.5 w-3.5 text-zinc-500" />

                                        Worker

                                        <span className="text-red-400">
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
                                            handleWorkerChange
                                        }
                                        disabled={
                                            !formData.siteId ||
                                            loadingWorkers ||
                                            saving
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        Only workers from the selected site are shown.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ================================================= */}
                        {/* TASK INFORMATION */}
                        {/* ================================================= */}

                        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">

                            <div className="mb-5">
                                <h2 className="font-semibold text-white">
                                    Task Information
                                </h2>

                                <p className="text-xs text-zinc-500">
                                    Update the task details and requirements
                                </p>
                            </div>

                            <div className="space-y-5">

                                {/* Title */}
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
                                        disabled={
                                            saving
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
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
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={5}
                                        placeholder="Describe the task..."
                                        disabled={
                                            saving
                                        }
                                        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* Priority / Status / Due Date */}
                                <div className="grid gap-5 md:grid-cols-3">

                                    {/* Priority */}
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
                                            disabled={
                                                saving
                                            }
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
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

                                    {/* Status */}
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
                                            disabled={
                                                saving
                                            }
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
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

                                    {/* Due Date */}
                                    <div>
                                        <label
                                            htmlFor="dueDate"
                                            className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
                                        >
                                            <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />

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
                                            disabled={
                                                saving
                                            }
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Remarks */}
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
                                        rows={4}
                                        placeholder="Add any additional remarks..."
                                        disabled={
                                            saving
                                        }
                                        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ================================================= */}
                        {/* ACTIONS */}
                        {/* ================================================= */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Link
                                href={`/DriWE-Construction/tasks/${taskId}`}
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
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
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