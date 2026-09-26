import {
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import {
    randomUUID,
} from "crypto";

import type {
    ConstructionTaskStatus,
} from "@/types/construction";

const client = new DynamoDBClient({
    region:
        process.env.AWS_REGION ||
        "eu-north-1",
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

    siteId: string;
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
   GET ALL TASKS
============================================================ */

export async function getTasks(
    companyId: string
): Promise<ConstructionTask[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TABLE,

            FilterExpression:
                "companyId = :companyId",

            ExpressionAttributeValues: {
                ":companyId": companyId,
            },
        })
    );

    return (
        (result.Items || []) as ConstructionTask[]
    );
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

    return (
        (result.Items || []) as ConstructionTask[]
    );
}

/* ============================================================
   GET TASKS BY SITE
============================================================ */

export async function getTasksBySite(
    siteId: string,
    companyId: string
): Promise<ConstructionTask[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TABLE,

            FilterExpression:
                "companyId = :companyId AND siteId = :siteId",

            ExpressionAttributeValues: {
                ":companyId": companyId,
                ":siteId": siteId,
            },
        })
    );

    return (
        (result.Items || []) as ConstructionTask[]
    );
}

/* ============================================================
   GET TASKS BY WORKER / ASSIGNEE
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

    return (
        (result.Items || []) as ConstructionTask[]
    );
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

            Key: {
                taskId,
            },
        })
    );

    const task =
        result.Item as
            | ConstructionTask
            | undefined;

    if (
        !task ||
        task.companyId !== companyId
    ) {
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

    siteId: string;
    siteName?: string;

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
    const now =
        new Date().toISOString();

    const task: ConstructionTask = {
        taskId: randomUUID(),

        companyId:
            data.companyId,

        companyName:
            data.companyName,

        projectId:
            data.projectId,

        projectName:
            data.projectName,

        siteId:
            data.siteId,

        siteName:
            data.siteName,

        title:
            data.title,

        description:
            data.description,

        assignedTo:
            data.assignedTo,

        assignedToName:
            data.assignedToName,

        assignedToEmail:
            data.assignedToEmail,

        assignedBy:
            data.assignedBy,

        assignedByName:
            data.assignedByName,

        priority:
            data.priority ||
            "Medium",

        status:
            data.status ||
            "Pending",

        startDate:
            data.startDate,

        dueDate:
            data.dueDate,

        remarks:
            data.remarks,

        completionDescription:
            data.completionDescription,

        completionLink:
            data.completionLink,

        createdBy:
            data.createdBy,

        createdByName:
            data.createdByName,

        createdAt:
            now,

        updatedAt:
            now,
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
            | "taskId"
            | "companyId"
            | "createdAt"
        >
    >
): Promise<ConstructionTask | null> {
    const existing =
        await getTaskById(
            taskId,
            companyId
        );

    if (!existing) {
        return null;
    }

    const now =
        new Date().toISOString();

    const updated: ConstructionTask = {
        ...existing,
        ...data,

        taskId,

        companyId,

        updatedAt:
            now,
    };

    /*
     * Automatically set completedAt when
     * task status becomes Completed.
     */

    if (
        data.status ===
        "Completed"
    ) {
        if (!existing.completedAt) {
            updated.completedAt =
                now;
        }
    }

    /*
     * If task is changed away from Completed,
     * remove completedAt.
     */

    if (
        data.status &&
        data.status !==
            "Completed"
    ) {
        updated.completedAt =
            undefined;
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
    const existing =
        await getTaskById(
            taskId,
            companyId
        );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,

            Key: {
                taskId,
            },
        })
    );

    return true;
}