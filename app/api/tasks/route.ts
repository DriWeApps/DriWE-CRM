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


/* =========================================================
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
            tasks.map((task: any) => ({
                title: task.title,
                assignedTo: task.assignedTo,
                assignedToName: task.assignedToName,
                assignedToEmail: task.assignedToEmail,
                assignmentDate: task.assignmentDate,
                dueDate: task.dueDate,
            }))
        );

        
        /* ADMIN + MANAGER
         * Can see all tasks.
         */
        const isManager =
            user.role?.trim().toLowerCase() ===
            "manager";

        if (
            !isAdminUser(user) &&
            !isManager
        ) {
            
            /* EMPLOYEE / EXECUTIVE
             * Can only see their own tasks.
            */
            const userEmail =
                user.email?.trim().toLowerCase();

            tasks = tasks.filter(
                (task: any) =>
                    task.assignedToEmail
                        ?.trim()
                        .toLowerCase() ===
                    userEmail
            );
        }

        return NextResponse.json({
            success: true,
            tasks,
        });

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


/* =========================================================
 * CREATE TASK
 * =========================================================
*/
export async function POST(req: Request) {
    try {
        const user =
            await getUserFromRequest(req);

        
        /* Only Admin / Manager can
         * create and assign tasks.
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
         * VALIDATE TITLE
         * =====================================================
        */
        if (
            !body.title ||
            typeof body.title !== "string" ||
            !body.title.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task title is required.",
                },
                {
                    status: 400,
                }
            );
        }

        
        /* =====================================================
         * VALIDATE ASSIGNEE
         * =====================================================
        */
        if (
            !body.assignedTo ||
            !String(body.assignedTo).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please select an employee to assign this task.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !body.assignedToName ||
            !String(body.assignedToName).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Assigned employee name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !body.assignedToEmail ||
            !String(body.assignedToEmail).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Assigned employee email is required.",
                },
                {
                    status: 400,
                }
            );
        }

        
        /* =====================================================
         * VALIDATE TASK START DATE
         * =====================================================
        */
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
         * VALIDATE DUE DATE
         * =====================================================
        */
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
         * VALIDATE DATES
         * =====================================================
        */
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

        
        /* Due date cannot be before
         * assignment date.
        */
        if (
            dueDate <
            assignmentDate
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
         * CREATE TIMESTAMP
         * =====================================================
        */
        const now =
            new Date().toISOString();

        
        /* =====================================================
         * CREATE TASK
         * =====================================================
        */
        const task: Task = {
            taskId:
                randomUUID(),

            title:
                body.title.trim(),

            description:
                body.description?.trim() ||
                "",

            companyId:
                body.companyId ?? "",

            companyName:
                body.companyName?.trim() ||
                "",

            
            /* Employee identifier
            */
            assignedTo:
                String(body.assignedTo).trim(),

            
            /* Employee display name
            */
            assignedToName:
                String(
                    body.assignedToName
                ).trim(),

            
            /* Employee email
            */
            assignedToEmail:
                String(
                    body.assignedToEmail
                )
                    .trim()
                    .toLowerCase(),

            
            /* Always use the logged-in
             * user as task creator.
            */
            assignedBy:
                user.userId,

            assignedByName:
                user.email,

            priority:
                body.priority ??
                "Medium",

            
            /* Every new task starts
             * as Pending.
            */
            status:
                "Pending",

            
            /* Date from which the employee
             * can start the task.
            */
            assignmentDate:
                body.assignmentDate,

            
            /* Last date on which the
             * employee can submit.
            */
            dueDate:
                body.dueDate,

            remarks:
                body.remarks?.trim() ||
                "",

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