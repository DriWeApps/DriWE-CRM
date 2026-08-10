import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
    createTask,
    getTasks,
} from "@/services/task.service";
import { Task } from "@/types/task";


import {
    getUserFromRequest,
    isAdminUser,
    canAssignTask,
} from "@/lib/auth";

/**
 * =========================================================
 * GET TASKS
 * =========================================================
 */
export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        console.log("Logged in user:", user);

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

        let tasks = await getTasks();

        console.log(
            "Task assignedTo values:",
            tasks.map((t: any) => ({
                title: t.title,
                assignedTo: t.assignedTo,
                assignedToEmail: t.assignedToEmail,
                assignmentDate: t.assignmentDate,
                dueDate: t.dueDate,
            }))
        );

        /*
         * ADMIN + MANAGER
         * Can see all tasks.
         */
        const isManager =
            user.role === "Manager";

        if (
            !isAdminUser(user) &&
            !isManager
        ) {
            /*
             * EMPLOYEE / EXECUTIVE
             * Can only see their own tasks.
             */
            tasks = tasks.filter(
                (task: any) =>
                    task.assignedToEmail ===
                    user.email
            );
        }

        return NextResponse.json(tasks);

    } catch (error) {

        console.error(
            "Get Tasks Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch tasks",
            },
            {
                status: 500,
            }
        );
    }
}

/**
 * =========================================================
 * CREATE TASK
 * =========================================================
 */
export async function POST(req: Request) {
    try {

        const user =
            await getUserFromRequest(req);

        /*
         * Only Admin / Manager can assign tasks.
         */
        if (
            !user ||
            !canAssignTask(user)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only Admins and Managers can assign tasks.",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await req.json();

        console.log(
            "Create Task Request:",
            body
        );

        /* =====================================================
           VALIDATE TASK START DATE
        ===================================================== */

        if (!body.assignmentDate) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please select the date from which the employee can start this task.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           VALIDATE DUE DATE
        ===================================================== */

        if (!body.dueDate) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please select the final due date for this task.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           VALIDATE DATE RANGE
        ===================================================== */

        const assignmentDate =
            new Date(
                `${body.assignmentDate}T00:00:00`
            );

        const dueDate =
            new Date(
                `${body.dueDate}T00:00:00`
            );

        if (
            isNaN(
                assignmentDate.getTime()
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The task start date is not valid. Please select a valid date.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            isNaN(
                dueDate.getTime()
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The task due date is not valid. Please select a valid date.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            dueDate < assignmentDate
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The due date cannot be earlier than the task start date.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CREATE TIMESTAMP
        ===================================================== */

        const now =
            new Date().toISOString();

        /* =====================================================
           CREATE TASK
        ===================================================== */

        const task: Task = {

            taskId:
                randomUUID(),

            title:
                body.title,

            description:
                body.description,

            companyId:
                body.companyId ?? "",

            companyName:
                body.companyName ?? "",

            assignedTo:
                body.assignedTo,

            assignedToName:
                body.assignedToName,

            assignedToEmail:
                body.assignedToEmail,

            /*
             * Always use the logged-in
             * user as task creator.
             */
            assignedBy:
                user.userId,

            assignedByName:
                user.email,

            priority:
                body.priority ??
                "Medium",

            /*
             * New tasks always start
             * as Pending.
             */
            status:
                "Pending",

            /*
             * Date when the employee can
             * start the task.
             */
            assignmentDate:
                body.assignmentDate,

            /*
             * IMPORTANT
             *
             * Last date employee can
             * submit the task.
             */
            dueDate:
                body.dueDate,

            remarks:
                body.remarks ?? "",

            createdAt:
                now,

            updatedAt:
                now,
        };

        console.log(
            "Task being stored:",
            task
        );

        await createTask(task);

        return NextResponse.json(
            {
                success: true,
                task,
            },
            {
                status: 201,
            }
        );

    } catch (error) {

        console.error(
            "Create Task Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create task.",
            },
            {
                status: 500,
            }
        );
    }
}