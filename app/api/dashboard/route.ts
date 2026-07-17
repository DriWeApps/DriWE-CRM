import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

export async function GET() {
  try {
    const [
      companies,
      employees,
      tasks,
      meetings,
    ] = await Promise.all([
      db.send(
        new ScanCommand({
          TableName: process.env.COMPANIES_TABLE!,
          Select: "COUNT",
        })
      ),
      db.send(
        new ScanCommand({
          TableName: process.env.EMPLOYEES_TABLE!,
          Select: "COUNT",
        })
      ),
      db.send(
        new ScanCommand({
          TableName: process.env.TASKS_TABLE!,
          Select: "COUNT",
        })
      ),
      db.send(
        new ScanCommand({
          TableName: process.env.MEETINGS_TABLE!,
          Select: "COUNT",
        })
      ),
    ]);

    return NextResponse.json({
      companies: companies.Count ?? 0,
      employees: employees.Count ?? 0,
      tasks: tasks.Count ?? 0,
      meetings: meetings.Count ?? 0,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Dashboard Error",
      },
      {
        status: 500,
      }
    );
  }
}