"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    Loader2,
    MapPin,
    Phone,
    Save,
    User,
    Wallet,
} from "lucide-react";

type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

interface Worker {
    workerId: string;

    companyId: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    name: string;
    phone: string;

    role?: string;

    workerType: WorkerType;

    salary: number;
    dailyWage?: number;

    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}

interface Site {
    siteId: string;
    companyId: string;

    projectId: string;
    projectName?: string;

    siteName: string;
    location?: string;

    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}

interface Project {
    projectId: string;
    projectName: string;
    location?: string;
}

export default function EditWorkerPage() {
    const params = useParams();
    const router = useRouter();

    const workerId = params.workerId as string;

    const [worker, setWorker] = useState<Worker | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [sites, setSites] = useState<Site[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        workerType: "Employee" as WorkerType,
        salary: "",
        siteId: "",
        active: true,
    });

    useEffect(() => {
        if (!workerId) return;

        loadWorker();
    }, [workerId]);

    async function loadWorker() {
        try {
            setLoading(true);
            setError("");

            const workerResponse = await fetch(
                `/api/construction/workers/${workerId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const workerData = await workerResponse.json();

            if (!workerResponse.ok) {
                throw new Error(
                    workerData?.error ||
                        workerData?.message ||
                        "Failed to load worker"
                );
            }

            const loadedWorker: Worker =
                workerData.worker || workerData;

            setWorker(loadedWorker);

            setFormData({
                name: loadedWorker.name || "",
                phone: loadedWorker.phone || "",
                workerType:
                    loadedWorker.workerType || "Employee",
                salary: String(loadedWorker.salary ?? ""),
                siteId: loadedWorker.siteId || "",
                active: loadedWorker.active !== false,
            });

            if (loadedWorker.projectId) {
                await loadProject(loadedWorker.projectId);
                await loadSites(loadedWorker.projectId);
            }
        } catch (err) {
            console.error("Load worker error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load worker"
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadProject(projectId: string) {
        try {
            const response = await fetch(
                `/api/construction/projects/${projectId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load project"
                );
            }

            setProject(data.project || data);
        } catch (err) {
            console.error("Load project error:", err);
        }
    }

    async function loadSites(projectId: string) {
        try {
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
                        data?.message ||
                        "Failed to load sites"
                );
            }

            const loadedSites: Site[] = Array.isArray(data)
                ? data
                : data.sites || [];

            setSites(loadedSites);
        } catch (err) {
            console.error("Load sites error:", err);
            setSites([]);
        }
    }

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function validateForm() {
        const name = formData.name.trim();
        const phone = formData.phone.replace(/\D/g, "");
        const salary = Number(formData.salary);

        if (!name) {
            return "Worker name is required.";
        }

        if (!/^\d{10}$/.test(phone)) {
            return "Enter a valid 10-digit mobile number.";
        }

        if (!formData.siteId) {
            return "Please select a site.";
        }

        if (!Number.isFinite(salary) || salary <= 0) {
            return "Salary / wage must be greater than 0.";
        }

        return "";
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            const selectedSite = sites.find(
                (site) => site.siteId === formData.siteId
            );

            if (!selectedSite) {
                throw new Error("Selected site was not found.");
            }

            const salary = Number(formData.salary);

            const payload = {
                name: formData.name.trim(),

                phone: formData.phone.replace(/\D/g, ""),

                workerType: formData.workerType,

                salary,

                siteId: selectedSite.siteId,

                active: formData.active,
            };

            const response = await fetch(
                `/api/construction/workers/${workerId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to update worker"
                );
            }

            setSuccess("Worker updated successfully.");

            setWorker(
                data.worker || {
                    ...worker,
                    ...payload,
                    siteName: selectedSite.siteName,
                    projectId: selectedSite.projectId,
                    projectName:
                        selectedSite.projectName ||
                        worker?.projectName,
                }
            );

            setTimeout(() => {
                router.push(
                    `/DriWE-Construction/people/${workerId}`
                );
                router.refresh();
            }, 700);
        } catch (err) {
            console.error("Update worker error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update worker"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
                <div className="flex items-center gap-3">
                    <Loader2
                        className="animate-spin"
                        size={24}
                    />

                    <span>Loading worker...</span>
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/DriWE-Construction/people"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                    >
                        <ArrowLeft size={17} />
                        Back to People
                    </Link>

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                        <User className="mx-auto mb-4 h-10 w-10 text-red-400" />

                        <h1 className="text-xl font-semibold text-white">
                            Worker not found
                        </h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            {error ||
                                "The requested worker could not be found."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back */}
                <Link
                    href={`/DriWE-Construction/people/${workerId}`}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                    <ArrowLeft size={17} />
                    Back to Worker
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                            <User className="h-7 w-7 text-yellow-400" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Edit Worker
                            </h1>

                            <p className="mt-1 text-sm text-zinc-400">
                                Update worker information,
                                site assignment and salary details.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                        <CheckCircle2 size={17} />
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Project Information */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70">
                        <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                                    <Building2 className="h-5 w-5 text-orange-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Project Assignment
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Worker belongs to this
                                        construction project.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 px-5 py-6 sm:px-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Project
                                </label>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-zinc-500" />

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-white">
                                                {project?.projectName ||
                                                    worker.projectName ||
                                                    "Project"}
                                            </p>

                                            {project?.location && (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                                    <MapPin
                                                        size={12}
                                                    />
                                                    {
                                                        project.location
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-2 text-xs text-zinc-600">
                                    Project is inherited from the
                                    selected site.
                                </p>
                            </div>

                            {/* Site */}
                            <div>
                                <label
                                    htmlFor="siteId"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Site{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <select
                                    id="siteId"
                                    name="siteId"
                                    value={formData.siteId}
                                    onChange={handleChange}
                                    required
                                    disabled={
                                        saving ||
                                        sites.length === 0
                                    }
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">
                                        Select site
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

                                {sites.length === 0 && (
                                    <p className="mt-2 text-xs text-red-400">
                                        No sites are available for
                                        this project.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Selected site information */}
                        {formData.siteId && (
                            <div className="mx-5 mb-6 rounded-xl border border-yellow-500/10 bg-yellow-500/5 px-4 py-3 sm:mx-6">
                                {(() => {
                                    const selectedSite =
                                        sites.find(
                                            (site) =>
                                                site.siteId ===
                                                formData.siteId
                                        );

                                    if (!selectedSite) {
                                        return null;
                                    }

                                    return (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 shrink-0 text-yellow-400" />

                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {
                                                        selectedSite.siteName
                                                    }
                                                </p>

                                                {selectedSite.location && (
                                                    <p className="mt-0.5 text-xs text-zinc-500">
                                                        {
                                                            selectedSite.location
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </section>

                    {/* Personal Information */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70">
                        <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                                    <User className="h-5 w-5 text-blue-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Worker Information
                                    </h2>

                                    <p className="text-xs text-zinc-500">
                                        Basic worker details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 px-5 py-6 sm:px-6 md:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Worker Name{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter worker name"
                                        required
                                        disabled={saving}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-yellow-500/50 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Mobile Number{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        required
                                        disabled={saving}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-yellow-500/50 disabled:opacity-50"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-zinc-600">
                                    Enter exactly 10 digits.
                                </p>
                            </div>

                            {/* Worker Type */}
                            <div>
                                <label
                                    htmlFor="workerType"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Worker Type{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                                    <select
                                        id="workerType"
                                        name="workerType"
                                        value={
                                            formData.workerType
                                        }
                                        onChange={handleChange}
                                        required
                                        disabled={saving}
                                        className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-yellow-500/50 disabled:opacity-50"
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
                                <label
                                    htmlFor="salary"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Salary / Wage{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                                    <input
                                        id="salary"
                                        name="salary"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="Enter salary or wage"
                                        required
                                        disabled={saving}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-yellow-500/50 disabled:opacity-50"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-zinc-600">
                                    For Daily Wage workers, this
                                    amount will be used as the daily
                                    wage.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Status */}
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70">
                        <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
                            <h2 className="font-semibold text-white">
                                Worker Status
                            </h2>

                            <p className="mt-1 text-xs text-zinc-500">
                                Control whether this worker is
                                currently active.
                            </p>
                        </div>

                        <div className="px-5 py-6 sm:px-6">
                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            formData.active
                                                ? "bg-emerald-500/10"
                                                : "bg-zinc-800"
                                        }`}
                                    >
                                        <CheckCircle2
                                            className={`h-5 w-5 ${
                                                formData.active
                                                    ? "text-emerald-400"
                                                    : "text-zinc-500"
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            Active Worker
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            Active workers can be
                                            used for attendance
                                            and site operations.
                                        </p>
                                    </div>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                active:
                                                    e.target.checked,
                                            })
                                        )
                                    }
                                    disabled={saving}
                                    className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-yellow-400 accent-yellow-400"
                                />
                            </label>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
                        <Link
                            href={`/DriWE-Construction/people/${workerId}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            <ArrowLeft size={17} />
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}