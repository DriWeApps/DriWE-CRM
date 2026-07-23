import { NextResponse } from "next/server";

import {
  getNotificationById,
  markNotificationAsRead,
  deleteNotification,
} from "@/services/notification.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

interface Params {
  params: Promise<{
    notificationId: string;
  }>;
}

/* ---------------------------------------
   PUT
   Mark notification as read
--------------------------------------- */

export async function PUT(
  req: Request,
  { params }: Params
) {
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

    const { notificationId } = await params;

    const notification = await getNotificationById(
      notificationId
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
        },
        { status: 404 }
      );
    }

    // Employee can only mark their own notification
    if (
      notification.recipientEmail.toLowerCase() !==
      user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        { status: 403 }
      );
    }

    await markNotificationAsRead(notificationId);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update notification.",
      },
      { status: 500 }
    );
  }
}

/* ---------------------------------------
   DELETE
   Admin only
--------------------------------------- */

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin can delete notifications.",
        },
        { status: 403 }
      );
    }

    const { notificationId } = await params;

    const notification = await getNotificationById(
      notificationId
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    await deleteNotification(notificationId);

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete notification.",
      },
      { status: 500 }
    );
  }
}