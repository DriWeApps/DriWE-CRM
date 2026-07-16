import { NextResponse } from "next/server";

import {
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "@/services/employee.service";

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

  const employee = await getEmployeeById(id);

  return NextResponse.json(employee);
}

export async function PUT(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const body = await req.json();

  await updateEmployee(id, body);

  return NextResponse.json({
    success: true,
  });
}

export async function DELETE(
  req: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  await deleteEmployee(id);

  return NextResponse.json({
    success: true,
  });
}