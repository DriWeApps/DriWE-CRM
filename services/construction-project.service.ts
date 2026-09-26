import {
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "crypto";

import type {
    ConstructionProject,
    ProjectStatus,
} from "@/types/construction";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_PROJECTS_TABLE ||
    "CRM_ConstructionProjects";

export async function getProjects(companyId: string) {
    const result = await client.send(
        new ScanCommand({
            TableName: TABLE,
            FilterExpression: "companyId = :companyId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
            },
        })
    );

    return (result.Items || []) as ConstructionProject[];
}

export async function getProjectById(
    projectId: string,
    companyId: string
) {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,
            Key: {
                projectId,
            },
        })
    );

    const project = result.Item as ConstructionProject | undefined;

    if (!project || project.companyId !== companyId) {
        return null;
    }

    return project;
}

export async function createProject(data: {
    companyId: string;
    companyName?: string;

    projectName: string;
    location: string;

    projectManager?: string;
    projectManagerName?: string;

    siteSupervisor?: string;
    siteSupervisorName?: string;

    startDate: string;
    expectedCompletion: string;

    status?: ProjectStatus;

    description?: string;

    createdBy: string;
    createdByName?: string;
}) {
    const now = new Date().toISOString();

    const project: ConstructionProject = {
        projectId: randomUUID(),

        companyId: data.companyId,
        companyName: data.companyName,

        projectName: data.projectName,
        location: data.location,

        projectManager: data.projectManager,
        projectManagerName: data.projectManagerName,

        siteSupervisor: data.siteSupervisor,
        siteSupervisorName: data.siteSupervisorName,

        startDate: data.startDate,
        expectedCompletion: data.expectedCompletion,

        status: data.status || "Planning",

        description: data.description,

        createdBy: data.createdBy,
        createdByName: data.createdByName,

        createdAt: now,
        updatedAt: now,
    };

    await client.send(
        new PutCommand({
            TableName: TABLE,
            Item: project,
        })
    );

    return project;
}

export async function updateProject(
    projectId: string,
    companyId: string,
    data: Partial<ConstructionProject>
) {
    const existing = await getProjectById(
        projectId,
        companyId
    );

    if (!existing) {
        return null;
    }

    const updated = {
        ...existing,
        ...data,
        projectId,
        companyId,
        updatedAt: new Date().toISOString(),
    };

    await client.send(
        new PutCommand({
            TableName: TABLE,
            Item: updated,
        })
    );

    return updated;
}

export async function deleteProject(
    projectId: string,
    companyId: string
) {
    const existing = await getProjectById(
        projectId,
        companyId
    );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,
            Key: {
                projectId,
            },
        })
    );

    return true;
}