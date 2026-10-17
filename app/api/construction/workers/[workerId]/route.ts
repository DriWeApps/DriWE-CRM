import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    getWorkerById,
    updateWorker,
    deleteWorker,
} from "@/services/construction-worker.service";

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

type AuthenticatedUser = NonNullable<
    Awaited<ReturnType<typeof getUserFromRequest>>
>;

function getCompanyId(user: AuthenticatedUser): string {
    return user.companyId || user.userId;
}

function isValidWorkerType(
    value: unknown
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

        let body: Record<string, unknown>;

        try {
            const parsedBody: unknown = await req.json();

            if (
                typeof parsedBody !== "object" ||
                parsedBody === null ||
                Array.isArray(parsedBody)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Request body must be a JSON object.",
                    },
                    { status: 400 }
                );
            }

            body = parsedBody as Record<string, unknown>;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON request body.",
                },
                { status: 400 }
            );
        }

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

        const workerType: unknown =
            body.workerType !== undefined
                ? body.workerType
                : existingWorker.workerType;

        const salaryInput = body.salary;
        const salary = salaryInput !== undefined
            ? Number(salaryInput)
            : Number(existingWorker.salary || 0);

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
            (salaryInput !== undefined &&
                (salaryInput === null || String(salaryInput).trim() === "")) ||
            !Number.isFinite(salary) ||
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

        if (
            body.active !== undefined &&
            typeof body.active !== "boolean"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Active must be a boolean value.",
                },
                { status: 400 }
            );
        }

          /* =====================================================
              PROJECT CHANGE
          ===================================================== */

        let projectId =
            existingWorker.projectId;

        let projectName =
            existingWorker.projectName;

        if (body.siteId !== undefined) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Site-based assignment is no longer supported. Send a projectId instead.",
                },
                { status: 400 }
            );
        }

        if (body.projectId !== undefined) {
            if (typeof body.projectId !== "string" || !body.projectId.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Valid project is required.",
                    },
                    { status: 400 }
                );
            }

            const newProject = await getProjectById(
                body.projectId.trim(),
                companyId
            );

            if (!newProject) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Selected project was not found.",
                    },
                    { status: 404 }
                );
            }

            projectId = newProject.projectId;
            projectName = newProject.projectName;
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

                    active:
                        body.active !== undefined
                            ? body.active
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