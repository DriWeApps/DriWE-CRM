// import { NextResponse } from "next/server";
// import { ScanCommand } from "@aws-sdk/lib-dynamodb";

// import { db } from "@/lib/dynamodb";

// export async function GET() {
//   try {
//     const [
//       companies,
//       employees,
//       tasks,
//       meetings,
//     ] = await Promise.all([
//       db.send(
//         new ScanCommand({
//           TableName: process.env.COMPANIES_TABLE!,
//           Select: "COUNT",
//         })
//       ),
//       db.send(
//         new ScanCommand({
//           TableName: process.env.EMPLOYEES_TABLE!,
//           Select: "COUNT",
//         })
//       ),
//       db.send(
//         new ScanCommand({
//           TableName: process.env.TASKS_TABLE!,
//           Select: "COUNT",
//         })
//       ),
//       db.send(
//         new ScanCommand({
//           TableName: process.env.MEETINGS_TABLE!,
//           Select: "COUNT",
//         })
//       ),
//     ]);

//     return NextResponse.json({
//       companies: companies.Count ?? 0,
//       employees: employees.Count ?? 0,
//       tasks: tasks.Count ?? 0,
//       meetings: meetings.Count ?? 0,
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Dashboard Error",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";
import { getUserFromRequest, isAdminUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const [
      companies,
      employees,
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
          TableName: process.env.MEETINGS_TABLE!,
          Select: "COUNT",
        })
      ),
    ]);

    /**
     * =========================================================
     * TASK COUNT
     * =========================================================
     *
     * ADMIN / MANAGER
     * ----------------
     * Show total number of tasks.
     *
     * EMPLOYEE
     * --------
     * Show only tasks assigned to the logged-in employee.
     */

    let taskCount = 0;

    if (
      user.role === "ADMIN" ||
      user.role === "MANAGER"
    ) {
      const tasks = await db.send(
        new ScanCommand({
          TableName: process.env.TASKS_TABLE!,
          Select: "COUNT",
        })
      );

      taskCount = tasks.Count ?? 0;
    } else {
      const tasks = await db.send(
        new ScanCommand({
          TableName: process.env.TASKS_TABLE!,
          FilterExpression: "assignedToEmail = :email",
          ExpressionAttributeValues: {
            ":email": user.email,
          },
          Select: "COUNT",
        })
      );

      taskCount = tasks.Count ?? 0;
    }

    return NextResponse.json({
      success: true,
      companies: companies.Count ?? 0,
      employees: employees.Count ?? 0,
      tasks: taskCount,
      meetings: meetings.Count ?? 0,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

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