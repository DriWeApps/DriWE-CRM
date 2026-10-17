
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

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

import { hashPassword } from "@/lib/password";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_WORKERS_TABLE ||
    "CRM_ConstructionWorkers";

/**
 * Get all workers belonging to a company.
 *
 * Legacy records that contain siteId/siteName remain readable.
 * Site fields are no longer required by this service.
 */
export async function getWorkers(
    companyId: string
): Promise<ConstructionWorker[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TABLE,
            FilterExpression: "companyId = :companyId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
            },
        })
    );

    return (result.Items || []) as ConstructionWorker[];
}

/**
 * Get workers assigned to a project within the same company.
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
 * Get one worker, ensuring that the worker belongs to the requesting company.
 */
export async function getWorkerById(
    workerId: string,
    companyId: string
): Promise<ConstructionWorker | null> {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,
            Key: { workerId },
        })
    );

    const worker = result.Item as
        | ConstructionWorker
        | undefined;

    if (!worker || worker.companyId !== companyId) {
        return null;
    }

    return worker;
}

/**
 * Create a project-linked construction worker and login.
 *
 * siteId and siteName are intentionally not required.
 */
export async function createWorker(data: {
    companyId: string;

    projectId: string;
    projectName?: string;

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
    const now = new Date().toISOString();

    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const phone = data.phone.trim();

    if (!data.companyId || !data.projectId) {
        throw new Error("Company and project are required.");
    }

    if (!name || !phone || !email || !data.password) {
        throw new Error(
            "Name, phone, email, and password are required."
        );
    }

    if (data.password.length < 6) {
        throw new Error(
            "Password must be at least 6 characters."
        );
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        throw new Error(
            "A user with this email already exists."
        );
    }

    const workerId = randomUUID();
    const userId = randomUUID();
    const employeeId = randomUUID();

    const hashedPassword = await hashPassword(data.password);

    const salary = Number(data.salary) || 0;
    const workerRole = data.role || "ConstructionEmployee";

    const worker: ConstructionWorker = {
        workerId,
        userId,
        companyId: data.companyId,

        projectId: data.projectId,
        projectName: data.projectName,

        name,
        phone,
        email,
        role: workerRole,
        workerType: data.workerType,
        salary,

        dailyWage:
            data.dailyWage !== undefined
                ? Number(data.dailyWage) || 0
                : data.workerType === "Daily Wage"
                    ? salary
                    : 0,

        active: data.active ?? true,
        loginEnabled: true,
        createdAt: now,
        updatedAt: now,
    };

    await client.send(
        new PutCommand({
            TableName: TABLE,
            Item: worker,
        })
    );

    try {
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
        // Roll back the worker record if its login cannot be created.
        try {
            await client.send(
                new DeleteCommand({
                    TableName: TABLE,
                    Key: { workerId },
                })
            );
        } catch (rollbackError) {
            console.error(
                "Failed to roll back construction worker:",
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
 * Update a worker without allowing the company or worker ID to be changed.
 */
export async function updateWorker(
    workerId: string,
    companyId: string,
    data: Partial<ConstructionWorker>
) {
    const existing = await getWorkerById(workerId, companyId);

    if (!existing) {
        return null;
    }

    const {
        workerId: _ignoredWorkerId,
        companyId: _ignoredCompanyId,
        ...safeData
    } = data;

    const updated = {
        ...existing,
        ...safeData,
        workerId,
        companyId,
        updatedAt: new Date().toISOString(),
    } as ConstructionWorker;

    await client.send(
        new PutCommand({
            TableName: TABLE,
            Item: updated,
        })
    );

    return updated;
}

/**
 * Delete a worker belonging to the specified company.
 */
export async function deleteWorker(
    workerId: string,
    companyId: string
) {
    const existing = await getWorkerById(workerId, companyId);

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,
            Key: { workerId },
        })
    );

    return true;
}
