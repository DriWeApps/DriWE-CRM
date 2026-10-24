
"use client";

import { useCallback, useEffect, useState } from "react";
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

type TaskStatus = "Pending" | "In Progress" | "Completed" | "Delayed";
type TaskPriority = "Low" | "Medium" | "High";

type Task = {
    taskId: string;
    projectId: string;
    projectName?: string;
    siteId?: string;
    siteName?: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;
    dueDate?: string;
    remarks?: string;
};

type AuthUser = {
    role?: string;
    email?: string;
    employeeId?: string;
    userId?: string;
};

type FormData = {
    projectId: string;
    siteId: string;
    assignedTo: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
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
    const [userRole, setUserRole] = useState("");
    const [authLoaded, setAuthLoaded] = useState(false);

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

    const isConstructionWorker =
        userRole.trim().toUpperCase() === "CONSTRUCTIONEMPLOYEE";

    const loadSites = useCallback(async (projectId: string): Promise<Site[]> => {
        if (!projectId) {
            setSites([]);
            return [];
        }

        try {
            setLoadingSites(true);
            const response = await fetch(
                `/api/construction/sites?projectId=${encodeURIComponent(projectId)}`,
                { cache: "no-store", credentials: "include" }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to load sites");
            }

            const loadedSites: Site[] = Array.isArray(data?.sites) ? data.sites : [];
            setSites(loadedSites);
            return loadedSites;
        } catch (err) {
            console.error("Failed to load sites:", err);
            setSites([]);
            setError(err instanceof Error ? err.message : "Failed to load sites");
            return [];
        } finally {
            setLoadingSites(false);
        }
    }, []);

    const loadWorkers = useCallback(async (siteId: string) => {
        if (!siteId) {
            setWorkers([]);
            return [];
        }

        try {
            setLoadingWorkers(true);
            const response = await fetch(
                `/api/construction/workers?siteId=${encodeURIComponent(siteId)}`,
                { cache: "no-store", credentials: "include" }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to load workers");
            }

            const loadedWorkers: Worker[] = Array.isArray(data?.workers)
                ? data.workers
                : [];
            const siteWorkers = loadedWorkers.filter(
                (worker) => worker.siteId === siteId && worker.active !== false
            );
            setWorkers(siteWorkers);
            return siteWorkers;
        } catch (err) {
            console.error("Failed to load workers:", err);
            setWorkers([]);
            setError(err instanceof Error ? err.message : "Failed to load workers");
            return [];
        } finally {
            setLoadingWorkers(false);
        }
    }, []);

    const loadData = useCallback(async () => {
        if (!taskId) return;

        try {
            setLoading(true);
            setError("");

            const [taskResponse, projectsResponse] = await Promise.all([
                fetch(`/api/construction/tasks/${encodeURIComponent(taskId)}`, {
                    cache: "no-store",
                    credentials: "include",
                }),
                fetch("/api/construction/projects", {
                    cache: "no-store",
                    credentials: "include",
                }),
            ]);

            const taskData = await taskResponse.json();
            const projectsData = await projectsResponse.json();

            if (!taskResponse.ok) {
                throw new Error(
                    taskData?.error || taskData?.message || "Failed to load task"
                );
            }
            if (!projectsResponse.ok) {
                throw new Error(
                    projectsData?.error ||
                        projectsData?.message ||
                        "Failed to load projects"
                );
            }

            const loadedTask: Task = taskData?.task || taskData;
            const loadedProjects: Project[] = Array.isArray(projectsData?.projects)
                ? projectsData.projects
                : [];

            setTask(loadedTask);
            setProjects(loadedProjects);

            const projectId = loadedTask.projectId || "";
            const siteId = loadedTask.siteId || "";

            setFormData({
                projectId,
                siteId,
                assignedTo: loadedTask.assignedTo || "",
                title: loadedTask.title || "",
                description: loadedTask.description || "",
                priority: loadedTask.priority || "Medium",
                status: loadedTask.status || "Pending",
                dueDate: loadedTask.dueDate
                    ? String(loadedTask.dueDate).slice(0, 10)
                    : "",
                remarks: loadedTask.remarks || "",
            });

            if (projectId) await loadSites(projectId);
            if (siteId && !isConstructionWorker) await loadWorkers(siteId);
        } catch (err) {
            console.error("Failed to load task:", err);
            setError(err instanceof Error ? err.message : "Failed to load task");
        } finally {
            setLoading(false);
        }
    }, [taskId, loadSites, loadWorkers, isConstructionWorker]);

    useEffect(() => {
        let cancelled = false;

        async function loadCurrentUser() {
            try {
                const response = await fetch("/api/auth/me", {
                    cache: "no-store",
                    credentials: "include",
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error || "Could not identify current user");
                }

                const user: AuthUser = data?.user || data;
                if (!cancelled) setUserRole(user?.role || "");
            } catch (err) {
                console.error("Failed to load current user role:", err);
                if (!cancelled) setUserRole("");
            } finally {
                if (!cancelled) setAuthLoaded(true);
            }
        }

        void loadCurrentUser();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!taskId || !authLoaded) return;
        void loadData();
    }, [taskId, authLoaded, loadData]);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    }

    async function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
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
        if (projectId) await loadSites(projectId);
    }

    async function handleSiteChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const siteId = e.target.value;
        setFormData((prev) => ({ ...prev, siteId, assignedTo: "" }));
        setWorkers([]);
        setError("");
        if (siteId) await loadWorkers(siteId);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!taskId) {
            setError("Task ID is missing.");
            return;
        }

        if (isConstructionWorker) {
            if (!formData.status) {
                setError("Please select a status.");
                return;
            }

            try {
                setSaving(true);
                const response = await fetch(
                    `/api/construction/tasks/${encodeURIComponent(taskId)}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            status: formData.status,
                            remarks: formData.remarks.trim(),
                        }),
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                            data?.message ||
                            "Failed to update task progress"
                    );
                }

                router.push(`/DriWE-Construction/tasks/${taskId}`);
                router.refresh();
            } catch (err) {
                console.error("Failed to update task progress:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to update task progress"
                );
            } finally {
                setSaving(false);
            }
            return;
        }

        if (!formData.projectId) {
            setError("Please select a project.");
            return;
        }
        if (!formData.siteId) {
            setError("Please select a site.");
            return;
        }
        if (!formData.assignedTo) {
            setError("Please select a worker.");
            return;
        }
        if (!formData.title.trim()) {
            setError("Task title is required.");
            return;
        }

        const selectedWorker = workers.find(
            (worker) => worker.workerId === formData.assignedTo
        );
        if (!selectedWorker) {
            setError("Selected worker could not be found for this site.");
            return;
        }
        if (selectedWorker.siteId !== formData.siteId) {
            setError("Selected worker does not belong to the selected site.");
            return;
        }

        const selectedProject = projects.find(
            (project) => project.projectId === formData.projectId
        );
        const selectedSite = sites.find((site) => site.siteId === formData.siteId);

        if (!selectedSite) {
            setError("Selected site could not be found.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                projectId: formData.projectId,
                projectName: selectedProject?.projectName || task?.projectName || "",
                siteId: formData.siteId,
                siteName: selectedSite.siteName,
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                status: formData.status,
                assignedTo: selectedWorker.workerId,
                assignedToName: selectedWorker.name,
                ...(selectedWorker.email || task?.assignedToEmail
                    ? {
                          assignedToEmail:
                              selectedWorker.email || task?.assignedToEmail,
                      }
                    : {}),
                dueDate: formData.dueDate,
                remarks: formData.remarks.trim(),
            };

            const response = await fetch(
                `/api/construction/tasks/${encodeURIComponent(taskId)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || data?.message || "Failed to update task"
                );
            }

            router.push(`/DriWE-Construction/tasks/${taskId}`);
            router.refresh();
        } catch (err) {
            console.error("Failed to update task:", err);
            setError(err instanceof Error ? err.message : "Failed to update task");
        } finally {
            setSaving(false);
        }
    }

    const inputClassName =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder-gray-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60";

    const labelClassName = "mb-2 block text-sm font-medium text-gray-700";

    const sectionClassName =
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

    if (loading || !authLoaded) {
        return (
           <div className="min-h-screen w-full min-w-0 bg-white text-black">
    <div className="w-full min-w-0 px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading task...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-white text-black">
                <div className="mx-auto max-w-3xl px-4 py-10">
                    <Link
                        href="/DriWE-Construction/tasks"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tasks
                    </Link>

                    <div className="rounded-xl border border-red-200 bg-white p-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-red-700">{error || "Task not found."}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
      <div className="min-h-screen w-full min-w-0 bg-white text-black">
    <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={`/DriWE-Construction/tasks/${taskId}`}
                        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Task
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                            <ClipboardList className="h-5 w-5 text-black" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-black">
                                {isConstructionWorker
                                    ? "Update Task Progress"
                                    : "Edit Task"}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {isConstructionWorker
                                    ? "Update the status and remarks for your assigned task."
                                    : "Update construction task details."}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {!isConstructionWorker && (
                            <section className={sectionClassName}>
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                        <Building2 className="h-4 w-4 text-black" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-black">
                                            Assignment
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Select project, site and worker
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-3">
                                    <div>
                                        <label
                                            htmlFor="projectId"
                                            className={labelClassName}
                                        >
                                            Project{" "}
                                            <span className="ml-1 text-red-600">*</span>
                                        </label>

                                        <select
                                            id="projectId"
                                            name="projectId"
                                            value={formData.projectId}
                                            onChange={handleProjectChange}
                                            disabled={saving}
                                            className={inputClassName}
                                        >
                                            <option value="">Select Project</option>
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

                                    <div>
                                        <label
                                            htmlFor="siteId"
                                            className={labelClassName}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                                Site{" "}
                                                <span className="text-red-600">*</span>
                                            </span>
                                        </label>

                                        <select
                                            id="siteId"
                                            name="siteId"
                                            value={formData.siteId}
                                            onChange={handleSiteChange}
                                            disabled={
                                                !formData.projectId ||
                                                loadingSites ||
                                                saving
                                            }
                                            className={inputClassName}
                                        >
                                            <option value="">
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
                                                >
                                                    {site.siteName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="assignedTo"
                                            className={labelClassName}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-gray-500" />
                                                Worker{" "}
                                                <span className="text-red-600">*</span>
                                            </span>
                                        </label>

                                        <select
                                            id="assignedTo"
                                            name="assignedTo"
                                            value={formData.assignedTo}
                                            onChange={handleChange}
                                            disabled={
                                                !formData.siteId ||
                                                loadingWorkers ||
                                                saving
                                            }
                                            className={inputClassName}
                                        >
                                            <option value="">
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
                                                >
                                                    {worker.name}
                                                </option>
                                            ))}
                                        </select>

                                        <p className="mt-2 text-xs text-gray-500">
                                            Only active workers from the selected site are
                                            shown.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className={sectionClassName}>
                            <div className="mb-5">
                                <h2 className="font-semibold text-black">
                                    {isConstructionWorker
                                        ? "Progress Update"
                                        : "Task Information"}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {isConstructionWorker
                                        ? "You can update the status and remarks for this task."
                                        : "Update the task details and requirements."}
                                </p>
                            </div>

                            {isConstructionWorker ? (
                                <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                                        Task
                                    </p>
                                    <p className="font-medium text-black">{task.title}</p>
                                    {task.projectName && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            {task.projectName}
                                            {task.siteName ? ` · ${task.siteName}` : ""}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div>
                                        <label
                                            htmlFor="title"
                                            className={labelClassName}
                                        >
                                            Task Title{" "}
                                            <span className="ml-1 text-red-600">*</span>
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
                                        <label
                                            htmlFor="description"
                                            className={labelClassName}
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Describe the task..."
                                            disabled={saving}
                                            className={`${inputClassName} resize-none`}
                                        />
                                    </div>
                                </div>
                            )}

                            <div
                                className={`grid gap-5 ${
                                    isConstructionWorker ? "" : "md:grid-cols-3"
                                }`}
                            >
                                {!isConstructionWorker && (
                                    <div>
                                        <label
                                            htmlFor="priority"
                                            className={labelClassName}
                                        >
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
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="status"
                                        className={labelClassName}
                                    >
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
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Delayed">Delayed</option>
                                    </select>
                                </div>

                                {!isConstructionWorker && (
                                    <div>
                                        <label
                                            htmlFor="dueDate"
                                            className={labelClassName}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                                                Due Date
                                            </span>
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
                                )}
                            </div>

                            <div className="mt-5">
                                <label
                                    htmlFor="remarks"
                                    className={labelClassName}
                                >
                                    Remarks
                                </label>

                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder={
                                        isConstructionWorker
                                            ? "Add a progress update..."
                                            : "Add any additional remarks..."
                                    }
                                    disabled={saving}
                                    className={`${inputClassName} resize-none`}
                                />
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link
                                href={`/DriWE-Construction/tasks/${taskId}`}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {isConstructionWorker
                                            ? "Update Progress"
                                            : "Save Changes"}
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
