import { NextResponse } from "next/server";

import { createToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getUserByEmail } from "@/services/auth.service";

type Portal = "crm" | "construction" | "both";

export async function POST(req: Request) {
  try {
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

    if (!user) {
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

    if (!validPassword) {
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

    console.log("User from DB:", user);

    /* =====================================================
       GET USER PORTAL
    ===================================================== */

    const role =
      user.role?.trim().toUpperCase();

    const isAdmin = role === "ADMIN";

    /*
     * Existing users without a portal are treated as
     * CRM users.
     */
    const userPortal: Portal =
      user.portal === "construction"
        ? "construction"
        : user.portal === "both"
          ? "both"
          : "crm";

    /*
     * Admin can access both.
     */
    const loginPortal: Portal =
      isAdmin
        ? "both"
        : userPortal;

    /* =====================================================
       CREATE JWT
    ===================================================== */

    const token = await createToken({
      userId: user.userId,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      pageAccess: user.pageAccess ?? [],
      portal: loginPortal,
    });

    console.log(
      "Created token with portal:",
      loginPortal
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    const response = NextResponse.json({
      success: true,

      user: {
        userId: user.userId,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,

        pageAccess:
          user.pageAccess ?? [],

        portal: loginPortal,
      },
    });

    /* =====================================================
       AUTH COOKIE
    ===================================================== */

    response.cookies.set("token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}