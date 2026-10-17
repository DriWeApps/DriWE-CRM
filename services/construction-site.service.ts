import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_SITES_TABLE || "CRM_ConstructionSites";

export interface ConstructionSite {
    siteId: string;
    companyId: string;
    projectId: string;
    siteName: string;
    location?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export async function getSites(
    companyId: string,
    projectId?: string
): Promise<ConstructionSite[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TABLE,
            FilterExpression: projectId
                ? "companyId = :companyId AND projectId = :projectId"
                : "companyId = :companyId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
                ...(projectId ? { ":projectId": projectId } : {}),
            },
        })
    );

    return (result.Items || []) as ConstructionSite[];
}

export async function getSiteById(
    siteId: string,
    companyId: string
): Promise<ConstructionSite | null> {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,
            Key: { siteId },
        })
    );

    const site = result.Item as ConstructionSite | undefined;

    if (!site || site.companyId !== companyId) {
        return null;
    }

    return site;
}
