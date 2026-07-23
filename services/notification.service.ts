import {
  PutCommand,
  ScanCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const TABLE = process.env.NOTIFICATIONS_TABLE!;

export interface Notification {
  notificationId: string;
  title: string;
  message: string;

  sentBy: string;
  sentByName: string;
  sentByEmail: string;

  recipientEmail: string;

  isRead: boolean;

  createdAt: string;
}

/**
 * Create Notification
 */
export async function createNotification(
  notification: Notification
) {
  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: notification,
    })
  );

  return notification;
}

/**
 * Get All Notifications
 */
export async function getNotifications() {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    })
  );

  return result.Items ?? [];
}

/**
 * Get Notifications By Employee Email
 */
export async function getNotificationsByEmail(
  email: string
) {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    })
  );

  return (result.Items ?? [])
    .filter(
      (item: any) =>
        item.recipientEmail?.toLowerCase() ===
        email.toLowerCase()
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

/**
 * Get Notifications Sent By Admin
 */
export async function getNotificationsSentByAdmin(
  adminId: string
) {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    })
  );

  return (result.Items ?? [])
    .filter(
      (item: any) => item.sentBy === adminId
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

/**
 * Get Notification By ID
 */
export async function getNotificationById(
  notificationId: string
) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        notificationId,
      },
    })
  );

  return result.Item;
}

/**
 * Mark Notification as Read
 */
export async function markNotificationAsRead(
  notificationId: string
) {
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: {
        notificationId,
      },
      UpdateExpression:
        "SET isRead = :read",
      ExpressionAttributeValues: {
        ":read": true,
      },
    })
  );

  return true;
}

/**
 * Delete Notification
 */
export async function deleteNotification(
  notificationId: string
) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: {
        notificationId,
      },
    })
  );

  return true;
}