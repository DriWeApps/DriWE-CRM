"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Users,
    MapPin,
    Loader2,
    UserPlus,
    Phone,
    Wallet,
    BriefcaseBusiness,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
};

type Site = {
    siteId: string;
    projectId: string;
    projectName?: string;
    siteName: string;
    location?: string;
    active: boolean;
};

type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

export default function NewProjectWorkerPage() {
    const params = useParams();
    const router = useRouter();

    const projectId = params.projectId as string;

    const [project, setProject] =
        useState<Project | null>(null);

    const [sites, setSites] =
        useState<Site[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [form, setForm] = useState({
        siteId: "",
        name: "",
        phone: "",
        email: "",
        password: "",
        workerType:
            "Employee" as WorkerType,
        salary: "",
    });

    useEffect(() => {
        if (!projectId) return;

        loadProjectAndSites();
    }, [projectId]);

    async function loadProjectAndSites() {
        try {
            setLoading(true);
            setError("");

            const [
                projectResponse,
                sitesResponse,
            ] = await Promise.all([
                fetch(
                    `/api/construction/projects/${projectId}`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                ),

                fetch(
                    `/api/construction/sites?projectId=${encodeURIComponent(
                        projectId
                    )}`,
                    {
                        credentials: "include",
                        cache: "no-store",
                    }
                ),
            ]);

            const projectData =
                await projectResponse.json();

            const sitesData =
                await sitesResponse.json();

            if (!projectResponse.ok) {
                throw new Error(
                    projectData?.message ||
                        projectData?.error ||
                        "Failed to load project."
                );
            }

            if (!sitesResponse.ok) {
                throw new Error(
                    sitesData?.message ||
                        sitesData?.error ||
                        "Failed to load project sites."
                );
            }

            setProject(
                projectData.project || null
            );

            const projectSites =
                sitesData.sites || [];

            setSites(projectSites);

            /*
             * Automatically select the first active site
             * when there is only one active site.
             */
            const activeSites =
                projectSites.filter(
                    (site: Site) =>
                        site.active
                );

            if (activeSites.length === 1) {
                setForm((current) => ({
                    ...current,
                    siteId:
                        activeSites[0].siteId,
                }));
            }
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load project information."
            );
        } finally {
            setLoading(false);
        }
    }

    function updateField(
        field: keyof typeof form,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function handlePhoneChange(
        value: string
    ) {
        const digitsOnly = value
            .replace(/\D/g, "")
            .slice(0, 10);

        updateField(
            "phone",
            digitsOnly
        );
    }

    function handleSalaryChange(
        value: string
    ) {
        const cleaned = value.replace(
            /[^\d.]/g,
            ""
        );

        updateField(
            "salary",
            cleaned
        );
    }

    function validateForm() {
        if (!form.siteId) {
            return "Please select a site.";
        }

        if (!form.name.trim()) {
            return "Worker name is required.";
        }

        if (form.phone.length !== 10) {
            return "Please enter a valid 10-digit mobile number.";
        }

        if (!form.email.trim()) {
            return "Worker email is required.";
        }

        const email =
            form.email.trim();

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return "Please enter a valid email address.";
        }

        if (!form.password) {
            return "Worker login password is required.";
        }

        if (form.password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (!form.workerType) {
            return "Please select worker type.";
        }

        const salary =
            Number(form.salary);

        if (
            !form.salary ||
            Number.isNaN(salary) ||
            salary <= 0
        ) {
            return "Please enter a valid salary or wage.";
        }

        return "";
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            const response =
                await fetch(
                    "/api/construction/workers",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

                        body: JSON.stringify({
                            projectId,

                            siteId:
                                form.siteId,

                            name:
                                form.name.trim(),

                            phone:
                                form.phone,

                            email:
                                form.email
                                    .trim()
                                    .toLowerCase(),

                            password:
                                form.password,

                            workerType:
                                form.workerType,

                            salary:
                                Number(
                                    form.salary
                                ),
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        "Failed to create worker."
                );
            }

            setSuccess(
                "Worker and login account created successfully."
            );

            const workerId =
                data?.worker?.workerId;

            setTimeout(() => {
                if (workerId) {
                    router.push(
                        `/DriWE-Construction/people/${workerId}`
                    );
                } else {
                    router.push(
                        `/DriWE-Construction/projects/${projectId}/sites/workers`
                    );
                }
            }, 700);
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create worker."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="mx-auto max-w-4xl px-6 py-10">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading project and sites...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-4xl px-6 py-8">

                {/* Breadcrumb */}
                <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="transition hover:text-yellow-400"
                    >
                        Projects
                    </Link>

                    <span>/</span>

                    <Link
                        href={`/DriWE-Construction/projects/${projectId}`}
                        className="transition hover:text-yellow-400"
                    >
                        {project?.projectName ||
                            "Project"}
                    </Link>

                    <span>/</span>

                    <Link
                        href={`/DriWE-Construction/projects/${projectId}/sites`}
                        className="transition hover:text-yellow-400"
                    >
                        Sites
                    </Link>

                    <span>/</span>

                    <Link
                        href={`/DriWE-Construction/projects/${projectId}/sites/workers`}
                        className="transition hover:text-yellow-400"
                    >
                        Workers
                    </Link>

                    <span>/</span>

                    <span className="text-zinc-300">
                        Add Worker
                    </span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/DriWE-Construction/projects/${projectId}/sites/workers`}
                        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Workers
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-yellow-500/10 p-3">
                            <UserPlus className="h-7 w-7 text-yellow-400" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold">
                                Add Worker
                            </h1>

                            <p className="mt-1 text-zinc-400">
                                Add a worker to this
                                project and create
                                their Construction
                                Portal login.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Project Information */}
                <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <BriefcaseBusiness className="h-5 w-5 text-yellow-400" />

                        <h2 className="font-semibold">
                            Project Information
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Project
                            </p>

                            <p className="mt-1 font-medium text-white">
                                {project?.projectName ||
                                    "Unknown Project"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Location
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-300">
                                <MapPin className="h-4 w-4 text-zinc-500" />

                                {project?.location ||
                                    "Location not specified"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* No Sites */}
                {sites.length === 0 && (
                    <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

                            <div>
                                <h3 className="font-semibold text-yellow-300">
                                    No sites found
                                </h3>

                                <p className="mt-1 text-sm text-zinc-400">
                                    You need to create at
                                    least one site before
                                    adding a worker to
                                    this project.
                                </p>

                                <Link
                                    href={`/DriWE-Construction/projects/${projectId}/sites/new`}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Create Site
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <p className="text-sm text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                        <p className="text-sm text-green-400">
                            {success}
                        </p>
                    </div>
                )}

                {/* Form */}
                {sites.length > 0 && (
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/70"
                    >
                        {/* Form Header */}
                        <div className="border-b border-zinc-800 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-zinc-800 p-2">
                                    <Users className="h-5 w-5 text-yellow-400" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Worker Details
                                    </h2>

                                    <p className="text-sm text-zinc-500">
                                        Enter the worker's
                                        information and
                                        login details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 p-6">

                            {/* Site */}
                            <div>
                                <label
                                    htmlFor="siteId"
                                    className="mb-2 block text-sm font-medium text-zinc-200"
                                >
                                    Site{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                    <select
                                        id="siteId"
                                        value={
                                            form.siteId
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "siteId",
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-yellow-500"
                                        required
                                    >
                                        <option value="">
                                            Select Site
                                        </option>

                                        {sites
                                            .filter(
                                                (site) =>
                                                    site.active
                                            )
                                            .map(
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

                                                        {site.location
                                                            ? ` — ${site.location}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                    </select>
                                </div>

                                <p className="mt-2 text-xs text-zinc-500">
                                    The worker will
                                    automatically be
                                    linked to this
                                    project and
                                    selected site.
                                </p>
                            </div>

                            {/* Worker Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-zinc-200"
                                >
                                    Worker Name{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                    <input
                                        id="name"
                                        type="text"
                                        value={
                                            form.name
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "name",
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter worker name"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-zinc-200"
                                >
                                    Mobile Number{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                    <input
                                        id="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        value={
                                            form.phone
                                        }
                                        onChange={(event) =>
                                            handlePhoneChange(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="10-digit mobile number"
                                        maxLength={
                                            10
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
                                        required
                                    />
                                </div>

                                <p className="mt-2 text-xs text-zinc-500">
                                    Enter a valid
                                    10-digit Indian
                                    mobile number.
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-zinc-200"
                                >
                                    Email Address{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                    <input
                                        id="email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "email",
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="worker@example.com"
                                        autoComplete="email"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
                                        required
                                    />
                                </div>

                                <p className="mt-2 text-xs text-zinc-500">
                                    This email will be
                                    used by the worker
                                    to log in to the
                                    Construction Portal.
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-zinc-200"
                                >
                                    Login Password{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            form.password
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "password",
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Create login password"
                                        autoComplete="new-password"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
                                        required
                                        minLength={
                                            6
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) =>
                                                    !current
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-zinc-500">
                                    Minimum 6 characters.
                                    This password will
                                    be used for the
                                    worker's Construction
                                    Portal login.
                                </p>
                            </div>

                            {/* Login Account Notice */}
                            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

                                    <div>
                                        <p className="font-medium text-yellow-300">
                                            Construction Portal
                                            Login
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-zinc-400">
                                            A login account
                                            will be created
                                            for this worker
                                            using the email
                                            and password
                                            entered above.
                                            The worker can
                                            use these
                                            credentials to
                                            access their
                                            assigned tasks
                                            and submit their
                                            work.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Worker Type */}
                            <div>
                                <label
                                    htmlFor="workerType"
                                    className="mb-2 block text-sm font-medium text-zinc-200"
                                >
                                    Worker Type{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <select
                                    id="workerType"
                                    value={
                                        form.workerType
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "workerType",
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500"
                                    required
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

                            {/* Salary */}
                            <div>
                                <label
                                    htmlFor="salary"
                                    className="mb-2 block text-sm font-medium text-zinc-200"
                                >
                                    {form.workerType ===
                                    "Daily Wage"
                                        ? "Daily Wage"
                                        : "Salary / Wage"}{" "}
                                    <span className="text-red-400">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                                        ₹
                                    </span>

                                    <input
                                        id="salary"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={
                                            form.salary
                                        }
                                        onChange={(event) =>
                                            handleSalaryChange(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder={
                                            form.workerType ===
                                            "Daily Wage"
                                                ? "Enter daily wage"
                                                : "Enter salary / wage"
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-3 pl-16 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
                                        required
                                    />
                                </div>

                                <p className="mt-2 text-xs text-zinc-500">
                                    {form.workerType ===
                                    "Daily Wage"
                                        ? "Enter the amount paid to this worker per day."
                                        : "Enter the worker's agreed salary or wage amount."}
                                </p>
                            </div>
                        </div>

                        {/* Selected Site Preview */}
                        {form.siteId && (
                            <div className="mx-6 mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                                {(() => {
                                    const selectedSite =
                                        sites.find(
                                            (site) =>
                                                site.siteId ===
                                                form.siteId
                                        );

                                    if (!selectedSite) {
                                        return null;
                                    }

                                    return (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 h-5 w-5 text-yellow-400" />

                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-yellow-500">
                                                    Worker will
                                                    be assigned
                                                    to
                                                </p>

                                                <p className="mt-1 font-semibold text-white">
                                                    {
                                                        selectedSite.siteName
                                                    }
                                                </p>

                                                {selectedSite.location && (
                                                    <p className="mt-1 text-sm text-zinc-400">
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

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 px-6 py-5 sm:flex-row sm:justify-end">
                            <Link
                                href={`/DriWE-Construction/projects/${projectId}/sites/workers`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
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
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Create Worker
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}