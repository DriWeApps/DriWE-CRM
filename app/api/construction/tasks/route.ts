
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

import {
    getTasks,
    getTasksByProject,
    getTasksByAssignee,
    createTask,
} from "@/services/construction-task.service";

import {
    getProjectById,
    getProjects,
} from "@/services/construction-project.service";

import { getWorkers } from "@/services/construction-worker.service";

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
};

type AssignedProject = {
    projectId: string;
    projectName: string;
    companyId: string;
    companyName?: string;
    projectManagerUserId?: string;
};

const VALID_STATUSES: ConstructionTaskStatus[] = [
    "Pending",
    "In Progress",
    "Completed",
    "Delayed",
];

const VALID_PRIORITIES = ["Low", "Medium", "High"] as const;

function normalizedRole(user: ConstructionUser) {
    return user.role?.trim().toLowerCase() ?? "";
}

function isAdmin(user: ConstructionUser) {
    return ["admin", "constructionadmin"].includes(
        normalizedRole(user)
    );
}

function isProjectManager(user: ConstructionUser) {
    return normalizedRole(user) === "constructionprojectmanager";
}

function isConstructionWorker(user: ConstructionUser) {
    return normalizedRole(user) === "constructionemployee";
}

function getCompanyId(user: ConstructionUser) {
    return user.companyId || user.userId;
}

function isAssignedToUser(
    task: AssignedTask,
    user: ConstructionUser
): boolean {
    const email = user.email?.trim().toLowerCase();
    const assignedTo = task.assignedTo?.trim().toLowerCase();
    const assignedToEmail = task.assignedToEmail?.trim().toLowerCase();
    const employeeId = user.employeeId?.trim().toLowerCase();
    const userId = user.userId?.trim().toLowerCase();

    return Boolean(
        (email && (assignedToEmail === email || assignedTo === email)) ||
        (employeeId && assignedTo === employeeId) ||
        (userId && assignedTo === userId)
    );
}

function unauthorized() {
    return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
    );
}

function forbidden(
    message = "You do not have permission to perform this action."
) {
    return NextResponse.json(
        { success: false, message },
        { status: 403 }
    );
}

function badRequest(message: string) {
    return NextResponse.json(
        { success: false, message },
        { status: 400 }
    );
}

async function getAuthorizedProject(
    user: ConstructionUser,
    projectId: string
): Promise<AssignedProject | null> {
    if (!isAdmin(user) && !isProjectManager(user)) {
        return null;
    }

    const project = await getProjectById(
        projectId,
        getCompanyId(user)
    );

    if (!project) {
        return null;
    }

    const assignedProject = project as AssignedProject;

    if (
        isProjectManager(user) &&
        assignedProject.projectManagerUserId !== user.userId
    ) {
        return null;
    }

    return assignedProject;
}

/**
 * GET TASKS
 *
 * Admin: all tasks in the company.
 * Project manager: tasks in assigned projects only.
 * Worker: assigned tasks only.
 */
export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) {
            return unauthorized();
        }

        if (
            !isAdmin(user) &&
            !isProjectManager(user) &&
            !isConstructionWorker(user)
        ) {
            return forbidden();
        }

        const companyId = getCompanyId(user);
        const { searchParams } = new URL(req.url);

        const requestedProjectId =
            searchParams.get("projectId")?.trim();

        const requestedAssignee =
            searchParams.get("assignedTo")?.trim();

        let tasks: Awaited<ReturnType<typeof getTasks>> = [];

        if (isConstructionWorker(user)) {
            // Ignore caller-supplied project/assignee filters.
            // Always return only tasks assigned to this worker.
            tasks = await getTasks(companyId);

            tasks = tasks.filter((task) =>
                isAssignedToUser(task, user)
            );
        } else if (requestedProjectId) {
            const project = await getAuthorizedProject(
                user,
                requestedProjectId
            );

            if (!project) {
                return forbidden(
                    "You cannot access tasks for this project."
                );
            }

            tasks = await getTasksByProject(
                project.projectId,
                companyId
            );

            if (requestedAssignee) {
                const target = requestedAssignee.toLowerCase();

                tasks = tasks.filter((task) =>
                    [
                        task.assignedTo,
                        task.assignedToEmail,
                    ].some(
                        (value) =>
                            value?.trim().toLowerCase() === target
                    )
                );
            }
        } else if (isProjectManager(user)) {
            // Only collect tasks from projects assigned to this manager.
            const projects = await getProjects(companyId);

            const assignedProjects = (
                projects as AssignedProject[]
            ).filter(
                (project) =>
                    project.projectManagerUserId === user.userId
            );

            const taskGroups = await Promise.all(
                assignedProjects.map((project) =>
                    getTasksByProject(project.projectId, companyId)
                )
            );

            tasks = taskGroups.flat();

            if (requestedAssignee) {
                const target = requestedAssignee.toLowerCase();

                tasks = tasks.filter((task) =>
                    [
                        task.assignedTo,
                        task.assignedToEmail,
                    ].some(
                        (value) =>
                            value?.trim().toLowerCase() === target
                    )
                );
            }
        } else if (requestedAssignee) {
            tasks = await getTasksByAssignee(
                requestedAssignee,
                companyId
            );
        } else {
            tasks = await getTasks(companyId);
        }

        tasks.sort((a, b) => {
            const first = a.dueDate || a.createdAt || "";
            const second = b.dueDate || b.createdAt || "";

            return (
                new Date(first).getTime() -
                new Date(second).getTime()
            );
        });

        return NextResponse.json({
            success: true,
            tasks,
            count: tasks.length,
        });
    } catch (error) {
        console.error("GET construction tasks error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch construction tasks.",
            },
            { status: 500 }
        );
    }
}

