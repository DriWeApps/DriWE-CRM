import { NextResponse } from "next/server";

import { getRepliesByNotificationId } from "@/services/notification-reply.service";
import { getUserFromRequest } from "@/lib/auth";

interface Params {
  params: Promise<{
    notificationId: string;
  }>;
}

export async function GET(
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

    const replies = await getRepliesByNotificationId(
      notificationId
    );

    return NextResponse.json({
      success: true,
      replies,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch replies",
      },
      { status: 500 }
    );
  }
}