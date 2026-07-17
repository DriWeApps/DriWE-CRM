import { NextResponse } from "next/server";
import {
  createCompany,
  getCompanies,
} from "@/services/company.service";

// GET ALL COMPANIES
export async function GET() {
  try {
    const companies = await getCompanies();

    return NextResponse.json({
      success: true,
      companies,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch companies",
      },
      {
        status: 500,
      }
    );
  }
}

// CREATE COMPANY
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.companyName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Company name is required",
        },
        {
          status: 400,
        }
      );
    }

    const company = await createCompany(body);

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Create company error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Company creation failed",
      },
      {
        status: 500,
      }
    );
  }
}