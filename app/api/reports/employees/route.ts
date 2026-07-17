import { NextResponse } from "next/server";
import { getEmployees } from "@/services/employee.service";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const employees = await getEmployees();

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch employees",
      },
      {
        status: 500,
      }
    );
  }
}