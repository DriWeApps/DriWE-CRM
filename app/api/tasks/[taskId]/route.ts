import { NextResponse } from "next/server";

import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/services/task.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

interface Params {
  params: Promise<{
    taskId: string;
  }>;
}

/**
 * GET Task By ID
 */
export async function GET(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    const task = await getTaskById(taskId);

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    if (
      !isAdminUser(user) &&
      task.assignedToEmail !== user.email
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

/**
 * UPDATE TASK
 */
export async function PUT(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    const oldTask = await getTaskById(taskId);

    if (!oldTask) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body);

    // Employee can only update status & remarks
   // Employee can only update before deadline
if (!isAdminUser(user)) {

  const now = new Date();
  const dueDate = new Date(oldTask.dueDate);

  if (now > dueDate) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Task deadline has passed. Please contact your administrator for further changes.",
      },
      {
        status: 403,
      }
    );
  }

  await updateTask(taskId, {
    ...oldTask,
    status: body.status,
    remarks: body.remarks,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
  });
}
    // Admin can update everything
    await updateTask(taskId, {
      ...oldTask,
      ...body,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * DELETE TASK
 */
export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        { success: false, message: "Only Admin can delete task" },
        { status: 403 }
      );
    }

    const { taskId } = await params;

    await deleteTask(taskId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}