
import { NextResponse } from "next/server";

import { createToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getUserByEmail } from "@/services/auth.service";
import { createAttendanceSession } from "@/services/attendance.service";

type Portal = "crm" | "construction" | "both";

const CONSTRUCTION_ADMIN_EMAIL = "adminc@driwe.com";

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

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    console.log("========== LOGIN DEBUG ==========");
    console.log("Login email:", email);
    console.log("User found:", !!user);

    if (!user) {
      console.log("LOGIN RESULT: USER NOT FOUND");

      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    console.log("User ID:", user.userId);
    console.log("User email:", user.email);
    console.log("User role:", user.role);
    console.log("User portal:", user.portal);
    console.log("User companyId:", user.companyId);
    console.log("Password hash exists:", !!user.password);

    const validPassword = await verifyPassword(
      password,
      user.password
    );

    console.log("Password verification result:", validPassword);

    if (!validPassword) {
      console.log("LOGIN RESULT: INVALID PASSWORD");

      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    console.log("LOGIN RESULT: PASSWORD VERIFIED");

    const role =
      typeof user.role === "string"
        ? user.role.trim().toUpperCase()
        : "";

    const isAdmin = role === "ADMIN";

    const isConstructionEmployee =
      role === "CONSTRUCTIONEMPLOYEE";

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

    // This specific admin account is restricted to Construction CRM.
    // Other admin accounts retain their existing access behavior.
    const loginPortal: Portal =
      isAdmin && email === CONSTRUCTION_ADMIN_EMAIL
        ? "construction"
        : isAdmin
          ? "both"
          : userPortal;

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
        { status: 403 }
      );
    }

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

    const token = await createToken({
      userId: user.userId,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      ...(user.companyId
        ? { companyId: user.companyId }
        : {}),
      pageAccess: user.pageAccess ?? [],
      portal: loginPortal,
    });

    console.log("JWT created successfully.");
    console.log("Login portal:", loginPortal);
    console.log("Login role:", role);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          userId: user.userId,
          employeeId: user.employeeId,
          companyId: user.companyId,
          name: user.name,
          email: user.email,
          role: user.role,
          pageAccess: user.pageAccess ?? [],
          portal: loginPortal,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("LOGIN RESULT: SUCCESS");

    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
