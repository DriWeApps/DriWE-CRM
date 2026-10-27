
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import type { ConstructionTaskStatus } from "@/types/construction";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-north-1",
});

const TABLE =
  process.env.CONSTRUCTION_TASKS_TABLE || "CRM_ConstructionTasks";

export interface ConstructionTask {
  taskId: string;
  companyId: string;
  companyName?: string;
  projectId: string;
  projectName?: string;
  siteId?: string;
  siteName?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedBy?: string;
  assignedByName?: string;
  priority?: "Low" | "Medium" | "High";
  status: ConstructionTaskStatus;
  startDate?: string;
  dueDate?: string;
  remarks?: string;
  completionDescription?: string;
  completionLink?: string;
  completedAt?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

/* Get tasks for one company */
export async function getTasks(
  companyId: string
): Promise<ConstructionTask[]> {
  const result = await client.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: "companyId = :companyId",
      ExpressionAttributeValues: {
        ":companyId": companyId,
      },
    })
  );

  return (result.Items || []) as ConstructionTask[];
}

/* Get tasks for one project within one company */
export async function getTasksByProject(
  projectId: string,
  companyId: string
): Promise<ConstructionTask[]> {
  const result = await client.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression:
        "companyId = :companyId AND projectId = :projectId",
      ExpressionAttributeValues: {
        ":companyId": companyId,
        ":projectId": projectId,
      },
    })
  );

  return (result.Items || []) as ConstructionTask[];
}

/* Existing company-scoped assignee lookup */
export async function getTasksByAssignee(
  assignedTo: string,
  companyId: string
): Promise<ConstructionTask[]> {
  const result = await client.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression:
        "companyId = :companyId AND assignedTo = :assignedTo",
      ExpressionAttributeValues: {
        ":companyId": companyId,
        ":assignedTo": assignedTo,
      },
    })
  );

  return (result.Items || []) as ConstructionTask[];
}

/*
 * Worker-specific lookup.
 * The API must still verify that each returned task is assigned
 * to the authenticated worker before returning it.
 */
export async function getTasksForAssigneeAcrossCompanies(
  identifiers: string[]
): Promise<ConstructionTask[]> {
  const values = [...new Set(
    identifiers
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
  )];

  if (values.length === 0) {
    return [];
  }

  const result = await client.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: values
        .map(
          (_, index) =>
            `(assignedTo = :assignee${index} OR assignedToEmail = :assignee${index})`
        )
        .join(" OR "),
      ExpressionAttributeValues: Object.fromEntries(
        values.map((value, index) => [`:assignee${index}`, value])
      ),
    })
  );

  return (result.Items || []) as ConstructionTask[];
}

/* Existing company-scoped task lookup */
export async function getTaskById(
  taskId: string,
  companyId: string
): Promise<ConstructionTask | null> {
  const result = await client.send(
    new GetCommand({
      TableName: TABLE,
      Key: { taskId },
    })
  );

  const task = result.Item as ConstructionTask | undefined;

  if (!task || task.companyId !== companyId) {
    return null;
  }

  return task;
}

/*
 * Retrieve by ID for an API route that will immediately verify
 * the authenticated user's assignment and role.
 * Do not expose this directly to an unauthenticated endpoint.
 */
export async function getTaskByIdForAuthorization(
  taskId: string
): Promise<ConstructionTask | null> {
  const result = await client.send(
    new GetCommand({
      TableName: TABLE,
      Key: { taskId },
    })
  );

  return (result.Item as ConstructionTask | undefined) || null;
}

/* Create a task */
export async function createTask(data: {
  companyId: string;
  companyName?: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedBy?: string;
  assignedByName?: string;
  priority?: "Low" | "Medium" | "High";
  status?: ConstructionTaskStatus;
  startDate?: string;
  dueDate?: string;
  remarks?: string;
  completionDescription?: string;
  completionLink?: string;
  createdBy?: string;
  createdByName?: string;
}): Promise<ConstructionTask> {
  const now = new Date().toISOString();

  if (!data.companyId || !data.projectId) {
    throw new Error("Company ID and project ID are required.");
  }

  if (!data.title.trim()) {
    throw new Error("Task title is required.");
  }

  const task: ConstructionTask = {
    taskId: randomUUID(),
    companyId: data.companyId,
    companyName: data.companyName,
    projectId: data.projectId,
    projectName: data.projectName,
    title: data.title.trim(),
    description: data.description,
    assignedTo: data.assignedTo,
    assignedToName: data.assignedToName,
    assignedToEmail: data.assignedToEmail,
    assignedBy: data.assignedBy,
    assignedByName: data.assignedByName,
    priority: data.priority || "Medium",
    status: data.status || "Pending",
    startDate: data.startDate,
    dueDate: data.dueDate,
    remarks: data.remarks,
    completionDescription: data.completionDescription,
    completionLink: data.completionLink,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    createdAt: now,
    updatedAt: now,
  };

  await client.send(
    new PutCommand({
      TableName: TABLE,
      Item: task,
      ConditionExpression: "attribute_not_exists(taskId)",
    })
  );

  return task;
}

/* Update a task, scoped to its actual company */
export async function updateTask(
  taskId: string,
  companyId: string,
  data: Partial<
    Omit<ConstructionTask, "taskId" | "companyId" | "createdAt">
  >
): Promise<ConstructionTask | null> {
  const existing = await getTaskById(taskId, companyId);

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  const updated: ConstructionTask = {
    ...existing,
    ...data,
    taskId,
    companyId,
    updatedAt: now,
  };

  if (data.status === "Completed") {
    if (!existing.completedAt) {
      updated.completedAt = now;
    }
  } else if (data.status) {
    updated.completedAt = undefined;
  }

  await client.send(
    new PutCommand({
      TableName: TABLE,
      Item: updated,
    })
  );

  return updated;
}

/* Delete a task, scoped to its company */
export async function deleteTask(
  taskId: string,
  companyId: string
): Promise<boolean> {
  const existing = await getTaskById(taskId, companyId);

  if (!existing) {
    return false;
  }

  await client.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { taskId },
    })
  );

  return true;
}
