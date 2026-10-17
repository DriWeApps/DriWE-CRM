
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    HardHat,
    Loader2,
    MapPin,
    Plus,
    Trash2,
    UserRound,
    Users,
    Eye,
    EyeOff,
} from "lucide-react";

type ProjectStatus =
    | "Planning"
    | "Active"
    | "On Hold"
    | "Completed"
    | "Cancelled";

type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

interface WorkerForm {
    tempId: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    showPassword: boolean;
    workerType: WorkerType;
    salary: string;
}

interface ProjectForm {
    projectName: string;
    location: string;
    projectManager: string;
    projectManagerName: string;
    projectManagerEmail: string;
    projectManagerPassword: string;
    showManagerPassword: boolean;
    startDate: string;
    expectedCompletion: string;
    status: ProjectStatus;
    description: string;
}

const emptyProject: ProjectForm = {
    projectName: "",
    location: "",
    projectManager: "",
    projectManagerName: "",
    projectManagerEmail: "",
    projectManagerPassword: "",
    showManagerPassword: false,
    startDate: "",
    expectedCompletion: "",
    status: "Planning",
    description: "",
};

function createWorker(): WorkerForm {
    return {
        tempId: crypto.randomUUID(),
        name: "",
        phone: "",
        email: "",
        password: "",
        showPassword: false,
        workerType: "Daily Wage",
        salary: "",
    };
}

const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30";

const labelClass =
    "mb-2 block text-sm font-medium text-zinc-300";

const cardClass =
    "rounded-2xl border border-zinc-800 bg-zinc-900/70";

const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50";

