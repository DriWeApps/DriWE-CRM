import { NextResponse } from "next/server";

import { createToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getUserByEmail } from "@/services/auth.service";
import { createAttendanceSession } from "@/services/attendance.service";

type Portal = "crm" | "construction" | "both";

/* =========================================================
   LOGIN
========================================================= */

export async function POST(req: Request) {
  try {
    /* =====================================================
       READ REQUEST
    ===================================================== */

    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       FIND USER
    ===================================================== */

    const user = await getUserByEmail(email);

    /*
     * Temporary login diagnostics.
     *
     * IMPORTANT:
     * Never log the actual password.
     */
    console.log("========== LOGIN DEBUG ==========");
    console.log("Login email:", email);
    console.log("User found:", !!user);

    if (user) {
      console.log("User ID:", user.userId);
      console.log("User email:", user.email);
      console.log("User role:", user.role);
      console.log("User portal:", user.portal);
      console.log("User companyId:", user.companyId);
      console.log("Password hash exists:", !!user.password);

      console.log(
        "Password hash prefix:",
        user.password
          ? user.password.substring(0, 20)
          : "NO PASSWORD"
      );
    }

    if (!user) {
      console.log(
        "LOGIN RESULT: USER NOT FOUND"
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       PASSWORD CHECK
    ===================================================== */

    const validPassword = await verifyPassword(
      password,
      user.password
    );

    console.log(
      "Password verification result:",
      validPassword
    );

    if (!validPassword) {
      console.log(
        "LOGIN RESULT: INVALID PASSWORD"
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "LOGIN RESULT: PASSWORD VERIFIED"
    );

    /* =====================================================
       USER ROLE
    ===================================================== */

    const role =
      typeof user.role === "string"
        ? user.role.trim().toUpperCase()
        : "";

    const isAdmin = role === "ADMIN";

    const isConstructionEmployee =
      role === "CONSTRUCTIONEMPLOYEE";

    /* =====================================================
       USER PORTAL
    ===================================================== */

    /*
     * Existing users without a portal
     * are treated as CRM users.
     */

    const normalizedPortal =
      typeof user.portal === "string"
        ? user.portal.trim().toLowerCase()
        : "";

    const userPortal: Portal =
      normalizedPortal === "construction"
        ? "construction"
        : normalizedPortal === "both"
          ? "both"
          : "crm";

    /* =====================================================
       LOGIN PORTAL
    ===================================================== */

    /*
     * Admin can access both portals.
     */

    const loginPortal: Portal =
      isAdmin
        ? "both"
        : userPortal;

    /* =====================================================
       CONSTRUCTION USER VALIDATION
    ===================================================== */

    /*
     * ConstructionEmployee accounts must belong
     * to the Construction Portal.
     */

    if (
      isConstructionEmployee &&
      userPortal !== "construction" &&
      userPortal !== "both"
    ) {
      console.log(
        "LOGIN RESULT: CONSTRUCTION USER HAS INVALID PORTAL"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "This construction employee is not assigned to the Construction Portal.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       ATTENDANCE SESSION
    ===================================================== */

    /*
     * Attendance tracking must never block login.
     */

    try {
      await createAttendanceSession({
        employeeId: user.employeeId,
        userId: user.userId,
        email: user.email,
      });
    } catch (attendanceError) {
      console.error(
        "Attendance login tracking error:",
        attendanceError
      );
    }

    /* =====================================================
       CREATE JWT
    ===================================================== */

    const token = await createToken({
      userId: user.userId,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,

      /*
       * Include companyId when available.
       */
      ...(user.companyId
        ? {
            companyId: user.companyId,
          }
        : {}),

      pageAccess: user.pageAccess ?? [],
      portal: loginPortal,
    });

    console.log(
      "JWT created successfully."
    );

    console.log(
      "Login portal:",
      loginPortal
    );

    console.log(
      "Login role:",
      user.role
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    const response = NextResponse.json(
      {
        success: true,

        user: {
          userId: user.userId,

          employeeId:
            user.employeeId,

          companyId:
            user.companyId,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          pageAccess:
            user.pageAccess ?? [],

          portal:
            loginPortal,
        },
      },
      {
        status: 200,
      }
    );

    /* =====================================================
       AUTH COOKIE
    ===================================================== */

    response.cookies.set(
      "token",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge:
          60 *
          60 *
          24 *
          7,
      }
    );

    console.log(
      "LOGIN RESULT: SUCCESS"
    );

    return response;
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}