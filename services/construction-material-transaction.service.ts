import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

import type { MaterialTransactionType } from "@/types/construction";

import {
    getMaterialById,
} from "@/services/construction-material.service";

import {
    getSiteById,
} from "@/services/construction-site.service";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
});

const TRANSACTION_TABLE =
    process.env.CONSTRUCTION_MATERIAL_TRANSACTIONS_TABLE ||
    "CRM_ConstructionMaterialTransactions";

const MATERIAL_TABLE =
    process.env.CONSTRUCTION_MATERIALS_TABLE ||
    "CRM_ConstructionMaterials";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ConstructionMaterialTransaction {
    transactionId: string;

    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    materialId: string;
    materialName?: string;

    transactionType: MaterialTransactionType;

    quantity: number;
    unit: string;

    /**
     * Used for TRANSFER transactions.
     *
     * Example:
     * Site A -> Site B
     *
     * siteId/siteName represent the source site.
     * toSiteId/toSiteName represent the destination site.
     */
    toSiteId?: string;
    toSiteName?: string;

    /**
     * Optional reference information.
     */
    referenceNumber?: string;

    supplierName?: string;

    remarks?: string;

    createdBy?: string;
    createdByName?: string;

    createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Get all transactions                                                       */
/* -------------------------------------------------------------------------- */

export async function getMaterialTransactions(
    companyId: string
): Promise<ConstructionMaterialTransaction[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TRANSACTION_TABLE,
            FilterExpression: "companyId = :companyId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
            },
        })
    );

    return (result.Items || []) as ConstructionMaterialTransaction[];
}

/* -------------------------------------------------------------------------- */
/* Get transactions by project                                                */
/* -------------------------------------------------------------------------- */

export async function getMaterialTransactionsByProject(
    projectId: string,
    companyId: string
): Promise<ConstructionMaterialTransaction[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TRANSACTION_TABLE,
            FilterExpression:
                "companyId = :companyId AND projectId = :projectId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
                ":projectId": projectId,
            },
        })
    );

    return (result.Items || []) as ConstructionMaterialTransaction[];
}

/* -------------------------------------------------------------------------- */
/* Get transactions by site                                                   */
/* -------------------------------------------------------------------------- */

export async function getMaterialTransactionsBySite(
    siteId: string,
    companyId: string
): Promise<ConstructionMaterialTransaction[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TRANSACTION_TABLE,
            FilterExpression:
                "companyId = :companyId AND siteId = :siteId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
                ":siteId": siteId,
            },
        })
    );

    return (result.Items || []) as ConstructionMaterialTransaction[];
}

/* -------------------------------------------------------------------------- */
/* Get transactions by material                                               */
/* -------------------------------------------------------------------------- */

export async function getMaterialTransactionsByMaterial(
    materialId: string,
    companyId: string
): Promise<ConstructionMaterialTransaction[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TRANSACTION_TABLE,
            FilterExpression:
                "companyId = :companyId AND materialId = :materialId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
                ":materialId": materialId,
            },
        })
    );

    return (result.Items || []) as ConstructionMaterialTransaction[];
}

/* -------------------------------------------------------------------------- */
/* Get transaction by ID                                                      */
/* -------------------------------------------------------------------------- */

export async function getMaterialTransactionById(
    transactionId: string,
    companyId: string
): Promise<ConstructionMaterialTransaction | null> {
    const result = await client.send(
        new GetCommand({
            TableName: TRANSACTION_TABLE,
            Key: {
                transactionId,
            },
        })
    );

    const transaction =
        result.Item as ConstructionMaterialTransaction | undefined;

    if (!transaction) {
        return null;
    }

    if (transaction.companyId !== companyId) {
        return null;
    }

    return transaction;
}

/* -------------------------------------------------------------------------- */
/* Create RECEIVE transaction                                                 */
/* -------------------------------------------------------------------------- */

