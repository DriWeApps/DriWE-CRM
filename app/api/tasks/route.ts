import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  createTask,
  getTasks,
} from "@/services/task.service";
import { getUserFromRequest, isAdminUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    console.log("Logged in user:", user);
    let tasks = await getTasks();
    console.log("Task assignedTo values:", tasks.map((t: any) => ({
  title: t.title,
  assignedTo: t.assignedTo,
})));

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // let tasks = await getTasks();

    // Employees should only see their own tasks
   if (!isAdminUser(user)) {
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
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can create tasks",
        },
        {
          status: 403,
        }
      );
    }

    const body = await req.json();

    const task = {
      taskId: randomUUID(),

      title: body.title,
      description: body.description,

      companyId: body.companyId,
      companyName: body.companyName,

      assignedTo: body.assignedTo,           // employeeId
  assignedToName: body.assignedToName,   // John Doe
  assignedToEmail: body.assignedToEmail,

      assignedBy: body.assignedBy,
      assignedByName: body.assignedByName,

      priority: body.priority ?? "Medium",
      status: body.status ?? "Pending",

      dueDate: body.dueDate,
      remarks: body.remarks ?? "",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
        message: "Failed to create task",
      },
      {
        status: 500,
      }
    );
  }
}