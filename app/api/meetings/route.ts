import { NextResponse } from "next/server";
import {
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";
import { getUserFromRequest } from "@/lib/auth";
import { createNotification } from "@/services/notification.service";

const TABLE_NAME = "CRM_Meetings";

/* ---------------- GET ALL MEETINGS ---------------- */

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    return NextResponse.json({
      success: true,
      meetings: result.Items || [],
    });
  } catch (error) {
    console.error("GET Meetings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch meetings",
      },
      { status: 500 }
    );
  }
}

/* ---------------- CREATE MEETING ---------------- */

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      companyId,
      companyName,
      participants,
      meetingLink,
      agenda,
      date,
      time,
      status,
      description,
    } = body;


    console.log("========== NEW MEETING ==========");
    console.log("User:", user);
    console.log("Participants:", JSON.stringify(participants, null, 2));

    if (
      !title ||
      !companyId ||
      !participants ||
      participants.length === 0 ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields missing",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const meeting = {
      meetingId: crypto.randomUUID(),

      title,

      companyId,
      companyName,

      participants,

      meetingLink: meetingLink || "",

      agenda: agenda || "",

      date,
      time,

      status: status || "Scheduled",

      description: description || "",

      decision: "",

      actionTaken: "",

      createdBy: user.userId,
      createdByEmail: user.email,

      createdAt: now,
      updatedAt: now,
    };

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: meeting,
      })
    );

    console.log("=================================");
    console.log("Meeting Saved Successfully");
    console.log("Participants Count:", participants.length);
    console.log("Participants:", participants);
    console.log("=================================");

    // ===============================
    // SEND NOTIFICATION TO PARTICIPANTS
    // ===============================

    for (const participant of participants) {

      console.log("Sending notification to:", participant.employeeEmail);

      if (!participant.employeeEmail) {
        console.log("Employee email missing.");
        continue;
      }

      await createNotification({
        notificationId: crypto.randomUUID(),

        title: "New Meeting Scheduled",

        message: `${user.email} scheduled "${title}" on ${date} at ${time}.`,

        sentBy: user.userId,
        sentByName: user.email,
        sentByEmail: user.email,

        recipientEmail: participant.employeeEmail,

        meetingId: meeting.meetingId,

        isRead: false,

        createdAt: new Date().toISOString(),
      });

      console.log("Notification Created Successfully");
    }
    return NextResponse.json({
      success: true,
      message: "Meeting created successfully",
      meeting,
    });
  } catch (error) {
    console.error("CREATE Meeting Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create meeting",
      },
      { status: 500 }
    );
  }
}