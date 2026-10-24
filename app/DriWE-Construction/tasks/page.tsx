
"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
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

type TaskStatus = "Pending" | "In Progress" | "Completed" | "Delayed";
type Priority = "Low" | "Medium" | "High";

interface Project {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
}

interface Worker {
    personId?: string;
    workerId?: string;
    userId?: string;
    companyId?: string;
    projectId?: string;
    projectName?: string;
    name: string;
    phone?: string;
    role?: string;
    workerType?: string;
    active?: boolean;
    personType?: "Worker" | "Project Manager" | "Project Creator";
}

function getWorkerSelectionId(worker: Worker): string {
    return (
        worker.personId?.trim() ||
        worker.workerId?.trim() ||
        worker.userId?.trim() ||
        ""
    );
}

interface ConstructionTask {
    taskId: string;
    companyId?: string;
    companyName?: string;
    projectId: string;
    projectName?: string;
    siteId?: string;
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
    createdAt?: string;
    updatedAt?: string;
}

interface TaskForm {
    projectId: string;
    title: string;
    description: string;
    priority: Priority;
    status: TaskStatus;
    startDate: string;
    dueDate: string;
    assignedTo: string;
    remarks: string;
    completionDescription: string;
    completionLink: string;
}

const EMPTY_FORM: TaskForm = {
    projectId: "",
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    startDate: "",
    dueDate: "",
    assignedTo: "",
    remarks: "",
    completionDescription: "",
    completionLink: "",
};

const inputClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
    "w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50";

const labelClass =
    "mb-1.5 block text-sm font-medium text-black";

const sectionHeadingClass =
    "mb-4 text-sm font-semibold text-black";

async function readResponse(response: Response): Promise<any> {
    const text = await response.text();

    let data: any;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error(
            `The server returned an invalid response (HTTP ${response.status}). Check the API route and server terminal.`
        );
    }

    if (!response.ok) {
        throw new Error(
            data?.error ||
                data?.message ||
                `Request failed with status ${response.status}`
        );
    }

    if (data?.success === false) {
        throw new Error(
            data?.error || data?.message || "Request failed"
        );
    }

    return data;
}

function formatDate(value?: string) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function toDateInput(value?: string) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
}

function getStatusClass(status: TaskStatus) {
    switch (status) {
        case "Completed":
            return "border-green-200 bg-green-50 text-green-700";
        case "In Progress":
            return "border-blue-200 bg-blue-50 text-blue-700";
        case "Delayed":
            return "border-red-200 bg-red-50 text-red-700";
        default:
            return "border-amber-200 bg-amber-50 text-amber-800";
    }
}

function getPriorityClass(priority?: Priority) {
    switch (priority) {
        case "High":
            return "text-red-700";
        case "Medium":
            return "text-amber-700";
        default:
            return "text-green-700";
    }
}

function isOverdue(task: ConstructionTask) {
    if (task.status === "Completed" || !task.dueDate) return false;

    const due = new Date(task.dueDate);

    if (Number.isNaN(due.getTime())) return false;

    due.setHours(23, 59, 59, 999);

    return due < new Date();
}

