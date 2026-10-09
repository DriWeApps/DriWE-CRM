
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
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

interface SiteForm {
    tempId: string;
    siteName: string;
    location: string;
    workers: WorkerForm[];
}

interface ProjectForm {
    projectName: string;
    location: string;
    projectManager: string;
    projectManagerName: string;
    siteSupervisor: string;
    siteSupervisorName: string;
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
    siteSupervisor: "",
    siteSupervisorName: "",
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

function createSite(): SiteForm {
    return {
        tempId: crypto.randomUUID(),
        siteName: "",
        location: "",
        workers: [],
    };
}

export default function NewProjectPage() {
    const router = useRouter();

    const [step, setStep] = useState(1);

    const [project, setProject] =
        useState<ProjectForm>(emptyProject);

    const [sites, setSites] =
        useState<SiteForm[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /*
     * Step 1
     */
    function updateProject(
        field: keyof ProjectForm,
        value: string
    ) {
        setProject((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    /*
     * Sites
     */
    function addSite() {
        setSites((previous) => [
            ...previous,
            createSite(),
        ]);
    }

    function removeSite(tempId: string) {
        setSites((previous) =>
            previous.filter(
                (site) => site.tempId !== tempId
            )
        );
    }

    function updateSite(
        tempId: string,
        field: keyof SiteForm,
        value: string
    ) {
        setSites((previous) =>
            previous.map((site) =>
                site.tempId === tempId
                    ? {
                        ...site,
                        [field]: value,
                    }
                    : site
            )
        );
    }

    /*
     * Workers
     */
    function addWorker(siteId: string) {
        setSites((previous) =>
            previous.map((site) =>
                site.tempId === siteId
                    ? {
                        ...site,
                        workers: [
                            ...site.workers,
                            createWorker(),
                        ],
                    }
                    : site
            )
        );
    }

    function removeWorker(
        siteId: string,
        workerId: string
    ) {
        setSites((previous) =>
            previous.map((site) =>
                site.tempId === siteId
                    ? {
                        ...site,
                        workers:
                            site.workers.filter(
                                (worker) =>
                                    worker.tempId !==
                                    workerId
                            ),
                    }
                    : site
            )
        );
    }

    function updateWorker<K extends keyof WorkerForm>(
        siteId: string,
        workerId: string,
        field: K,
        value: WorkerForm[K]
    ) {
        setSites((previous) =>
            previous.map((site) =>
                site.tempId === siteId
                    ? {
                        ...site,
                        workers:
                            site.workers.map(
                                (worker) =>
                                    worker.tempId ===
                                        workerId
                                        ? {
                                            ...worker,
                                            [field]:
                                                value,
                                        }
                                        : worker
                            ),
                    }
                    : site
            )
        );
    }

    /*
     * Validation
     */
    function validateStep1() {
        if (!project.projectName.trim()) {
            setError("Project name is required.");
            return false;
        }

        if (!project.location.trim()) {
            setError("Project location is required.");
            return false;
        }

        if (!project.startDate) {
            setError("Start date is required.");
            return false;
        }

        if (!project.expectedCompletion) {
            setError(
                "Expected completion date is required."
            );
            return false;
        }

        if (
            project.expectedCompletion <
            project.startDate
        ) {
            setError(
                "Expected completion date cannot be before the start date."
            );
            return false;
        }

        setError("");
        return true;
    }

    function validateStep2() {
        if (sites.length === 0) {
            setError(
                "Please add at least one site."
            );
            return false;
        }

        for (let index = 0; index < sites.length; index++) {
            const site = sites[index];

            if (!site.siteName.trim()) {
                setError(
                    `Please enter a name for Site ${index + 1
                    }.`
                );
                return false;
            }

            if (!site.location.trim()) {
                setError(
                    `Please enter the location for Site ${index + 1
                    }.`
                );
                return false;
            }
        }

        setError("");
        return true;
    }

    function validateStep3() {
        for (
            let siteIndex = 0;
            siteIndex < sites.length;
            siteIndex++
        ) {
            const site = sites[siteIndex];

            for (
                let workerIndex = 0;
                workerIndex < site.workers.length;
                workerIndex++
            ) {
                const worker =
                    site.workers[workerIndex];

                if (!worker.name.trim()) {
                    setError(
                        `Please enter the worker name for Site ${siteIndex + 1
                        }, Worker ${workerIndex + 1
                        }.`
                    );
                    return false;
                }

                if (!worker.phone.trim()) {
                    setError(
                        `Please enter the mobile number for ${worker.name
                        }.`
                    );
                    return false;
                }

                if (
                    !/^[0-9]{10}$/.test(
                        worker.phone.trim()
                    )
                ) {
                    setError(
                        `Please enter a valid 10-digit mobile number for ${worker.name
                        }.`
                    );
                    return false;
                }

                if (!worker.email.trim()) {
                    setError(`Please enter the email address for ${worker.name}.`);
                    return false;
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(worker.email.trim())) {
                    setError(`Please enter a valid email address for ${worker.name}.`);
                    return false;
                }

                if (!worker.password) {
                    setError(`Please enter a login password for ${worker.name}.`);
                    return false;
                }

                if (worker.password.length < 6) {
                    setError(`Password for ${worker.name} must be at least 6 characters.`);
                    return false;
                }

                if (
                    !worker.salary ||
                    Number(worker.salary) <= 0
                ) {
                    setError(
                        `Please enter a valid salary/wage for ${worker.name
                        }.`
                    );
                    return false;
                }
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
            return;
        }

        if (step === 3) {
            if (!validateStep3()) return;
            setStep(4);
        }
    }

    function previousStep() {
        setError("");

        if (step > 1) {
            setStep((previous) => previous - 1);
        }
    }

    /*
     * Summary
     */
    const totalWorkers = useMemo(() => {
        return sites.reduce(
            (total, site) =>
                total + site.workers.length,
            0
        );
    }, [sites]);

    const totalMonthlySalary = useMemo(() => {
        return sites.reduce(
            (total, site) =>
                total +
                site.workers.reduce(
                    (siteTotal, worker) =>
                        siteTotal +
                        (Number(worker.salary) || 0),
                    0
                ),
            0
        );
    }, [sites]);

    /*
     * Create Project
     */
    async function createProject() {
        if (!validateStep1()) {
            setStep(1);
            return;
        }

        if (!validateStep2()) {
            setStep(2);
            return;
        }

        if (!validateStep3()) {
            setStep(3);
            return;
        }

        try {
            setLoading(true);
            setError("");

            /*
             * The backend receives the entire project
             * structure in one request.
             *
             * The backend can then:
             *
             * 1. Create project
             * 2. Create sites
             * 3. Create workers
             *
             * Workers already contain their site
             * because they are nested under that site.
             */

            const response = await fetch(
                "/api/construction/projects",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        project: {
                            projectName:
                                project.projectName.trim(),
                            location:
                                project.location.trim(),
                            projectManager:
                                project.projectManager ||
                                undefined,
                            projectManagerName:
                                project.projectManagerName.trim() ||
                                undefined,
                            siteSupervisor:
                                project.siteSupervisor ||
                                undefined,
                            siteSupervisorName:
                                project.siteSupervisorName.trim() ||
                                undefined,
                            startDate:
                                project.startDate,
                            expectedCompletion:
                                project.expectedCompletion,
                            status:
                                project.status,
                            description:
                                project.description.trim() ||
                                undefined,
                        },

                        sites: sites.map(
                            (site) => ({
                                siteName:
                                    site.siteName.trim(),
                                location:
                                    site.location.trim(),

                                workers:
                                    site.workers.map(
                                        (worker) => ({
                                            name:
                                                worker.name.trim(),
                                            phone:
                                                worker.phone.trim(),
                                            email:
                                                worker.email.trim().toLowerCase(),
                                            password:
                                                worker.password,
                                            workerType:
                                                worker.workerType,
                                            salary:
                                                Number(
                                                    worker.salary
                                                ),
                                        })
                                    ),
                            })
                        ),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to create project."
                );
            }

            router.push(
                `/DriWE-Construction/projects/${data.project?.projectId || ""}`
            );
        } catch (err) {
            console.error(
                "Create project error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create project."
            );
        } finally {
            setLoading(false);
        }
    }

    /*
     * Step indicator
     */
    const steps = [
        {
            number: 1,
            title: "Project",
            icon: Building2,
        },
        {
            number: 2,
            title: "Sites",
            icon: MapPin,
        },
        {
            number: 3,
            title: "Workers",
            icon: Users,
        },
        {
            number: 4,
            title: "Review",
            icon: Check,
        },
    ];

    return (
        <main className="relative min-h-screen text-zinc-900">

            {/* Background photo */}
            <div
                className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/building%20image%201.avif')" }}
            />
            {/* Light overlay so the photo stays soft and text stays readable */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/90 via-white/85 to-white/90" />

            <div className="mx-auto max-w-6xl px-6 py-8">

                {/* Header */}
                <div className="mb-8">

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/DriWE-Construction/projects"
                            )
                        }
                        className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-sky-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </button>

                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 backdrop-blur-xl border border-zinc-200 shadow-sm">
                            <Building2 className="h-6 w-6 text-zinc-900" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900">
                                Create New Project
                            </h1>

                            <p className="mt-1 text-sm text-zinc-500">
                                Set up your project, sites and workers.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Step indicator */}
                <div className="mb-8 rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-4 shadow-sm">

                    <div className="grid grid-cols-4 gap-2">

                        {steps.map((item) => {
                            const Icon =
                                item.icon;

                            const active =
                                step ===
                                item.number;

                            const completed =
                                step >
                                item.number;

                            return (
                                <div
                                    key={
                                        item.number
                                    }
                                    className="relative"
                                >

                                    <div
                                        className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${active
                                                ? "bg-sky-500/10 text-sky-700"
                                                : completed
                                                    ? "text-green-600"
                                                    : "text-zinc-400"
                                            }`}
                                    >

                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active
                                                    ? "bg-sky-600 text-white"
                                                    : completed
                                                        ? "bg-green-500/10"
                                                        : "bg-zinc-100"
                                                }`}
                                        >
                                            {completed ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Icon className="h-4 w-4" />
                                            )}
                                        </div>

                                        <div className="hidden sm:block">
                                            <p className="text-xs">
                                                Step{" "}
                                                {
                                                    item.number
                                                }
                                            </p>

                                            <p className="text-sm font-semibold">
                                                {
                                                    item.title
                                                }
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Main card */}
                <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl shadow-sm">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="p-6 md:p-8">

                            <div className="mb-7">
                                <h2 className="text-xl font-bold text-zinc-900">
                                    Project Information
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Enter the basic details of your construction project.
                                </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">

                                {/* Project Name */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Project Name *
                                    </label>

                                    <input
                                        value={
                                            project.projectName
                                        }
                                        onChange={(event) =>
                                            updateProject(
                                                "projectName",
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. DriWE Tower"
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-sky-500"
                                    />
                                </div>

                                {/* Location */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Project Location *
                                    </label>

                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                                        <input
                                            value={
                                                project.location
                                            }
                                            onChange={(event) =>
                                                updateProject(
                                                    "location",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter project location"
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-sky-500"
                                        />
                                    </div>
                                </div>

                                {/* Project Manager */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Project Manager
                                    </label>

                                    <input
                                        value={
                                            project.projectManagerName
                                        }
                                        onChange={(event) =>
                                            updateProject(
                                                "projectManagerName",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Manager name"
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-sky-500"
                                    />
                                </div>

                                {/* Site Supervisor */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Site Supervisor
                                    </label>

                                    <input
                                        value={
                                            project.siteSupervisorName
                                        }
                                        onChange={(event) =>
                                            updateProject(
                                                "siteSupervisorName",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Supervisor name"
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-sky-500"
                                    />
                                </div>

                                {/* Start date */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Start Date *
                                    </label>

                                    <div className="relative">
                                        <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                                        <input
                                            type="date"
                                            value={
                                                project.startDate
                                            }
                                            onChange={(event) =>
                                                updateProject(
                                                    "startDate",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-sky-500"
                                        />
                                    </div>
                                </div>

                                {/* Expected completion */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Expected Completion *
                                    </label>

                                    <div className="relative">
                                        <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                                        <input
                                            type="date"
                                            value={
                                                project.expectedCompletion
                                            }
                                            onChange={(event) =>
                                                updateProject(
                                                    "expectedCompletion",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-sky-500"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Project Status
                                    </label>

                                    <select
                                        value={
                                            project.status
                                        }
                                        onChange={(event) =>
                                            updateProject(
                                                "status",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-sky-500"
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
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            project.description
                                        }
                                        onChange={(event) =>
                                            updateProject(
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="Add project description..."
                                        className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                    />
                                </div>

                            </div>

                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="p-6 md:p-8">

                            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900">
                                        Project Sites
                                    </h2>

                                    <p className="mt-1 text-sm text-zinc-500">
                                        Add all sites that belong to this project.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSite}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Site
                                </button>

                            </div>

                            {sites.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 px-6 py-16 text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10">
                                        <MapPin className="h-7 w-7 text-sky-600" />
                                    </div>

                                    <h3 className="mt-4 font-semibold text-zinc-900">
                                        No sites added
                                    </h3>

                                    <p className="mt-1 text-sm text-zinc-500">
                                        Add the first site for this project.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={addSite}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add First Site
                                    </button>

                                </div>
                            ) : (
                                <div className="space-y-5">

                                    {sites.map(
                                        (
                                            site,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    site.tempId
                                                }
                                                className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5"
                                            >

                                                <div className="mb-5 flex items-center justify-between">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sm font-bold text-sky-700">
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold text-zinc-900">
                                                                Site{" "}
                                                                {
                                                                    index +
                                                                    1
                                                                }
                                                            </h3>

                                                            <p className="text-xs text-zinc-400">
                                                                Part of{" "}
                                                                {
                                                                    project.projectName ||
                                                                    "this project"
                                                                }
                                                            </p>
                                                        </div>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSite(
                                                                site.tempId
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-600"
                                                        title="Remove site"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>

                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">

                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                                                            Site Name *
                                                        </label>

                                                        <input
                                                            value={
                                                                site.siteName
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateSite(
                                                                    site.tempId,
                                                                    "siteName",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="e.g. Building A"
                                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                                                            Site Location *
                                                        </label>

                                                        <input
                                                            value={
                                                                site.location
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateSite(
                                                                    site.tempId,
                                                                    "location",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Site location"
                                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                                        />
                                                    </div>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="p-6 md:p-8">

                            <div className="mb-7">
                                <h2 className="text-xl font-bold text-zinc-900">
                                    Add Workers
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Workers are automatically assigned to their current site.
                                </p>
                            </div>

                            <div className="space-y-8">

                                {sites.map(
                                    (
                                        site,
                                        siteIndex
                                    ) => (
                                        <div
                                            key={
                                                site.tempId
                                            }
                                            className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5"
                                        >

                                            {/* Site heading */}
                                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                                                        <MapPin className="h-5 w-5 text-sky-600" />
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold text-zinc-900">
                                                            {
                                                                site.siteName ||
                                                                `Site ${siteIndex +
                                                                1
                                                                }`
                                                            }
                                                        </h3>

                                                        <p className="text-xs text-zinc-400">
                                                            {
                                                                site.location
                                                            }
                                                        </p>
                                                    </div>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        addWorker(
                                                            site.tempId
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Worker
                                                </button>

                                            </div>

                                            {site.workers.length ===
                                                0 ? (
                                                <div className="rounded-xl border border-dashed border-zinc-300 px-5 py-10 text-center">

                                                    <UserRound className="mx-auto h-8 w-8 text-zinc-300" />

                                                    <p className="mt-3 text-sm text-zinc-500">
                                                        No workers added to this site.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            addWorker(
                                                                site.tempId
                                                            )
                                                        }
                                                        className="mt-4 text-sm font-medium text-sky-700 hover:text-sky-800"
                                                    >
                                                        + Add first worker
                                                    </button>

                                                </div>
                                            ) : (
                                                <div className="space-y-4">

                                                    {site.workers.map(
                                                        (
                                                            worker,
                                                            workerIndex
                                                        ) => (
                                                            <div
                                                                key={
                                                                    worker.tempId
                                                                }
                                                                className="rounded-xl border border-zinc-200 bg-white p-4"
                                                            >

                                                                <div className="mb-4 flex items-center justify-between">

                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-500">
                                                                            {
                                                                                workerIndex +
                                                                                1
                                                                            }
                                                                        </div>

                                                                        <span className="text-sm font-semibold text-zinc-900">
                                                                            Worker{" "}
                                                                            {
                                                                                workerIndex +
                                                                                1
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeWorker(
                                                                                site.tempId,
                                                                                worker.tempId
                                                                            )
                                                                        }
                                                                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-600"
                                                                        title="Remove worker"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>

                                                                </div>

                                                                <div className="grid gap-4 md:grid-cols-2">

                                                                    {/* Name */}
                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-zinc-500">
                                                                            Worker Name *
                                                                        </label>

                                                                        <input
                                                                            value={
                                                                                worker.name
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                updateWorker(
                                                                                    site.tempId,
                                                                                    worker.tempId,
                                                                                    "name",
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            placeholder="Full name"
                                                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                                                        />
                                                                    </div>

                                                                    {/* Mobile */}
                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-zinc-500">
                                                                            Mobile Number *
                                                                        </label>

                                                                        <input
                                                                            type="tel"
                                                                            inputMode="numeric"
                                                                            maxLength={
                                                                                10
                                                                            }
                                                                            value={
                                                                                worker.phone
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                updateWorker(
                                                                                    site.tempId,
                                                                                    worker.tempId,
                                                                                    "phone",
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                        .replace(
                                                                                            /\D/g,
                                                                                            ""
                                                                                        )
                                                                                )
                                                                            }
                                                                            placeholder="10 digit mobile number"
                                                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                                                        />
                                                                    </div>

                                                                    {/* Email */}
                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-zinc-500">
                                                                            Login Email *
                                                                        </label>
                                                                        <input
                                                                            type="email"
                                                                            value={worker.email}
                                                                            onChange={(event) =>
                                                                                updateWorker(
                                                                                    site.tempId,
                                                                                    worker.tempId,
                                                                                    "email",
                                                                                    event.target.value
                                                                                )
                                                                            }
                                                                            placeholder="worker@example.com"
                                                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                                                        />
                                                                    </div>

                                                                    {/* Password */}
                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-zinc-500">
                                                                            Login Password *
                                                                        </label>
                                                                        <div className="relative">
                                                                            <input
                                                                                type={worker.showPassword ? "text" : "password"}
                                                                                value={worker.password}
                                                                                onChange={(event) =>
                                                                                    updateWorker(
                                                                                        site.tempId,
                                                                                        worker.tempId,
                                                                                        "password",
                                                                                        event.target.value
                                                                                    )
                                                                                }
                                                                                placeholder="Minimum 6 characters"
                                                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-11 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    updateWorker(
                                                                                        site.tempId,
                                                                                        worker.tempId,
                                                                                        "showPassword",
                                                                                        !worker.showPassword
                                                                                    )
                                                                                }
                                                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-700"
                                                                                aria-label={worker.showPassword ? "Hide password" : "Show password"}
                                                                            >
                                                                                {worker.showPassword ? (
                                                                                    <EyeOff className="h-4 w-4" />
                                                                                ) : (
                                                                                    <Eye className="h-4 w-4" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                        <p className="mt-1 text-[11px] text-zinc-400">
                                                                            This password will be used by the worker to log in.
                                                                        </p>
                                                                    </div>

                                                                    {/* Worker Type */}
                                                                    <div>
                                                                        <label className="mb-2 block text-xs font-medium text-zinc-500">
                                                                            Worker Type
                                                                        </label>

                                                                        <select
                                                                            value={worker.workerType}
                                                                            onChange={(event) =>
                                                                                updateWorker(
                                                                                    site.tempId,
                                                                                    worker.tempId,
                                                                                    "workerType",
                                                                                    event.target.value as WorkerType
                                                                                )
                                                                            }
                                                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-sky-500"
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
                                                                        <label className="mb-2 block text-xs font-medium text-zinc-500">
                                                                            {worker.workerType ===
                                                                                "Daily Wage"
                                                                                ? "Daily Wage *"
                                                                                : "Salary *"}
                                                                        </label>

                                                                        <div className="relative">
                                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                                                                                ₹
                                                                            </span>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={
                                                                                    worker.salary
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    updateWorker(
                                                                                        site.tempId,
                                                                                        worker.tempId,
                                                                                        "salary",
                                                                                        event
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                placeholder="0"
                                                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-9 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-500"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                                {/* Automatic assignment */}
                                                                <div className="mt-4 flex items-center gap-2 rounded-lg bg-sky-500/5 px-3 py-2 text-xs text-sky-700">
                                                                    <MapPin className="h-3.5 w-3.5" />

                                                                    Automatically assigned to:
                                                                    <span className="font-semibold">
                                                                        {
                                                                            site.siteName
                                                                        }
                                                                    </span>
                                                                </div>

                                                            </div>
                                                        )
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    )
                                )}

                            </div>

                        </div>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                        <div className="p-6 md:p-8">

                            <div className="mb-7">
                                <h2 className="text-xl font-bold text-zinc-900">
                                    Review Project
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Check the project, sites and workers before creating it.
                                </p>
                            </div>

                            {/* Project summary */}
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10">
                                        <Building2 className="h-5 w-5 text-sky-600" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-zinc-900">
                                            {
                                                project.projectName
                                            }
                                        </h3>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                                            <MapPin className="h-4 w-4" />
                                            {
                                                project.location
                                            }
                                        </div>
                                    </div>

                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">

                                    <div className="rounded-xl bg-white p-4 border border-zinc-200">
                                        <p className="text-xs text-zinc-400">
                                            Status
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-sky-700">
                                            {
                                                project.status
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 border border-zinc-200">
                                        <p className="text-xs text-zinc-400">
                                            Start Date
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-zinc-700">
                                            {
                                                project.startDate
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 border border-zinc-200">
                                        <p className="text-xs text-zinc-400">
                                            Completion
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-zinc-700">
                                            {
                                                project.expectedCompletion
                                            }
                                        </p>
                                    </div>

                                </div>

                            </div>

                            {/* Statistics */}
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">

                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <MapPin className="h-4 w-4 text-sky-600" />
                                        Sites
                                    </div>

                                    <p className="mt-2 text-3xl font-bold text-zinc-900">
                                        {
                                            sites.length
                                        }
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <Users className="h-4 w-4 text-sky-600" />
                                        Workers
                                    </div>

                                    <p className="mt-2 text-3xl font-bold text-zinc-900">
                                        {
                                            totalWorkers
                                        }
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <HardHat className="h-4 w-4 text-sky-600" />
                                        Total Wage
                                    </div>

                                    <p className="mt-2 text-2xl font-bold text-zinc-900">
                                        ₹
                                        {totalMonthlySalary.toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>

                            </div>

                            {/* Sites */}
                            <div className="mt-6 space-y-4">

                                {sites.map(
                                    (
                                        site,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                site.tempId
                                            }
                                            className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5"
                                        >

                                            <div className="flex items-center justify-between">

                                                <div>
                                                    <h3 className="font-semibold text-zinc-900">
                                                        {
                                                            site.siteName
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        {
                                                            site.location
                                                        }
                                                    </p>
                                                </div>

                                                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700">
                                                    {
                                                        site.workers.length
                                                    }{" "}
                                                    workers
                                                </span>

                                            </div>

                                            {site.workers.length >
                                                0 && (
                                                    <div className="mt-4 space-y-2">

                                                        {site.workers.map(
                                                            (
                                                                worker
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        worker.tempId
                                                                    }
                                                                    className="flex flex-col gap-2 rounded-xl bg-white border border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                                                >

                                                                    <div className="flex items-center gap-3">

                                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                                                                            <UserRound className="h-4 w-4 text-zinc-500" />
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-sm font-medium text-zinc-900">
                                                                                {
                                                                                    worker.name
                                                                                }
                                                                            </p>

                                                                            <p className="text-xs text-zinc-400">
                                                                                {worker.phone} · {worker.email}
                                                                            </p>
                                                                        </div>

                                                                    </div>

                                                                    <div className="text-left sm:text-right">
                                                                        <p className="text-sm font-semibold text-zinc-700">
                                                                            ₹
                                                                            {Number(
                                                                                worker.salary
                                                                            ).toLocaleString(
                                                                                "en-IN"
                                                                            )}
                                                                        </p>

                                                                        <p className="text-xs text-zinc-400">
                                                                            {
                                                                                worker.workerType
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                </div>
                                                            )
                                                        )}

                                                    </div>
                                                )}

                                        </div>
                                    )
                                )}

                            </div>

                        </div>
                    )}

                    {/* Footer navigation */}
                    <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 p-6 sm:flex-row sm:items-center sm:justify-between">

                        <button
                            type="button"
                            onClick={
                                step === 1
                                    ? () =>
                                        router.push(
                                            "/DriWE-Construction/projects"
                                        )
                                    : previousStep
                            }
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />

                            {step === 1
                                ? "Cancel"
                                : "Previous"}
                        </button>

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={
                                    nextStep
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                Continue

                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={
                                    createProject
                                }
                                disabled={
                                    loading
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
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

                    </div>

                </div>

            </div>
        </main>
    );
}