export async function receiveMaterial(data: {
    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    materialId: string;
    materialName?: string;

    quantity: number;
    unit: string;

    referenceNumber?: string;
    supplierName?: string;
    remarks?: string;

    createdBy?: string;
    createdByName?: string;
}): Promise<ConstructionMaterialTransaction> {
    if (!data.quantity || data.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }

    const material = await getMaterialById(
        data.materialId,
        data.companyId
    );

    if (!material) {
        throw new Error("Material not found");
    }

    if (material.projectId !== data.projectId) {
        throw new Error(
            "Material does not belong to the selected project"
        );
    }

    if (material.siteId !== data.siteId) {
        throw new Error(
            "Material does not belong to the selected site"
        );
    }

    const site = await getSiteById(
        data.siteId,
        data.companyId
    );

    if (!site) {
        throw new Error("Site not found");
    }

    if (site.projectId !== data.projectId) {
        throw new Error(
            "Site does not belong to the selected project"
        );
    }

    const transactionId = randomUUID();
    const now = new Date().toISOString();

    const transaction: ConstructionMaterialTransaction = {
        transactionId,

        companyId: data.companyId,
        companyName: data.companyName,

        projectId: data.projectId,
        projectName: data.projectName || material.projectName,

        siteId: data.siteId,
        siteName: data.siteName || material.siteName,

        materialId: data.materialId,
        materialName: data.materialName || material.materialName,

        transactionType: "RECEIVE",

        quantity: data.quantity,
        unit: data.unit || material.unit,

        referenceNumber: data.referenceNumber,
        supplierName: data.supplierName,
        remarks: data.remarks,

        createdBy: data.createdBy,
        createdByName: data.createdByName,

        createdAt: now,
    };

    const newQuantity =
        Number(material.quantity || 0) +
        Number(data.quantity);

    const updatedMaterial = {
        ...material,
        quantity: newQuantity,
        totalValue:
            newQuantity *
            Number(material.unitPrice || 0),
        updatedAt: now,
    };

    await client.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: TRANSACTION_TABLE,
                        Item: transaction,
                        ConditionExpression:
                            "attribute_not_exists(transactionId)",
                    },
                },
                {
                    Put: {
                        TableName: MATERIAL_TABLE,
                        Item: updatedMaterial,
                    },
                },
            ],
        })
    );

    return transaction;
}

/* -------------------------------------------------------------------------- */
/* Create ISSUE transaction                                                   */
/* -------------------------------------------------------------------------- */

export async function issueMaterial(data: {
    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    materialId: string;
    materialName?: string;

    quantity: number;
    unit: string;

    referenceNumber?: string;
    remarks?: string;

    createdBy?: string;
    createdByName?: string;
}): Promise<ConstructionMaterialTransaction> {
    if (!data.quantity || data.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }

    const material = await getMaterialById(
        data.materialId,
        data.companyId
    );

    if (!material) {
        throw new Error("Material not found");
    }

    if (material.projectId !== data.projectId) {
        throw new Error(
            "Material does not belong to the selected project"
        );
    }

    if (material.siteId !== data.siteId) {
        throw new Error(
            "Material does not belong to the selected site"
        );
    }

    const availableQuantity =
        Number(material.quantity || 0);

    if (data.quantity > availableQuantity) {
        throw new Error(
            `Insufficient stock. Available quantity: ${availableQuantity}`
        );
    }

    const site = await getSiteById(
        data.siteId,
        data.companyId
    );

    if (!site) {
        throw new Error("Site not found");
    }

    if (site.projectId !== data.projectId) {
        throw new Error(
            "Site does not belong to the selected project"
        );
    }

    const transactionId = randomUUID();
    const now = new Date().toISOString();

    const transaction: ConstructionMaterialTransaction = {
        transactionId,

        companyId: data.companyId,
        companyName: data.companyName,

        projectId: data.projectId,
        projectName: data.projectName || material.projectName,

        siteId: data.siteId,
        siteName: data.siteName || material.siteName,

        materialId: data.materialId,
        materialName: data.materialName || material.materialName,

        transactionType: "ISSUE",

        quantity: data.quantity,
        unit: data.unit || material.unit,

        referenceNumber: data.referenceNumber,
        remarks: data.remarks,

        createdBy: data.createdBy,
        createdByName: data.createdByName,

        createdAt: now,
    };

    const newQuantity =
        availableQuantity -
        Number(data.quantity);

    const updatedMaterial = {
        ...material,
        quantity: newQuantity,
        totalValue:
            newQuantity *
            Number(material.unitPrice || 0),
        updatedAt: now,
    };

    await client.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: TRANSACTION_TABLE,
                        Item: transaction,
                        ConditionExpression:
                            "attribute_not_exists(transactionId)",
                    },
                },
                {
                    Put: {
                        TableName: MATERIAL_TABLE,
                        Item: updatedMaterial,
                    },
                },
            ],
        })
    );

    return transaction;
}

