import { Company } from "@/types/company";
import { db } from "@/lib/dynamodb";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.COMPANY_TABLE_NAME || process.env.COMPANY_TABLE || "CRM_Companies";

export async function createCompany(company: Company) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const item = {
    id,
    companyId: id,
    ...company,
    phone: company.phone ?? company.mobile ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
}

export async function getCompanies() {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  return result.Items || [];
}

export async function getCompany(id: string) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        companyId: id,
      },
    })
  );

  return result.Item;
}

export async function updateCompany(id: string, data: Partial<Company>) {
  const updates = [
    { field: "companyName", value: data.companyName ?? "" },
    { field: "companyType", value: data.companyType ?? "" },
    { field: "contactPerson", value: data.contactPerson ?? "" },
    { field: "designation", value: data.designation ?? "" },
    { field: "mobile", value: data.mobile ?? "" },
    { field: "alternateMobile", value: data.alternateMobile ?? "" },
    { field: "email", value: data.email ?? "" },
    { field: "address", value: data.address ?? "" },
    { field: "city", value: data.city ?? "" },
    { field: "state", value: data.state ?? "" },
    { field: "pincode", value: data.pincode ?? "" },
    { field: "gstNumber", value: data.gstNumber ?? "" },
    { field: "panNumber", value: data.panNumber ?? "" },
    { field: "website", value: data.website ?? "" },
    { field: "assignedEmployeeId", value: data.assignedEmployeeId ?? "" },
    { field: "status", value: data.status ?? "Active" },
    { field: "notes", value: data.notes ?? "" },
    { field: "phone", value: data.phone ?? data.mobile ?? "" },
    { field: "updatedAt", value: new Date().toISOString() },
  ];

  const updateExpression = updates
    .map(({ field }) => `#${field} = :${field}`)
    .join(", ");

  const expressionAttributeNames = Object.fromEntries(
    updates.map(({ field }) => [`#${field}`, field])
  );

  const expressionAttributeValues = Object.fromEntries(
    updates.map(({ field, value }) => [`:${field}`, value])
  );

  await db.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        companyId: id,
      },
      UpdateExpression: `set ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );

  return true;
}

export async function deleteCompany(id: string) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        companyId: id,
      },
    })
  );

  return true;
}
