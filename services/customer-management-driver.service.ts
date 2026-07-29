import {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const TABLE_NAME =
  process.env.CUSTOMER_MANAGEMENT_DRIVER_TABLE ||
  "CRM_CustomerManagement_Driver";

/* =========================================================
   TYPES
========================================================= */

export type CustomerManagementDriverStatus =
  | "Accept"
  | "Reject"
  | "Hold";

export interface CustomerManagementDriver {
  customerId: string;

  srNo: number;


  name: string;
  email: string;
  contactNo: string;

  type: "Cab" | "Courier";

  status: CustomerManagementDriverStatus;
  reason: string;

  date: string;

  /* Who created this record */
  createdBy: string;
  createdByName: string;
  createdByEmail: string;

  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   GET ALL DRIVERS
========================================================= */

export async function getCustomerManagementDrivers() {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  return (result.Items ?? []) as CustomerManagementDriver[];
}

/* =========================================================
   GET DRIVERS CREATED BY A SPECIFIC USER
========================================================= */

export async function getCustomerManagementDriversByUser(
  userId: string,
  userEmail?: string
) {
  const drivers = await getCustomerManagementDrivers();

  return drivers.filter((driver) => {
    return (
      driver.createdBy === userId ||
      (!!userEmail && driver.createdByEmail === userEmail)
    );
  });
}

/* =========================================================
   GET DRIVER BY ID
========================================================= */

export async function getCustomerManagementDriverById(
  customerId: string
) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        customerId,
      },
    })
  );

  return result.Item as CustomerManagementDriver | undefined;
}

/* =========================================================
   CREATE DRIVER
========================================================= */

export async function createCustomerManagementDriver(
  driver: CustomerManagementDriver
) {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: driver,
    })
  );

  return driver;
}

/* =========================================================
   UPDATE DRIVER
========================================================= */

export async function updateCustomerManagementDriver(
  customerId: string,
  data: Partial<CustomerManagementDriver>
) {
  const existingDriver =
    await getCustomerManagementDriverById(customerId);

  if (!existingDriver) {
    throw new Error("Driver not found");
  }

  const updatedDriver: CustomerManagementDriver = {
    ...existingDriver,
    ...data,

    // Never allow customerId to be changed
    customerId,

    // Keep original creator information
    createdBy: existingDriver.createdBy,
    createdByName: existingDriver.createdByName,
    createdByEmail: existingDriver.createdByEmail,

    updatedAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedDriver,
    })
  );

  return updatedDriver;
}

/* =========================================================
   DELETE DRIVER
========================================================= */

export async function deleteCustomerManagementDriver(
  customerId: string
) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        customerId,
      },
    })
  );

  return true;
}