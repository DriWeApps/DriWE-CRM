import { NextResponse } from "next/server";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

import {
  deleteEmployee,
  getEmployeeById,
} from "@/services/employee.service";

interface Params {
  params: Promise<{
    employeeId: string;
  }>;
}

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const admin = await getUserFromRequest(req);

    if (!admin || !isAdminUser(admin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can delete employees",
        },
        { status: 403 }
      );
    }

    const { employeeId } = await params;

    const employee = await getEmployeeById(employeeId);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    await deleteEmployee(employeeId);

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete employee",
      },
      { status: 500 }
    );
  }
}