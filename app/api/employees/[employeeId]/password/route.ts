import { NextResponse } from "next/server";

import { getUserFromRequest, isAdminUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

import { getEmployeeById } from "@/services/employee.service";
import {
  getUserByEmail,
  updateUserPassword,
} from "@/services/auth.service";

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
          message: "Only admins can change passwords.",
        },
        { status: 403 }
      );
    }

    const { employeeId } = await params;

    const body = await req.json();

    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const employee = await getEmployeeById(employeeId);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found.",
        },
        { status: 404 }
      );
    }

    const user = await getUserByEmail(employee.email);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Login account not found.",
        },
        { status: 404 }
      );
    }

    const hashedPassword = await hashPassword(password);

   await updateUserPassword(
  user.userId,
  hashedPassword
);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update password.",
      },
      { status: 500 }
    );
  }
}