"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    UserPlus,
    User,
    Phone,
    BriefcaseBusiness,
    IndianRupee,
    MapPin,
    Building2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
};

type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

export default function NewWorkerPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        projectId: "",
        name: "",
        phone: "",
        email: "",
        password: "",
        workerType: "Employee" as WorkerType,
        salary: "",
        active: true,
    });

    useEffect(() => {
        async function loadProjects() {
            try {
                setLoadingProjects(true);
                setError("");

                const res = await fetch("/api/construction/projects", {
                    cache: "no-store",
                    credentials: "include",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data?.error || "Failed to load projects"
                    );
                }

                setProjects(data.projects || []);
            } catch (err) {
                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load projects"
                );
            } finally {
                setLoadingProjects(false);
            }
        }

        void loadProjects();
    }, []);

    function handleProjectChange(projectId: string) {
        setFormData((prev) => ({
            ...prev,
            projectId,
        }));

        setError("");
    }

    function handleWorkerTypeChange(workerType: WorkerType) {
        setFormData((prev) => ({
            ...prev,
            workerType,
            salary: "",
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const phone = formData.phone.replace(/\D/g, "");
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;
        const salary = Number(formData.salary);

        if (!formData.projectId) {
            setError("Please select a project.");
            return;
        }

        if (!name) {
            setError("Worker name is required.");
            return;
        }

        if (!phone) {
            setError("Worker mobile number is required.");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (!email) {
            setError("Worker login email is required.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Worker login password is required.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Worker login password must be at least 6 characters."
            );
            return;
        }

        if (!formData.salary) {
            setError("Salary / wage is required.");
            return;
        }

        if (!Number.isFinite(salary) || salary <= 0) {
            setError("Salary / wage must be greater than 0.");
            return;
        }

        try {
            setSaving(true);

            const res = await fetch("/api/construction/workers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    projectId: formData.projectId,
                    name,
                    phone,
                    email,
                    password,
                    workerType: formData.workerType,
                    salary,
                    active: formData.active,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.error || "Failed to create worker"
                );
            }

            setSuccess(
                "Worker and login account created successfully."
            );

            setTimeout(() => {
                if (data?.worker?.workerId) {
                    router.push(
                        `/DriWE-Construction/people/${data.worker.workerId}`
                    );
                } else {
                    router.push(
                        `/DriWE-Construction/projects/${formData.projectId}/workers`
                    );
                }
            }, 700);
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create worker"
            );
        } finally {
            setSaving(false);
        }
    }

    const selectedProject = projects.find(
        (project) => project.projectId === formData.projectId
    );

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60";

    const labelClass =
        "mb-2 block text-sm font-medium text-gray-700";

    const sectionClass =
        "rounded-2xl border border-gray-200 bg-white shadow-sm";

    const iconClass =
        "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500";

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="w-full px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Link
                            href="/DriWE-Construction/people"
                            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-black transition hover:bg-gray-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-black" />

                                <span className="text-sm font-medium text-gray-600">
                                    Construction People
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                                Add New Worker
                            </h1>

                            <p className="mt-1 text-sm text-gray-600">
                                Add a worker and create their Construction
                                Portal login.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div>
                            <p className="font-medium">
                                Unable to create worker
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />

                        <p className="font-medium">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Project Assignment */}
                        <section className={sectionClass}>
                            <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                        <Building2 className="h-5 w-5 text-black" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-black">
                                            Project Assignment
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Assign this worker directly to a
                                            project.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                                <div>
                                    <label className={labelClass}>
                                        Project
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={formData.projectId}
                                        onChange={(e) =>
                                            handleProjectChange(
                                                e.target.value
                                            )
                                        }
                                        disabled={loadingProjects || saving}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingProjects
                                                ? "Loading projects..."
                                                : "Select project"}
                                        </option>

                                        {projects.map((project) => (
                                            <option
                                                key={project.projectId}
                                                value={project.projectId}
                                            >
                                                {project.projectName}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedProject?.location && (
                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {selectedProject.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Worker Information */}
                        <section className={sectionClass}>
                            <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                        <User className="h-5 w-5 text-black" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-black">
                                            Worker Information
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Enter the worker&apos;s basic
                                            details.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                                {/* Name */}
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Worker Name
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <User className={iconClass} />

                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter worker name"
                                            disabled={saving}
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={labelClass}>
                                        Mobile Number
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Phone className={iconClass} />

                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 10),
                                                }))
                                            }
                                            placeholder="10-digit mobile number"
                                            disabled={saving}
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </div>

                                {/* Worker Type */}
                                <div>
                                    <label className={labelClass}>
                                        Worker Type
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <BriefcaseBusiness
                                            className={iconClass}
                                        />

                                        <select
                                            value={formData.workerType}
                                            onChange={(e) =>
                                                handleWorkerTypeChange(
                                                    e.target.value as WorkerType
                                                )
                                            }
                                            disabled={saving}
                                            className={`${inputClass} pl-10`}
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

                                {/* Login Email */}
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Login Email
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Mail className={iconClass} />

                                        <input
                                            type="email"
                                            autoComplete="off"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            placeholder="worker@example.com"
                                            disabled={saving}
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        This email will be used by the worker
                                        to log in to the Construction Portal.
                                    </p>
                                </div>

                                {/* Login Password */}
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Login Password
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <LockKeyhole className={iconClass} />

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    password: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter login password"
                                            disabled={saving}
                                            className={`${inputClass} pl-10 pr-12`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            disabled={saving}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
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

                                    <p className="mt-2 text-xs text-gray-500">
                                        Minimum 6 characters. Ensure the
                                        server securely hashes passwords
                                        before storing them.
                                    </p>
                                </div>

                                {/* Salary */}
                                <div>
                                    <label className={labelClass}>
                                        {formData.workerType === "Daily Wage"
                                            ? "Daily Wage"
                                            : "Salary / Wage"}

                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <IndianRupee className={iconClass} />

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.salary}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    salary: e.target.value,
                                                }))
                                            }
                                            placeholder={
                                                formData.workerType ===
                                                "Daily Wage"
                                                    ? "Enter daily wage"
                                                    : "Enter salary / wage"
                                            }
                                            disabled={saving}
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        Enter amount in Indian Rupees (₹).
                                    </p>
                                </div>

                                {/* Active */}
                                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <input
                                        id="active"
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                active: e.target.checked,
                                            }))
                                        }
                                        disabled={saving}
                                        className="h-4 w-4 rounded border-gray-300 accent-black"
                                    />

                                    <label
                                        htmlFor="active"
                                        className="cursor-pointer"
                                    >
                                        <span className="block text-sm font-medium text-black">
                                            Active Worker
                                        </span>

                                        <span className="block text-xs text-gray-500">
                                            Worker is currently working on
                                            the project.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Assignment Preview */}
                        {selectedProject && (
                            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-black" />

                                    <h3 className="font-semibold text-black">
                                        Assignment Preview
                                    </h3>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500">
                                            Project
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-black">
                                            {selectedProject.projectName}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
                            <Link
                                href="/DriWE-Construction/people"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving || loadingProjects}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating Worker...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Create Worker
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
