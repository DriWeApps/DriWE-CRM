"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    Edit,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Trash2,
    User,
    Wallet,
    XCircle,
    Eye,
    EyeOff,
} from "lucide-react";

type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

interface Worker {
    workerId: string;
    userId?: string;
    companyId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    name: string;
    phone: string;
    email?: string;
    role?: string;
    workerType: WorkerType;
    salary: number;
    dailyWage?: number;
    active: boolean;
    loginEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface Project {
    projectId: string;
    projectName: string;
    location?: string;
}

interface Site {
    siteId: string;
    projectId: string;
    siteName: string;
    location?: string;
    active: boolean;
}

export default function WorkerDetailPage() {
    const params = useParams();
    const router = useRouter();

    const workerId = params.workerId as string;

    const [worker, setWorker] = useState<Worker | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [site, setSite] = useState<Site | null>(null);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    useEffect(() => {
        if (!workerId) return;
        loadWorker();
    }, [workerId]);

    async function loadWorker() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/construction/workers/${workerId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || data?.message || "Failed to load worker"
                );
            }

            const loadedWorker: Worker = data.worker || data;
            setWorker(loadedWorker);

            if (loadedWorker.projectId) {
                loadProject(loadedWorker.projectId);
            }

            if (loadedWorker.siteId) {
                loadSite(loadedWorker.siteId);
            }
        } catch (err) {
            console.error("Load worker error:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load worker"
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

            if (!response.ok) return;

            const data = await response.json();
            setProject(data.project || data);
        } catch (err) {
            console.error("Load project error:", err);
        }
    }

    async function loadSite(siteId: string) {
        try {
            const response = await fetch(
                `/api/construction/sites/${siteId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            if (!response.ok) return;

            const data = await response.json();
            setSite(data.site || data);
        } catch (err) {
            console.error("Load site error:", err);
        }
    }

    async function handleDelete() {
        if (!worker) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${worker.name}"?`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `/api/construction/workers/${worker.workerId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.error || data?.message || "Failed to delete worker"
                );
            }

            router.push("/DriWE-Construction/people");
            router.refresh();
        } catch (err) {
            console.error("Delete worker error:", err);
            setError(
                err instanceof Error ? err.message : "Failed to delete worker"
            );
        } finally {
            setDeleting(false);
        }
    }

    async function handleResetPassword(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        if (!newPassword) {
            setPasswordError("Please enter a new password.");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            return;
        }

        if (!confirmPassword) {
            setPasswordError("Please confirm the new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to reset the login password for "${worker?.name}"?`
        );

        if (!confirmed) return;

        try {
            setResettingPassword(true);

            const response = await fetch(
                `/api/construction/workers/${workerId}/password`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        password: newPassword,
                        confirmPassword,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        "Failed to update worker password."
                );
            }

            setPasswordSuccess(
                "Worker login password updated successfully."
            );
            setNewPassword("");
            setConfirmPassword("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (err) {
            console.error("Reset worker password error:", err);
            setPasswordError(
                err instanceof Error
                    ? err.message
                    : "Failed to update worker password."
            );
        } finally {
            setResettingPassword(false);
        }
    }

    function formatCurrency(value?: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(Number(value ?? 0));
    }

    function formatDate(value?: string) {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function getWorkerTypeLabel(type?: WorkerType) {
        if (!type) return "-";
        return type;
    }

    const cardClass = "rounded-2xl border border-gray-200 bg-white shadow-sm";
    const sectionHeaderClass =
        "border-b border-gray-200 px-5 py-4 sm:px-6";
    const labelClass =
        "text-xs uppercase tracking-wider text-gray-500";
    const detailTextClass = "text-sm font-medium text-black";
    const mutedTextClass = "text-xs text-gray-500";
    const iconTileClass =
        "flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100";
    const detailIconClass = "h-4 w-4 text-gray-500";
    const primaryButtonClass =
        "inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";
    const secondaryButtonClass =
        "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";
    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white text-black">
                <div className="flex items-center gap-3">
                    <Loader2 size={24} className="animate-spin text-black" />
                    <span className="text-sm text-gray-600">
                        Loading worker...
                    </span>
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen bg-white px-4 py-8 text-black sm:px-6">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/DriWE-Construction/people"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft size={17} />
                        Back to People
                    </Link>

                    <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
                        <User className="mx-auto mb-4 h-12 w-12 text-red-600" />
                        <h1 className="text-xl font-semibold text-black">
                            Worker not found
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {error ||
                                "The requested worker could not be found."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="w-full px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
                {/* Back */}
                <Link
                    href="/DriWE-Construction/people"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                >
                    <ArrowLeft size={17} />
                    Back to People
                </Link>

                {/* Header */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                            <User className="h-8 w-8 text-black" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                                    {worker.name}
                                </h1>

                                {worker.active ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                        <CheckCircle2 size={13} />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                        <XCircle size={13} />
                                        Inactive
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                                Worker ID:{" "}
                                <span className="font-mono text-gray-500">
                                    {worker.workerId}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                            className={secondaryButtonClass}
                        >
                            <Edit size={16} />
                            Edit
                        </Link>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            Delete
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Main information */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Personal Information */}
                    <section className={`${cardClass} lg:col-span-2`}>
                        <div className={sectionHeaderClass}>
                            <div className="flex items-center gap-3">
                                <div className={iconTileClass}>
                                    <User className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-black">
                                        Worker Information
                                    </h2>
                                    <p className={mutedTextClass}>
                                        Basic worker details
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-x-8 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:px-6">
                            <div>
                                <p className={labelClass}>Worker Name</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <User className={detailIconClass} />
                                    <p className={detailTextClass}>
                                        {worker.name}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className={labelClass}>Mobile Number</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Phone className={detailIconClass} />
                                    <a
                                        href={`tel:${worker.phone}`}
                                        className="text-sm font-medium text-black transition hover:underline"
                                    >
                                        {worker.phone}
                                    </a>
                                </div>
                            </div>

                            <div>
                                <p className={labelClass}>Login Email</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Mail className={detailIconClass} />
                                    {worker.email ? (
                                        <a
                                            href={`mailto:${worker.email}`}
                                            className="break-all text-sm font-medium text-black transition hover:underline"
                                        >
                                            {worker.email}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Login email not available
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className={labelClass}>Worker Type</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <BriefcaseBusiness className={detailIconClass} />
                                    <span className="rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs text-black">
                                        {getWorkerTypeLabel(worker.workerType)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className={labelClass}>Salary / Wage</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Wallet className={detailIconClass} />
                                    <p className="text-sm font-semibold text-black">
                                        {formatCurrency(worker.salary)}
                                    </p>
                                </div>
                            </div>

                            {worker.workerType === "Daily Wage" &&
                                worker.dailyWage !== undefined && (
                                    <div>
                                        <p className={labelClass}>Daily Wage</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Wallet className={detailIconClass} />
                                            <p className="text-sm font-semibold text-black">
                                                {formatCurrency(worker.dailyWage)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {worker.role && (
                                <div>
                                    <p className={labelClass}>Role</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <BriefcaseBusiness className={detailIconClass} />
                                        <p className="text-sm text-black">
                                            {worker.role}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Status */}
                    <section className={cardClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="font-semibold text-black">Status</h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Current worker status
                            </p>
                        </div>

                        <div className="p-5">
                            <div
                                className={`rounded-xl border p-5 ${
                                    worker.active
                                        ? "border-green-200 bg-green-50"
                                        : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                {worker.active ? (
                                    <>
                                        <CheckCircle2 className="h-8 w-8 text-green-700" />
                                        <p className="mt-4 text-lg font-semibold text-green-800">
                                            Active
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-gray-600">
                                            This worker is currently active and
                                            available for construction operations.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-8 w-8 text-gray-500" />
                                        <p className="mt-4 text-lg font-semibold text-gray-700">
                                            Inactive
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-gray-600">
                                            This worker is currently inactive.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Login Account */}
                <section className={`${cardClass} mt-6`}>
                    <div className={sectionHeaderClass}>
                        <div className="flex items-center gap-3">
                            <div className={iconTileClass}>
                                <ShieldCheck className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-black">
                                    Construction Portal Login
                                </h2>
                                <p className={mutedTextClass}>
                                    Manage this worker&apos;s login credentials
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        {/* Login email */}
                        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                                <div className="min-w-0">
                                    <p className={labelClass}>Login Email</p>
                                    <p className="mt-1 break-all text-sm font-medium text-black">
                                        {worker.email || "Email not available"}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        This email is used to sign in to the
                                        Construction Portal.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Password form */}
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-black">
                                        Reset Login Password
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Set a new password for this worker&apos;s
                                        Construction Portal account.
                                    </p>
                                </div>

                                {/* New password */}
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="mb-2 block text-sm font-medium text-black"
                                    >
                                        New Password{" "}
                                        <span className="text-red-600">*</span>
                                    </label>

                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                        <input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(event) =>
                                                setNewPassword(event.target.value)
                                            }
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                            minLength={6}
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword((current) => !current)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
                                            aria-label={
                                                showNewPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        Minimum 6 characters.
                                    </p>
                                </div>

                                {/* Confirm password */}
                                <div className="mt-5">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 block text-sm font-medium text-black"
                                    >
                                        Confirm Password{" "}
                                        <span className="text-red-600">*</span>
                                    </label>

                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                        <input
                                            id="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(event.target.value)
                                            }
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                            minLength={6}
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (current) => !current
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {passwordError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-700">
                                        {passwordError}
                                    </p>
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
                                        <p className="text-sm text-green-800">
                                            {passwordSuccess}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={resettingPassword}
                                    className={primaryButtonClass}
                                >
                                    {resettingPassword ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Updating Password...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={17} />
                                            Reset Login Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Assignment */}
                <section className={`${cardClass} mt-6`}>
                    <div className={sectionHeaderClass}>
                        <div className="flex items-center gap-3">
                            <div className={iconTileClass}>
                                <Building2 className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-black">
                                    Project &amp; Site Assignment
                                </h2>
                                <p className={mutedTextClass}>
                                    Current construction hierarchy
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                        {/* Project */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                                    <Building2 className="h-5 w-5 text-black" />
                                </div>
                                <div className="min-w-0">
                                    <p className={labelClass}>Project</p>
                                    <p className="mt-1 truncate text-base font-semibold text-black">
                                        {project?.projectName ||
                                            worker.projectName ||
                                            "-"}
                                    </p>
                                    {project?.location && (
                                        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span>{project.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Site */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                                    <MapPin className="h-5 w-5 text-black" />
                                </div>
                                <div className="min-w-0">
                                    <p className={labelClass}>Site</p>
                                    <p className="mt-1 truncate text-base font-semibold text-black">
                                        {site?.siteName || worker.siteName || "-"}
                                    </p>
                                    {(site?.location || worker.siteName) && (
                                        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span>
                                                {site?.location || "Construction site"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dates */}
                <section className={`${cardClass} mt-6`}>
                    <div className={sectionHeaderClass}>
                        <div className="flex items-center gap-3">
                            <div className={iconTileClass}>
                                <CalendarDays className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-black">
                                    Record Information
                                </h2>
                                <p className={mutedTextClass}>
                                    Worker record timestamps
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">
                        <div>
                            <p className={labelClass}>Created</p>
                            <p className="mt-2 text-sm text-black">
                                {formatDate(worker.createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className={labelClass}>Last Updated</p>
                            <p className="mt-2 text-sm text-black">
                                {formatDate(worker.updatedAt)}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bottom actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Link
                        href="/DriWE-Construction/people"
                        className={secondaryButtonClass}
                    >
                        <ArrowLeft size={17} />
                        Back to People
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={`/DriWE-Construction/people/${worker.workerId}/edit`}
                            className={secondaryButtonClass}
                        >
                            <Edit size={17} />
                            Edit Worker
                        </Link>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 size={17} className="animate-spin" />
                            ) : (
                                <Trash2 size={17} />
                            )}
                            Delete Worker
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
