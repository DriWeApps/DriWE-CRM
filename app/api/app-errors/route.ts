import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
 import { getEmployeeById } from "@/services/employee.service";

import {
  createAppError,
  getAppErrors,
} from "@/services/app-error.service";

import { getUserFromRequest } from "@/lib/auth";



/**
 * GET ALL APP ERRORS
 */
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
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

    const errors = await getAppErrors();

    return NextResponse.json({
      success: true,
      errors,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch app errors.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * CREATE APP ERROR
 */
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
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

    const employee = user.employeeId
  ? await getEmployeeById(user.employeeId)
  : null;

    const body = await req.json();

    if (
      !body.module ||
      !body.errorTitle ||
      !body.occurredError ||
      !body.expectedError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    const appError = {
      errorId: randomUUID(),

      module: body.module,

      errorTitle: body.errorTitle,

      occurredError: body.occurredError,

      expectedError: body.expectedError,

      status: body.status || "In Progress",

      reportedBy: user.employeeId || user.userId,

     reportedByName: employee
  ? `${employee.firstName} ${employee.lastName}`
  : user.email,

      reportedByEmail: user.email,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    };

    await createAppError(appError);

    return NextResponse.json({
      success: true,
      message: "App error reported successfully.",
      error: appError,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to report app error.",
      },
      {
        status: 500,
      }
    );
  }
}