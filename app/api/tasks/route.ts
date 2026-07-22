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
const isManager = user.role === "Manager"; // use "MANAGER" if that's your role value

if (!isAdminUser(user) && !isManager) {
  tasks = tasks.filter(
    (task: any) => task.assignedToEmail === user.email
  );
}

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);

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
      message: "Only Admins and Managers can assign tasks.",
    },
    {
      status: 403,
    }
  );
}

    const body = await req.json();

    const now = new Date().toISOString();

    const task = {
      taskId: randomUUID(),

      title: body.title,
      description: body.description,

      companyId: body.companyId ?? "",
      companyName: body.companyName ?? "",

      assignedTo: body.assignedTo,
      assignedToName: body.assignedToName,
      assignedToEmail: body.assignedToEmail,

      // Always store the logged-in admin as the creator
      assignedBy: user.userId,
   assignedByName: user.email,

      priority: body.priority ?? "Medium",
      status: body.status ?? "Pending",

      dueDate: body.dueDate,
      remarks: body.remarks ?? "",

      createdAt: now,
      updatedAt: now,
    };

    await createTask(task);

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task.",
      },
      {
        status: 500,
      }
    );
  }
}