
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

import {
    getTaskById,
    updateTask,
    deleteTask,
} from "@/services/construction-task.service";

import { getProjectById } from "@/services/construction-project.service";

import type { ConstructionTaskStatus } from "@/types/construction";

type ConstructionUser = {
    userId: string;
    employeeId?: string;
    email: string;
    name?: string;
    role?: string;
    companyId?: string;
};

type AssignedTask = {
    assignedTo?: string;
    assignedToEmail?: string;
    projectId?: string;
};

type RouteContext = {
    params: Promise<{ taskId: string }>;
};

const VALID_STATUSES: ConstructionTaskStatus[] = [
    "Pending",
    "In Progress",
    "Completed",
    "Delayed",
];

const VALID_PRIORITIES = ["Low", "Medium", "High"] as const;

const WORKER_EDITABLE_FIELDS = new Set([
    "status",
    "remarks",
    "completionDescription",
    "completionLink",
]);

function role(user: ConstructionUser) {
    return user.role?.trim().toLowerCase() ?? "";
}

function isAdmin(user: ConstructionUser) {
    return ["admin", "constructionadmin"].includes(role(user));
}

function isProjectManager(user: ConstructionUser) {
    return role(user) === "constructionprojectmanager";
}

function isWorker(user: ConstructionUser) {
    return role(user) === "constructionemployee";
}

function companyIdFor(user: ConstructionUser) {
    return user.companyId || user.userId;
}

function jsonError(message: string, status: number) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function isAssignedToUser(
    task: AssignedTask,
    user: ConstructionUser
) {
    const assignedTo = task.assignedTo?.trim().toLowerCase();
    const assignedEmail = task.assignedToEmail?.trim().toLowerCase();
    const userId = user.userId?.trim().toLowerCase();
    const employeeId = user.employeeId?.trim().toLowerCase();
    const email = user.email?.trim().toLowerCase();

    return Boolean(
        (userId && assignedTo === userId) ||
        (employeeId && assignedTo === employeeId) ||
        (email && (assignedTo === email || assignedEmail === email))
    );
}

async function canManageTaskProject(
    user: ConstructionUser,
    projectId?: string
): Promise<boolean> {
    if (!projectId) {
        return false;
    }

    const project = await getProjectById(
        projectId,
        companyIdFor(user)
    );

    if (!project) {
        return false;
    }

    if (isAdmin(user)) {
        return true;
    }

    if (isProjectManager(user)) {
        return (
            (project as { projectManagerUserId?: string })
                .projectManagerUserId === user.userId
        );
    }

    return false;
}

/* GET TASK BY ID */
export async function GET(req: Request, context: RouteContext) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) {
            return jsonError("Unauthorized.", 401);
        }

        if (!isAdmin(user) && !isProjectManager(user) && !isWorker(user)) {
            return jsonError(
                "You do not have permission to view tasks.",
                403
            );
        }

        const { taskId } = await context.params;

        if (!taskId) {
            return jsonError("Task ID is required.", 400);
        }

        const companyId = companyIdFor(user);
        const task = await getTaskById(taskId, companyId);

        if (!task) {
            return jsonError("Task not found.", 404);
        }

        if (isWorker(user) && !isAssignedToUser(task, user)) {
            return jsonError(
                "You can view only tasks assigned to you.",
                403
            );
        }

        if (
            isProjectManager(user) &&
            !(await canManageTaskProject(user, task.projectId))
        ) {
            return jsonError(
                "This task is outside your assigned projects.",
                403
            );
        }

        return NextResponse.json({
            success: true,
            task,
        });
    } catch (error) {
        console.error("GET construction task error:", error);

        return jsonError("Failed to fetch construction task.", 500);
    }
}