/* -------------------------------------------------------------------------- */
/* Create TRANSFER transaction                                                */
/* -------------------------------------------------------------------------- */

export async function transferMaterial(data: {
    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    fromSiteId: string;
    fromSiteName?: string;

    toSiteId: string;
    toSiteName?: string;

    materialId: string;
    materialName?: string;

    quantity: number;
    unit: string;

    referenceNumber?: string;
    remarks?: string;

    createdBy?: string;
    createdByName?: string;
}): Promise<ConstructionMaterialTransaction> {
    if (!data.quantity || data.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }

    if (data.fromSiteId === data.toSiteId) {
        throw new Error(
            "Source site and destination site cannot be the same"
        );
    }

    const sourceSite = await getSiteById(
        data.fromSiteId,
        data.companyId
    );

    if (!sourceSite) {
        throw new Error("Source site not found");
    }

    if (sourceSite.projectId !== data.projectId) {
        throw new Error(
            "Source site does not belong to the selected project"
        );
    }

    const destinationSite = await getSiteById(
        data.toSiteId,
        data.companyId
    );

    if (!destinationSite) {
        throw new Error("Destination site not found");
    }

    if (destinationSite.projectId !== data.projectId) {
        throw new Error(
            "Destination site does not belong to the selected project"
        );
    }

    /*
     * Materials are currently stored against a specific site.
     *
     * Therefore, for transfer:
     *
     * Source material:
     *   Site A + Material X
     *
     * Destination material:
     *   Site B + Material X
     *
     * The destination material must already exist.
     */

    const sourceMaterial = await getMaterialById(
        data.materialId,
        data.companyId
    );

    if (!sourceMaterial) {
        throw new Error("Source material not found");
    }

    if (sourceMaterial.projectId !== data.projectId) {
        throw new Error(
            "Source material does not belong to the selected project"
        );
    }

    if (sourceMaterial.siteId !== data.fromSiteId) {
        throw new Error(
            "Material does not belong to the source site"
        );
    }

    const availableQuantity =
        Number(sourceMaterial.quantity || 0);

    if (data.quantity > availableQuantity) {
        throw new Error(
            `Insufficient stock at source site. Available quantity: ${availableQuantity}`
        );
    }

    /*
     * Find the destination material.
     *
     * Because materials currently have materialId as their
     * unique identifier and are site-specific, we search the
     * material table for the same material name/project/site.
     */
    const destinationResult = await client.send(
        new ScanCommand({
            TableName: MATERIAL_TABLE,
            FilterExpression:
                "companyId = :companyId AND projectId = :projectId AND siteId = :siteId AND materialName = :materialName",
            ExpressionAttributeValues: {
                ":companyId": data.companyId,
                ":projectId": data.projectId,
                ":siteId": data.toSiteId,
                ":materialName": sourceMaterial.materialName,
            },
        })
    );

    const destinationMaterials =
        (destinationResult.Items || []) as typeof sourceMaterial[];

    const destinationMaterial =
        destinationMaterials[0];

    if (!destinationMaterial) {
        throw new Error(
            "Destination material does not exist. Create the material at the destination site before transferring stock."
        );
    }

    const transactionId = randomUUID();
    const now = new Date().toISOString();

    const transaction: ConstructionMaterialTransaction = {
        transactionId,

        companyId: data.companyId,
        companyName: data.companyName,

        projectId: data.projectId,
        projectName:
            data.projectName ||
            sourceMaterial.projectName,

        /*
         * For a transfer, the main site fields represent
         * the source site.
         */
        siteId: data.fromSiteId,
        siteName:
            data.fromSiteName ||
            sourceSite.siteName,

        materialId: data.materialId,
        materialName:
            data.materialName ||
            sourceMaterial.materialName,

        transactionType: "TRANSFER",

        quantity: data.quantity,
        unit:
            data.unit ||
            sourceMaterial.unit,

        toSiteId: data.toSiteId,
        toSiteName:
            data.toSiteName ||
            destinationSite.siteName,

        referenceNumber: data.referenceNumber,
        remarks: data.remarks,

        createdBy: data.createdBy,
        createdByName: data.createdByName,

        createdAt: now,
    };

    const newSourceQuantity =
        availableQuantity -
        Number(data.quantity);

    const newDestinationQuantity =
        Number(destinationMaterial.quantity || 0) +
        Number(data.quantity);

    const updatedSourceMaterial = {
        ...sourceMaterial,

        quantity: newSourceQuantity,

        totalValue:
            newSourceQuantity *
            Number(sourceMaterial.unitPrice || 0),

        updatedAt: now,
    };

    const updatedDestinationMaterial = {
        ...destinationMaterial,

        quantity: newDestinationQuantity,

        totalValue:
            newDestinationQuantity *
            Number(destinationMaterial.unitPrice || 0),

        updatedAt: now,
    };

    await client.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: TRANSACTION_TABLE,
                        Item: transaction,
                        ConditionExpression:
                            "attribute_not_exists(transactionId)",
                    },
                },
                {
                    Put: {
                        TableName: MATERIAL_TABLE,
                        Item: updatedSourceMaterial,
                    },
                },
                {
                    Put: {
                        TableName: MATERIAL_TABLE,
                        Item: updatedDestinationMaterial,
                    },
                },
            ],
        })
    );

    return transaction;
}

