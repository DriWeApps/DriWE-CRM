import {
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const TABLE_NAME = process.env.NOTIFICATION_REPLIES_TABLE!;

/* --------------------------------------------------
   Reply Interface
--------------------------------------------------- */

export interface NotificationReply {
  replyId: string;
  notificationId: string;

  senderEmail: string;
  senderName: string;

  receiverEmail: string;

  message: string;

  createdAt: string;
}

/* --------------------------------------------------
   Create Reply
--------------------------------------------------- */

export async function createReply(
  reply: NotificationReply
) {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: reply,
    })
  );

  return reply;
}

/* --------------------------------------------------
   Get Replies By Notification
--------------------------------------------------- */

export async function getRepliesByNotificationId(
  notificationId: string
) {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "notificationId-index",
      KeyConditionExpression:
        "notificationId = :notificationId",

      ExpressionAttributeValues: {
        ":notificationId": notificationId,
      },
    })
  );

  return result.Items ?? [];
}