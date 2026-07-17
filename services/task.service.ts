import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";
import { Task } from "@/types/task";

const TABLE = process.env.TASKS_TABLE!;

/**
 * Create Task
 */
export async function createTask(task: Task) {
  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: task,
    })
  );

  return task;
}

/**
 * Get All Tasks
 */
export async function getTasks(): Promise<Task[]> {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    })
  );

  return (result.Items as Task[] | undefined) ?? [];
}

/**
 * Get Task By ID
 */
export async function getTaskById(taskId: string) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        taskId,
      },
    })
  );

  return result.Item;
}

/**
 * Update Task
 */
// console.log("Update data:", data);
export async function updateTask(
  taskId: string,
  data: Partial<Task>
) {
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: {
        taskId,
      },
      UpdateExpression: `
        SET
          title = :title,
          description = :description,
          companyId = :companyId,
          companyName = :companyName,
          assignedTo = :assignedTo,
          assignedToName = :assignedToName,
          assignedToEmail = :assignedToEmail,
          assignedBy = :assignedBy,
          assignedByName = :assignedByName,
          priority = :priority,
          #status = :status,
          dueDate = :dueDate,
          remarks = :remarks,
          updatedAt = :updatedAt
      `,
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":description": data.description,
        // ":companyId": data.companyId,
        // ":companyName": data.companyName,
        ":companyId": data.companyId ?? "",
":companyName": data.companyName ?? "",
        // ":assignedTo": data.assignedTo,
        // ":assignedToName": data.assignedToName,
        // ":assignedToEmail": data.assignedToEmail,
        // ":assignedBy": data.assignedBy,
        // ":assignedByName": data.assignedByName,

        ":assignedBy": data.assignedBy ?? "",
":assignedByName": data.assignedByName ?? "",
":assignedTo": data.assignedTo ?? "",
":assignedToName": data.assignedToName ?? "",
":assignedToEmail": data.assignedToEmail ?? "",
":remarks": data.remarks ?? "",
        ":priority": data.priority,
        ":status": data.status,
        ":dueDate": data.dueDate,
        // ":remarks": data.remarks ?? "",
        ":updatedAt": new Date().toISOString(),
      },
    })
  );

  return true;
}
/**
 * Delete Task
 */
export async function deleteTask(taskId: string) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: {
        taskId,
      },
    })
  );

  return true;
}