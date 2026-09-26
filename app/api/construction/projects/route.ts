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

/* =========================================================
   GET PROJECTS
========================================================= */

export async function GET(req: Request) {
    try {
        const user =
            await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const companyId =
            getCompanyId(user);

        const projects =
            await getProjects(companyId);

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
                message:
                    "Failed to fetch projects",
            },
            { status: 500 }
        );
    }
}

/* =========================================================
   CREATE PROJECT + SITES + WORKERS
========================================================= */

export async function POST(req: Request) {
    try {
        const user =
            await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const body =
            await req.json();

        /*
         * NEW FORMAT
         *
         * {
         *   project: {...},
         *   sites: [
         *      {
         *        siteName,
         *        location,
         *        workers: [...]
         *      }
         *   ]
         * }
         */

        const projectData =
            body?.project;

        const sitesData =
            body?.sites;

        /* =====================================================
           VALIDATE PROJECT
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
            projectData.startDate;

        const expectedCompletion =
            projectData.expectedCompletion;

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

        for (
            let siteIndex = 0;
            siteIndex < sitesData.length;
            siteIndex++
        ) {
            const site =
                sitesData[siteIndex];

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
                !Array.isArray(
                    site.workers
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Site ${siteIndex + 1}: Workers data is invalid.`,
                    },
                    { status: 400 }
                );
            }

            for (
                let workerIndex = 0;
                workerIndex <
                site.workers.length;
                workerIndex++
            ) {
                const worker =
                    site.workers[
                        workerIndex
                    ];

                if (
                    !worker ||
                    typeof worker.name !== "string" ||
                    !worker.name.trim()
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerIndex + 1}: Worker name is required.`,
                        },
                        { status: 400 }
                    );
                }

                const phone =
                    String(
                        worker.phone || ""
                    ).replace(
                        /\D/g,
                        ""
                    );

                if (
                    phone.length !== 10
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerIndex + 1}: Valid 10-digit mobile number is required.`,
                        },
                        { status: 400 }
                    );
                }

                const salary =
                    Number(
                        worker.salary
                    );

                if (
                    !Number.isFinite(
                        salary
                    ) ||
                    salary <= 0
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                `Site ${siteIndex + 1}, Worker ${workerIndex + 1}: Salary / wage must be greater than 0.`,
                        },
                        { status: 400 }
                    );
                }
            }
        }

        /* =====================================================
           COMPANY
        ===================================================== */

        const companyId =
            getCompanyId(user);

        /* =====================================================
           CREATE PROJECT
        ===================================================== */

        const project =
            await createProject({
                companyId,

                projectName,

                location,

                projectManager:
                    projectData.projectManager ||
                    undefined,

                projectManagerName:
                    projectData.projectManagerName ||
                    undefined,

                siteSupervisor:
                    projectData.siteSupervisor ||
                    undefined,

                siteSupervisorName:
                    projectData.siteSupervisorName ||
                    undefined,

                startDate,

                expectedCompletion,

                status:
                    (projectData.status ||
                        "Planning") as ProjectStatus,

                description:
                    projectData.description ||
                    undefined,

                createdBy:
                    user.userId,

                createdByName:
                    (user as any).name ||
                    user.email,
            });

        /* =====================================================
           CREATE SITES + WORKERS
        ===================================================== */

        const createdSites = [];

        const createdWorkers = [];

        for (
            const siteData of sitesData
        ) {
            /*
             * Create site first.
             */
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
                            ? siteData.location.trim()
                            : undefined,

                    active: true,
                });

            createdSites.push(site);

            /*
             * Create workers inside this site.
             *
             * IMPORTANT:
             *
             * siteId and siteName come from
             * the site created above.
             *
             * The user does NOT manually select
             * a site for each worker.
             */
            for (
                const workerData of siteData.workers
            ) {
                const phone =
                    String(
                        workerData.phone
                    ).replace(
                        /\D/g,
                        ""
                    );

                const salary =
                    Number(
                        workerData.salary
                    );

                const workerType =
                    workerData.workerType as WorkerType;

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

                        phone,

                        workerType,

                        salary,

                        /*
                         * Daily wage is automatically
                         * derived for Daily Wage workers.
                         */
                        dailyWage:
                            workerType ===
                            "Daily Wage"
                                ? salary
                                : undefined,

                        active: true,
                    });

                createdWorkers.push(
                    worker
                );
            }
        }

        /* =====================================================
           RESPONSE
        ===================================================== */

        return NextResponse.json(
            {
                success: true,

                message:
                    "Project, sites and workers created successfully.",

                project,

                sites:
                    createdSites,

                workers:
                    createdWorkers,

                counts: {
                    sites:
                        createdSites.length,

                    workers:
                        createdWorkers.length,
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
                    "Failed to create project.",
            },
            { status: 500 }
        );
    }
}