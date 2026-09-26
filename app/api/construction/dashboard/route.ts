import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { getUserFromRequest } from "@/lib/auth";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-north-1",
});

const ATTENDANCE_TABLE =
  process.env.CONSTRUCTION_ATTENDANCE_TABLE ||
  "CRM_ConstructionAttendance";

const TASKS_TABLE =
  process.env.CONSTRUCTION_TASKS_TABLE ||
  "CRM_ConstructionTasks";

const MATERIAL_TRANSACTIONS_TABLE =
  process.env.CONSTRUCTION_MATERIAL_TRANSACTIONS_TABLE ||
  "CRM_ConstructionMaterialTransactions";

function getCompanyId(user: any): string {
  return user.companyId || user.userId;
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const companyId = getCompanyId(user);

    const { searchParams } = new URL(req.url);

    const projectId =
      searchParams.get("projectId") || "";

    /*
     * Current date in YYYY-MM-DD format.
     */
    const today = new Date()
      .toISOString()
      .split("T")[0];

    /*
     * ---------------------------------------------------
     * ATTENDANCE
     * ---------------------------------------------------
     */

    const attendanceResult = await client.send(
      new ScanCommand({
        TableName: ATTENDANCE_TABLE,

        FilterExpression:
          "companyId = :companyId AND #date = :date" +
          (projectId
            ? " AND projectId = :projectId"
            : ""),

        ExpressionAttributeNames: {
          "#date": "date",
        },

        ExpressionAttributeValues: {
          ":companyId": companyId,
          ":date": today,
          ...(projectId
            ? { ":projectId": projectId }
            : {}),
        },
      })
    );

    const attendance =
      attendanceResult.Items || [];

    const workersToday = attendance.filter(
      (item: any) =>
        item.status === "Present" ||
        item.status === "Half Day"
    ).length;

    const labourCost = attendance.reduce(
      (total: number, item: any) => {
        /*
         * We use labourCost stored in attendance.
         *
         * This already allows:
         * Present  = full wage
         * Half Day = half wage
         * Absent   = zero
         */
        return (
          total +
          Number(item.labourCost || 0)
        );
      },
      0
    );

    /*
     * ---------------------------------------------------
     * TASKS
     * ---------------------------------------------------
     */

    const taskResult = await client.send(
      new ScanCommand({
        TableName: TASKS_TABLE,

        FilterExpression:
          "companyId = :companyId" +
          (projectId
            ? " AND projectId = :projectId"
            : ""),

        ExpressionAttributeValues: {
          ":companyId": companyId,
          ...(projectId
            ? { ":projectId": projectId }
            : {}),
        },
      })
    );

    const tasks = taskResult.Items || [];

    const tasksTotal = tasks.length;

    const tasksCompleted = tasks.filter(
      (task: any) =>
        task.status === "Completed"
    ).length;

    /*
     * ---------------------------------------------------
     * MATERIAL MOVEMENT
     * ---------------------------------------------------
     *
     * We calculate the monetary movement only if
     * your material transaction records contain a
     * unitPrice / amount field.
     *
     * Your current MaterialTransaction type does NOT
     * contain price information.
     *
     * Therefore for now we calculate total quantity
     * movement.
     */

    const materialResult = await client.send(
      new ScanCommand({
        TableName:
          MATERIAL_TRANSACTIONS_TABLE,

        FilterExpression:
          "companyId = :companyId" +
          (projectId
            ? " AND projectId = :projectId"
            : ""),

        ExpressionAttributeValues: {
          ":companyId": companyId,
          ...(projectId
            ? { ":projectId": projectId }
            : {}),
        },
      })
    );

    const materialTransactions =
      materialResult.Items || [];

    const materialMovement =
      materialTransactions.reduce(
        (total: number, transaction: any) => {
          return (
            total +
            Number(transaction.quantity || 0)
          );
        },
        0
      );

    return NextResponse.json({
      success: true,

      date: today,

      projectId: projectId || null,

      workersToday,

      tasksCompleted,

      tasksTotal,

      materialMovement,

      labourCost,
    });
  } catch (error) {
    console.error(
      "Construction dashboard error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load construction dashboard",
      },
      {
        status: 500,
      }
    );
  }
}