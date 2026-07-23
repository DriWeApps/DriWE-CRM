import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { getEmployeeById } from "@/services/employee.service";
import { getUserByEmail } from "@/services/auth.service";

export async function GET(req: Request) {
  try {
    const session = await getUserFromRequest(req);

    if (!session) {
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

    let employee = null;

    // First try employeeId
    if (session.employeeId) {
      employee = await getEmployeeById(session.employeeId);
    }

    // Admin usually doesn't have an employee record
    const user = await getUserByEmail(session.email);

    return NextResponse.json({
      success: true,

      profile: {
        name:
          employee
            ? `${employee.firstName} ${employee.lastName}`
            : user?.name,

        email: session.email,

        mobile: employee?.mobile ?? "-",

        designation:
          employee?.designation ?? "Administrator",

        department:
          employee?.department ?? "-",

        role:
          employee?.role ??
          user?.role ??
          session.role,

        status:
          employee?.status ?? "Active",

        dob:
          employee?.dob ?? "-",

        address:
          employee?.address ?? "-",

        city:
          employee?.city ?? "-",

        pincode:
          employee?.pincode ?? "-",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile",
      },
      {
        status: 500,
      }
    );
  }
}