import { NextResponse } from "next/server";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

import { hashPassword } from "@/lib/password";
import {
  getUserByEmployeeId,
  getUserByEmail,
  updateUserPassword,
  updateUserPageAccess,
  updateUserEmail,
  updateUserName,
  updateUserRole,
  updateUserPortal,
} from "@/services/auth.service";

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

    const employee =
      await getEmployeeById(employeeId);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    let user =
      await getUserByEmployeeId(
        employee.employeeId
      );

    if (
      !user &&
      typeof body.email === "string" &&
      body.email.trim()
    ) {
      user = await getUserByEmail(
        body.email.trim()
      );
    }

    if (user) {
      /*
       * =====================================================
       * PAGE ACCESS
       * =====================================================
       */
      if (Array.isArray(body.pageAccess)) {
        await updateUserPageAccess(
          user.userId,
          body.pageAccess
        );
      }

      /*
       * =====================================================
       * PORTAL ACCESS
       * =====================================================
       */
      if (
        typeof body.portal === "string"
      ) {
        const portal =
          body.portal.trim().toLowerCase();

        if (
          ["crm", "construction", "both"].includes(
            portal
          )
        ) {
          await updateUserPortal(
            user.userId,
            portal as
              | "crm"
              | "construction"
              | "both"
          );
        }
      }

      /*
       * =====================================================
       * PASSWORD
       * =====================================================
       */
      if (body.password) {
        if (
          typeof body.password !== "string" ||
          body.password.length < 6
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Password must be at least 6 characters.",
            },
            { status: 400 }
          );
        }

        const hashedPassword =
          await hashPassword(
            body.password
          );

        await updateUserPassword(
          user.userId,
          hashedPassword
        );
      }

      /*
       * =====================================================
       * EMAIL
       * =====================================================
       */
      if (
        typeof body.email === "string" &&
        body.email.trim() &&
        body.email.trim().toLowerCase() !==
          user.email.toLowerCase()
      ) {
        await updateUserEmail(
          user.userId,
          body.email.trim()
        );
      }

      /*
       * =====================================================
       * ROLE
       * =====================================================
       */
      if (
        typeof body.role === "string" &&
        body.role.trim() &&
        body.role !== user.role
      ) {
        await updateUserRole(
          user.userId,
          body.role.trim()
        );
      }

      /*
       * =====================================================
       * NAME
       * =====================================================
       */
      if (
        typeof body.firstName === "string" &&
        typeof body.lastName === "string"
      ) {
        const fullName =
          `${body.firstName.trim()} ${body.lastName.trim()}`
            .trim();

        if (
          fullName &&
          fullName !== user.name
        ) {
          await updateUserName(
            user.userId,
            fullName
          );
        }
      }
    } else if (body.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Login account not found for this employee.",
        },
        { status: 404 }
      );
    }

    /*
     * =====================================================
     * UPDATE EMPLOYEE RECORD
     * =====================================================
     */
    await updateEmployee(
      employeeId,
      body
    );

    return NextResponse.json({
      success: true,
      message:
        "Employee updated successfully",
    });
  } catch (error) {
    console.error(
      "Update employee error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update employee",
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