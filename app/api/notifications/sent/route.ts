import { NextResponse } from "next/server";

import {
  getNotificationsSentByAdmin,
} from "@/services/notification.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const notifications =
      await getNotificationsSentByAdmin(
        user.userId
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
        message:
          "Failed to fetch sent notifications",
      },
      { status: 500 }
    );
  }
}