export default function NewProjectPage() {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [project, setProject] =
        useState<ProjectForm>(emptyProject);
    const [workers, setWorkers] = useState<WorkerForm[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function updateProject(
        field: keyof ProjectForm,
        value: string | boolean
    ) {
        setProject((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function addWorker() {
        setWorkers((previous) => [...previous, createWorker()]);
    }

    function removeWorker(workerId: string) {
        setWorkers((previous) =>
            previous.filter((worker) => worker.tempId !== workerId)
        );
    }

    function updateWorker<K extends keyof WorkerForm>(
        workerId: string,
        field: K,
        value: WorkerForm[K]
    ) {
        setWorkers((previous) =>
            previous.map((worker) =>
                worker.tempId === workerId
                    ? { ...worker, [field]: value }
                    : worker
            )
        );
    }

    function validateStep1() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!project.projectName.trim()) {
            setError("Project name is required.");
            return false;
        }

        if (!project.location.trim()) {
            setError("Project location is required.");
            return false;
        }

        if (!project.projectManagerName.trim()) {
            setError("Project manager name is required.");
            return false;
        }

        if (!emailRegex.test(project.projectManagerEmail.trim())) {
            setError("Please enter a valid project manager email.");
            return false;
        }

        if (project.projectManagerPassword.length < 6) {
            setError("Project manager password must be at least 6 characters.");
            return false;
        }

        if (!project.startDate) {
            setError("Start date is required.");
            return false;
        }

        if (!project.expectedCompletion) {
            setError("Expected completion date is required.");
            return false;
        }

        if (project.expectedCompletion < project.startDate) {
            setError("Expected completion date cannot be before the start date.");
            return false;
        }

        setError("");
        return true;
    }

    function validateStep2() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const managerEmail = project.projectManagerEmail.trim().toLowerCase();
        const seenEmails = new Set<string>();

        for (let index = 0; index < workers.length; index++) {
            const worker = workers[index];
            const workerLabel = worker.name.trim()
                ? worker.name.trim()
                : `Worker ${index + 1}`;

            if (!worker.name.trim()) {
                setError(`Please enter a name for Worker ${index + 1}.`);
                return false;
            }

            if (!/^[0-9]{10}$/.test(worker.phone.trim())) {
                setError(`Please enter a valid 10-digit mobile number for ${workerLabel}.`);
                return false;
            }

            const email = worker.email.trim().toLowerCase();

            if (!emailRegex.test(email)) {
                setError(`Please enter a valid email address for ${workerLabel}.`);
                return false;
            }

            if (email === managerEmail) {
                setError("The project manager and a worker cannot use the same email.");
                return false;
            }

            if (seenEmails.has(email)) {
                setError(`Duplicate worker email: ${email}`);
                return false;
            }

            seenEmails.add(email);

            if (worker.password.length < 6) {
                setError(`Password for ${workerLabel} must be at least 6 characters.`);
                return false;
            }

            if (
                !worker.salary ||
                !Number.isFinite(Number(worker.salary)) ||
                Number(worker.salary) <= 0
            ) {
                setError(`Please enter a valid salary/wage for ${workerLabel}.`);
                return false;
            }
        }

        setError("");
        return true;
    }

    function nextStep() {
        setError("");

        if (step === 1) {
            if (!validateStep1()) return;
            setStep(2);
            return;
        }

        if (step === 2) {
            if (!validateStep2()) return;
            setStep(3);
        }
    }

    function previousStep() {
        setError("");
        if (step > 1) setStep((previous) => previous - 1);
    }

    const totalWorkers = workers.length;

    const totalSalary = useMemo(
        () =>
            workers.reduce(
                (total, worker) => total + (Number(worker.salary) || 0),
                0
            ),
        [workers]
    );

    async function createProject() {
        if (!validateStep1()) {
            setStep(1);
            return;
        }

        if (!validateStep2()) {
            setStep(2);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/construction/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    project: {
                        projectName: project.projectName.trim(),
                        location: project.location.trim(),
                        projectManagerName: project.projectManagerName.trim(),
                        projectManagerEmail:
                            project.projectManagerEmail.trim().toLowerCase(),
                        projectManagerPassword: project.projectManagerPassword,
                        startDate: project.startDate,
                        expectedCompletion: project.expectedCompletion,
                        status: project.status,
                        description: project.description.trim() || undefined,
                    },
                    workers: workers.map((worker) => ({
                        name: worker.name.trim(),
                        phone: worker.phone.trim(),
                        email: worker.email.trim().toLowerCase(),
                        password: worker.password,
                        workerType: worker.workerType,
                        salary: Number(worker.salary),
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Failed to create project."
                );
            }

            const projectId = data.project?.projectId;

            if (!projectId) {
                throw new Error(
                    "The API did not return a project ID. Check the project API response."
                );
            }

            router.push(`/DriWE-Construction/projects/${projectId}`);
        } catch (err) {
            console.error("Create project error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create project."
            );
        } finally {
            setLoading(false);
        }
    }

    const steps = [
        { number: 1, title: "Project", icon: Building2 },
        { number: 2, title: "Workers", icon: Users },
        { number: 3, title: "Review", icon: Check },
    ];

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-zinc-950" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.09),transparent_42%),radial-gradient(ellipse_at_bottom_left,rgba(250,204,21,0.04),transparent_35%)]" />

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <header className="mb-8">
                    <button
                        type="button"
                        onClick={() => router.push("/DriWE-Construction/projects")}
                        className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10">
                            <Building2 className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Create New Project
                            </h1>
                            <p className="mt-1 text-sm text-zinc-400">
                                Set up your project, manager account and workers.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-xl sm:p-4">
                    <div className="grid grid-cols-3 gap-2">
                        {steps.map((item) => {
                            const Icon = item.icon;
                            const active = step === item.number;
                            const completed = step > item.number;

                            return (
                                <div key={item.number}>
                                    <div
                                        className={`flex items-center gap-2 rounded-xl px-2 py-3 transition sm:gap-3 sm:px-3 ${
                                            active
                                                ? "bg-yellow-400/10 text-yellow-300"
                                                : completed
                                                  ? "text-green-400"
                                                  : "text-zinc-500"
                                        }`}
                                    >
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                active
                                                    ? "bg-yellow-400 text-black"
                                                    : completed
                                                      ? "bg-green-400/10"
                                                      : "bg-zinc-800"
                                            }`}
                                        >
                                            {completed ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Icon className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] sm:text-xs">
                                                Step {item.number}
                                            </p>
                                            <p className="truncate text-xs font-semibold sm:text-sm">
                                                {item.title}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
                    {step === 1 && (
                        <section className="p-5 sm:p-8">
                            <div className="mb-7">
                                <h2 className="text-xl font-bold text-white">
                                    Project Information
                                </h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Enter project details and create the manager's login.
                                </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Project Name *</label>
                                    <input
                                        value={project.projectName}
                                        onChange={(e) => updateProject("projectName", e.target.value)}
                                        placeholder="e.g. DriWE Tower"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Project Location *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            value={project.location}
                                            onChange={(e) => updateProject("location", e.target.value)}
                                            placeholder="Enter project location"
                                            className={`${inputClass} pl-11`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Project Manager Name *</label>
                                    <input
                                        value={project.projectManagerName}
                                        onChange={(e) => updateProject("projectManagerName", e.target.value)}
                                        placeholder="Manager full name"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Project Manager Email *</label>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        value={project.projectManagerEmail}
                                        onChange={(e) => updateProject("projectManagerEmail", e.target.value)}
                                        placeholder="manager@example.com"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Project Manager Password *</label>
                                    <div className="relative">
                                        <input
                                            type={project.showManagerPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            value={project.projectManagerPassword}
                                            onChange={(e) => updateProject("projectManagerPassword", e.target.value)}
                                            placeholder="Minimum 6 characters"
                                            className={`${inputClass} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateProject("showManagerPassword", !project.showManagerPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-yellow-400"
                                            aria-label={project.showManagerPassword ? "Hide manager password" : "Show manager password"}
                                        >
                                            {project.showManagerPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        The manager will use this password to sign in.
                                    </p>
                                </div>

                                <div>
                                    <label className={labelClass}>Project Status</label>
                                    <select
                                        value={project.status}
                                        onChange={(e) => updateProject("status", e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="Active">Active</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Start Date *</label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="date"
                                            value={project.startDate}
                                            onChange={(e) => updateProject("startDate", e.target.value)}
                                            className={`${inputClass} pl-11`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Expected Completion *</label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="date"
                                            value={project.expectedCompletion}
                                            onChange={(e) => updateProject("expectedCompletion", e.target.value)}
                                            className={`${inputClass} pl-11`}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        value={project.description}
                                        onChange={(e) => updateProject("description", e.target.value)}
                                        rows={4}
                                        placeholder="Add project description..."
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="p-5 sm:p-8">
                            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Project Workers</h2>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        Add workers directly to this project.
                                    </p>
                                </div>
                                <button type="button" onClick={addWorker} className={primaryButtonClass}>
                                    <Plus className="h-4 w-4" />
                                    Add Worker
                                </button>
                            </div>

                            {workers.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 px-5 py-14 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10">
                                        <Users className="h-7 w-7 text-yellow-400" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-white">No workers added</h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                                        You can create the project first and add workers later, or add workers now.
                                    </p>
                                    <button type="button" onClick={addWorker} className={`${primaryButtonClass} mt-5`}>
                                        <Plus className="h-4 w-4" />
                                        Add First Worker
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {workers.map((worker, index) => (
                                        <div key={worker.tempId} className={`${cardClass} p-4 sm:p-5`}>
                                            <div className="mb-5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400/10 text-sm font-bold text-yellow-400">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white">
                                                            {worker.name.trim() || `Worker ${index + 1}`}
                                                        </h3>
                                                        <p className="text-xs text-zinc-500">Project worker</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeWorker(worker.tempId)}
                                                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                                                    title="Remove worker"
                                                    aria-label={`Remove worker ${index + 1}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className={labelClass}>Worker Name *</label>
                                                    <input
                                                        value={worker.name}
                                                        onChange={(e) => updateWorker(worker.tempId, "name", e.target.value)}
                                                        placeholder="Full name"
                                                        className={inputClass}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Mobile Number *</label>
                                                    <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        maxLength={10}
                                                        value={worker.phone}
                                                        onChange={(e) => updateWorker(worker.tempId, "phone", e.target.value.replace(/\D/g, ""))}
                                                        placeholder="10 digit mobile number"
                                                        className={inputClass}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Login Email *</label>
                                                    <input
                                                        type="email"
                                                        value={worker.email}
                                                        onChange={(e) => updateWorker(worker.tempId, "email", e.target.value)}
                                                        placeholder="worker@example.com"
                                                        className={inputClass}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Login Password *</label>
                                                    <div className="relative">
                                                        <input
                                                            type={worker.showPassword ? "text" : "password"}
                                                            value={worker.password}
                                                            onChange={(e) => updateWorker(worker.tempId, "password", e.target.value)}
                                                            placeholder="Minimum 6 characters"
                                                            className={`${inputClass} pr-11`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => updateWorker(worker.tempId, "showPassword", !worker.showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-yellow-400"
                                                            aria-label={worker.showPassword ? "Hide password" : "Show password"}
                                                        >
                                                            {worker.showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        The worker will use this password to log in.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Worker Type</label>
                                                    <select
                                                        value={worker.workerType}
                                                        onChange={(e) => updateWorker(worker.tempId, "workerType", e.target.value as WorkerType)}
                                                        className={inputClass}
                                                    >
                                                        <option value="Employee">Employee</option>
                                                        <option value="Contract Worker">Contract Worker</option>
                                                        <option value="Daily Wage">Daily Wage</option>
                                                        <option value="Subcontractor">Subcontractor</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={labelClass}>
                                                        {worker.workerType === "Daily Wage" ? "Daily Wage *" : "Salary *"}
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={worker.salary}
                                                            onChange={(e) => updateWorker(worker.tempId, "salary", e.target.value)}
                                                            placeholder="0"
                                                            className={`${inputClass} pl-9`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-zinc-300">
                                Workers added here are associated with this project. You can continue without adding workers and manage them later.
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section className="p-5 sm:p-8">
                            <div className="mb-7">
                                <h2 className="text-xl font-bold text-white">Review Project</h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Review the project details, manager login and workers.
                                </p>
                            </div>

                            <div className={`${cardClass} p-4 sm:p-5`}>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10">
                                        <Building2 className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="break-words text-lg font-bold text-white">
                                            {project.projectName}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                                            <MapPin className="h-4 w-4 shrink-0 text-yellow-400" />
                                            {project.location}
                                        </div>
                                        <p className="mt-2 text-sm text-zinc-400">
                                            Project Manager:{" "}
                                            <span className="font-medium text-zinc-200">
                                                {project.projectManagerName}
                                            </span>
                                        </p>
                                        <p className="mt-1 break-words text-sm text-zinc-400">
                                            Manager login: {project.projectManagerEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                                        <p className="text-xs text-zinc-500">Status</p>
                                        <p className="mt-1 text-sm font-semibold text-yellow-400">{project.status}</p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                                        <p className="text-xs text-zinc-500">Start Date</p>
                                        <p className="mt-1 text-sm font-semibold text-zinc-200">{project.startDate}</p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                                        <p className="text-xs text-zinc-500">Completion</p>
                                        <p className="mt-1 text-sm font-semibold text-zinc-200">{project.expectedCompletion}</p>
                                    </div>
                                </div>

                                {project.description.trim() && (
                                    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                                        <p className="text-xs text-zinc-500">Description</p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">
                                            {project.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className={`${cardClass} p-5`}>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Users className="h-4 w-4 text-yellow-400" />
                                        Workers
                                    </div>
                                    <p className="mt-2 text-3xl font-bold text-white">{totalWorkers}</p>
                                </div>
                                <div className={`${cardClass} p-5`}>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <HardHat className="h-4 w-4 text-yellow-400" />
                                        Total Salary / Wage
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-white">
                                        ₹{totalSalary.toLocaleString("en-IN")}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Daily wages and salaries may use different periods.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="mb-3 font-semibold text-white">Project Workers</h3>
                                {workers.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 px-5 py-8 text-center">
                                        <Users className="mx-auto h-7 w-7 text-zinc-600" />
                                        <p className="mt-3 text-sm text-zinc-400">
                                            No workers added. You can add them after creating the project.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {workers.map((worker, index) => (
                                            <div
                                                key={worker.tempId}
                                                className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                                                        <UserRound className="h-4 w-4 text-yellow-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="break-words text-sm font-medium text-white">
                                                            {index + 1}. {worker.name}
                                                        </p>
                                                        <p className="break-words text-xs text-zinc-400">
                                                            {worker.phone} · {worker.email}
                                                        </p>
                                                        <p className="mt-1 text-xs text-zinc-500">{worker.workerType}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:shrink-0 sm:text-right">
                                                    <p className="text-sm font-semibold text-zinc-200">
                                                        ₹{(Number(worker.salary) || 0).toLocaleString("en-IN")}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {worker.workerType === "Daily Wage" ? "Daily wage" : "Salary"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    <footer className="flex flex-col-reverse gap-3 border-t border-zinc-800 bg-zinc-950/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <button
                            type="button"
                            onClick={
                                step === 1
                                    ? () => router.push("/DriWE-Construction/projects")
                                    : previousStep
                            }
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {step === 1 ? "Cancel" : "Previous"}
                        </button>

                        {step < 3 ? (
                            <button type="button" onClick={nextStep} className={primaryButtonClass}>
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={createProject}
                                disabled={loading}
                                className={primaryButtonClass}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Create Project
                                    </>
                                )}
                            </button>
                        )}
                    </footer>
                </div>

                <p className="mt-6 text-center text-xs text-zinc-600">
                    DriWE Construction Management
                </p>
            </div>
        </main>
    );
}
