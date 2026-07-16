import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";
import { Employee } from "@/types/employee";

const TABLE = process.env.EMPLOYEES_TABLE!;

/**
 * Create Employee
 */
export async function createEmployee(employee: Employee) {
  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: employee,
    })
  );

  return employee;
}

/**
 * Get All Employees
 */
export async function getEmployees() {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    })
  );

  return result.Items ?? [];
}

/**
 * Get Employee By ID
 */
export async function getEmployeeById(employeeId: string) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        employeeId,
      },
    })
  );

  return result.Item;
}

/**
 * Update Employee
 */
export async function updateEmployee(
  employeeId: string,
  data: Partial<Employee>
) {
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: {
        employeeId,
      },
      UpdateExpression: `
        SET
          firstName = :firstName,
          lastName = :lastName,
          email = :email,
          mobile = :mobile,
          designation = :designation,
          department = :department,
          #role = :role,
          #status = :status,
          joiningDate = :joiningDate,
          address = :address,
          city = :city,
          #state = :state,
          pincode = :pincode,
          updatedAt = :updatedAt
      `,
      ExpressionAttributeNames: {
        "#role": "role",
        "#status": "status",
        "#state": "state",
      },
      ExpressionAttributeValues: {
        ":firstName": data.firstName,
        ":lastName": data.lastName,
        ":email": data.email,
        ":mobile": data.mobile,
        ":designation": data.designation,
        ":department": data.department,
        ":role": data.role,
        ":status": data.status,
        ":joiningDate": data.joiningDate,
        ":address": data.address,
        ":city": data.city,
        ":state": data.state,
        ":pincode": data.pincode,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  return true;
}

/**
 * Delete Employee
 */
export async function deleteEmployee(employeeId: string) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: {
        employeeId,
      },
    })
  );

  return true;
}