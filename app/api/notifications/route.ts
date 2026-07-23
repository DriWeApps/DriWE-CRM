import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  createNotification,
  getNotificationsByEmail,
} from "@/services/notification.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

/* ---------------------------------------
   GET
   Employee gets their own notifications
--------------------------------------- */

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

    const notifications = await getNotificationsByEmail(
      user.email
    );

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

/* ---------------------------------------
   POST
   Admin sends notification
--------------------------------------- */

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin can send notifications",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (
      !body.title ||
      !body.message ||
      !body.recipientEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, message and recipient email are required.",
        },
        { status: 400 }
      );
    }

    const notification = {
      notificationId: randomUUID(),

      title: body.title.trim(),
      message: body.message.trim(),

      sentBy: user.userId,
      sentByName: user.email ?? "Administrator",

      recipientEmail: body.recipientEmail
        .trim()
        .toLowerCase(),

      isRead: false,

      createdAt: new Date().toISOString(),
    };

    await createNotification(notification);

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send notification",
      },
      { status: 500 }
    );
  }
}