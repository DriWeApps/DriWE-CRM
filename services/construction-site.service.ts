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
    ConstructionSite,
} from "@/types/construction";

const client = new DynamoDBClient({
    region:
        process.env.AWS_REGION ||
        "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_SITES_TABLE ||
    "CRM_ConstructionSites";

/**
 * Get all sites for a company
 */
export async function getSites(
    companyId: string
): Promise<ConstructionSite[]> {
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

    return (result.Items || []) as ConstructionSite[];
}

/**
 * Get all sites for a project
 */
export async function getSitesByProject(
    projectId: string,
    companyId: string
): Promise<ConstructionSite[]> {
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

    return (result.Items || []) as ConstructionSite[];
}

/**
 * Get one site
 */
export async function getSiteById(
    siteId: string,
    companyId: string
): Promise<ConstructionSite | null> {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,

            Key: {
                siteId,
            },
        })
    );

    const site =
        result.Item as
            | ConstructionSite
            | undefined;

    if (
        !site ||
        site.companyId !== companyId
    ) {
        return null;
    }

    return site;
}

/**
 * Create site
 */
export async function createSite(data: {
    companyId: string;

    projectId: string;
    projectName?: string;

    siteName: string;
    location?: string;

    active?: boolean;
}) {
    const now =
        new Date().toISOString();

    const site: ConstructionSite = {
        siteId: randomUUID(),

        companyId:
            data.companyId,

        projectId:
            data.projectId,

        projectName:
            data.projectName,

        siteName:
            data.siteName.trim(),

        location:
            data.location?.trim(),

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
            Item: site,
        })
    );

    return site;
}

/**
 * Update site
 */
export async function updateSite(
    siteId: string,
    companyId: string,
    data: Partial<ConstructionSite>
) {
    const existing =
        await getSiteById(
            siteId,
            companyId
        );

    if (!existing) {
        return null;
    }

    const updated: ConstructionSite = {
        ...existing,

        ...data,

        siteId,

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
 * Delete site
 */
export async function deleteSite(
    siteId: string,
    companyId: string
) {
    const existing =
        await getSiteById(
            siteId,
            companyId
        );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,

            Key: {
                siteId,
            },
        })
    );

    return true;
}