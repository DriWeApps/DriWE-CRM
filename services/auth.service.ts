// services/auth.service.ts
import { PutCommand, QueryCommand, GetCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";


const USERS_TABLE = process.env.USERS_TABLE!;

export interface User {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: string;

  pageAccess: string[];

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
}

export async function getUserById(userId: string) {
  const result = await db.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
    })
  );

  return result.Item ?? null;
}

export async function getUserByEmployeeId(employeeId: string) {
  const result = await db.send(
    new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: "employeeId = :employeeId",
      ExpressionAttributeValues: {
        ":employeeId": employeeId,
      },
      Limit: 1,
    })
  );

  return result.Items?.[0] ?? null;
}

export async function updateUserPageAccess(
  userId: string,
  pageAccess: string[]
) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
      UpdateExpression: `SET pageAccess = :pageAccess, updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ":pageAccess": pageAccess,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  return true;
}

export async function updateUserEmail(userId: string, email: string) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
      UpdateExpression: `SET email = :email, updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ":email": email.toLowerCase(),
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  return true;
}

export async function updateUserName(userId: string, name: string) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
      UpdateExpression: `SET #name = :name, updatedAt = :updatedAt`,
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  return true;
}

export async function updateUserRole(userId: string, role: string) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
      UpdateExpression: `SET #role = :role, updatedAt = :updatedAt`,
      ExpressionAttributeNames: {
        "#role": "role",
      },
      ExpressionAttributeValues: {
        ":role": role,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  return true;
}

export async function createUser(userData: {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: string;

  pageAccess: string[];
}) {
  const now = new Date().toISOString();

  const user = {
  userId: userData.userId,
  employeeId: userData.employeeId,
  name: userData.name,
  email: userData.email.toLowerCase(),
  password: userData.password,
  role: userData.role,

  pageAccess: userData.pageAccess,

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

export async function updateUserPassword(
  userId: string,
  hashedPassword: string
) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
      UpdateExpression: `
        SET password = :password,
            updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ":password": hashedPassword,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  return true;
}