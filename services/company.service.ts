import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";
import { Company } from "@/types/company";
import {
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.COMPANIES_TABLE!;

export async function createCompany(company: Company) {
  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: company,
    })
  );

  return company;
}

import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function getCompanies() {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    })
  );

  return result.Items ?? [];
}

export async function getCompanyById(companyId: string) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        companyId,
      },
    })
  );

  return result.Item;
}

export async function deleteCompany(companyId: string) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: {
        companyId,
      },
    })
  );
}

export async function updateCompany(
  companyId: string,
  data: Record<string, unknown>
) {
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: {
        companyId,
      },
      UpdateExpression:
        "SET companyName=:companyName, companyType=:companyType, contactPerson=:contactPerson, designation=:designation, mobile=:mobile, email=:email, address=:address, city=:city, #state=:state, pincode=:pincode, status=:status, notes=:notes, updatedAt=:updatedAt",
      ExpressionAttributeNames: {
        "#state": "state",
      },
      ExpressionAttributeValues: {
        ":companyName": data.companyName,
        ":companyType": data.companyType,
        ":contactPerson": data.contactPerson,
        ":designation": data.designation,
        ":mobile": data.mobile,
        ":email": data.email,
        ":address": data.address,
        ":city": data.city,
        ":state": data.state,
        ":pincode": data.pincode,
        ":status": data.status,
        ":notes": data.notes,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );
}