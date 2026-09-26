import { NextResponse } from "next/server";

import {
    getUserFromRequest,
} from "@/lib/auth";

import {
    getTaskById,
    updateTask,
    deleteTask,
} from "@/services/construction-task.service";

import type {
    ConstructionTaskStatus,
} from "@/types/construction";

/* ============================================================
   TYPES
============================================================ */

type ConstructionUser = {
    userId: string;
    employeeId: string;
    email: string;
    name?: string;
    role?: string;
    companyId?: string;
    pageAccess?: string[];
    portal?: "crm" | "construction" | "both";
};

type RouteContext = {
    params: Promise<{
        taskId: string;
    }>;
};

const VALID_STATUSES: ConstructionTaskStatus[] = [
    "Pending",
    "In Progress",
    "Completed",
    "Delayed",
];

const VALID_PRIORITIES = [
    "Low",
    "Medium",
    "High",
] as const;

/* ============================================================
   GET TASK BY ID
============================================================ */

export async function GET(
    req: Request,
    context: RouteContext
) {
    try {
        const user =
            (await getUserFromRequest(
                req
            )) as ConstructionUser | null;

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { taskId } =
            await context.params;

        if (!taskId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        const task =
            await getTaskById(
                taskId,
                companyId
            );

        if (!task) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            task,
        });
    } catch (error) {
        console.error(
            "GET construction task error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch construction task",
            },
            {
                status: 500,
            }
        );
    }
}

/* ============================================================
   PUT / UPDATE TASK
============================================================ */

export async function PUT(
    req: Request,
    context: RouteContext
) {
    try {
        const user =
            (await getUserFromRequest(
                req
            )) as ConstructionUser | null;

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { taskId } =
            await context.params;

        if (!taskId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        /* ----------------------------------------------------
           CHECK EXISTING TASK
        ---------------------------------------------------- */

        const existingTask =
            await getTaskById(
                taskId,
                companyId
            );

        if (!existingTask) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task not found",
                },
                {
                    status: 404,
                }
            );
        }

        const body =
            await req.json();

        /* ----------------------------------------------------
           BASIC VALIDATION
        ---------------------------------------------------- */

        if (
            body.title !==
                undefined &&
            (
                typeof body.title !==
                    "string" ||
                !body.title.trim()
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task title cannot be empty",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            body.status !==
                undefined &&
            !VALID_STATUSES.includes(
                body.status
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid task status",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            body.priority !==
                undefined &&
            !VALID_PRIORITIES.includes(
                body.priority
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid task priority",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           DATE VALIDATION
        ---------------------------------------------------- */

        if (
            body.startDate !==
                undefined &&
            body.startDate !== "" &&
            isNaN(
                Date.parse(
                    body.startDate
                )
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid start date",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            body.dueDate !==
                undefined &&
            body.dueDate !== "" &&
            isNaN(
                Date.parse(
                    body.dueDate
                )
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid due date",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           PREPARE UPDATE DATA
        ---------------------------------------------------- */

        const updateData: Record<
            string,
            unknown
        > = {};

        if (
            body.title !==
                undefined
        ) {
            updateData.title =
                body.title.trim();
        }

        if (
            body.description !==
                undefined
        ) {
            updateData.description =
                body.description
                    ? String(
                          body.description
                      ).trim()
                    : undefined;
        }

        if (
            body.assignedTo !==
                undefined
        ) {
            updateData.assignedTo =
                body.assignedTo
                    ? String(
                          body.assignedTo
                      ).trim()
                    : undefined;
        }

        if (
            body.assignedToName !==
                undefined
        ) {
            updateData.assignedToName =
                body.assignedToName
                    ? String(
                          body.assignedToName
                      ).trim()
                    : undefined;
        }

        if (
            body.assignedToEmail !==
                undefined
        ) {
            updateData.assignedToEmail =
                body.assignedToEmail
                    ? String(
                          body.assignedToEmail
                      )
                          .trim()
                          .toLowerCase()
                    : undefined;
        }

        if (
            body.assignedBy !==
                undefined
        ) {
            updateData.assignedBy =
                body.assignedBy
                    ? String(
                          body.assignedBy
                      ).trim()
                    : undefined;
        }

        if (
            body.assignedByName !==
                undefined
        ) {
            updateData.assignedByName =
                body.assignedByName
                    ? String(
                          body.assignedByName
                      ).trim()
                    : undefined;
        }

        if (
            body.priority !==
                undefined
        ) {
            updateData.priority =
                body.priority;
        }

        if (
            body.status !==
                undefined
        ) {
            updateData.status =
                body.status;
        }

        if (
            body.startDate !==
                undefined
        ) {
            updateData.startDate =
                body.startDate ||
                undefined;
        }

        if (
            body.dueDate !==
                undefined
        ) {
            updateData.dueDate =
                body.dueDate ||
                undefined;
        }

        if (
            body.remarks !==
                undefined
        ) {
            updateData.remarks =
                body.remarks
                    ? String(
                          body.remarks
                      ).trim()
                    : undefined;
        }

        if (
            body.completionDescription !==
                undefined
        ) {
            updateData.completionDescription =
                body.completionDescription
                    ? String(
                          body.completionDescription
                      ).trim()
                    : undefined;
        }

        if (
            body.completionLink !==
                undefined
        ) {
            updateData.completionLink =
                body.completionLink
                    ? String(
                          body.completionLink
                      ).trim()
                    : undefined;
        }

        /* ----------------------------------------------------
           UPDATE TASK
        ---------------------------------------------------- */

        const updatedTask =
            await updateTask(
                taskId,
                companyId,
                updateData as any
            );

        if (!updatedTask) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Failed to update task",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Task updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        console.error(
            "PUT construction task error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update construction task",
            },
            {
                status: 500,
            }
        );
    }
}

/* ============================================================
   DELETE TASK
============================================================ */

export async function DELETE(
    req: Request,
    context: RouteContext
) {
    try {
        const user =
            (await getUserFromRequest(
                req
            )) as ConstructionUser | null;

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { taskId } =
            await context.params;

        if (!taskId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        /* ----------------------------------------------------
           CHECK TASK OWNERSHIP
        ---------------------------------------------------- */

        const existingTask =
            await getTaskById(
                taskId,
                companyId
            );

        if (!existingTask) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* ----------------------------------------------------
           DELETE
        ---------------------------------------------------- */

        const deleted =
            await deleteTask(
                taskId,
                companyId
            );

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Failed to delete task",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Task deleted successfully",
        });
    } catch (error) {
        console.error(
            "DELETE construction task error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete construction task",
            },
            {
                status: 500,
            }
        );
    }
}