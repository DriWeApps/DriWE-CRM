import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { hashPassword } from "@/lib/password";
import {
  createUser,
  getUserByEmail,
} from "@/services/auth.service";

import {
  createEmployee,
} from "@/services/employee.service";

export async function POST(req: Request) {
  try {
    /* =====================================================
       READ REQUEST BODY
    ====================================================== */

    const body = await req.json();

    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const contactNo =
      typeof body.contactNo === "string"
        ? body.contactNo.trim()
        : "";

    const companyName =
      typeof body.companyName === "string"
        ? body.companyName.trim()
        : "";

    const companyGSTNo =
      typeof body.companyGSTNo === "string"
        ? body.companyGSTNo.trim().toUpperCase()
        : "";

    const companyPANNo =
      typeof body.companyPANNo === "string"
        ? body.companyPANNo.trim().toUpperCase()
        : "";

    const pincode =
      typeof body.pincode === "string"
        ? body.pincode.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!firstName) {
      return NextResponse.json(
        {
          success: false,
          message: "First name is required.",
        },
        { status: 400 }
      );
    }

    if (!lastName) {
      return NextResponse.json(
        {
          success: false,
          message: "Last name is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 }
      );
    }

    if (!contactNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact number is required.",
        },
        { status: 400 }
      );
    }

    if (!companyName) {
      return NextResponse.json(
        {
          success: false,
          message: "Company name is required.",
        },
        { status: 400 }
      );
    }

    if (!companyGSTNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Company GST number is required.",
        },
        { status: 400 }
      );
    }

    if (!companyPANNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Company PAN number is required.",
        },
        { status: 400 }
      );
    }

    if (!pincode) {
      return NextResponse.json(
        {
          success: false,
          message: "Pincode is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Pincode must be exactly 6 digits.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CHECK EXISTING ACCOUNT
    ====================================================== */

    const existingUser =
      await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists. Please login instead.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       CREATE IDS / TIMESTAMP
    ====================================================== */

    const userId = randomUUID();
    const employeeId = randomUUID();

    const now = new Date().toISOString();

    /* =====================================================
       HASH PASSWORD
    ====================================================== */

    const hashedPassword =
      await hashPassword(password);

    /* =====================================================
       CREATE CONSTRUCTION EMPLOYEE PROFILE
    ====================================================== */

    const employee = {
      employeeId,

      /* Personal Details */
      firstName,
      lastName,
      email,
      mobile: contactNo,

      /* Company Details */
      companyName,
      companyGSTNo,
      companyPANNo,

      /* Location */
      pincode,

      /* Construction Account */
      designation: "Construction Candidate",

      department: "Construction",

      role: "Executive",

      status: "Active",

      portal: "construction" as const,

      joiningDate: now.split("T")[0],

      /* Unused profile fields */
      dateOfBirth: "",

      gender: "",

      address: "",

      city: "",

      state: "",

      country: "India",

      /*
       * Construction signup users should not
       * receive CRM page permissions.
       */
      pageAccess: [],

      createdAt: now,

      updatedAt: now,
    };

    /* =====================================================
       CREATE EMPLOYEE RECORD
    ====================================================== */

    await createEmployee(employee);

    /* =====================================================
       CREATE LOGIN USER
    ====================================================== */

    const user = await createUser({
      userId,

      employeeId,

      name:
        `${firstName} ${lastName}`.trim(),

      email,

      password:
        hashedPassword,

      role: "Executive",

      /*
       * This account is ALWAYS Construction.
       */
      portal: "construction",

      /*
       * No CRM page access.
       */
      pageAccess: [],
    });

    /* =====================================================
       SUCCESS RESPONSE
    ====================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Construction account created successfully.",

        user: {
          userId:
            user.userId,

          employeeId:
            user.employeeId,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          portal:
            "construction",
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Construction Signup Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create Construction account.",
      },
      {
        status: 500,
      }
    );
  }
}