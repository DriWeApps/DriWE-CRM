import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    getWorkers,
    getWorkersByProject,
    getWorkersBySite,
    createWorker,
} from "@/services/construction-worker.service";

import {
    getProjectById,
} from "@/services/construction-project.service";

import {
    getSiteById,
} from "@/services/construction-site.service";

import type {
    WorkerType,
} from "@/types/construction";

/* =========================================================
   HELPERS
========================================================= */

function getCompanyId(user: any): string {
    return user.companyId || user.userId;
}

function isValidWorkerType(
    value: string
): value is WorkerType {
    return (
        value === "Employee" ||
        value === "Contract Worker" ||
        value === "Daily Wage" ||
        value === "Subcontractor"
    );
}

/* =========================================================
   GET WORKERS
========================================================= */

/**
 * GET /api/construction/workers
 *
 * Optional query parameters:
 *
 * ?projectId=xxx
 * ?siteId=xxx
 *
 * Examples:
 *
 * /api/construction/workers
 * /api/construction/workers?projectId=xxx
 * /api/construction/workers?siteId=xxx
 */
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

        const url =
            new URL(req.url);

        const projectId =
            url.searchParams.get(
                "projectId"
            );

        const siteId =
            url.searchParams.get(
                "siteId"
            );

        let workers;

        /* =====================================================
           FILTER BY SITE
        ===================================================== */

        if (siteId) {
            workers =
                await getWorkersBySite(
                    siteId,
                    companyId
                );
        }

        /* =====================================================
           FILTER BY PROJECT
        ===================================================== */

        else if (projectId) {
            workers =
                await getWorkersByProject(
                    projectId,
                    companyId
                );
        }

        /* =====================================================
           ALL COMPANY WORKERS
        ===================================================== */

        else {
            workers =
                await getWorkers(
                    companyId
                );
        }

        return NextResponse.json({
            success: true,
            workers,
        });
    } catch (error) {
        console.error(
            "GET construction workers error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch workers",
            },
            { status: 500 }
        );
    }
}

/* =========================================================
   CREATE WORKER
========================================================= */

/**
 * POST /api/construction/workers
 *
 * Creates a worker under a specific site.
 *
 * The site determines the project automatically.
 *
 * Expected body:
 *
 * {
 *   siteId: "...",
 *   name: "...",
 *   phone: "...",
 *   workerType: "Employee",
 *   salary: 30000
 * }
 */
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

        /* =====================================================
           BASIC FIELDS
        ===================================================== */

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        const phone =
            typeof body.phone === "string"
                ? body.phone
                    .replace(/\D/g, "")
                : "";

        const siteId =
            typeof body.siteId === "string"
                ? body.siteId.trim()
                : "";

        const workerType =
            typeof body.workerType === "string"
                ? body.workerType
                : "";

        const salary =
            Number(body.salary);

        /* =====================================================
           VALIDATION
        ===================================================== */

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker name is required.",
                },
                { status: 400 }
            );
        }

        if (
            phone.length !== 10
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Valid 10-digit mobile number is required.",
                },
                { status: 400 }
            );
        }

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Site is required.",
                },
                { status: 400 }
            );
        }

        if (
            !isValidWorkerType(
                workerType
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid worker type.",
                },
                { status: 400 }
            );
        }

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
                        "Salary / wage must be greater than 0.",
                },
                { status: 400 }
            );
        }

        /* =====================================================
           COMPANY
        ===================================================== */

        const companyId =
            getCompanyId(user);

        /* =====================================================
           VERIFY SITE
        ===================================================== */

        const site =
            await getSiteById(
                siteId,
                companyId
            );

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Site not found.",
                },
                { status: 404 }
            );
        }

        /* =====================================================
           VERIFY PROJECT
        ===================================================== */

        const project =
            await getProjectById(
                site.projectId,
                companyId
            );

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project associated with this site was not found.",
                },
                { status: 404 }
            );
        }

        /* =====================================================
           CREATE WORKER
        ===================================================== */

        const worker =
            await createWorker({
                companyId,

                /*
                 * Project comes automatically
                 * from the selected site.
                 */
                projectId:
                    site.projectId,

                projectName:
                    project.projectName,

                /*
                 * Site comes from siteId.
                 */
                siteId:
                    site.siteId,

                siteName:
                    site.siteName,

                name,

                phone,

                workerType,

                salary,

                dailyWage:
                    workerType ===
                    "Daily Wage"
                        ? salary
                        : undefined,

                active:
                    body.active !== undefined
                        ? Boolean(
                            body.active
                        )
                        : true,
            });

        return NextResponse.json(
            {
                success: true,
                worker,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "POST construction worker error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create worker",
            },
            { status: 500 }
        );
    }
}