/**
 * CREATE TASK
 *
 * Admin: any project in their company.
 * Project manager: assigned projects only.
 * Worker: cannot create or assign tasks.
 */
export async function POST(req: Request) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) {
            return unauthorized();
        }

        if (!isAdmin(user) && !isProjectManager(user)) {
            return forbidden("Workers cannot create or assign tasks.");
        }

        const companyId = getCompanyId(user);
        const body = await req.json();

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return badRequest("Invalid task details.");
        }

        const projectId =
            typeof body.projectId === "string"
                ? body.projectId.trim()
                : "";

        const title =
            typeof body.title === "string"
                ? body.title.trim()
                : "";

        const description =
            typeof body.description === "string"
                ? body.description.trim()
                : "";

        const requestedAssignee =
            typeof body.assignedTo === "string"
                ? body.assignedTo.trim()
                : "";

        const requestedAssigneeEmail =
            typeof body.assignedToEmail === "string"
                ? body.assignedToEmail.trim().toLowerCase()
                : "";

        const priority = body.priority || "Medium";
        const status = body.status || "Pending";
        const startDate = body.startDate || undefined;
        const dueDate = body.dueDate || undefined;

        const remarks =
            typeof body.remarks === "string"
                ? body.remarks.trim()
                : "";

        const completionDescription =
            typeof body.completionDescription === "string"
                ? body.completionDescription.trim()
                : "";

        const completionLink =
            typeof body.completionLink === "string"
                ? body.completionLink.trim()
                : "";

        if (!projectId) {
            return badRequest("Project ID is required.");
        }

        if (!title) {
            return badRequest("Task title is required.");
        }

        if (!VALID_STATUSES.includes(status as ConstructionTaskStatus)) {
            return badRequest("Invalid task status.");
        }

        if (
            !VALID_PRIORITIES.includes(
                priority as (typeof VALID_PRIORITIES)[number]
            )
        ) {
            return badRequest("Invalid task priority.");
        }

        if (
            startDate &&
            (typeof startDate !== "string" ||
                Number.isNaN(Date.parse(startDate)))
        ) {
            return badRequest("Invalid start date.");
        }

        if (
            dueDate &&
            (typeof dueDate !== "string" ||
                Number.isNaN(Date.parse(dueDate)))
        ) {
            return badRequest("Invalid due date.");
        }

        if (
            startDate &&
            dueDate &&
            new Date(dueDate).getTime() < new Date(startDate).getTime()
        ) {
            return badRequest(
                "Due date cannot be earlier than the start date."
            );
        }

        const project = await getAuthorizedProject(
            user,
            projectId
        );

        if (!project) {
            return forbidden(
                "You can create tasks only for projects you are authorized to manage."
            );
        }

        let assignedTo: string | undefined;
        let assignedToName: string | undefined;
        let assignedToEmail: string | undefined;

        if (requestedAssignee || requestedAssigneeEmail) {
            const workers = await getWorkers(companyId);

            const searchValue = requestedAssignee.toLowerCase();
            const searchEmail = requestedAssigneeEmail || searchValue;

            const worker = workers.find((item) => {
                const matchesId =
                    item.workerId?.toLowerCase() === searchValue ||
                    item.userId?.toLowerCase() === searchValue;

                const matchesEmail =
                    item.email?.trim().toLowerCase() === searchEmail;

                return matchesId || matchesEmail;
            });

            if (!worker) {
                return badRequest(
                    "Assigned worker was not found in your company."
                );
            }

            if (
                worker.active === false ||
                worker.loginEnabled === false
            ) {
                return badRequest(
                    "This worker is inactive or login is disabled."
                );
            }

            if (worker.projectId !== project.projectId) {
                return badRequest(
                    "You can assign tasks only to workers assigned to this project."
                );
            }

            assignedTo = worker.userId || worker.workerId;
            assignedToName = worker.name;
            assignedToEmail = worker.email?.trim().toLowerCase();
        }

        const task = await createTask({
            companyId,
            companyName: project.companyName,

            projectId: project.projectId,
            projectName: project.projectName,

            title,
            description: description || undefined,

            assignedTo,
            assignedToName,
            assignedToEmail,

            assignedBy: user.userId,
            assignedByName: user.name || user.email,

            priority,
            status,
            startDate,
            dueDate,

            remarks: remarks || undefined,
            completionDescription:
                completionDescription || undefined,
            completionLink: completionLink || undefined,

            createdBy: user.userId,
            createdByName: user.name || user.email,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Construction task created successfully.",
                task,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST construction task error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create construction task.",
            },
            { status: 500 }
        );
    }
}
