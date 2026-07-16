import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";

const USERS_TABLE = process.env.USERS_TABLE!;

export async function getUserByEmail(email: string) {
  const result = await db.send(
    new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    })
  );

  return result.Items?.[0] ?? null;
}