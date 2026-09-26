import { NextResponse } from "next/server";

import {
    getUserFromRequest,
} from "@/lib/auth";

import {
    getTasks,
    getTasksByProject,
    getTasksBySite,
    getTasksByAssignee,
    createTask,
} from "@/services/construction-task.service";

import {
    getProjectById,
} from "@/services/construction-project.service";

import {
    getSiteById,
} from "@/services/construction-site.service";

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
   GET TASKS
============================================================ */

export async function GET(req: Request) {
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

        const companyId =
            user.companyId ||
            user.userId;

        const { searchParams } =
            new URL(req.url);

        const projectId =
            searchParams.get(
                "projectId"
            );

        const siteId =
            searchParams.get(
                "siteId"
            );

        const assignedTo =
            searchParams.get(
                "assignedTo"
            );

        let tasks;

        /* ----------------------------------------------------
           FILTER BY PROJECT
        ---------------------------------------------------- */

        if (projectId) {
            tasks =
                await getTasksByProject(
                    projectId,
                    companyId
                );
        }

        /* ----------------------------------------------------
           FILTER BY SITE
        ---------------------------------------------------- */

        else if (siteId) {
            tasks =
                await getTasksBySite(
                    siteId,
                    companyId
                );
        }

        /* ----------------------------------------------------
           FILTER BY ASSIGNEE
        ---------------------------------------------------- */

        else if (assignedTo) {
            tasks =
                await getTasksByAssignee(
                    assignedTo,
                    companyId
                );
        }

        /* ----------------------------------------------------
           GET ALL TASKS
        ---------------------------------------------------- */

        else {
            tasks =
                await getTasks(
                    companyId
                );
        }

        /* ----------------------------------------------------
           SORT TASKS
        ---------------------------------------------------- */

        tasks.sort((a, b) => {
            const first =
                a.dueDate ||
                a.createdAt ||
                "";

            const second =
                b.dueDate ||
                b.createdAt ||
                "";

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
        console.error(
            "GET construction tasks error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch construction tasks",
            },
            {
                status: 500,
            }
        );
    }
}

/* ============================================================
   CREATE TASK
============================================================ */

export async function POST(req: Request) {
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

        const companyId =
            user.companyId ||
            user.userId;

        const body =
            await req.json();

        /* ----------------------------------------------------
           READ INPUT
        ---------------------------------------------------- */

        const projectId =
            body.projectId?.trim();

        const siteId =
            body.siteId?.trim();

        const title =
            body.title?.trim();

        const description =
            body.description?.trim();

        const assignedTo =
            body.assignedTo
                ?.trim();

        const assignedToName =
            body.assignedToName
                ?.trim();

        const assignedToEmail =
            body.assignedToEmail
                ?.trim()
                .toLowerCase();

        const assignedBy =
            body.assignedBy
                ?.trim();

        const assignedByName =
            body.assignedByName
                ?.trim();

        const priority =
            body.priority ||
            "Medium";

        const status =
            body.status ||
            "Pending";

        const startDate =
            body.startDate ||
            undefined;

        const dueDate =
            body.dueDate ||
            undefined;

        const remarks =
            body.remarks?.trim();

        const completionDescription =
            body.completionDescription?.trim();

        const completionLink =
            body.completionLink?.trim();

        /* ----------------------------------------------------
           REQUIRED VALIDATION
        ---------------------------------------------------- */

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Site ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!title) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task title is required",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           STATUS VALIDATION
        ---------------------------------------------------- */

        if (
            !VALID_STATUSES.includes(
                status
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

        /* ----------------------------------------------------
           PRIORITY VALIDATION
        ---------------------------------------------------- */

        if (
            !VALID_PRIORITIES.includes(
                priority
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
            startDate &&
            isNaN(
                Date.parse(
                    startDate
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
            dueDate &&
            isNaN(
                Date.parse(
                    dueDate
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
           GET PROJECT
        ---------------------------------------------------- */

        const project =
            await getProjectById(
                projectId,
                companyId
            );

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* ----------------------------------------------------
           GET SITE
        ---------------------------------------------------- */

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
                        "Site not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* ----------------------------------------------------
           MAKE SURE SITE BELONGS TO PROJECT
        ---------------------------------------------------- */

        if (
            site.projectId !==
            projectId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Selected site does not belong to the selected project",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           CREATE TASK
        ---------------------------------------------------- */

        const task =
            await createTask({
                companyId,

                companyName:
                    project.companyName,

                projectId:
                    project.projectId,

                projectName:
                    project.projectName,

                siteId:
                    site.siteId,

                siteName:
                    site.siteName,

                title,

                description:

                    description ||
                    undefined,

                assignedTo:
                    assignedTo ||
                    undefined,

                assignedToName:
                    assignedToName ||
                    undefined,

                assignedToEmail:
                    assignedToEmail ||
                    undefined,

                assignedBy:
                    assignedBy ||
                    user.userId,

                assignedByName:
                    assignedByName ||
                    user.name ||
                    user.email,

                priority,

                status,

                startDate,

                dueDate,

                remarks:
                    remarks ||
                    undefined,

                completionDescription:
                    completionDescription ||
                    undefined,

                completionLink:
                    completionLink ||
                    undefined,

                createdBy:
                    user.userId,

                createdByName:
                    user.name ||
                    user.email,
            });

        /* ----------------------------------------------------
           RESPONSE
        ---------------------------------------------------- */

        return NextResponse.json(
            {
                success: true,
                message:
                    "Construction task created successfully",
                task,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "POST construction task error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create construction task",
            },
            {
                status: 500,
            }
        );
    }
}