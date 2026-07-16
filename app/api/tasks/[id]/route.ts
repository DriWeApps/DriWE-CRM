import { NextResponse } from "next/server";

import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/services/task.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const task = await getTaskById(id);

  if (!task) {
    return NextResponse.json(
      {
        success: false,
        message: "Task not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(task);
}

export async function PUT(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const body = await req.json();

  await updateTask(id, body);

  return NextResponse.json({
    success: true,
    message: "Task updated successfully",
  });
}

export async function DELETE(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  await deleteTask(id);

  return NextResponse.json({
    success: true,
    message: "Task deleted successfully",
  });
}