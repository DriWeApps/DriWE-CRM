import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  createEmployee,
  getEmployees,
} from "@/services/employee.service";

import {
  createUser,
  getUserByEmail,
} from "@/services/auth.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

import { hashPassword } from "@/lib/password";

/**
 * =========================================================
 * GET EMPLOYEES
 * =========================================================
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

    const role = user.role?.toLowerCase();

    if (role !== "admin" && role !== "manager") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    const employees = await getEmployees();

    return NextResponse.json(employees);
  } catch (error) {
    console.error(
      "GET /api/employees error:",
      error
    );

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

/**
 * =========================================================
 * POST - CREATE EMPLOYEE
 * =========================================================
 */
export async function POST(req: Request) {
  try {
    const admin = await getUserFromRequest(req);

    /*
     * Only Admin can create employees.
     */
    if (!admin || !isAdminUser(admin)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only admins can create employees",
        },
        {
          status: 403,
        }
      );
    }

    const body = await req.json();

    /*
     * =====================================================
     * LOGIN DETAILS
     * =====================================================
     */

    const loginEmail = (
      body.loginEmail ||
      body.email ||
      ""
    )
      .trim()
      .toLowerCase();

    const loginPassword =
      body.password?.toString() || "";

    if (!loginEmail || !loginPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Login email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    if (loginPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * CHECK EXISTING USER
     * =====================================================
     */

    const existingUser =
      await getUserByEmail(loginEmail);

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * =====================================================
     * VALIDATE PORTAL
     * =====================================================
     *
     * crm
     * construction
     * both
     */

    type Portal = "crm" | "construction" | "both";

    const allowedPortals: Portal[] = [
      "crm",
      "construction",
      "both",
    ];

    const requestedPortal =
      typeof body.portal === "string"
        ? body.portal.trim().toLowerCase()
        : "";

    const portal: Portal =
      allowedPortals.includes(
        requestedPortal as Portal
      )
        ? (requestedPortal as Portal)
        : "crm";

    /*
     * =====================================================
     * PAGE ACCESS
     * =====================================================
     */

    const pageAccess = Array.isArray(
      body.pageAccess
    )
      ? body.pageAccess
      : [];

    /*
     * =====================================================
     * CREATE EMPLOYEE
     * =====================================================
     */

    const employeeId =
      randomUUID();

    const now =
      new Date().toISOString();

    const employee = {
      employeeId,

      firstName:
        body.firstName || "",

      lastName:
        body.lastName || "",

      email:
        body.email || "",

      mobile:
        body.mobile || "",

      designation:
        body.designation || "",

      department:
        body.department || "",

      role:
        body.role ?? "Executive",

      status:
        body.status ?? "Active",

      /*
       * =================================================
       * PORTAL ACCESS
       * =================================================
       */
      portal,

      joiningDate:
        body.joiningDate ||
        new Date()
          .toISOString()
          .split("T")[0],

      dateOfBirth:
        body.dateOfBirth || "",

      gender:
        body.gender || "",

      address:
        body.address || "",

      city:
        body.city || "",

      state:
        body.state || "",

      pincode:
        body.pincode || "",

      country:
        body.country || "",

      /*
       * CRM PAGE ACCESS
       */
      pageAccess,

      createdAt: now,
      updatedAt: now,
    };

    /*
     * =====================================================
     * HASH PASSWORD
     * =====================================================
     */

    const hashedPassword =
      await hashPassword(
        loginPassword
      );

    /*
     * =====================================================
     * SAVE EMPLOYEE
     * =====================================================
     */

    await createEmployee(
      employee
    );

    /*
     * =====================================================
     * SAVE LOGIN USER
     * =====================================================
     *
     * Portal is stored here too because the login API
     * will use the User record to determine which
     * portal the account is allowed to access.
     */

    const user = {
      userId:
        randomUUID(),

      employeeId:
        employee.employeeId,

      name:
        `${body.firstName || ""} ${body.lastName || ""
          }`.trim(),

      email:
        loginEmail,

      password:
        hashedPassword,

      role:
        (body.role ??
          "Executive").toString(),

      /*
       * IMPORTANT:
       * Portal restriction
       */
      portal,

      /*
       * CRM page permissions
       */
      pageAccess,
    };

    await createUser(user);

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Employee created successfully",

        employee: {
          ...employee,
          /*
           * Never return password
           */
          password: undefined,
        },

        user: {
          userId: user.userId,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          role: user.role,
          portal: user.portal,
          pageAccess: user.pageAccess,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/employees error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create employee",
      },
      {
        status: 500,
      }
    );
  }
}

