import {
  PutCommand,
  QueryCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

/* =========================================================
   USERS TABLE
========================================================= */

const USERS_TABLE =
  process.env.USERS_TABLE ||
  "CRM_Users";

/* =========================================================
   PORTAL TYPE
========================================================= */

export type Portal =
  | "crm"
  | "construction"
  | "both";

/* =========================================================
   USER INTERFACE
========================================================= */

export interface User {
  userId: string;

  employeeId: string;

  companyId?: string;

  name: string;

  email: string;

  /*
   * Password is stored as a bcrypt hash.
   */
  password: string;

  role: string;

  pageAccess: string[];

  portal?: Portal;

  createdAt: string;

  updatedAt: string;
}

/* =========================================================
   GET USER BY EMAIL
========================================================= */

export async function getUserByEmail(
  email: string
): Promise<User | null> {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const result = await db.send(
    new QueryCommand({
      TableName: USERS_TABLE,

      IndexName: "email-index",

      KeyConditionExpression:
        "email = :email",

      ExpressionAttributeValues: {
        ":email": normalizedEmail,
      },

      Limit: 1,
    })
  );

  const user =
    result.Items?.[0];

  if (!user) {
    return null;
  }

  return user as User;
}

/* =========================================================
   GET USER BY ID
========================================================= */

export async function getUserById(
  userId: string
): Promise<User | null> {
  const result = await db.send(
    new GetCommand({
      TableName: USERS_TABLE,

      Key: {
        userId,
      },
    })
  );

  return (
    (result.Item as User | undefined) ??
    null
  );
}

/* =========================================================
   GET USER BY EMPLOYEE ID
========================================================= */

export async function getUserByEmployeeId(
  employeeId: string
): Promise<User | null> {
  const result = await db.send(
    new ScanCommand({
      TableName: USERS_TABLE,

      FilterExpression:
        "employeeId = :employeeId",

      ExpressionAttributeValues: {
        ":employeeId":
          employeeId,
      },

      Limit: 1,
    })
  );

  return (
    (result.Items?.[0] as User | undefined) ??
    null
  );
}

/* =========================================================
   UPDATE PAGE ACCESS
========================================================= */

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

      UpdateExpression:
        "SET pageAccess = :pageAccess, updatedAt = :updatedAt",

      ExpressionAttributeValues: {
        ":pageAccess":
          pageAccess,

        ":updatedAt":
          new Date().toISOString(),
      },
    })
  );

  return true;
}

/* =========================================================
   UPDATE PORTAL
========================================================= */

export async function updateUserPortal(
  userId: string,
  portal: Portal
) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,

      Key: {
        userId,
      },

      UpdateExpression:
        "SET portal = :portal, updatedAt = :updatedAt",

      ExpressionAttributeValues: {
        ":portal":
          portal,

        ":updatedAt":
          new Date().toISOString(),
      },
    })
  );

  return true;
}

/* =========================================================
   UPDATE EMAIL
========================================================= */

export async function updateUserEmail(
  userId: string,
  email: string
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,

      Key: {
        userId,
      },

      UpdateExpression:
        "SET email = :email, updatedAt = :updatedAt",

      ExpressionAttributeValues: {
        ":email":
          normalizedEmail,

        ":updatedAt":
          new Date().toISOString(),
      },
    })
  );

  return true;
}

/* =========================================================
   UPDATE NAME
========================================================= */

export async function updateUserName(
  userId: string,
  name: string
) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,

      Key: {
        userId,
      },

      UpdateExpression:
        "SET #name = :name, updatedAt = :updatedAt",

      ExpressionAttributeNames: {
        "#name": "name",
      },

      ExpressionAttributeValues: {
        ":name":
          name.trim(),

        ":updatedAt":
          new Date().toISOString(),
      },
    })
  );

  return true;
}

/* =========================================================
   UPDATE ROLE
========================================================= */

export async function updateUserRole(
  userId: string,
  role: string
) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,

      Key: {
        userId,
      },

      UpdateExpression:
        "SET #role = :role, updatedAt = :updatedAt",

      ExpressionAttributeNames: {
        "#role": "role",
      },

      ExpressionAttributeValues: {
        ":role":
          role.trim(),

        ":updatedAt":
          new Date().toISOString(),
      },
    })
  );

  return true;
}

/* =========================================================
   UPDATE COMPANY
========================================================= */

export async function updateUserCompany(
  userId: string,
  companyId: string
) {
  await db.send(
    new UpdateCommand({
      TableName: USERS_TABLE,

      Key: {
        userId,
      },

      UpdateExpression:
        "SET companyId = :companyId, updatedAt = :updatedAt",

      ExpressionAttributeValues: {
        ":companyId":
          companyId,

        ":updatedAt":
          new Date().toISOString(),
      },
    })
  );

  return true;
}

/* =========================================================
   CREATE USER
========================================================= */

export async function createUser(
  userData: {
    userId: string;

    employeeId: string;

    companyId?: string;

    name: string;

    email: string;

    /*
     * IMPORTANT:
     *
     * Password must already be hashed.
     */
    password: string;

    role: string;

    pageAccess: string[];

    portal?: Portal;
  }
): Promise<User> {
  const now =
    new Date().toISOString();

  const normalizedEmail =
    userData.email
      .trim()
      .toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  if (!userData.password) {
    throw new Error(
      "Password is required."
    );
  }

  const portal: Portal =
    userData.portal ??
    "crm";

  const user: User = {
    userId:
      userData.userId,

    employeeId:
      userData.employeeId,

    ...(userData.companyId
      ? {
          companyId:
            userData.companyId,
        }
      : {}),

    name:
      userData.name.trim(),

    email:
      normalizedEmail,

    password:
      userData.password,

    role:
      userData.role.trim(),

    pageAccess:
      userData.pageAccess ??
      [],

    portal,

    createdAt:
      now,

    updatedAt:
      now,
  };

  await db.send(
    new PutCommand({
      TableName:
        USERS_TABLE,

      Item:
        user,

      ConditionExpression:
        "attribute_not_exists(userId)",
    })
  );

  return user;
}

/* =========================================================
   UPDATE PASSWORD
========================================================= */

export async function updateUserPassword(
  userId: string,
  hashedPassword: string
): Promise<boolean> {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  if (!hashedPassword) {
    throw new Error(
      "Hashed password is required."
    );
  }

  console.log(
    "========== UPDATE PASSWORD DEBUG =========="
  );

  console.log(
    "Updating user ID:",
    userId
  );

  console.log(
    "Hash exists:",
    !!hashedPassword
  );

  console.log(
    "Hash prefix:",
    hashedPassword.substring(0, 20)
  );

  const result = await db.send(
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
        ":password":
          hashedPassword,

        ":updatedAt":
          new Date().toISOString(),
      },

      ReturnValues: "ALL_NEW",
    })
  );

  console.log(
    "Password update successful:",
    !!result.Attributes
  );

  if (result.Attributes) {
    console.log(
      "Updated user ID:",
      result.Attributes.userId
    );

    console.log(
      "Updated email:",
      result.Attributes.email
    );

    console.log(
      "Updated password prefix:",
      result.Attributes.password
        ? String(
              result.Attributes.password
          ).substring(0, 20)
        : "NO PASSWORD"
    );
  }

  console.log(
    "=========================================="
  );

  return true;
}