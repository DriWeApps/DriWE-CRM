import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";

export async function GET() {
  try {
    const data = await getDashboardStats();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );
  }
}