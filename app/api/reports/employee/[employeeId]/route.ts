import { NextResponse } from "next/server";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";

const EMPLOYEE_TABLE = process.env.EMPLOYEES_TABLE!;
const TASK_TABLE = "CRM_Tasks";
const MEETING_TABLE = "CRM_Meetings";
const FOLLOWUP_TABLE = "CRM_FollowUps";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    // Employee Details
    const employeeResult = await db.send(
      new GetCommand({
        TableName: EMPLOYEE_TABLE,
        Key: {
          employeeId,
        },
      })
    );

    const employee = employeeResult.Item;

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        {
          status: 404,
        }
      );
    }

    // Tasks
    const tasks = await db.send(
      new ScanCommand({
        TableName: TASK_TABLE,
        FilterExpression: "employeeId = :id",
        ExpressionAttributeValues: {
          ":id": employeeId,
        },
      })
    );

    // Meetings
    const meetings = await db.send(
      new ScanCommand({
        TableName: MEETING_TABLE,
        FilterExpression: "employeeId = :id",
        ExpressionAttributeValues: {
          ":id": employeeId,
        },
      })
    );

    // Follow-ups
    const followups = await db.send(
      new ScanCommand({
        TableName: FOLLOWUP_TABLE,
        FilterExpression: "employeeId = :id",
        ExpressionAttributeValues: {
          ":id": employeeId,
        },
      })
    );

    const taskItems = tasks.Items || [];
    const meetingItems = meetings.Items || [];
    const followupItems = followups.Items || [];

    const completedTasks = taskItems.filter(
      (task: any) => task.status === "Completed"
    ).length;

    const pendingTasks = taskItems.filter(
      (task: any) => task.status !== "Completed"
    ).length;

    return NextResponse.json({
      success: true,

      report: {
        employee,

        summary: {
          totalTasks: taskItems.length,
          completedTasks,
          pendingTasks,
          totalMeetings: meetingItems.length,
          totalFollowups: followupItems.length,
        },

        tasks: taskItems,
        meetings: meetingItems,
        followups: followupItems,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load employee report",
      },
      {
        status: 500,
      }
    );
  }
}