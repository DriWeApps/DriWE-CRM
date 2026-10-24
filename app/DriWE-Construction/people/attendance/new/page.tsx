
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    Save,
    UserCheck,
    UserX,
    Users,
    Building2,
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
    projectName?: string;
    siteName: string;
    location?: string;
    active: boolean;
};

type Worker = {
    workerId: string;
    companyId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    name: string;
    phone: string;
    role?: string;
    workerType:
        | "Employee"
        | "Contract Worker"
        | "Daily Wage"
        | "Subcontractor";
    salary: number;
    dailyWage?: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

type AttendanceStatus = "Present" | "Absent" | "Half Day";

export default function NewAttendancePage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingSites, setLoadingSites] = useState(false);
    const [loadingWorkers, setLoadingWorkers] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        projectId: "",
        siteId: "",
        workerId: "",
        date: new Date().toISOString().split("T")[0],
        status: "Present" as AttendanceStatus,
        remarks: "",
    });

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        try {
            setLoadingProjects(true);
            setError("");

            const response = await fetch("/api/construction/projects", {
                credentials: "include",
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to load projects.");
            }

            setProjects(data.projects || []);
        } catch (err) {
            console.error("Load projects error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load projects."
            );
        } finally {
            setLoadingProjects(false);
        }
    }

    useEffect(() => {
        if (!formData.projectId) {
            setSites([]);
            setWorkers([]);

            setFormData((current) => ({
                ...current,
                siteId: "",
                workerId: "",
            }));

            return;
        }

        loadSites(formData.projectId);
    }, [formData.projectId]);

    async function loadSites(projectId: string) {
        try {
            setLoadingSites(true);
            setError("");
            setSites([]);
            setWorkers([]);

            const response = await fetch(
                `/api/construction/sites?projectId=${encodeURIComponent(
                    projectId
                )}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to load sites.");
            }

            const projectSites: Site[] = data.sites || [];
            setSites(projectSites);

            const activeSites = projectSites.filter((site) => site.active);

            if (activeSites.length === 1) {
                setFormData((current) => ({
                    ...current,
                    siteId: activeSites[0].siteId,
                    workerId: "",
                }));
            } else {
                setFormData((current) => ({
                    ...current,
                    siteId: "",
                    workerId: "",
                }));
            }
        } catch (err) {
            console.error("Load sites error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load sites."
            );
        } finally {
            setLoadingSites(false);
        }
    }

    useEffect(() => {
        if (!formData.siteId) {
            setWorkers([]);

            setFormData((current) => ({
                ...current,
                workerId: "",
            }));

            return;
        }

        loadWorkers(formData.siteId);
    }, [formData.siteId]);

    async function loadWorkers(siteId: string) {
        try {
            setLoadingWorkers(true);
            setError("");
            setWorkers([]);

            const response = await fetch(
                `/api/construction/workers?siteId=${encodeURIComponent(
                    siteId
                )}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to load workers.");
            }

            const siteWorkers: Worker[] = data.workers || [];
            const activeWorkers = siteWorkers.filter(
                (worker) => worker.active
            );

            setWorkers(activeWorkers);

            if (activeWorkers.length === 1) {
                setFormData((current) => ({
                    ...current,
                    workerId: activeWorkers[0].workerId,
                }));
            } else {
                setFormData((current) => ({
                    ...current,
                    workerId: "",
                }));
            }
        } catch (err) {
            console.error("Load workers error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load workers."
            );
        } finally {
            setLoadingWorkers(false);
        }
    }

    function handleChange(
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    }

    function handleProjectChange(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        const projectId = event.target.value;

        setFormData((current) => ({
            ...current,
            projectId,
            siteId: "",
            workerId: "",
        }));

        setError("");
        setSuccess("");
    }

    function handleSiteChange(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        const siteId = event.target.value;

        setFormData((current) => ({
            ...current,
            siteId,
            workerId: "",
        }));

        setError("");
        setSuccess("");
    }

    const selectedProject = useMemo(
        () =>
            projects.find(
                (project) => project.projectId === formData.projectId
            ),
        [projects, formData.projectId]
    );

    const selectedSite = useMemo(
        () => sites.find((site) => site.siteId === formData.siteId),
        [sites, formData.siteId]
    );

    const selectedWorker = useMemo(
        () => workers.find((worker) => worker.workerId === formData.workerId),
        [workers, formData.workerId]
    );

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!formData.siteId) {
            setError("Please select a site.");
            return;
        }

        if (!formData.workerId) {
            setError("Please select a worker.");
            return;
        }

        if (!formData.date) {
            setError("Attendance date is required.");
            return;
        }

        if (!formData.status) {
            setError("Please select attendance status.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch("/api/construction/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    projectId: formData.projectId,
                    projectName: selectedProject?.projectName || "",
                    siteId: formData.siteId,
                    siteName: selectedSite?.siteName || "",
                    workerId: formData.workerId,
                    workerName: selectedWorker?.name || "",
                    date: formData.date,
                    status: formData.status,
                    remarks: formData.remarks.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to create attendance."
                );
            }

            setSuccess("Attendance recorded successfully.");

            setTimeout(() => {
                router.push("/DriWE-Construction/people/attendance");
            }, 700);
        } catch (err) {
            console.error("Create attendance error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to record attendance."
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

    const selectClass =
        "w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

    const cardClass = "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm";

    if (loadingProjects) {
        return (
            <div className="min-h-screen bg-white text-black">
                <div className="mx-auto max-w-4xl px-6 py-10">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading projects...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 md:py-8">
            <div className="mx-auto max-w-4xl">
                {/* Breadcrumb */}
                <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <Link
                        href="/DriWE-Construction/people"
                        className="transition hover:text-black"
                    >
                        People
                    </Link>

                    <span>/</span>

                    <Link
                        href="/DriWE-Construction/people/attendance"
                        className="transition hover:text-black"
                    >
                        Attendance
                    </Link>

                    <span>/</span>

                    <span className="text-black">New Attendance</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/DriWE-Construction/people/attendance"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Attendance
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-100 p-3">
                            <CalendarDays className="h-7 w-7 text-black" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-black">
                                Record Attendance
                            </h1>

                            <p className="mt-1 text-gray-600">
                                Record attendance for a construction worker.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                    >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div
                        role="status"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                    >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className={cardClass}>
                    {/* Form Header */}
                    <div className="border-b border-gray-200 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                                <UserCheck className="h-5 w-5 text-black" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-black">
                                    Attendance Details
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Select the project, site and worker.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-6">
                        {/* Project */}
                        <div>
                            <label
                                htmlFor="projectId"
                                className="mb-2 block text-sm font-medium text-black"
                            >
                                Project <span className="text-red-600">*</span>
                            </label>

                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                                <select
                                    id="projectId"
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleProjectChange}
                                    className={selectClass}
                                    required
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
                        </div>

                        {/* Site */}
                        <div>
                            <label
                                htmlFor="siteId"
                                className="mb-2 block text-sm font-medium text-black"
                            >
                                Site <span className="text-red-600">*</span>
                            </label>

                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                                <select
                                    id="siteId"
                                    name="siteId"
                                    value={formData.siteId}
                                    onChange={handleSiteChange}
                                    disabled={!formData.projectId || loadingSites}
                                    className={selectClass}
                                    required
                                >
                                    <option value="">
                                        {loadingSites
                                            ? "Loading sites..."
                                            : !formData.projectId
                                              ? "Select project first"
                                              : "Select Site"}
                                    </option>

                                    {sites
                                        .filter((site) => site.active)
                                        .map((site) => (
                                            <option
                                                key={site.siteId}
                                                value={site.siteId}
                                            >
                                                {site.siteName}
                                                {site.location
                                                    ? ` — ${site.location}`
                                                    : ""}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {formData.projectId &&
                                !loadingSites &&
                                sites.filter((site) => site.active).length ===
                                    0 && (
                                    <p className="mt-2 text-xs text-gray-600">
                                        No active sites are available for this
                                        project.
                                    </p>
                                )}
                        </div>

                        {/* Worker */}
                        <div>
                            <label
                                htmlFor="workerId"
                                className="mb-2 block text-sm font-medium text-black"
                            >
                                Worker <span className="text-red-600">*</span>
                            </label>

                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                                <select
                                    id="workerId"
                                    name="workerId"
                                    value={formData.workerId}
                                    onChange={handleChange}
                                    disabled={!formData.siteId || loadingWorkers}
                                    className={selectClass}
                                    required
                                >
                                    <option value="">
                                        {loadingWorkers
                                            ? "Loading workers..."
                                            : !formData.siteId
                                              ? "Select site first"
                                              : "Select Worker"}
                                    </option>

                                    {workers.map((worker) => (
                                        <option
                                            key={worker.workerId}
                                            value={worker.workerId}
                                        >
                                            {worker.name} — {worker.workerType}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.siteId &&
                                !loadingWorkers &&
                                workers.length === 0 && (
                                    <p className="mt-2 text-xs text-gray-600">
                                        No active workers are available at this
                                        site.
                                    </p>
                                )}
                        </div>

                        {/* Date */}
                        <div>
                            <label
                                htmlFor="date"
                                className="mb-2 block text-sm font-medium text-black"
                            >
                                Attendance Date{" "}
                                <span className="text-red-600">*</span>
                            </label>

                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black">
                                Attendance Status{" "}
                                <span className="text-red-600">*</span>
                            </label>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <button
                                    type="button"
                                    aria-pressed={formData.status === "Present"}
                                    onClick={() =>
                                        setFormData((current) => ({
                                            ...current,
                                            status: "Present",
                                        }))
                                    }
                                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                                        formData.status === "Present"
                                            ? "border-black bg-black text-white"
                                            : "border-gray-300 bg-white text-black hover:bg-gray-50"
                                    }`}
                                >
                                    <CheckCircle2
                                        className={`h-5 w-5 ${
                                            formData.status === "Present"
                                                ? "text-white"
                                                : "text-gray-600"
                                        }`}
                                    />

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Present
                                        </p>
                                        <p
                                            className={`mt-0.5 text-xs ${
                                                formData.status === "Present"
                                                    ? "text-gray-300"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            Full day
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    aria-pressed={formData.status === "Absent"}
                                    onClick={() =>
                                        setFormData((current) => ({
                                            ...current,
                                            status: "Absent",
                                        }))
                                    }
                                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                                        formData.status === "Absent"
                                            ? "border-black bg-black text-white"
                                            : "border-gray-300 bg-white text-black hover:bg-gray-50"
                                    }`}
                                >
                                    <UserX
                                        className={`h-5 w-5 ${
                                            formData.status === "Absent"
                                                ? "text-white"
                                                : "text-gray-600"
                                        }`}
                                    />

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Absent
                                        </p>
                                        <p
                                            className={`mt-0.5 text-xs ${
                                                formData.status === "Absent"
                                                    ? "text-gray-300"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            Not present
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    aria-pressed={formData.status === "Half Day"}
                                    onClick={() =>
                                        setFormData((current) => ({
                                            ...current,
                                            status: "Half Day",
                                        }))
                                    }
                                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                                        formData.status === "Half Day"
                                            ? "border-black bg-black text-white"
                                            : "border-gray-300 bg-white text-black hover:bg-gray-50"
                                    }`}
                                >
                                    <Clock3
                                        className={`h-5 w-5 ${
                                            formData.status === "Half Day"
                                                ? "text-white"
                                                : "text-gray-600"
                                        }`}
                                    />

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Half Day
                                        </p>
                                        <p
                                            className={`mt-0.5 text-xs ${
                                                formData.status === "Half Day"
                                                    ? "text-gray-300"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            Half day
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label
                                htmlFor="remarks"
                                className="mb-2 block text-sm font-medium text-black"
                            >
                                Remarks
                            </label>

                            <textarea
                                id="remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Add any attendance remarks..."
                                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>
                    </div>

                    {/* Selected Information */}
                    {selectedWorker && (
                        <div className="mx-6 mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-black" />
                                <h3 className="font-semibold text-black">
                                    Attendance Summary
                                </h3>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Project
                                    </p>
                                    <p className="mt-1 font-medium text-black">
                                        {selectedProject?.projectName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Site
                                    </p>
                                    <p className="mt-1 font-medium text-black">
                                        {selectedSite?.siteName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Worker
                                    </p>
                                    <p className="mt-1 font-medium text-black">
                                        {selectedWorker.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Worker Type
                                    </p>
                                    <p className="mt-1 font-medium text-black">
                                        {selectedWorker.workerType}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Date
                                    </p>
                                    <p className="mt-1 font-medium text-black">
                                        {formData.date}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Status
                                    </p>
                                    <p className="mt-1 font-semibold text-black">
                                        {formData.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-5 sm:flex-row sm:justify-end">
                        <Link
                            href="/DriWE-Construction/people/attendance"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                !formData.projectId ||
                                !formData.siteId ||
                                !formData.workerId
                            }
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
                                    Record Attendance
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

