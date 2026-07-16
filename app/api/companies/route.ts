import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { createCompany } from "@/services/company.service";
import { getCompanies } from "@/services/company.service";

export async function POST(req: Request) {
  try {
    // const body = await req.json();
    const body = await req.json();

console.log(body);

    const company = {
      companyId: randomUUID(),

      companyName: body.companyName,
      companyType: body.companyType,

      contactPerson: body.contactPerson,
      designation: body.designation,

      mobile: body.mobile,
      alternateMobile: body.alternateMobile,

      email: body.email,

      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,

      gstNumber: body.gstNumber,
      panNumber: body.panNumber,
      website: body.website,

      assignedEmployeeId: body.assignedEmployeeId,

      status: body.status ?? "Active",

      notes: body.notes,

      tiedUpDate: new Date().toISOString(),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createCompany(company);

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create company",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const companies = await getCompanies();

    return NextResponse.json(companies);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}