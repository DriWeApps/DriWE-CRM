import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { createReply } from "@/services/notification-reply.service";
import { getUserFromRequest } from "@/lib/auth";

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

    if (!body.notificationId || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID and message are required.",
        },
        { status: 400 }
      );
    }

  const reply = {
  replyId: randomUUID(),

  notificationId: body.notificationId,

  senderEmail: user.email,
  senderName: user.email,

  receiverEmail: body.receiverEmail ?? "",

  message: body.message.trim(),

  createdAt: new Date().toISOString(),
};

    await createReply(reply);

    return NextResponse.json({
      success: true,
      reply,
      message: "Reply sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send reply.",
      },
      { status: 500 }
    );
  }
}