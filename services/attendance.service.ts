import { randomUUID } from "crypto";
import {
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const ATTENDANCE_TABLE =
  process.env.ATTENDANCE_TABLE || "CRM_Attendance";

export interface Attendance {
  sessionId: string;
  employeeId: string;
  userId: string;
  email: string;

  loginAt: string;
  logoutAt?: string;

  loginDate: string;

  status: "Logged In" | "Logged Out";
}

/**
 * =====================================================
 * CREATE A NEW LOGIN SESSION
 * =====================================================
 */
export async function createAttendanceSession(data: {
  employeeId: string;
  userId: string;
  email: string;
}) {
  const now = new Date();

  const session: Attendance = {
    sessionId: randomUUID(),

    employeeId: data.employeeId,
    userId: data.userId,
    email: data.email,

    loginAt: now.toISOString(),

    loginDate: now.toISOString().split("T")[0],

    status: "Logged In",
  };

  await db.send(
    new PutCommand({
      TableName: ATTENDANCE_TABLE,
      Item: session,
    })
  );

  return session;
}

/**
 * =====================================================
 * LOGOUT EMPLOYEE'S CURRENTLY OPEN SESSION
 * =====================================================
 */
export async function logoutAttendanceSession(
  userId: string
) {
  const result = await db.send(
    new ScanCommand({
      TableName: ATTENDANCE_TABLE,

      FilterExpression:
        "userId = :userId AND #status = :status",

      ExpressionAttributeNames: {
        "#status": "status",
      },

      ExpressionAttributeValues: {
        ":userId": userId,
        ":status": "Logged In",
      },
    })
  );

  const sessions =
    (result.Items || []) as Attendance[];

  if (sessions.length === 0) {
    return null;
  }

  /**
   * If multiple open sessions somehow exist,
   * use the latest one.
   */
  const latestSession = sessions.sort(
    (a, b) =>
      new Date(b.loginAt).getTime() -
      new Date(a.loginAt).getTime()
  )[0];

  const logoutAt = new Date().toISOString();

  await db.send(
    new UpdateCommand({
      TableName: ATTENDANCE_TABLE,

      Key: {
        sessionId: latestSession.sessionId,
      },

      UpdateExpression:
        "SET logoutAt = :logoutAt, #status = :status",

      ExpressionAttributeNames: {
        "#status": "status",
      },

      ExpressionAttributeValues: {
        ":logoutAt": logoutAt,
        ":status": "Logged Out",
      },
    })
  );

  return {
    ...latestSession,
    logoutAt,
    status: "Logged Out" as const,
  };
}

/**
 * =====================================================
 * GET ALL ATTENDANCE RECORDS FOR AN EMPLOYEE
 * =====================================================
 */
export async function getAttendanceByEmployeeId(
  employeeId: string
) {
  const result = await db.send(
    new ScanCommand({
      TableName: ATTENDANCE_TABLE,

      FilterExpression:
        "employeeId = :employeeId",

      ExpressionAttributeValues: {
        ":employeeId": employeeId,
      },
    })
  );

  const sessions =
    (result.Items || []) as Attendance[];

  /**
   * Latest login first
   */
  sessions.sort(
    (a, b) =>
      new Date(b.loginAt).getTime() -
      new Date(a.loginAt).getTime()
  );

  return sessions;
}