/* UPDATE TASK */
export async function PUT(req: Request, context: RouteContext) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) {
            return jsonError("Unauthorized.", 401);
        }

        if (!isAdmin(user) && !isProjectManager(user) && !isWorker(user)) {
            return jsonError(
                "You do not have permission to update tasks.",
                403
            );
        }

        const { taskId } = await context.params;

        if (!taskId) {
            return jsonError("Task ID is required.", 400);
        }

        const companyId = companyIdFor(user);
        const existingTask = await getTaskById(taskId, companyId);

        if (!existingTask) {
            return jsonError("Task not found.", 404);
        }

        if (isWorker(user) && !isAssignedToUser(existingTask, user)) {
            return jsonError(
                "You can update only tasks assigned to you.",
                403
            );
        }

        if (
            isProjectManager(user) &&
            !(await canManageTaskProject(user, existingTask.projectId))
        ) {
            return jsonError(
                "This task is outside your assigned projects.",
                403
            );
        }

        const body = await req.json();

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body) ||
            Object.keys(body).length === 0
        ) {
            return jsonError(
                "Provide at least one field to update.",
                400
            );
        }

        if (isWorker(user)) {
            const forbiddenFields = Object.keys(body).filter(
                (field) => !WORKER_EDITABLE_FIELDS.has(field)
            );

            if (forbiddenFields.length > 0) {
                return jsonError(
                    "Workers can update only task status, remarks, and completion details.",
                    403
                );
            }
        }

        if (
            body.status !== undefined &&
            (
                typeof body.status !== "string" ||
                !VALID_STATUSES.includes(
                    body.status as ConstructionTaskStatus
                )
            )
        ) {
            return jsonError("Invalid task status.", 400);
        }

        if (
            !isWorker(user) &&
            body.title !== undefined &&
            (
                typeof body.title !== "string" ||
                !body.title.trim()
            )
        ) {
            return jsonError("Task title cannot be empty.", 400);
        }

        if (
            !isWorker(user) &&
            body.priority !== undefined &&
            (
                typeof body.priority !== "string" ||
                !VALID_PRIORITIES.includes(
                    body.priority as (typeof VALID_PRIORITIES)[number]
                )
            )
        ) {
            return jsonError("Invalid task priority.", 400);
        }

        if (
            !isWorker(user) &&
            body.description !== undefined &&
            typeof body.description !== "string"
        ) {
            return jsonError(
                "Task description must be text.",
                400
            );
        }

        if (
            !isWorker(user) &&
            body.startDate !== undefined &&
            body.startDate !== "" &&
            (
                typeof body.startDate !== "string" ||
                Number.isNaN(Date.parse(body.startDate))
            )
        ) {
            return jsonError("Invalid start date.", 400);
        }

        if (
            !isWorker(user) &&
            body.dueDate !== undefined &&
            body.dueDate !== "" &&
            (
                typeof body.dueDate !== "string" ||
                Number.isNaN(Date.parse(body.dueDate))
            )
        ) {
            return jsonError("Invalid due date.", 400);
        }

        const nextStartDate =
            !isWorker(user) && body.startDate !== undefined
                ? body.startDate
                : existingTask.startDate;

        const nextDueDate =
            !isWorker(user) && body.dueDate !== undefined
                ? body.dueDate
                : existingTask.dueDate;

        if (
            nextStartDate &&
            nextDueDate &&
            new Date(nextDueDate).getTime() <
                new Date(nextStartDate).getTime()
        ) {
            return jsonError(
                "Due date cannot be earlier than the start date.",
                400
            );
        }

        for (const field of [
            "remarks",
            "completionDescription",
            "completionLink",
        ]) {
            if (
                body[field] !== undefined &&
                typeof body[field] !== "string"
            ) {
                return jsonError(
                    `${field} must be text.`,
                    400
                );
            }
        }

        const updateData: Record<string, unknown> = {};

        // Only admins and authorized managers can edit task details.
        if (!isWorker(user)) {
            if (body.title !== undefined) {
                updateData.title = body.title.trim();
            }

            if (body.description !== undefined) {
                updateData.description =
                    body.description.trim() || undefined;
            }

            if (body.priority !== undefined) {
                updateData.priority = body.priority;
            }

            if (body.startDate !== undefined) {
                updateData.startDate = body.startDate || undefined;
            }

            if (body.dueDate !== undefined) {
                updateData.dueDate = body.dueDate || undefined;
            }
        }

        if (body.status !== undefined) {
            updateData.status = body.status;
            updateData.completedAt =
                body.status === "Completed"
                    ? new Date().toISOString()
                    : undefined;
        }

        if (body.remarks !== undefined) {
            updateData.remarks =
                body.remarks.trim() || undefined;
        }

        if (body.completionDescription !== undefined) {
            updateData.completionDescription =
                body.completionDescription.trim() || undefined;
        }

        if (body.completionLink !== undefined) {
            updateData.completionLink =
                body.completionLink.trim() || undefined;
        }

        if (Object.keys(updateData).length === 0) {
            return jsonError(
                "No permitted fields were provided.",
                400
            );
        }

        const updatedTask = await updateTask(
            taskId,
            companyId,
            updateData as any
        );

        if (!updatedTask) {
            return jsonError("Failed to update task.", 500);
        }

        return NextResponse.json({
            success: true,
            message: "Task updated successfully.",
            task: updatedTask,
        });
    } catch (error) {
        console.error("PUT construction task error:", error);

        return jsonError("Failed to update construction task.", 500);
    }
}

/* DELETE TASK */
export async function DELETE(req: Request, context: RouteContext) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) {
            return jsonError("Unauthorized.", 401);
        }

        if (!isAdmin(user) && !isProjectManager(user)) {
            return jsonError("Workers cannot delete tasks.", 403);
        }

        const { taskId } = await context.params;

        if (!taskId) {
            return jsonError("Task ID is required.", 400);
        }

        const companyId = companyIdFor(user);
        const task = await getTaskById(taskId, companyId);

        if (!task) {
            return jsonError("Task not found.", 404);
        }

        if (
            isProjectManager(user) &&
            !(await canManageTaskProject(user, task.projectId))
        ) {
            return jsonError(
                "This task is outside your assigned projects.",
                403
            );
        }

        const deleted = await deleteTask(taskId, companyId);

        if (!deleted) {
            return jsonError("Failed to delete task.", 500);
        }

        return NextResponse.json({
            success: true,
            message: "Task deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE construction task error:", error);

        return jsonError("Failed to delete construction task.", 500);
    }
}
