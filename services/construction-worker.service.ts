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

import {
    createUser,
    getUserByEmail,
} from "@/services/auth.service";

import {
    hashPassword,
} from "@/lib/password";

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
 * Create construction worker
 *
 * This creates:
 *
 * 1. Construction worker record
 * 2. Login account in CRM_Users
 *
 * Worker login:
 * - Role: ConstructionEmployee
 * - Portal: construction
 *
 * Password is always hashed before
 * being stored in CRM_Users.
 */
export async function createWorker(data: {
    companyId: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    name: string;
    phone: string;

    email: string;
    password: string;

    role?: string;

    workerType: WorkerType;

    salary: number;

    dailyWage?: number;

    active?: boolean;
}) {
    const now =
        new Date().toISOString();

    const email =
        data.email
            .trim()
            .toLowerCase();

    const name =
        data.name.trim();

    const phone =
        data.phone.trim();

    /**
     * Check if email already exists.
     */
    const existingUser =
        await getUserByEmail(email);

    if (existingUser) {
        throw new Error(
            "A user with this email already exists."
        );
    }

    /**
     * Generate IDs.
     */
    const workerId =
        randomUUID();

    const userId =
        randomUUID();

    const employeeId =
        randomUUID();

    /**
     * Hash password.
     *
     * Never store plain-text passwords.
     */
    const hashedPassword =
        await hashPassword(
            data.password
        );

    /**
     * Calculate salary.
     */
    const salary =
        Number(data.salary) || 0;

    /**
     * Use the same role everywhere.
     *
     * This must match the role checked
     * by the construction worker APIs.
     */
    const workerRole =
        data.role ||
        "ConstructionEmployee";

    /**
     * Create construction worker object.
     */
    const worker: ConstructionWorker = {
        workerId,

        userId,

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

        name,

        phone,

        email,

        role:
            workerRole,

        workerType:
            data.workerType,

        salary,

        dailyWage:
            data.dailyWage !== undefined
                ? Number(data.dailyWage) || 0
                : data.workerType ===
                    "Daily Wage"
                    ? salary
                    : 0,

        active:
            data.active !== undefined
                ? data.active
                : true,

        loginEnabled:
            true,

        createdAt:
            now,

        updatedAt:
            now,
    };

    /**
     * STEP 1
     *
     * Create worker record first.
     */
    await client.send(
        new PutCommand({
            TableName: TABLE,

            Item: worker,
        })
    );

    try {
        /**
         * STEP 2
         *
         * Create login account.
         */
       await createUser({
    userId,
    employeeId,
    companyId: data.companyId,
    name,
    email,
    password: hashedPassword,
    role: workerRole,
    pageAccess: [],
    portal: "construction",
});
    } catch (error) {
        /**
         * If user creation fails,
         * remove the worker record.
         *
         * This prevents an orphan
         * construction worker.
         */
        try {
            await client.send(
                new DeleteCommand({
                    TableName: TABLE,

                    Key: {
                        workerId,
                    },
                })
            );
        } catch (rollbackError) {
            console.error(
                "Failed to rollback construction worker:",
                rollbackError
            );
        }

        console.error(
            "Failed to create construction worker login:",
            error
        );

        throw error;
    }

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