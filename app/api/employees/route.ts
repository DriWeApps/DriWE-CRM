import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  createEmployee,
  getEmployees,
} from "@/services/employee.service";

export async function GET() {
  try {
    const employees = await getEmployees();

    return NextResponse.json(employees);
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

export async function POST(req: Request) {
  try {
    // const body = await req.json();
    const body = await req.json();

console.log(body);

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

      joiningDate:
        body.joiningDate ??
        new Date().toISOString().split("T")[0],

      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createEmployee(employee);

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create employee",
      },
      {
        status: 500,
      }
    );
  }
}