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

const client = new DynamoDBClient({
    region:
        process.env.AWS_REGION ||
        "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_MATERIALS_TABLE ||
    "CRM_ConstructionMaterials";

/* ============================================================
   TYPES
============================================================ */

export type MaterialUnit =
    | "Kg"
    | "Gram"
    | "Ton"
    | "Litre"
    | "ML"
    | "Piece"
    | "Box"
    | "Bag"
    | "Meter"
    | "Square Feet"
    | "Cubic Feet"
    | "Other";

export type MaterialStatus =
    | "Active"
    | "Inactive";

export interface ConstructionMaterial {
    materialId: string;

    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    materialName: string;
    category?: string;

    unit: MaterialUnit;
    quantity: number;

    minimumStock?: number;

    unitPrice?: number;
    totalValue?: number;

    supplierName?: string;
    supplierContact?: string;

    status: MaterialStatus;

    description?: string;
    remarks?: string;

    createdBy?: string;
    createdByName?: string;

    createdAt: string;
    updatedAt: string;
}

/* ============================================================
   GET ALL MATERIALS
============================================================ */

export async function getMaterials(
    companyId: string
): Promise<ConstructionMaterial[]> {
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
        (result.Items || []) as ConstructionMaterial[]
    );
}

/* ============================================================
   GET MATERIALS BY PROJECT
============================================================ */

export async function getMaterialsByProject(
    projectId: string,
    companyId: string
): Promise<ConstructionMaterial[]> {
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
        (result.Items || []) as ConstructionMaterial[]
    );
}

/* ============================================================
   GET MATERIALS BY SITE
============================================================ */

export async function getMaterialsBySite(
    siteId: string,
    companyId: string
): Promise<ConstructionMaterial[]> {
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
        (result.Items || []) as ConstructionMaterial[]
    );
}

/* ============================================================
   GET MATERIAL BY ID
============================================================ */

export async function getMaterialById(
    materialId: string,
    companyId: string
): Promise<ConstructionMaterial | null> {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,

            Key: {
                materialId,
            },
        })
    );

    const material =
        result.Item as
            | ConstructionMaterial
            | undefined;

    if (
        !material ||
        material.companyId !== companyId
    ) {
        return null;
    }

    return material;
}

/* ============================================================
   CREATE MATERIAL
============================================================ */

export async function createMaterial(data: {
    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    materialName: string;
    category?: string;

    unit: MaterialUnit;
    quantity: number;

    minimumStock?: number;

    unitPrice?: number;

    supplierName?: string;
    supplierContact?: string;

    status?: MaterialStatus;

    description?: string;
    remarks?: string;

    createdBy?: string;
    createdByName?: string;
}): Promise<ConstructionMaterial> {
    const now =
        new Date().toISOString();

    const quantity =
        Number(data.quantity) || 0;

    const unitPrice =
        Number(data.unitPrice) || 0;

    const totalValue =
        quantity * unitPrice;

    const material: ConstructionMaterial = {
        materialId:
            randomUUID(),

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

        materialName:
            data.materialName,

        category:
            data.category,

        unit:
            data.unit,

        quantity,

        minimumStock:
            data.minimumStock !==
            undefined
                ? Number(
                      data.minimumStock
                  )
                : undefined,

        unitPrice,

        totalValue,

        supplierName:
            data.supplierName,

        supplierContact:
            data.supplierContact,

        status:
            data.status ||
            "Active",

        description:
            data.description,

        remarks:
            data.remarks,

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
            Item: material,
        })
    );

    return material;
}

/* ============================================================
   UPDATE MATERIAL
============================================================ */

export async function updateMaterial(
    materialId: string,
    companyId: string,
    data: Partial<
        Omit<
            ConstructionMaterial,
            | "materialId"
            | "companyId"
            | "createdAt"
        >
    >
): Promise<ConstructionMaterial | null> {
    const existing =
        await getMaterialById(
            materialId,
            companyId
        );

    if (!existing) {
        return null;
    }

    const updatedQuantity =
        data.quantity !== undefined
            ? Number(data.quantity)
            : existing.quantity;

    const updatedUnitPrice =
        data.unitPrice !== undefined
            ? Number(data.unitPrice)
            : existing.unitPrice || 0;

    const updated: ConstructionMaterial = {
        ...existing,
        ...data,

        materialId,

        companyId,

        quantity:
            updatedQuantity,

        unitPrice:
            updatedUnitPrice,

        totalValue:
            updatedQuantity *
            updatedUnitPrice,

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

/* ============================================================
   DELETE MATERIAL
============================================================ */

export async function deleteMaterial(
    materialId: string,
    companyId: string
): Promise<boolean> {
    const existing =
        await getMaterialById(
            materialId,
            companyId
        );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,

            Key: {
                materialId,
            },
        })
    );

    return true;
}