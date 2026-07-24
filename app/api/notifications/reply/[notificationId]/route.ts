// import { NextResponse } from "next/server";

// import { getRepliesByNotificationId } from "@/services/notification-reply.service";
// import { getUserFromRequest } from "@/lib/auth";

// interface Params {
//   params: Promise<{
//     notificationId: string;
//   }>;
// }

// export async function GET(
//   req: Request,
//   { params }: Params
// ) {
//   try {
//     const user = await getUserFromRequest(req);

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     const { notificationId } = await params;

//     const replies = await getRepliesByNotificationId(
//       notificationId
//     );

//     return NextResponse.json({
//       success: true,
//       replies,
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unable to fetch replies",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  createReply,
  getRepliesByNotificationId,
} from "@/services/notification-reply.service";

import { getUserFromRequest } from "@/lib/auth";

interface Params {
  params: Promise<{
    notificationId: string;
  }>;
}

/* ---------------- GET ---------------- */

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

    const replies =
      await getRepliesByNotificationId(notificationId);

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

/* ---------------- POST ---------------- */

export async function POST(
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

    const body = await req.json();

    const reply = await createReply({
      replyId: crypto.randomUUID(),
      notificationId,

      senderEmail: user.email,
      senderName: body.senderName ?? user.email,

      receiverEmail: body.receiverEmail,

      message: body.message,

      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send reply",
      },
      { status: 500 }
    );
  }
}