import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  createTask,
  getTasks,
} from "@/services/task.service";

export async function GET() {
  try {
    const tasks = await getTasks();

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
    const body = await req.json();

    const task = {
      taskId: randomUUID(),

      title: body.title,
      description: body.description,

      companyId: body.companyId,
      companyName: body.companyName,

      assignedTo: body.assignedTo,
      assignedToName: body.assignedToName,

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