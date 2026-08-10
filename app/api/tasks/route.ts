import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  createTask,
  getTasks,
} from "@/services/task.service";

import {
  getUserFromRequest,
  isAdminUser,
  canAssignTask,
} from "@/lib/auth";

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
      }))
    );

    // Admin and Manager can see all tasks
    const isManager = user.role === "Manager";

    if (!isAdminUser(user) && !isManager) {
      tasks = tasks.filter(
        (task: any) =>
          task.assignedToEmail === user.email
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
        message: "Failed to fetch tasks",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !canAssignTask(user)) {
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

    /* =====================================================
       VALIDATE ASSIGNMENT DATE
    ===================================================== */

    if (!body.assignmentDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Assignment date is required.",
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
            "Due date is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE DATE RANGE
       
       Due date cannot be before assignment date.
    ===================================================== */

    if (
      body.dueDate <
      body.assignmentDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Due date cannot be earlier than the assignment date.",
        },
        {
          status: 400,
        }
      );
    }

    const now =
      new Date().toISOString();

    /* =====================================================
       CREATE TASK
    ===================================================== */

    const task = {
      taskId: randomUUID(),

      title: body.title,
      description: body.description,

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

      // Always use the logged-in user as creator
      assignedBy:
        user.userId,

      assignedByName:
        user.email,

      priority:
        body.priority ?? "Medium",

      // Every new task starts as Pending
      status:
        body.status ?? "Pending",

      /*
       * IMPORTANT:
       *
       * Assignment Date =
       * first day employee can submit
       *
       * Due Date =
       * last day employee can submit
       */
      assignmentDate:
        body.assignmentDate,

      dueDate:
        body.dueDate,

      remarks:
        body.remarks ?? "",

      createdAt:
        now,

      updatedAt:
        now,
    };

    await createTask(task);

    return NextResponse.json({
      success: true,
      task,
    });
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