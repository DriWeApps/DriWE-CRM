import { NextResponse } from "next/server";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

// import {
//   deleteEmployee,
//   getEmployeeById,
// } from "@/services/employee.service";

import {
  deleteEmployee,
  getEmployeeById,
  updateEmployee,
} from "@/services/employee.service";

interface Params {
  params: Promise<{
    employeeId: string;
  }>;
}



export async function PUT(
  req: Request,
  { params }: Params
) {
  try {
    const admin = await getUserFromRequest(req);

    if (!admin || !isAdminUser(admin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can edit employees",
        },
        { status: 403 }
      );
    }

    const { employeeId } = await params;

    const body = await req.json();

    await updateEmployee(employeeId, body);

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update employee",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
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

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch employee",
      },
      { status: 500 }
    );
  }
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