export default function ConstructionTasksPage() {
    const [tasks, setTasks] = useState<ConstructionTask[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingWorkers, setLoadingWorkers] = useState(false);
    const [saving, setSaving] = useState(false);

    const [userRole, setUserRole] = useState("");
    const normalizedRole = userRole.trim().toUpperCase();

    const isConstructionWorker =
        normalizedRole === "CONSTRUCTIONEMPLOYEE";

    const canManageTasks = [
        "ADMIN",
        "CONSTRUCTIONADMIN",
        "CONSTRUCTIONPROJECTMANAGER",
    ].includes(normalizedRole);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState<"All" | TaskStatus>("All");

    const [priorityFilter, setPriorityFilter] =
        useState<"All" | Priority>("All");

    const [projectFilter, setProjectFilter] = useState("All");
    const [showForm, setShowForm] = useState(false);

    const [editingTask, setEditingTask] =
        useState<ConstructionTask | null>(null);

    const [deleteTask, setDeleteTask] =
        useState<ConstructionTask | null>(null);

    const [form, setForm] = useState<TaskForm>({ ...EMPTY_FORM });

    const loadProjects = useCallback(async () => {
        setLoadingProjects(true);

        try {
            const response = await fetch(
                "/api/construction/projects",
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await readResponse(response);

            setProjects(
                Array.isArray(data?.projects)
                    ? data.projects
                    : []
            );
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
    }, []);

    const loadTasks = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(
                "/api/construction/tasks",
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await readResponse(response);

            setTasks(
                Array.isArray(data?.tasks)
                    ? data.tasks
                    : []
            );
        } catch (err) {
            console.error("Failed to load tasks:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load tasks"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const loadWorkers = useCallback(
        async (projectId: string) => {
            if (!projectId) {
                setWorkers([]);
                return;
            }

            setLoadingWorkers(true);
            setWorkers([]);

            try {
                const response = await fetch(
                    `/api/construction/workers?projectId=${encodeURIComponent(projectId)}`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data = await readResponse(response);

                const apiWorkers: Worker[] =
                    Array.isArray(data?.workers)
                        ? data.workers
                        : [];

                setWorkers(
                    apiWorkers.filter(
                        (worker) =>
                            worker.personType === "Worker" &&
                            worker.active !== false &&
                            Boolean(getWorkerSelectionId(worker)) &&
                            (!worker.projectId ||
                                worker.projectId === projectId)
                    )
                );
            } catch (err) {
                console.error(
                    "Failed to load project workers:",
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
        },
        []
    );

    const loadCurrentUser = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/me", {
                credentials: "include",
                cache: "no-store",
            });

            const data = await readResponse(response);

            setUserRole(
                String(
                    data?.user?.role || data?.role || ""
                ).trim()
            );
        } catch (err) {
            console.error("Failed to load current user:", err);
        }
    }, []);

    useEffect(() => {
        void loadTasks();
        void loadProjects();
        void loadCurrentUser();
    }, [loadTasks, loadProjects, loadCurrentUser]);

    const filteredTasks = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesSearch =
                !searchValue ||
                (task.title || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                (task.projectName || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                (task.siteName || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                (task.assignedToName || "")
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "All" ||
                task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" ||
                task.priority === priorityFilter;

            const matchesProject =
                projectFilter === "All" ||
                task.projectId === projectFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesProject
            );
        });
    }, [
        tasks,
        search,
        statusFilter,
        priorityFilter,
        projectFilter,
    ]);

    const statistics = useMemo(
        () => ({
            total: tasks.length,
            pending: tasks.filter(
                (task) => task.status === "Pending"
            ).length,
            inProgress: tasks.filter(
                (task) => task.status === "In Progress"
            ).length,
            completed: tasks.filter(
                (task) => task.status === "Completed"
            ).length,
            delayed: tasks.filter(
                (task) => task.status === "Delayed"
            ).length,
            overdue: tasks.filter(isOverdue).length,
        }),
        [tasks]
    );

    function resetForm() {
        setForm({ ...EMPTY_FORM });
        setWorkers([]);
        setEditingTask(null);
    }

    function openCreateForm() {
        resetForm();
        setError("");
        setSuccess("");
        setShowForm(true);
    }

    async function openEditForm(task: ConstructionTask) {
        setEditingTask(task);

        setForm({
            projectId: task.projectId || "",
            title: task.title || "",
            description: task.description || "",
            priority: task.priority || "Medium",
            status: task.status || "Pending",
            startDate: toDateInput(task.startDate),
            dueDate: toDateInput(task.dueDate),
            assignedTo: task.assignedTo || "",
            remarks: task.remarks || "",
            completionDescription:
                task.completionDescription || "",
            completionLink: task.completionLink || "",
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        if (task.projectId && !isConstructionWorker) {
            await loadWorkers(task.projectId);
        }
    }

    async function handleProjectChange(projectId: string) {
        setForm((previous) => ({
            ...previous,
            projectId,
            assignedTo: "",
        }));

        setWorkers([]);
        setError("");

        if (projectId) {
            await loadWorkers(projectId);
        }
    }

    function closeForm() {
        if (saving) return;

        setShowForm(false);
        resetForm();
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (isConstructionWorker) {
            if (!editingTask) {
                setError(
                    "You can update assigned tasks only."
                );
                return;
            }

            try {
                setSaving(true);

                const response = await fetch(
                    `/api/construction/tasks/${editingTask.taskId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            status: form.status,
                            remarks: form.remarks.trim(),
                            completionDescription:
                                form.completionDescription.trim(),
                            completionLink:
                                form.completionLink.trim(),
                        }),
                    }
                );

                await readResponse(response);

                setShowForm(false);
                resetForm();
                setSuccess(
                    "Task progress updated successfully."
                );

                await loadTasks();
            } catch (err) {
                console.error(
                    "Failed to update task progress:",
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

            return;
        }

        if (!form.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!form.title.trim()) {
            setError("Task title is required.");
            return;
        }

        if (!form.assignedTo) {
            setError("Please select a worker.");
            return;
        }

        if (
            form.startDate &&
            form.dueDate &&
            form.dueDate < form.startDate
        ) {
            setError(
                "Due date cannot be before the start date."
            );
            return;
        }

        const selectedProject = projects.find(
            (project) =>
                project.projectId === form.projectId
        );

        const selectedWorker = workers.find(
            (worker) =>
                getWorkerSelectionId(worker) ===
                form.assignedTo
        );

        if (!selectedProject) {
            setError(
                "Selected project could not be found."
            );
            return;
        }

        if (!selectedWorker) {
            setError(
                "Selected worker could not be found. Please select the project and worker again."
            );
            return;
        }

        if (
            selectedWorker.projectId &&
            selectedWorker.projectId !== form.projectId
        ) {
            setError(
                "Selected worker does not belong to this project."
            );
            return;
        }

        const payload = {
            projectId: selectedProject.projectId,
            projectName: selectedProject.projectName,
            title: form.title.trim(),
            description:
                form.description.trim() || undefined,
            priority: form.priority,
            status: form.status,
            startDate: form.startDate || undefined,
            dueDate: form.dueDate || undefined,
            assignedTo:
                getWorkerSelectionId(selectedWorker),
            assignedToName: selectedWorker.name,
            remarks: form.remarks.trim() || undefined,
            completionDescription:
                form.completionDescription.trim() ||
                undefined,
            completionLink:
                form.completionLink.trim() || undefined,
        };

        try {
            setSaving(true);

            const response = await fetch(
                editingTask
                    ? `/api/construction/tasks/${editingTask.taskId}`
                    : "/api/construction/tasks",
                {
                    method: editingTask ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            await readResponse(response);

            setShowForm(false);
            resetForm();

            setSuccess(
                editingTask
                    ? "Task updated successfully."
                    : "Task created successfully."
            );

            await loadTasks();
        } catch (err) {
            console.error("Failed to save task:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save task"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTask) return;

        try {
            setSaving(true);
            setError("");

            const response = await fetch(
                `/api/construction/tasks/${deleteTask.taskId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            await readResponse(response);

            setDeleteTask(null);
            setSuccess("Task deleted successfully.");

            await loadTasks();
        } catch (err) {
            console.error("Failed to delete task:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete task"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleRefresh() {
        setError("");
        setSuccess("");

        await Promise.all([
            loadTasks(),
            loadProjects(),
        ]);
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2">
                                <Link
                                    href="/DriWE-Construction"
                                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition hover:text-black"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Construction
                                </Link>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                                    <ClipboardList className="h-5 w-5 text-black" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-black">
                                        Construction Tasks
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        Manage and assign tasks by project
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        loading ? "animate-spin" : ""
                                    }`}
                                />
                                Refresh
                            </button>

                            {canManageTasks && (
                                <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Task
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="flex-1">{error}</div>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="flex-1">{success}</div>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss success message"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        label="Total"
                        value={statistics.total}
                        icon={<ClipboardList className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Pending"
                        value={statistics.pending}
                        icon={<Clock className="h-5 w-5" />}
                    />
                    <StatCard
                        label="In Progress"
                        value={statistics.inProgress}
                        icon={<Loader2 className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Completed"
                        value={statistics.completed}
                        icon={<CheckCircle2 className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Delayed"
                        value={statistics.delayed}
                        icon={<AlertTriangle className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Overdue"
                        value={statistics.overdue}
                        icon={<AlertTriangle className="h-5 w-5" />}
                    />
                </div>

                {/* Search and filters */}
                <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_220px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search tasks, project or worker..."
                                className={`${inputClass} pl-10`}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as
                                        | "All"
                                        | TaskStatus
                                )
                            }
                            className={inputClass}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Delayed">Delayed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(event) =>
                                setPriorityFilter(
                                    event.target.value as
                                        | "All"
                                        | Priority
                                )
                            }
                            className={inputClass}
                        >
                            <option value="All">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        <select
                            value={projectFilter}
                            onChange={(event) =>
                                setProjectFilter(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="All">All Projects</option>
                            {projects.map((project, index) => (
                                <option
                                    key={`${project.projectId || project.projectName}-${index}`}
                                    value={project.projectId}
                                >
                                    {project.projectName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Task list */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-black">
                                Task List
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Showing {filteredTasks.length} of{" "}
                                {tasks.length} tasks
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm text-gray-600">
                            <Loader2 className="h-5 w-5 animate-spin text-black" />
                            Loading tasks...
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                            <ClipboardList className="mb-4 h-10 w-10 text-gray-400" />
                            <h3 className="font-medium text-black">
                                No tasks found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Create a task or change your filters.
                            </p>

                            {canManageTasks && (
                                <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Task
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                                        <th className="px-5 py-3 font-medium">Task</th>
                                        <th className="px-5 py-3 font-medium">Project</th>
                                        <th className="px-5 py-3 font-medium">Assigned Worker</th>
                                        <th className="px-5 py-3 font-medium">Priority</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Due Date</th>
                                        <th className="px-5 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {filteredTasks.map((task) => (
                                        <tr
                                            key={task.taskId}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4 align-top">
                                                <div className="max-w-[300px]">
                                                    <div className="font-medium text-black">
                                                        {task.title}
                                                    </div>
                                                    {task.description && (
                                                        <div className="mt-1 line-clamp-2 text-xs text-gray-500">
                                                            {task.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 align-top text-sm text-gray-700">
                                                {task.projectName ||
                                                    projects.find(
                                                        (project) =>
                                                            project.projectId ===
                                                            task.projectId
                                                    )?.projectName ||
                                                    "-"}
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                {task.assignedToName ? (
                                                    <span className="text-sm text-gray-700">
                                                        {task.assignedToName}
                                                    </span>
                                                ) : task.assignedTo ? (
                                                    <span className="text-sm text-gray-600">
                                                        {task.assignedTo}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <span
                                                    className={`text-sm font-medium ${getPriorityClass(task.priority)}`}
                                                >
                                                    {task.priority || "Medium"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(task.status)}`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                    {isOverdue(task) && (
                                                        <span className="text-xs font-medium text-red-700">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div
                                                    className={`text-sm ${
                                                        isOverdue(task)
                                                            ? "font-medium text-red-700"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {formatDate(task.dueDate)}
                                                </div>
                                                {task.startDate && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Start:{" "}
                                                        {formatDate(task.startDate)}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void openEditForm(task)
                                                        }
                                                        title={
                                                            isConstructionWorker
                                                                ? "Update task progress"
                                                                : "Edit task"
                                                        }
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:border-black hover:bg-gray-100 hover:text-black"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    {!isConstructionWorker && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteTask(task)
                                                            }
                                                            title="Delete task"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Create / Edit Task Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-black">
                                    {isConstructionWorker
                                        ? "Update Assigned Task"
                                        : editingTask
                                          ? "Edit Construction Task"
                                          : "Create Construction Task"}
                                </h2>
                                <p className="mt-1 text-xs text-gray-600">
                                    {isConstructionWorker
                                        ? "Update status and submit work details"
                                        : "Assign a worker directly to a project task"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close form"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 hover:text-black disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                {error && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {!isConstructionWorker && (
                                    <>
                                        <section>
                                            <h3 className={sectionHeadingClass}>
                                                Assignment
                                            </h3>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label
                                                        htmlFor="form-project"
                                                        className={labelClass}
                                                    >
                                                        Project{" "}
                                                        <span className="text-red-600">*</span>
                                                    </label>

                                                    <select
                                                        id="form-project"
                                                        value={form.projectId}
                                                        onChange={(event) =>
                                                            void handleProjectChange(
                                                                event.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            loadingProjects || saving
                                                        }
                                                        required
                                                        className={inputClass}
                                                    >
                                                        <option value="">
                                                            {loadingProjects
                                                                ? "Loading projects..."
                                                                : "Select Project"}
                                                        </option>
                                                        {projects.map(
                                                            (project, index) => (
                                                                <option
                                                                    key={`${project.projectId || project.projectName}-${index}`}
                                                                    value={project.projectId}
                                                                >
                                                                    {project.projectName}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="form-worker"
                                                        className={labelClass}
                                                    >
                                                        Assign Worker{" "}
                                                        <span className="text-red-600">*</span>
                                                    </label>

                                                    <select
                                                        id="form-worker"
                                                        value={form.assignedTo}
                                                        onChange={(event) =>
                                                            setForm((previous) => ({
                                                                ...previous,
                                                                assignedTo:
                                                                    event.target.value,
                                                            }))
                                                        }
                                                        disabled={
                                                            !form.projectId ||
                                                            loadingWorkers ||
                                                            saving
                                                        }
                                                        required
                                                        className={inputClass}
                                                    >
                                                        <option value="">
                                                            {!form.projectId
                                                                ? "Select project first"
                                                                : loadingWorkers
                                                                  ? "Loading workers..."
                                                                  : workers.length === 0
                                                                    ? "No workers found"
                                                                    : "Select Worker"}
                                                        </option>
                                                        {workers.map(
                                                            (worker, index) => (
                                                                <option
                                                                    key={`${getWorkerSelectionId(worker)}-${index}`}
                                                                    value={getWorkerSelectionId(worker)}
                                                                >
                                                                    {worker.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>

                                                    <p className="mt-1.5 text-xs text-gray-500">
                                                        Only active workers for the selected project are listed.
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className={sectionHeadingClass}>
                                                Task Details
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        htmlFor="task-title"
                                                        className={labelClass}
                                                    >
                                                        Task Title{" "}
                                                        <span className="text-red-600">*</span>
                                                    </label>

                                                    <input
                                                        id="task-title"
                                                        value={form.title}
                                                        onChange={(event) =>
                                                            setForm((previous) => ({
                                                                ...previous,
                                                                title: event.target.value,
                                                            }))
                                                        }
                                                        required
                                                        disabled={saving}
                                                        placeholder="Enter task title"
                                                        className={inputClass}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="task-description"
                                                        className={labelClass}
                                                    >
                                                        Description
                                                    </label>

                                                    <textarea
                                                        id="task-description"
                                                        value={form.description}
                                                        onChange={(event) =>
                                                            setForm((previous) => ({
                                                                ...previous,
                                                                description:
                                                                    event.target.value,
                                                            }))
                                                        }
                                                        rows={4}
                                                        disabled={saving}
                                                        placeholder="Describe the task..."
                                                        className={textareaClass}
                                                    />
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label
                                                            htmlFor="task-priority"
                                                            className={labelClass}
                                                        >
                                                            Priority
                                                        </label>

                                                        <select
                                                            id="task-priority"
                                                            value={form.priority}
                                                            onChange={(event) =>
                                                                setForm((previous) => ({
                                                                    ...previous,
                                                                    priority:
                                                                        event.target.value as Priority,
                                                                }))
                                                            }
                                                            disabled={saving}
                                                            className={inputClass}
                                                        >
                                                            <option value="Low">Low</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="High">High</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="task-status"
                                                            className={labelClass}
                                                        >
                                                            Status
                                                        </label>

                                                        <select
                                                            id="task-status"
                                                            value={form.status}
                                                            onChange={(event) =>
                                                                setForm((previous) => ({
                                                                    ...previous,
                                                                    status:
                                                                        event.target.value as TaskStatus,
                                                                }))
                                                            }
                                                            disabled={saving}
                                                            className={inputClass}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Delayed">Delayed</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label
                                                            htmlFor="task-start-date"
                                                            className={labelClass}
                                                        >
                                                            Start Date
                                                        </label>

                                                        <input
                                                            id="task-start-date"
                                                            type="date"
                                                            value={form.startDate}
                                                            onChange={(event) =>
                                                                setForm((previous) => ({
                                                                    ...previous,
                                                                    startDate:
                                                                        event.target.value,
                                                                }))
                                                            }
                                                            disabled={saving}
                                                            className={inputClass}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="task-due-date"
                                                            className={labelClass}
                                                        >
                                                            Due Date
                                                        </label>

                                                        <input
                                                            id="task-due-date"
                                                            type="date"
                                                            value={form.dueDate}
                                                            onChange={(event) =>
                                                                setForm((previous) => ({
                                                                    ...previous,
                                                                    dueDate:
                                                                        event.target.value,
                                                                }))
                                                            }
                                                            disabled={saving}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </>
                                )}

                                {isConstructionWorker && (
                                    <section>
                                        <h3 className={sectionHeadingClass}>
                                            Update Progress
                                        </h3>

                                        <label
                                            htmlFor="worker-task-status"
                                            className={labelClass}
                                        >
                                            Task Status
                                        </label>

                                        <select
                                            id="worker-task-status"
                                            value={form.status}
                                            onChange={(event) =>
                                                setForm((previous) => ({
                                                    ...previous,
                                                    status:
                                                        event.target.value as TaskStatus,
                                                }))
                                            }
                                            disabled={saving}
                                            className={inputClass}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Delayed">Delayed</option>
                                        </select>
                                    </section>
                                )}

                                <section>
                                    <h3 className={sectionHeadingClass}>
                                        Remarks
                                    </h3>

                                    <textarea
                                        value={form.remarks}
                                        onChange={(event) =>
                                            setForm((previous) => ({
                                                ...previous,
                                                remarks: event.target.value,
                                            }))
                                        }
                                        rows={3}
                                        disabled={saving}
                                        placeholder="Additional remarks..."
                                        className={textareaClass}
                                    />
                                </section>

                                <section>
                                    <h3 className={sectionHeadingClass}>
                                        Completion Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="completion-description"
                                                className={labelClass}
                                            >
                                                Completion Description
                                            </label>

                                            <textarea
                                                id="completion-description"
                                                value={form.completionDescription}
                                                onChange={(event) =>
                                                    setForm((previous) => ({
                                                        ...previous,
                                                        completionDescription:
                                                            event.target.value,
                                                    }))
                                                }
                                                rows={3}
                                                disabled={saving}
                                                placeholder="Describe the completed work..."
                                                className={textareaClass}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="completion-link"
                                                className={labelClass}
                                            >
                                                Completion Link
                                            </label>

                                            <input
                                                id="completion-link"
                                                type="url"
                                                value={form.completionLink}
                                                onChange={(event) =>
                                                    setForm((previous) => ({
                                                        ...previous,
                                                        completionLink:
                                                            event.target.value,
                                                    }))
                                                }
                                                disabled={saving}
                                                placeholder="https://..."
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="h-10 rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium text-black transition hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {isConstructionWorker
                                        ? "Save Progress"
                                        : editingTask
                                          ? "Update Task"
                                          : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTask && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                            <Trash2 className="h-5 w-5 text-red-700" />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-black">
                            Delete Task?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-black">
                                &quot;{deleteTask.title}&quot;
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTask(null)}
                                disabled={saving}
                                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleDelete()}
                                disabled={saving}
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
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

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {label}
                </div>
                <div className="text-gray-500">{icon}</div>
            </div>

            <div className="mt-2 text-2xl font-bold text-black">
                {value}
            </div>
        </div>
    );
}

