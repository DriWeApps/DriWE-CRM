
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorPopup } from "@/components/ui/error-popup";
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
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

const labelClass =
    "mb-2 block text-sm font-medium text-gray-700";

const cardClass =
    "rounded-2xl border border-gray-200 bg-white";

const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";

export default function NewProjectPage() {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [project, setProject] =
        useState<ProjectForm>(emptyProject);
    const [workers, setWorkers] = useState<WorkerForm[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function showValidationPopup(message: string) {
        // Show errors in the in-page alert so they are readable and non-blocking.
        setError(message);
    }

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
            showValidationPopup("Project name is required.");
            return false;
        }

        if (!project.location.trim()) {
            showValidationPopup("Project location is required.");
            return false;
        }

        if (!project.projectManagerName.trim()) {
            showValidationPopup("Project manager name is required.");
            return false;
        }

        if (!emailRegex.test(project.projectManagerEmail.trim().toLowerCase())) {
            showValidationPopup("Please enter a valid project manager email.");
            return false;
        }

        if (project.projectManagerPassword.length < 6) {
            showValidationPopup("Project manager password must be at least 6 characters.");
            return false;
        }

        if (!project.startDate) {
            showValidationPopup("Start date is required.");
            return false;
        }

        if (!project.expectedCompletion) {
            showValidationPopup("Expected completion date is required.");
            return false;
        }

        if (project.expectedCompletion < project.startDate) {
            showValidationPopup("Expected completion date cannot be before the start date.");
            return false;
        }

        showValidationPopup("");
        return true;
    }

    function validateStep2() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const managerEmail = project.projectManagerEmail.trim().toLowerCase();
        const seenEmails = new Set<string>();

        if (workers.length === 0) {
            showValidationPopup("Please add at least one worker and complete the required worker details before continuing.");
            return false;
        }

        for (let index = 0; index < workers.length; index++) {
            const worker = workers[index];
            const workerLabel = worker.name.trim()
                ? worker.name.trim()
                : `Worker ${index + 1}`;

            if (!worker.name.trim()) {
                showValidationPopup(`Please enter a name for Worker ${index + 1}.`);
                return false;
            }

            if (!/^[0-9]{10}$/.test(worker.phone.trim())) {
                showValidationPopup(`Please enter a valid 10-digit mobile number for ${workerLabel}.`);
                return false;
            }

            const email = worker.email.trim().toLowerCase();

            if (!emailRegex.test(email)) {
                showValidationPopup(`Please enter a valid email address for ${workerLabel}.`);
                return false;
            }

            if (email === managerEmail) {
                showValidationPopup("The project manager and a worker cannot use the same email.");
                return false;
            }

            if (seenEmails.has(email)) {
                showValidationPopup(`Duplicate worker email: ${email}`);
                return false;
            }

            seenEmails.add(email);

            if (worker.password.length < 6) {
                showValidationPopup(`Password for ${workerLabel} must be at least 6 characters.`);
                return false;
            }

            if (
                !worker.salary ||
                !Number.isFinite(Number(worker.salary)) ||
                Number(worker.salary) <= 0
            ) {
                showValidationPopup(`Please enter a valid salary/wage for ${workerLabel}.`);
                return false;
            }
        }

        showValidationPopup("");
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
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "";

            const normalizedMessage = message.toLowerCase();
            if (
                normalizedMessage.includes("account already exists") ||
                normalizedMessage.includes("email already exists") ||
                normalizedMessage.includes("email already exist")
            ) {
                setError(
                    "An account already uses this email. Enter a different email address for the project manager or worker, then try again."
                );
                return;
            }

            setError(
                message ||
                    "We couldn’t create the project. Check the required fields and try again."
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
        <main className="min-h-screen bg-white text-black">
            <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 2xl:px-14">
                {/* Header */}
                <header className="mb-8">
                    <button
                        type="button"
                        onClick={() => router.push("/DriWE-Construction/projects")}
                        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                            <Building2 className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                                Create New Project
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Set up your project, manager account and workers.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Step progress */}
                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
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
                                                ? "bg-gray-100 text-black"
                                                : completed
                                                  ? "text-green-700"
                                                  : "text-gray-500"
                                        }`}
                                    >
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                active
                                                    ? "bg-black text-white"
                                                    : completed
                                                      ? "bg-green-100 text-green-700"
                                                      : "bg-gray-100 text-gray-500"
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

                <ErrorPopup message={error} onClose={() => setError("")} />

                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    {/* Step 1: Project details */}
                    {step === 1 && (
                        <section className="p-5 sm:p-8">
                            <div className="mb-7">
                                <h2 className="text-xl font-bold text-black">
                                    Project Information
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Enter project details and create the manager&apos;s login.
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
                                        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-black"
                                            aria-label={project.showManagerPassword ? "Hide manager password" : "Show manager password"}
                                        >
                                            {project.showManagerPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
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
                                        <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                                        <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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

                    {/* Step 2: Workers */}
                    {step === 2 && (
                        <section className="p-5 sm:p-8">
                            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-black">Project Workers</h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Add workers directly to this project.
                                    </p>
                                </div>
                                <button type="button" onClick={addWorker} className={primaryButtonClass}>
                                    <Plus className="h-4 w-4" />
                                    Add Worker
                                </button>
                            </div>

                            {workers.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-14 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                                        <Users className="h-7 w-7 text-black" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-black">No workers added</h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
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
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-black">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-black">
                                                            {worker.name.trim() || `Worker ${index + 1}`}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">Project worker</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeWorker(worker.tempId)}
                                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
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
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-black"
                                                            aria-label={worker.showPassword ? "Hide password" : "Show password"}
                                                        >
                                                            {worker.showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
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
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
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

                            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                Add at least one worker and complete all required worker details before continuing to the review step.
                            </div>
                        </section>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <section className="p-5 sm:p-8">
                            <div className="mb-7">
                                <h2 className="text-xl font-bold text-black">Review Project</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Review the project details, manager login and workers.
                                </p>
                            </div>

                            <div className={`${cardClass} p-4 sm:p-5`}>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                                        <Building2 className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="break-words text-lg font-bold text-black">
                                            {project.projectName}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
                                            {project.location}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Project Manager:{" "}
                                            <span className="font-medium text-black">
                                                {project.projectManagerName}
                                            </span>
                                        </p>
                                        <p className="mt-1 break-words text-sm text-gray-600">
                                            Manager login: {project.projectManagerEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-500">Status</p>
                                        <p className="mt-1 text-sm font-semibold text-black">{project.status}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-500">Start Date</p>
                                        <p className="mt-1 text-sm font-semibold text-black">{project.startDate}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-500">Completion</p>
                                        <p className="mt-1 text-sm font-semibold text-black">{project.expectedCompletion}</p>
                                    </div>
                                </div>

                                {project.description.trim() && (
                                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-500">Description</p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                                            {project.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className={`${cardClass} p-5`}>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="h-4 w-4 text-black" />
                                        Workers
                                    </div>
                                    <p className="mt-2 text-3xl font-bold text-black">{totalWorkers}</p>
                                </div>
                                <div className={`${cardClass} p-5`}>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <HardHat className="h-4 w-4 text-black" />
                                        Total Salary / Wage
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-black">
                                        ₹{totalSalary.toLocaleString("en-IN")}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Daily wages and salaries may use different periods.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="mb-3 font-semibold text-black">Project Workers</h3>
                                {workers.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                                        <Users className="mx-auto h-7 w-7 text-gray-400" />
                                        <p className="mt-3 text-sm text-gray-600">
                                            No workers added. You can add them after creating the project.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {workers.map((worker, index) => (
                                            <div
                                                key={worker.tempId}
                                                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                        <UserRound className="h-4 w-4 text-black" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="break-words text-sm font-medium text-black">
                                                            {index + 1}. {worker.name}
                                                        </p>
                                                        <p className="break-words text-xs text-gray-600">
                                                            {worker.phone} · {worker.email}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">{worker.workerType}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:shrink-0 sm:text-right">
                                                    <p className="text-sm font-semibold text-black">
                                                        ₹{(Number(worker.salary) || 0).toLocaleString("en-IN")}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
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

                    {/* Footer navigation */}
                    <footer className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <button
                            type="button"
                            onClick={
                                step === 1
                                    ? () => router.push("/DriWE-Construction/projects")
                                    : previousStep
                            }
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-black transition hover:border-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {step === 1 ? "Cancel" : "Previous"}
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className={primaryButtonClass}
                            >
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

                <p className="mt-6 text-center text-xs text-gray-500">
                    DriWE Construction Management
                </p>
            </div>
        </main>
    );
}

