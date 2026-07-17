import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  createEmployee,
  getEmployees,
  deleteEmployee,
} from "@/services/employee.service";

import { createUser, getUserByEmail } from "@/services/auth.service";
import { getUserFromRequest, isAdminUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const employees = await getEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ success: false, message: "Only admins can create employees" }, { status: 403 });
    }

    const body = await req.json();
    const loginEmail = (body.loginEmail || body.email || "").trim();
    const loginPassword = body.password?.toString() || "";

    if (!loginEmail || !loginPassword) {
      return NextResponse.json({ success: false, message: "Login email and password are required" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(loginEmail);
    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email already exists" }, { status: 409 });
    }

    const employee = {
      employeeId: randomUUID(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      mobile: body.mobile,
      designation: body.designation,
      department: body.department,
      role: body.role ?? "Executive",
      status: body.status ?? "Active",
      joiningDate: body.joiningDate ?? new Date().toISOString().split("T")[0],
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const hashedPassword = await hashPassword(loginPassword);

    await createEmployee(employee);
    await createUser({
  userId: randomUUID(),
  employeeId: employee.employeeId,   // <-- ADD THIS
  name: `${body.firstName} ${body.lastName}`.trim(),
  email: loginEmail,
  password: hashedPassword,
  role: (body.role ?? "Executive").toString(),
});
    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to create employee" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  console.log("DELETE handler called"); // ← Add this for debugging

  try {
    const admin = await getUserFromRequest(req);
    if (!admin || !isAdminUser(admin)) {
      return NextResponse.json({ success: false, message: "Only admins can delete employees" }, { status: 403 });
    }

    const url = new URL(req.url);
    const employeeId = url.pathname.split("/").pop();

    if (!employeeId) {
      return NextResponse.json({ success: false, message: "Employee ID is required" }, { status: 400 });
    }

    await deleteEmployee(employeeId);

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete employee" }, { status: 500 });
  }
}