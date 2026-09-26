"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import Link from "next/link";
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TaskStatus =
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Delayed";

type Priority =
    | "Low"
    | "Medium"
    | "High";

interface Project {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
}

interface Site {
    siteId: string;
    projectId: string;
    siteName: string;
    location?: string;
    active?: boolean;
}

interface Worker {
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
}

interface ConstructionTask {
    taskId: string;

    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    title: string;
    description?: string;

    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;

    assignedBy?: string;
    assignedByName?: string;

    priority?: Priority;
    status: TaskStatus;

    startDate?: string;
    dueDate?: string;

    remarks?: string;

    completionDescription?: string;
    completionLink?: string;
    completedAt?: string;

    createdBy?: string;
    createdByName?: string;

    createdAt: string;
    updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function getStatusClass(
    status: TaskStatus
) {
    switch (status) {
        case "Completed":
            return "border-green-500/30 bg-green-500/10 text-green-400";

        case "In Progress":
            return "border-blue-500/30 bg-blue-500/10 text-blue-400";

        case "Delayed":
            return "border-red-500/30 bg-red-500/10 text-red-400";

        default:
            return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }
}

function getPriorityClass(
    priority?: Priority
) {
    switch (priority) {
        case "High":
            return "text-red-400";

        case "Medium":
            return "text-yellow-400";

        default:
            return "text-green-400";
    }
}

function isOverdue(
    task: ConstructionTask
) {
    if (
        task.status === "Completed" ||
        !task.dueDate
    ) {
        return false;
    }

    const due = new Date(task.dueDate);
    const now = new Date();

    due.setHours(
        23,
        59,
        59,
        999
    );

    return due < now;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ConstructionTasksPage() {
    const [tasks, setTasks] = useState<
        ConstructionTask[]
    >([]);

    const [projects, setProjects] = useState<
        Project[]
    >([]);

    const [sites, setSites] = useState<
        Site[]
    >([]);

    const [workers, setWorkers] = useState<
        Worker[]
    >([]);

    const [loading, setLoading] =
        useState(true);

    const [loadingProjects, setLoadingProjects] =
        useState(false);

    const [loadingSites, setLoadingSites] =
        useState(false);

    const [loadingWorkers, setLoadingWorkers] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<
            "All" | TaskStatus
        >("All");

    const [priorityFilter, setPriorityFilter] =
        useState<
            "All" | Priority
        >("All");

    const [projectFilter, setProjectFilter] =
        useState("All");

    const [showForm, setShowForm] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState<ConstructionTask | null>(
            null
        );

    const [deleteTask, setDeleteTask] =
        useState<ConstructionTask | null>(
            null
        );

    const [form, setForm] = useState({
        projectId: "",
        siteId: "",
        title: "",
        description: "",
        priority: "Medium" as Priority,
        status: "Pending" as TaskStatus,
        startDate: "",
        dueDate: "",
        assignedTo: "",
        remarks: "",
        completionDescription: "",
        completionLink: "",
    });

    /* ---------------------------------------------------------------------- */
    /* Load Projects                                                          */
    /* ---------------------------------------------------------------------- */

    async function loadProjects() {
        try {
            setLoadingProjects(true);

            const response = await fetch(
                "/api/construction/projects",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load projects"
                );
            }

            setProjects(
                Array.isArray(
                    data?.projects
                )
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
        } finally {
            setLoadingProjects(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Load All Sites                                                         */
    /* ---------------------------------------------------------------------- */

    async function loadSites() {
        try {
            const response = await fetch(
                "/api/construction/sites",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load sites"
                );
            }

            setSites(
                Array.isArray(
                    data?.sites
                )
                    ? data.sites
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load sites:",
                err
            );
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Load Workers For Selected Site                                         */
    /* ---------------------------------------------------------------------- */

    async function loadWorkers(
        siteId: string
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
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load workers"
                );
            }

            const apiWorkers: Worker[] =
                Array.isArray(
                    data?.workers
                )
                    ? data.workers
                    : [];

            /*
             * Safety filter:
             * only workers belonging to the selected
             * site are allowed into the dropdown.
             */
            const siteWorkers =
                apiWorkers.filter(
                    (worker) =>
                        worker.siteId ===
                        siteId
                );

            /*
             * Do not show inactive workers.
             */
            const activeWorkers =
                siteWorkers.filter(
                    (worker) =>
                        worker.active !== false
                );

            setWorkers(
                activeWorkers
            );
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

    /* ---------------------------------------------------------------------- */
    /* Load Tasks                                                             */
    /* ---------------------------------------------------------------------- */

    async function loadTasks() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "/api/construction/tasks",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load tasks"
                );
            }

            setTasks(
                Array.isArray(
                    data?.tasks
                )
                    ? data.tasks
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load tasks:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load tasks"
            );
        } finally {
            setLoading(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Initial Load                                                           */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        loadTasks();
        loadProjects();
        loadSites();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Sites For Selected Project                                             */
    /* ---------------------------------------------------------------------- */

    const formSites = useMemo(() => {
        if (!form.projectId) {
            return [];
        }

        return sites.filter(
            (site) =>
                site.projectId ===
                form.projectId
        );
    }, [
        sites,
        form.projectId,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Filtered Tasks                                                         */
    /* ---------------------------------------------------------------------- */

    const filteredTasks =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return tasks.filter(
                (task) => {
                    const matchesSearch =
                        !searchValue ||
                        task.title
                            .toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        task.projectName
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        task.siteName
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        task.assignedToName
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            );

                    const matchesStatus =
                        statusFilter ===
                            "All" ||
                        task.status ===
                            statusFilter;

                    const matchesPriority =
                        priorityFilter ===
                            "All" ||
                        task.priority ===
                            priorityFilter;

                    const matchesProject =
                        projectFilter ===
                            "All" ||
                        task.projectId ===
                            projectFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority &&
                        matchesProject
                    );
                }
            );
        }, [
            tasks,
            search,
            statusFilter,
            priorityFilter,
            projectFilter,
        ]);

    /* ---------------------------------------------------------------------- */
    /* Statistics                                                             */
    /* ---------------------------------------------------------------------- */

    const statistics =
        useMemo(() => {
            return {
                total: tasks.length,

                pending: tasks.filter(
                    (task) =>
                        task.status ===
                        "Pending"
                ).length,

                inProgress:
                    tasks.filter(
                        (task) =>
                            task.status ===
                            "In Progress"
                    ).length,

                completed:
                    tasks.filter(
                        (task) =>
                            task.status ===
                            "Completed"
                    ).length,

                delayed:
                    tasks.filter(
                        (task) =>
                            task.status ===
                            "Delayed"
                    ).length,

                overdue:
                    tasks.filter(
                        (task) =>
                            isOverdue(
                                task
                            )
                    ).length,
            };
        }, [tasks]);

    /* ---------------------------------------------------------------------- */
    /* Reset Form                                                             */
    /* ---------------------------------------------------------------------- */

    function resetForm() {
        setForm({
            projectId: "",
            siteId: "",
            title: "",
            description: "",
            priority: "Medium",
            status: "Pending",
            startDate: "",
            dueDate: "",
            assignedTo: "",
            remarks: "",
            completionDescription:
                "",
            completionLink: "",
        });

        setWorkers([]);
        setEditingTask(null);
    }

    /* ---------------------------------------------------------------------- */
    /* Open Create                                                            */
    /* ---------------------------------------------------------------------- */

    function openCreateForm() {
        resetForm();

        setError("");
        setSuccess("");

        setShowForm(true);
    }

    /* ---------------------------------------------------------------------- */
    /* Open Edit                                                              */
    /* ---------------------------------------------------------------------- */

    async function openEditForm(
        task: ConstructionTask
    ) {
        setEditingTask(task);

        setForm({
            projectId:
                task.projectId || "",

            siteId:
                task.siteId || "",

            title:
                task.title || "",

            description:
                task.description || "",

            priority:
                task.priority ||
                "Medium",

            status:
                task.status ||
                "Pending",

            startDate:
                task.startDate
                    ? task.startDate.slice(
                          0,
                          10
                      )
                    : "",

            dueDate:
                task.dueDate
                    ? task.dueDate.slice(
                          0,
                          10
                      )
                    : "",

            /*
             * Existing task's assignedTo is
             * the workerId.
             */
            assignedTo:
                task.assignedTo || "",

            remarks:
                task.remarks || "",

            completionDescription:
                task.completionDescription ||
                "",

            completionLink:
                task.completionLink ||
                "",
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        /*
         * Load workers for the task's site.
         */
        if (task.siteId) {
            await loadWorkers(
                task.siteId
            );
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Project Change                                                         */
    /* ---------------------------------------------------------------------- */

    function handleProjectChange(
        projectId: string
    ) {
        setForm((previous) => ({
            ...previous,
            projectId,
            siteId: "",
            assignedTo: "",
        }));

        /*
         * Clear old workers because the project
         * has changed.
         */
        setWorkers([]);

        setError("");
    }

    /* ---------------------------------------------------------------------- */
    /* Site Change                                                            */
    /* ---------------------------------------------------------------------- */

    async function handleSiteChange(
        siteId: string
    ) {
        setForm((previous) => ({
            ...previous,
            siteId,
            assignedTo: "",
        }));

        /*
         * Important:
         * Changing the site immediately clears
         * the previous worker.
         */
        setWorkers([]);

        setError("");

        if (siteId) {
            await loadWorkers(
                siteId
            );
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Worker Change                                                          */
    /* ---------------------------------------------------------------------- */

    function handleWorkerChange(
        workerId: string
    ) {
        /*
         * Only workerId is stored in the form.
         *
         * Worker name is obtained automatically
         * from the workers array when submitting.
         */
        setForm((previous) => ({
            ...previous,
            assignedTo: workerId,
        }));

        setError("");
    }

    /* ---------------------------------------------------------------------- */
    /* Submit                                                                 */
    /* ---------------------------------------------------------------------- */

    async function handleSubmit(
        event: React.FormEvent
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!form.projectId) {
            setError(
                "Please select a project."
            );
            return;
        }

        if (!form.siteId) {
            setError(
                "Please select a site."
            );
            return;
        }

        if (!form.title.trim()) {
            setError(
                "Task title is required."
            );
            return;
        }

        if (!form.assignedTo) {
            setError(
                "Please select a worker."
            );
            return;
        }

        if (
            form.startDate &&
            form.dueDate &&
            form.dueDate <
                form.startDate
        ) {
            setError(
                "Due date cannot be before the start date."
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
                    form.projectId
            );

        /*
         * Find selected site.
         */
        const selectedSite =
            sites.find(
                (site) =>
                    site.siteId ===
                    form.siteId
            );

        /*
         * Find selected worker.
         */
        const selectedWorker =
            workers.find(
                (worker) =>
                    worker.workerId ===
                    form.assignedTo
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
         * Worker MUST belong to selected site.
         */
        if (
            selectedWorker.siteId !==
            form.siteId
        ) {
            setError(
                "Selected worker does not belong to the selected site."
            );
            return;
        }

        try {
            setSaving(true);

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
                    form.title.trim(),

                description:
                    form.description.trim() ||
                    undefined,

                priority:
                    form.priority,

                status:
                    form.status,

                startDate:
                    form.startDate ||
                    undefined,

                dueDate:
                    form.dueDate ||
                    undefined,

                /*
                 * Worker ID stored internally.
                 */
                assignedTo:
                    selectedWorker.workerId,

                /*
                 * Worker name automatically
                 * obtained from worker record.
                 */
                assignedToName:
                    selectedWorker.name,

                remarks:
                    form.remarks.trim() ||
                    undefined,

                completionDescription:
                    form.completionDescription.trim() ||
                    undefined,

                completionLink:
                    form.completionLink.trim() ||
                    undefined,
            };

            const url =
                editingTask
                    ? `/api/construction/tasks/${editingTask.taskId}`
                    : "/api/construction/tasks";

            const method =
                editingTask
                    ? "PUT"
                    : "POST";

            const response =
                await fetch(url, {
                    method,
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials:
                        "include",
                    body: JSON.stringify(
                        payload
                    ),
                });

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to save task"
                );
            }

            setSuccess(
                editingTask
                    ? "Task updated successfully."
                    : "Task created successfully."
            );

            setShowForm(false);

            resetForm();

            await loadTasks();
        } catch (err) {
            console.error(
                "Failed to save task:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save task"
            );
        } finally {
            setSaving(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Delete                                                                 */
    /* ---------------------------------------------------------------------- */

    async function handleDelete() {
        if (!deleteTask) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response =
                await fetch(
                    `/api/construction/tasks/${deleteTask.taskId}`,
                    {
                        method: "DELETE",
                        credentials:
                            "include",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to delete task"
                );
            }

            setDeleteTask(null);

            setSuccess(
                "Task deleted successfully."
            );

            await loadTasks();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete task"
            );
        } finally {
            setSaving(false);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Refresh                                                                */
    /* ---------------------------------------------------------------------- */

    async function handleRefresh() {
        setError("");
        setSuccess("");

        await Promise.all([
            loadTasks(),
            loadProjects(),
            loadSites(),
        ]);
    }

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            {/* ==============================================================
                HEADER
            ============================================================== */}

            <div className="border-b border-zinc-800 bg-zinc-950/95">
                <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <div className="mb-2">
                                <Link
                                    href="/DriWE-Construction"
                                    className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-yellow-400"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Construction
                                </Link>
                            </div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                                    <ClipboardList className="h-5 w-5 text-yellow-400" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Construction Tasks
                                    </h1>

                                    <p className="text-sm text-zinc-400">
                                        Manage project and site tasks
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={
                                    handleRefresh
                                }
                                disabled={loading}
                                className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />

                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={
                                    openCreateForm
                                }
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-yellow-400 px-4 text-sm font-semibold text-black transition hover:bg-yellow-300"
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==============================================================
                MAIN
            ============================================================== */}

            <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

                {/* Alerts */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">

                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="flex-1">
                            {error}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            className="text-red-300 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">

                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="flex-1">
                            {success}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                            className="text-green-300 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* ==========================================================
                    STATISTICS
                =========================================================== */}

                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

                    <StatCard
                        label="Total"
                        value={
                            statistics.total
                        }
                        icon={
                            <ClipboardList className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Pending"
                        value={
                            statistics.pending
                        }
                        icon={
                            <Clock className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="In Progress"
                        value={
                            statistics.inProgress
                        }
                        icon={
                            <Loader2 className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Completed"
                        value={
                            statistics.completed
                        }
                        icon={
                            <CheckCircle2 className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Delayed"
                        value={
                            statistics.delayed
                        }
                        icon={
                            <AlertTriangle className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Overdue"
                        value={
                            statistics.overdue
                        }
                        icon={
                            <AlertTriangle className="h-5 w-5" />
                        }
                    />
                </div>

                {/* ==========================================================
                    FILTERS
                =========================================================== */}

                <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">

                    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_220px]">

                        <div className="relative">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                            <input
                                value={search}
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search tasks, project, site, worker..."
                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400"
                            />
                        </div>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setStatusFilter(
                                    event.target
                                        .value as
                                        | "All"
                                        | TaskStatus
                                )
                            }
                            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-yellow-400"
                        >
                            <option value="All">
                                All Statuses
                            </option>

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

                        <select
                            value={
                                priorityFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setPriorityFilter(
                                    event.target
                                        .value as
                                        | "All"
                                        | Priority
                                )
                            }
                            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-yellow-400"
                        >
                            <option value="All">
                                All Priorities
                            </option>

                            <option value="High">
                                High
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="Low">
                                Low
                            </option>
                        </select>

                        <select
                            value={
                                projectFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setProjectFilter(
                                    event.target
                                        .value
                                )
                            }
                            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-yellow-400"
                        >
                            <option value="All">
                                All Projects
                            </option>

                            {projects.map(
                                (
                                    project
                                ) => (
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
                </div>

                {/* ==========================================================
                    TASK TABLE
                =========================================================== */}

                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">

                    <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">

                        <div>
                            <h2 className="font-semibold text-white">
                                Task List
                            </h2>

                            <p className="mt-0.5 text-xs text-zinc-500">
                                Showing{" "}
                                {
                                    filteredTasks.length
                                }{" "}
                                of{" "}
                                {
                                    tasks.length
                                }{" "}
                                tasks
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">

                            <div className="flex items-center gap-3 text-sm text-zinc-400">

                                <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />

                                Loading tasks...
                            </div>
                        </div>
                    ) : filteredTasks.length ===
                      0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
                                <ClipboardList className="h-6 w-6 text-zinc-500" />
                            </div>

                            <h3 className="font-medium text-white">
                                No tasks found
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-zinc-500">
                                Create a task or
                                change your
                                filters to see
                                construction
                                tasks.
                            </p>

                            <button
                                type="button"
                                onClick={
                                    openCreateForm
                                }
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1100px] text-left">

                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase tracking-wider text-zinc-500">

                                        <th className="px-5 py-3 font-medium">
                                            Task
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Project / Site
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Assigned Worker
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Priority
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Due Date
                                        </th>

                                        <th className="px-5 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-zinc-800">

                                    {filteredTasks.map(
                                        (
                                            task
                                        ) => (
                                            <tr
                                                key={
                                                    task.taskId
                                                }
                                                className="transition hover:bg-zinc-800/40"
                                            >

                                                <td className="px-5 py-4 align-top">

                                                    <div className="max-w-[300px]">

                                                        <div className="font-medium text-white">
                                                            {
                                                                task.title
                                                            }
                                                        </div>

                                                        {task.description && (
                                                            <div className="mt-1 line-clamp-2 text-xs text-zinc-500">
                                                                {
                                                                    task.description
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top">

                                                    <div className="text-sm text-zinc-200">
                                                        {
                                                            task.projectName ||
                                                            "-"
                                                        }
                                                    </div>

                                                    <div className="mt-1 text-xs text-zinc-500">
                                                        {
                                                            task.siteName ||
                                                            "-"
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top">

                                                    {task.assignedToName ? (
                                                        <div className="text-sm text-zinc-200">
                                                            {
                                                                task.assignedToName
                                                            }
                                                        </div>
                                                    ) : task.assignedTo ? (
                                                        <div className="text-sm text-zinc-400">
                                                            {
                                                                task.assignedTo
                                                            }
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-zinc-600">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 align-top">

                                                    <span
                                                        className={`text-sm font-medium ${getPriorityClass(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {
                                                            task.priority ||
                                                            "Medium"
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 align-top">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                                task.status
                                                            )}`}
                                                        >
                                                            {
                                                                task.status
                                                            }
                                                        </span>

                                                        {isOverdue(
                                                            task
                                                        ) && (
                                                            <span className="text-xs font-medium text-red-400">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top">

                                                    <div
                                                        className={`text-sm ${
                                                            isOverdue(
                                                                task
                                                            )
                                                                ? "font-medium text-red-400"
                                                                : "text-zinc-300"
                                                        }`}
                                                    >
                                                        {formatDate(
                                                            task.dueDate
                                                        )}
                                                    </div>

                                                    {task.startDate && (
                                                        <div className="mt-1 text-xs text-zinc-600">
                                                            Start:{" "}
                                                            {formatDate(
                                                                task.startDate
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 align-top">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    task
                                                                )
                                                            }
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-400"
                                                            title="Edit task"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteTask(
                                                                    task
                                                                )
                                                            }
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                                                            title="Delete task"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* ==============================================================
                CREATE / EDIT MODAL
            ============================================================== */}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

                    <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">

                        {/* Modal Header */}

                        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {editingTask
                                        ? "Edit Construction Task"
                                        : "Create Construction Task"}
                                </h2>

                                <p className="mt-1 text-xs text-zinc-500">
                                    {editingTask
                                        ? "Update task details"
                                        : "Create a task under a project and site"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(
                                        false
                                    );
                                    resetForm();
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="flex min-h-0 flex-1 flex-col"
                        >

                            <div className="flex-1 space-y-6 overflow-y-auto p-6">

                                {/* =================================================
                                    ASSIGNMENT
                                ================================================== */}

                                <div>

                                    <h3 className="mb-4 text-sm font-semibold text-yellow-400">
                                        Assignment
                                    </h3>

                                    <div className="grid gap-4 md:grid-cols-3">

                                        {/* PROJECT */}

                                        <div>
                                            <label
                                                htmlFor="form-project"
                                                className="mb-1.5 block text-sm font-medium text-zinc-300"
                                            >
                                                Project
                                                <span className="ml-1 text-red-400">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                id="form-project"
                                                value={
                                                    form.projectId
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleProjectChange(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    loadingProjects ||
                                                    saving
                                                }
                                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">
                                                    {loadingProjects
                                                        ? "Loading projects..."
                                                        : "Select Project"}
                                                </option>

                                                {projects.map(
                                                    (
                                                        project
                                                    ) => (
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

                                        {/* SITE */}

                                        <div>
                                            <label
                                                htmlFor="form-site"
                                                className="mb-1.5 block text-sm font-medium text-zinc-300"
                                            >
                                                Site
                                                <span className="ml-1 text-red-400">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                id="form-site"
                                                value={
                                                    form.siteId
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleSiteChange(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    !form.projectId ||
                                                    loadingSites ||
                                                    saving
                                                }
                                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">
                                                    {!form.projectId
                                                        ? "Select project first"
                                                        : loadingSites
                                                        ? "Loading sites..."
                                                        : formSites.length ===
                                                          0
                                                        ? "No sites found"
                                                        : "Select Site"}
                                                </option>

                                                {formSites.map(
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
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        {/* WORKER */}

                                        <div>
                                            <label
                                                htmlFor="form-worker"
                                                className="mb-1.5 block text-sm font-medium text-zinc-300"
                                            >
                                                Assign Worker
                                                <span className="ml-1 text-red-400">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                id="form-worker"
                                                value={
                                                    form.assignedTo
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleWorkerChange(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    !form.siteId ||
                                                    loadingWorkers ||
                                                    saving
                                                }
                                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">
                                                    {!form.siteId
                                                        ? "Select site first"
                                                        : loadingWorkers
                                                        ? "Loading workers..."
                                                        : workers.length ===
                                                          0
                                                        ? "No workers found"
                                                        : "Select Worker"}
                                                </option>

                                                {workers.map(
                                                    (
                                                        worker
                                                    ) => (
                                                        <option
                                                            key={
                                                                worker.workerId
                                                            }
                                                            value={
                                                                worker.workerId
                                                            }
                                                        >
                                                            {
                                                                worker.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <p className="mt-1.5 text-xs text-zinc-600">
                                                Only workers from the selected site are shown.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* =================================================
                                    TASK DETAILS
                                ================================================== */}

                                <div>

                                    <h3 className="mb-4 text-sm font-semibold text-yellow-400">
                                        Task Details
                                    </h3>

                                    <div className="space-y-4">

                                        {/* TITLE */}

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                Task Title
                                                <span className="ml-1 text-red-400">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    form.title
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setForm(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            title: event
                                                                .target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                placeholder="Enter task title"
                                                disabled={
                                                    saving
                                                }
                                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* DESCRIPTION */}

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                Description
                                            </label>

                                            <textarea
                                                value={
                                                    form.description
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setForm(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            description:
                                                                event
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                rows={
                                                    4
                                                }
                                                placeholder="Describe the task..."
                                                disabled={
                                                    saving
                                                }
                                                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* PRIORITY + STATUS */}

                                        <div className="grid gap-4 md:grid-cols-2">

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                    Priority
                                                </label>

                                                <select
                                                    value={
                                                        form.priority
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setForm(
                                                            (
                                                                previous
                                                            ) => ({
                                                                ...previous,
                                                                priority:
                                                                    event
                                                                        .target
                                                                        .value as Priority,
                                                            })
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-yellow-400"
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

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                    Status
                                                </label>

                                                <select
                                                    value={
                                                        form.status
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setForm(
                                                            (
                                                                previous
                                                            ) => ({
                                                                ...previous,
                                                                status:
                                                                    event
                                                                        .target
                                                                        .value as TaskStatus,
                                                            })
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-yellow-400"
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

                                        <div className="grid gap-4 md:grid-cols-2">

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                    Start Date
                                                </label>

                                                <input
                                                    type="date"
                                                    value={
                                                        form.startDate
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setForm(
                                                            (
                                                                previous
                                                            ) => ({
                                                                ...previous,
                                                                startDate:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-yellow-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                    Due Date
                                                </label>

                                                <input
                                                    type="date"
                                                    value={
                                                        form.dueDate
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setForm(
                                                            (
                                                                previous
                                                            ) => ({
                                                                ...previous,
                                                                dueDate:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-yellow-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* =================================================
                                    REMARKS
                                ================================================== */}

                                <div>

                                    <h3 className="mb-3 text-sm font-semibold text-yellow-400">
                                        Remarks
                                    </h3>

                                    <textarea
                                        value={
                                            form.remarks
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    remarks:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        rows={
                                            3
                                        }
                                        placeholder="Additional remarks..."
                                        disabled={
                                            saving
                                        }
                                        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400"
                                    />
                                </div>

                                {/* =================================================
                                    COMPLETION
                                ================================================== */}

                                <div>

                                    <h3 className="mb-3 text-sm font-semibold text-yellow-400">
                                        Completion Details
                                    </h3>

                                    <div className="space-y-4">

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                Completion Description
                                            </label>

                                            <textarea
                                                value={
                                                    form.completionDescription
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setForm(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            completionDescription:
                                                                event
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                rows={
                                                    3
                                                }
                                                placeholder="Describe the completed work..."
                                                disabled={
                                                    saving
                                                }
                                                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                                Completion Link
                                            </label>

                                            <input
                                                type="url"
                                                value={
                                                    form.completionLink
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setForm(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            completionLink:
                                                                event
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                placeholder="https://..."
                                                disabled={
                                                    saving
                                                }
                                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* =====================================================
                                MODAL FOOTER
                            ====================================================== */}

                            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 bg-zinc-950 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(
                                            false
                                        );
                                        resetForm();
                                    }}
                                    disabled={
                                        saving
                                    }
                                    className="h-10 rounded-lg border border-zinc-700 px-5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}

                                    {editingTask
                                        ? "Update Task"
                                        : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==============================================================
                DELETE CONFIRMATION
            ============================================================== */}

            {deleteTask && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
                            <Trash2 className="h-5 w-5 text-red-400" />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            Delete Task?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                            Are you sure you want to
                            delete{" "}
                            <span className="font-medium text-white">
                                "{deleteTask.title}"
                            </span>
                            ? This action cannot be
                            undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteTask(
                                        null
                                    )
                                }
                                disabled={
                                    saving
                                }
                                className="h-10 rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    saving
                                }
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}

                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">

            <div className="flex items-center justify-between">

                <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {label}
                </div>

                <div className="text-zinc-500">
                    {icon}
                </div>
            </div>

            <div className="mt-2 text-2xl font-bold text-white">
                {value}
            </div>
        </div>
    );
}