// services/auth.service.ts
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";

const USERS_TABLE = process.env.USERS_TABLE!;

export interface User {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUserByEmail(email: string) {
    
  const result = await db.send(
    new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email.toLowerCase(),
      },
      Limit: 1,
    })
  );


  const user = result.Items?.[0] ?? null;

console.log("User from DB:", user);

return user;

  return result.Items?.[0] ?? null;
}

export async function createUser(userData: {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const now = new Date().toISOString();

  const user = {
  userId: userData.userId,
  employeeId: userData.employeeId,   // <-- ADD THIS
  name: userData.name,
  email: userData.email.toLowerCase(),
  password: userData.password,
  role: userData.role,
  createdAt: now,
  updatedAt: now,
};

  await db.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: "attribute_not_exists(#email)",
      ExpressionAttributeNames: {
        "#email": "email"
      }
    })
  );

  return user;
}