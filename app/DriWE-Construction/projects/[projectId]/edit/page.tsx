"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Loader2,
    Building2,
    MapPin,
    UserRound,
    CalendarDays,
    ClipboardList,
} from "lucide-react";

type ProjectStatus =
    | "Planning"
    | "Active"
    | "On Hold"
    | "Completed"
    | "Cancelled";

interface Project {
    projectId: string;
    companyId?: string;
    projectName: string;
    location: string;

    projectManager?: string;
    projectManagerName?: string;

    siteSupervisor?: string;
    siteSupervisorName?: string;

    startDate?: string;
    expectedCompletion?: string;

    status: ProjectStatus;

    description?: string;

    createdAt?: string;
    updatedAt?: string;
}

export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();

    const projectId =
        typeof params?.projectId === "string"
            ? params.projectId
            : "";

    const [project, setProject] =
        useState<Project | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        projectName: "",
        location: "",
        projectManagerName: "",
        siteSupervisorName: "",
        startDate: "",
        expectedCompletion: "",
        status: "Planning" as ProjectStatus,
        description: "",
    });

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            setError("Project ID is missing.");
            return;
        }

        fetchProject();
    }, [projectId]);

    async function fetchProject() {
        try {
            setLoading(true);
            setError("");

            const url =
                `/api/construction/projects/${encodeURIComponent(
                    projectId
                )}`;

            console.log(
                "Loading project from:",
                url
            );

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const text = await response.text();

            let data: any = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                throw new Error(
                    `Server returned invalid response (${response.status})`
                );
            }

            console.log(
                "Project GET response:",
                response.status,
                data
            );

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        `Failed to load project (${response.status})`
                );
            }

            const projectData: Project =
                data.project || data;

            if (!projectData?.projectId) {
                throw new Error(
                    "Project data was not returned by the server."
                );
            }

            setProject(projectData);

            setFormData({
                projectName:
                    projectData.projectName || "",

                location:
                    projectData.location || "",

                projectManagerName:
                    projectData.projectManagerName ||
                    projectData.projectManager ||
                    "",

                siteSupervisorName:
                    projectData.siteSupervisorName ||
                    projectData.siteSupervisor ||
                    "",

                startDate:
                    projectData.startDate
                        ? projectData.startDate.substring(
                              0,
                              10
                          )
                        : "",

                expectedCompletion:
                    projectData.expectedCompletion
                        ? projectData.expectedCompletion.substring(
                              0,
                              10
                          )
                        : "",

                status:
                    projectData.status ||
                    "Planning",

                description:
                    projectData.description || "",
            });
        } catch (err) {
            console.error(
                "Fetch project error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load project"
            );
        } finally {
            setLoading(false);
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

        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    }

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!projectId) {
            setError("Project ID is missing.");
            return;
        }

        if (!formData.projectName.trim()) {
            setError(
                "Project name is required."
            );
            return;
        }

        if (!formData.location.trim()) {
            setError(
                "Project location is required."
            );
            return;
        }

        if (!formData.startDate) {
            setError(
                "Start date is required."
            );
            return;
        }

        if (!formData.expectedCompletion) {
            setError(
                "Expected completion date is required."
            );
            return;
        }

        if (
            new Date(
                formData.expectedCompletion
            ) <
            new Date(formData.startDate)
        ) {
            setError(
                "Expected completion date cannot be before the start date."
            );
            return;
        }

        try {
            setSaving(true);

            const url =
                `/api/construction/projects/${encodeURIComponent(
                    projectId
                )}`;

            const payload = {
                projectName:
                    formData.projectName.trim(),

                location:
                    formData.location.trim(),

                projectManagerName:
                    formData.projectManagerName.trim() ||
                    undefined,

                siteSupervisorName:
                    formData.siteSupervisorName.trim() ||
                    undefined,

                startDate:
                    formData.startDate,

                expectedCompletion:
                    formData.expectedCompletion,

                status:
                    formData.status,

                description:
                    formData.description.trim() ||
                    undefined,
            };

            console.log(
                "Updating project:",
                {
                    url,
                    payload,
                }
            );

            const response = await fetch(url, {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                credentials: "include",

                body: JSON.stringify(
                    payload
                ),
            });

            const text =
                await response.text();

            let data: any = {};

            try {
                data = text
                    ? JSON.parse(text)
                    : {};
            } catch {
                throw new Error(
                    `Server returned invalid response (${response.status})`
                );
            }

            console.log(
                "Project PUT response:",
                response.status,
                data
            );

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        `Failed to update project (${response.status})`
                );
            }

            if (
                !data?.success &&
                !data?.project
            ) {
                throw new Error(
                    data?.message ||
                        "Project update failed."
                );
            }

            setSuccess(
                "Project updated successfully."
            );

            // Give the user time to see success message
            setTimeout(() => {
                router.push(
                    `/DriWE-Construction/projects/${projectId}`
                );

                router.refresh();
            }, 800);
        } catch (err) {
            console.error(
                "Update project error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update project"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />

                    <p className="text-sm text-zinc-400">
                        Loading project...
                    </p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-4xl px-6 py-10">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>

                    <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-6">
                        <p className="font-medium text-red-300">
                            Unable to load project
                        </p>

                        <p className="mt-2 text-sm text-red-400">
                            {error ||
                                "Project not found."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/DriWE-Construction/projects/${projectId}`}
                        className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Project
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
                            <Building2 className="h-6 w-6 text-orange-500" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Edit Project
                            </h1>

                            <p className="mt-1 text-sm text-zinc-400">
                                Update project information and site details.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
                        <div className="border-b border-zinc-800 p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">
                                    Project Information
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Basic details about your construction project.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Project Name */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="projectName"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Project Name
                                        <span className="ml-1 text-orange-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            id="projectName"
                                            name="projectName"
                                            type="text"
                                            value={
                                                formData.projectName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="location"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Project Location
                                        <span className="ml-1 text-orange-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            id="location"
                                            name="location"
                                            type="text"
                                            value={
                                                formData.location
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Project Manager */}
                                <div>
                                    <label
                                        htmlFor="projectManagerName"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Project Manager
                                    </label>

                                    <div className="relative">
                                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            id="projectManagerName"
                                            name="projectManagerName"
                                            type="text"
                                            value={
                                                formData.projectManagerName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Site Supervisor */}
                                <div>
                                    <label
                                        htmlFor="siteSupervisorName"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Site Supervisor
                                    </label>

                                    <div className="relative">
                                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            id="siteSupervisorName"
                                            name="siteSupervisorName"
                                            type="text"
                                            value={
                                                formData.siteSupervisorName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label
                                        htmlFor="startDate"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Start Date
                                        <span className="ml-1 text-orange-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

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
                                            className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Expected Completion */}
                                <div>
                                    <label
                                        htmlFor="expectedCompletion"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Expected Completion
                                        <span className="ml-1 text-orange-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

                                        <input
                                            id="expectedCompletion"
                                            name="expectedCompletion"
                                            type="date"
                                            value={
                                                formData.expectedCompletion
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label
                                        htmlFor="status"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Project Status
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
                                        className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="Planning">
                                            Planning
                                        </option>

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="On Hold">
                                            On Hold
                                        </option>

                                        <option value="Completed">
                                            Completed
                                        </option>

                                        <option value="Cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="description"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Project Description
                                    </label>

                                    <div className="relative">
                                        <ClipboardList className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-zinc-500" />

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
                                            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse gap-3 bg-zinc-950/50 p-6 sm:flex-row sm:justify-end">
                            <Link
                                href={`/DriWE-Construction/projects/${projectId}`}
                                className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
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