/* -------------------------------------------------------------------------- */
/* Generic create transaction                                                */
/* -------------------------------------------------------------------------- */

export async function createMaterialTransaction(
    data:
        | {
              transactionType: "RECEIVE";
              companyId: string;
              companyName?: string;
              projectId: string;
              projectName?: string;
              siteId: string;
              siteName?: string;
              materialId: string;
              materialName?: string;
              quantity: number;
              unit: string;
              referenceNumber?: string;
              supplierName?: string;
              remarks?: string;
              createdBy?: string;
              createdByName?: string;
          }
        | {
              transactionType: "ISSUE";
              companyId: string;
              companyName?: string;
              projectId: string;
              projectName?: string;
              siteId: string;
              siteName?: string;
              materialId: string;
              materialName?: string;
              quantity: number;
              unit: string;
              referenceNumber?: string;
              remarks?: string;
              createdBy?: string;
              createdByName?: string;
          }
        | {
              transactionType: "TRANSFER";
              companyId: string;
              companyName?: string;
              projectId: string;
              projectName?: string;
              fromSiteId: string;
              fromSiteName?: string;
              toSiteId: string;
              toSiteName?: string;
              materialId: string;
              materialName?: string;
              quantity: number;
              unit: string;
              referenceNumber?: string;
              remarks?: string;
              createdBy?: string;
              createdByName?: string;
          }
): Promise<ConstructionMaterialTransaction> {
    switch (data.transactionType) {
        case "RECEIVE":
            return receiveMaterial(data);

        case "ISSUE":
            return issueMaterial(data);

        case "TRANSFER":
            return transferMaterial(data);

        default:
            throw new Error(
                "Invalid material transaction type"
            );
    }
}

/* -------------------------------------------------------------------------- */
/* Delete transaction                                                         */
/* -------------------------------------------------------------------------- */

/**
 * IMPORTANT:
 *
 * Deleting a transaction does NOT automatically reverse
 * the material stock.
 *
 * This is intentional because transaction history should
 * normally be treated as an audit record.
 *
 * If a transaction needs to be reversed, create a new
 * opposite transaction instead.
 */
export async function deleteMaterialTransaction(
    transactionId: string,
    companyId: string
): Promise<boolean> {
    const existing =
        await getMaterialTransactionById(
            transactionId,
            companyId
        );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TRANSACTION_TABLE,
            Key: {
                transactionId,
            },
        })
    );

    return true;
}