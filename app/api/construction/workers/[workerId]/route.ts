import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    getWorkerById,
    updateWorker,
    deleteWorker,
} from "@/services/construction-worker.service";

import {
    getSiteById,
} from "@/services/construction-site.service";

import {
    getProjectById,
} from "@/services/construction-project.service";

import type {
    WorkerType,
} from "@/types/construction";

type RouteContext = {
    params: Promise<{
        workerId: string;
    }>;
};

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
   GET SINGLE WORKER
========================================================= */

export async function GET(
    req: Request,
    { params }: RouteContext
) {
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

        const { workerId } =
            await params;

        if (!workerId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker ID is required.",
                },
                { status: 400 }
            );
        }

        const companyId =
            getCompanyId(user);

        const worker =
            await getWorkerById(
                workerId,
                companyId
            );

        if (!worker) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            worker,
        });
    } catch (error) {
        console.error(
            "GET construction worker error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch worker.",
            },
            { status: 500 }
        );
    }
}

/* =========================================================
   UPDATE WORKER
========================================================= */

export async function PUT(
    req: Request,
    { params }: RouteContext
) {
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

        const { workerId } =
            await params;

        if (!workerId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker ID is required.",
                },
                { status: 400 }
            );
        }

        const companyId =
            getCompanyId(user);

        /* =====================================================
           GET EXISTING WORKER
        ===================================================== */

        const existingWorker =
            await getWorkerById(
                workerId,
                companyId
            );

        if (!existingWorker) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker not found.",
                },
                { status: 404 }
            );
        }

        const body =
            await req.json();

        /* =====================================================
           BASIC FIELDS
        ===================================================== */

        const name =
            body.name !== undefined
                ? typeof body.name === "string"
                    ? body.name.trim()
                    : ""
                : existingWorker.name;

        const phone =
            body.phone !== undefined
                ? typeof body.phone === "string"
                    ? body.phone.replace(
                        /\D/g,
                        ""
                    )
                    : ""
                : existingWorker.phone;

        const workerType =
            body.workerType !== undefined
                ? body.workerType
                : existingWorker.workerType;

        const salary =
            body.salary !== undefined
                ? Number(body.salary)
                : Number(
                    existingWorker.salary || 0
                );

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
           SITE CHANGE
        ===================================================== */

        let projectId =
            existingWorker.projectId;

        let projectName =
            existingWorker.projectName;

        let siteId =
            existingWorker.siteId;

        let siteName =
            existingWorker.siteName;

        /*
         * If siteId is supplied during editing,
         * verify that the site belongs to
         * the logged-in company.
         */
        if (
            body.siteId !== undefined
        ) {
            if (
                typeof body.siteId !==
                    "string" ||
                !body.siteId.trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Valid site is required.",
                    },
                    { status: 400 }
                );
            }

            const newSite =
                await getSiteById(
                    body.siteId.trim(),
                    companyId
                );

            if (!newSite) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Selected site was not found.",
                    },
                    { status: 404 }
                );
            }

            /*
             * The project is automatically
             * derived from the site.
             */
            projectId =
                newSite.projectId;

            siteId =
                newSite.siteId;

            siteName =
                newSite.siteName;

            const project =
                await getProjectById(
                    newSite.projectId,
                    companyId
                );

            if (!project) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Project associated with the selected site was not found.",
                    },
                    { status: 404 }
                );
            }

            projectName =
                project.projectName;
        }

        /* =====================================================
           UPDATE WORKER
        ===================================================== */

        const updatedWorker =
            await updateWorker(
                workerId,
                companyId,
                {
                    name,

                    phone,

                    workerType,

                    salary,

                    /*
                     * Keep daily wage synchronized
                     * for Daily Wage workers.
                     */
                    dailyWage:
                        workerType ===
                        "Daily Wage"
                            ? salary
                            : 0,

                    projectId,

                    projectName,

                    siteId,

                    siteName,

                    active:
                        body.active !== undefined
                            ? Boolean(
                                body.active
                            )
                            : existingWorker.active,
                }
            );

        if (!updatedWorker) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Failed to update worker.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            worker:
                updatedWorker,
        });
    } catch (error) {
        console.error(
            "PUT construction worker error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update worker.",
            },
            { status: 500 }
        );
    }
}

/* =========================================================
   DELETE WORKER
========================================================= */

export async function DELETE(
    req: Request,
    { params }: RouteContext
) {
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

        const { workerId } =
            await params;

        if (!workerId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker ID is required.",
                },
                { status: 400 }
            );
        }

        const companyId =
            getCompanyId(user);

        /* =====================================================
           CHECK WORKER
        ===================================================== */

        const existingWorker =
            await getWorkerById(
                workerId,
                companyId
            );

        if (!existingWorker) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker not found.",
                },
                { status: 404 }
            );
        }

        /* =====================================================
           DELETE
        ===================================================== */

        const deleted =
            await deleteWorker(
                workerId,
                companyId
            );

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Failed to delete worker.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Worker deleted successfully.",
        });
    } catch (error) {
        console.error(
            "DELETE construction worker error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete worker.",
            },
            { status: 500 }
        );
    }
}