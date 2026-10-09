import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    createProject,
    getProjects,
} from "@/services/construction-project.service";

import {
    createSite,
} from "@/services/construction-site.service";

import {
    createWorker,
} from "@/services/construction-worker.service";

import type {
    ProjectStatus,
    WorkerType,
} from "@/types/construction";

/* =========================================================
   HELPERS
========================================================= */

function getCompanyId(user: any): string {
    return user.companyId || user.userId;
}

const WORKER_TYPES: WorkerType[] = [
    "Employee",
    "Contract Worker",
    "Daily Wage",
    "Subcontractor",
];

function isWorkerType(value: unknown): value is WorkerType {
    return (
        typeof value === "string" &&
        WORKER_TYPES.includes(value as WorkerType)
    );
}

/* =========================================================
   GET PROJECTS
========================================================= */

export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const companyId = getCompanyId(user);

        const projects = await getProjects(companyId);

        return NextResponse.json({
            success: true,
            projects,
        });
    } catch (error) {
        console.error(
            "GET construction projects error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch projects",
            },
            { status: 500 }
        );
    }
}

/* =========================================================
   CREATE PROJECT + SITES + WORKERS + LOGIN ACCOUNTS
========================================================= */

export async function POST(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const body = await req.json();

        /*
         * Expected format:
         *
         * {
         *   project: {
         *      projectName,
         *      location,
         *      projectManager,
         *      projectManagerName,
         *      siteSupervisor,
         *      siteSupervisorName,
         *      startDate,
         *      expectedCompletion,
         *      status,
         *      description
         *   },
         *
         *   sites: [
         *      {
         *          siteName,
         *          location,
         *
         *          workers: [
         *              {
         *                  name,
         *                  phone,
         *                  email,
         *                  password,
         *                  workerType,
         *                  salary
         *              }
         *          ]
         *      }
         *   ]
         * }
         */

        const projectData = body?.project;
        const sitesData = body?.sites;

        /* =====================================================
           VALIDATE PROJECT DATA
        ===================================================== */

        if (!projectData) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project information is required.",
                },
                { status: 400 }
            );
        }

        const projectName =
            typeof projectData.projectName === "string"
                ? projectData.projectName.trim()
                : "";

        const location =
            typeof projectData.location === "string"
                ? projectData.location.trim()
                : "";

        const startDate =
            typeof projectData.startDate === "string"
                ? projectData.startDate.trim()
                : "";

        const expectedCompletion =
            typeof projectData.expectedCompletion === "string"
                ? projectData.expectedCompletion.trim()
                : "";

        if (
            !projectName ||
            !location ||
            !startDate ||
            !expectedCompletion
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project name, location, start date and expected completion are required.",
                },
                { status: 400 }
            );
        }

        /* =====================================================
           VALIDATE SITES
        ===================================================== */

        if (
            !Array.isArray(sitesData) ||
            sitesData.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least one site is required.",
                },
                { status: 400 }
            );
        }

        /* =====================================================
           VALIDATE SITES + WORKERS
        ===================================================== */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const workerEmails = new Set<string>();

        for (
            let siteIndex = 0;
            siteIndex < sitesData.length;
            siteIndex++
        ) {
            const site = sitesData[siteIndex];

            /* -------------------------------------------------
               SITE VALIDATION
            ------------------------------------------------- */

            if (
                !site ||
                typeof site.siteName !== "string" ||
                !site.siteName.trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Site ${siteIndex + 1}: Site name is required.`,
                    },
                    { status: 400 }
                );
            }

            if (
                site.location !== undefined &&
                site.location !== null &&
                typeof site.location !== "string"
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Site ${siteIndex + 1}: Site location is invalid.`,
                    },
                    { status: 400 }
                );
            }

            /* -------------------------------------------------
               WORKERS VALIDATION
            ------------------------------------------------- */

            if (
                site.workers !== undefined &&
                !Array.isArray(site.workers)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Site ${siteIndex + 1}: Workers must be an array.`,
                    },
                    { status: 400 }
                );
            }

            const workers = Array.isArray(site.workers)
                ? site.workers
                : [];

            for (
                let workerIndex = 0;
                workerIndex < workers.length;
                workerIndex++
            ) {
                const worker =
                    workers[workerIndex];

                const workerNumber =
                    workerIndex + 1;

                if (!worker) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: Worker information is required.`,
                        },
                        { status: 400 }
                    );
                }

                /* ---------------------------------------------
                   NAME
                --------------------------------------------- */

                const workerName =
                    typeof worker.name === "string"
                        ? worker.name.trim()
                        : "";

                if (!workerName) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: Worker name is required.`,
                        },
                        { status: 400 }
                    );
                }

                /* ---------------------------------------------
                   PHONE
                --------------------------------------------- */

                const workerPhone =
                    typeof worker.phone === "string"
                        ? worker.phone.trim()
                        : "";

                if (!/^\d{10}$/.test(workerPhone)) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: A valid 10-digit mobile number is required.`,
                        },
                        { status: 400 }
                    );
                }

                /* ---------------------------------------------
                   EMAIL
                --------------------------------------------- */

                const workerEmail =
                    typeof worker.email === "string"
                        ? worker.email.trim().toLowerCase()
                        : "";

                if (
                    !workerEmail ||
                    !emailRegex.test(workerEmail)
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: A valid email address is required.`,
                        },
                        { status: 400 }
                    );
                }

                /*
                 * Prevent duplicate worker emails inside
                 * the same project request.
                 */
                if (workerEmails.has(workerEmail)) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: Duplicate worker email "${workerEmail}".`,
                        },
                        { status: 400 }
                    );
                }

                workerEmails.add(workerEmail);

                /* ---------------------------------------------
                   PASSWORD
                --------------------------------------------- */

                const workerPassword =
                    typeof worker.password === "string"
                        ? worker.password
                        : "";

                if (workerPassword.length < 6) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: Password must be at least 6 characters.`,
                        },
                        { status: 400 }
                    );
                }

                /* ---------------------------------------------
                   WORKER TYPE
                --------------------------------------------- */

                if (!isWorkerType(worker.workerType)) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: Invalid worker type.`,
                        },
                        { status: 400 }
                    );
                }

                /* ---------------------------------------------
                   SALARY
                --------------------------------------------- */

                const salary =
                    Number(worker.salary);

                if (
                    !Number.isFinite(salary) ||
                    salary <= 0
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerNumber}: Salary/wage must be greater than 0.`,
                        },
                        { status: 400 }
                    );
                }
            }
        }

        /* =====================================================
           COMPANY
        ===================================================== */

        const companyId = getCompanyId(user);

        /* =====================================================
           CREATE PROJECT
        ===================================================== */

        const project = await createProject({
            companyId,

            projectName,

            location,

            projectManager:
                typeof projectData.projectManager === "string"
                    ? projectData.projectManager.trim() || undefined
                    : undefined,

            projectManagerName:
                typeof projectData.projectManagerName === "string"
                    ? projectData.projectManagerName.trim() || undefined
                    : undefined,

            siteSupervisor:
                typeof projectData.siteSupervisor === "string"
                    ? projectData.siteSupervisor.trim() || undefined
                    : undefined,

            siteSupervisorName:
                typeof projectData.siteSupervisorName === "string"
                    ? projectData.siteSupervisorName.trim() || undefined
                    : undefined,

            startDate,

            expectedCompletion,

            status:
                (projectData.status ||
                    "Planning") as ProjectStatus,

            description:
                typeof projectData.description === "string"
                    ? projectData.description.trim() || undefined
                    : undefined,

            createdBy: user.userId,

            createdByName:
                (user as any).name ||
                user.email,
        });

        /* =====================================================
           CREATE SITES + WORKERS
        ===================================================== */

        const createdSites = [];

        let totalWorkers = 0;

        for (
            const siteData of sitesData
        ) {
            /* -------------------------------------------------
               CREATE SITE
            ------------------------------------------------- */

            const site =
                await createSite({
                    companyId,

                    projectId:
                        project.projectId,

                    projectName:
                        project.projectName,

                    siteName:
                        siteData.siteName.trim(),

                    location:
                        typeof siteData.location === "string"
                            ? siteData.location.trim() || undefined
                            : undefined,

                    active: true,
                });

            /* -------------------------------------------------
               CREATE WORKERS FOR THIS SITE
            ------------------------------------------------- */

            const createdWorkers = [];

            const workers =
                Array.isArray(siteData.workers)
                    ? siteData.workers
                    : [];

            for (
                const workerData of workers
            ) {
                const worker =
                    await createWorker({
                        companyId,

                        projectId:
                            project.projectId,

                        projectName:
                            project.projectName,

                        siteId:
                            site.siteId,

                        siteName:
                            site.siteName,

                        name:
                            workerData.name.trim(),

                        phone:
                            workerData.phone.trim(),

                        email:
                            workerData.email
                                .trim()
                                .toLowerCase(),

                        password:
                            workerData.password,

                        role:
                            "ConstructionEmployee",

                        workerType:
                            workerData.workerType,

                        salary:
                            Number(workerData.salary),

                        active:
                            true,
                    });

                /*
                 * Do NOT return the password or hashed password.
                 */
                createdWorkers.push({
                    workerId:
                        worker.workerId,

                    userId:
                        worker.userId,

                    name:
                        worker.name,

                    phone:
                        worker.phone,

                    email:
                        worker.email,

                    role:
                        worker.role,

                    workerType:
                        worker.workerType,

                    salary:
                        worker.salary,

                    dailyWage:
                        worker.dailyWage,

                    active:
                        worker.active,

                    loginEnabled:
                        worker.loginEnabled,
                });

                totalWorkers++;
            }

            createdSites.push({
                ...site,
                workers:
                    createdWorkers,
            });
        }

        /* =====================================================
           RESPONSE
        ===================================================== */

        return NextResponse.json(
            {
                success: true,

                message:
                    "Project, sites, workers and worker login accounts created successfully.",

                project,

                sites:
                    createdSites,

                counts: {
                    sites:
                        createdSites.length,

                    workers:
                        totalWorkers,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "POST construction project error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to create project.",
            },
            { status: 500 }
        );
    }
}