import {
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "crypto";

import type {
    ConstructionWorker,
    WorkerType,
} from "@/types/construction";

const client = new DynamoDBClient({
    region:
        process.env.AWS_REGION ||
        "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_WORKERS_TABLE ||
    "CRM_ConstructionWorkers";

/**
 * Get all workers for a company
 */
export async function getWorkers(
    companyId: string
): Promise<ConstructionWorker[]> {
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

    return (result.Items || []) as ConstructionWorker[];
}

/**
 * Get workers belonging to a project
 */
export async function getWorkersByProject(
    projectId: string,
    companyId: string
): Promise<ConstructionWorker[]> {
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

    return (result.Items || []) as ConstructionWorker[];
}

/**
 * Get workers belonging to a site
 */
export async function getWorkersBySite(
    siteId: string,
    companyId: string
): Promise<ConstructionWorker[]> {
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

    return (result.Items || []) as ConstructionWorker[];
}

/**
 * Get one worker
 */
export async function getWorkerById(
    workerId: string,
    companyId: string
): Promise<ConstructionWorker | null> {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,

            Key: {
                workerId,
            },
        })
    );

    const worker =
        result.Item as
            | ConstructionWorker
            | undefined;

    if (
        !worker ||
        worker.companyId !== companyId
    ) {
        return null;
    }

    return worker;
}

/**
 * Create worker
 *
 * Site is supplied by the backend based on
 * the site currently being processed.
 */
export async function createWorker(data: {
    companyId: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    name: string;
    phone: string;

    role?: string;

    workerType: WorkerType;

    salary: number;

    dailyWage?: number;

    active?: boolean;
}) {
    const now =
        new Date().toISOString();

    const salary =
        Number(data.salary) || 0;

    const worker: ConstructionWorker = {
        workerId: randomUUID(),

        companyId:
            data.companyId,

        projectId:
            data.projectId,

        projectName:
            data.projectName,

        siteId:
            data.siteId,

        siteName:
            data.siteName,

        name:
            data.name.trim(),

        phone:
            data.phone.trim(),

        role:
            data.role,

        workerType:
            data.workerType,

        salary,

        dailyWage:
            data.dailyWage !== undefined
                ? Number(data.dailyWage) || 0
                : data.workerType === "Daily Wage"
                    ? salary
                    : 0,

        active:
            data.active !== undefined
                ? data.active
                : true,

        createdAt:
            now,

        updatedAt:
            now,
    };

    await client.send(
        new PutCommand({
            TableName: TABLE,
            Item: worker,
        })
    );

    return worker;
}

/**
 * Update worker
 */
export async function updateWorker(
    workerId: string,
    companyId: string,
    data: Partial<ConstructionWorker>
) {
    const existing =
        await getWorkerById(
            workerId,
            companyId
        );

    if (!existing) {
        return null;
    }

    const updated: ConstructionWorker = {
        ...existing,

        ...data,

        workerId,

        companyId,

        updatedAt:
            new Date().toISOString(),
    };

    await client.send(
        new PutCommand({
            TableName: TABLE,
            Item: updated,
        })
    );

    return updated;
}

/**
 * Delete worker
 */
export async function deleteWorker(
    workerId: string,
    companyId: string
) {
    const existing =
        await getWorkerById(
            workerId,
            companyId
        );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,

            Key: {
                workerId,
            },
        })
    );

    return true;
}