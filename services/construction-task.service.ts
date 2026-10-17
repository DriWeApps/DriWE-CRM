
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "crypto";

import type {
    ConstructionTaskStatus,
} from "@/types/construction";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_TASKS_TABLE ||
    "CRM_ConstructionTasks";

/* ============================================================
   TYPES
============================================================ */

export interface ConstructionTask {
    taskId: string;

    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    // Optional legacy fields. New tasks do not require these.
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

/* ============================================================
   GET ALL TASKS FOR A COMPANY
============================================================ */

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

/* ============================================================
   GET TASKS BY PROJECT
============================================================ */

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

/* ============================================================
   GET TASKS BY ASSIGNEE
============================================================ */

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

/* ============================================================
   GET TASK BY ID
============================================================ */

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

    const task = result.Item as
        | ConstructionTask
        | undefined;

    if (!task || task.companyId !== companyId) {
        return null;
    }

    return task;
}

/* ============================================================
   CREATE TASK
============================================================ */

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
        })
    );

    return task;
}

/* ============================================================
   UPDATE TASK
============================================================ */

export async function updateTask(
    taskId: string,
    companyId: string,
    data: Partial<
        Omit<
            ConstructionTask,
            "taskId" | "companyId" | "createdAt"
        >
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

        // Prevent the update payload from changing these identifiers.
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

/* ============================================================
   DELETE TASK
============================================================ */

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
