import {
    GetCommand,
    PutCommand,
    ScanCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

import type { DailySiteUpdate } from "@/types/construction";

const TABLE_NAME =
    process.env.CONSTRUCTION_DAILY_UPDATES_TABLE ||
    "CRM_ConstructionDailyUpdates";

const MATERIALS_TABLE =
    process.env.CONSTRUCTION_MATERIALS_TABLE ||
    "CRM_ConstructionMaterials";

/* =========================================================
   GET DAILY UPDATES
========================================================= */

export async function getDailyUpdates(
    companyId: string,
    projectId?: string,
    siteId?: string
): Promise<DailySiteUpdate[]> {
    const filters = [
        "companyId = :companyId",
    ];

    const values: Record<string, string> = {
        ":companyId": companyId,
    };

    if (projectId) {
        filters.push(
            "projectId = :projectId"
        );

        values[":projectId"] =
            projectId;
    }

    if (siteId) {
        filters.push(
            "siteId = :siteId"
        );

        values[":siteId"] =
            siteId;
    }

    const result = await db.send(
        new ScanCommand({
            TableName: TABLE_NAME,

            FilterExpression:
                filters.join(" AND "),

            ExpressionAttributeValues:
                values,
        })
    );

    const updates =
        (result.Items || []) as DailySiteUpdate[];

    return updates.sort(
        (a, b) => {
            const dateA =
                new Date(
                    `${a.date}T${
                        a.createdAt?.split(
                            "T"
                        )[1] ||
                        "00:00:00"
                    }`
                ).getTime();

            const dateB =
                new Date(
                    `${b.date}T${
                        b.createdAt?.split(
                            "T"
                        )[1] ||
                        "00:00:00"
                    }`
                ).getTime();

            return dateB - dateA;
        }
    );
}

/* =========================================================
   GET SINGLE DAILY UPDATE
========================================================= */

export async function getDailyUpdateById(
    updateId: string,
    companyId: string
): Promise<DailySiteUpdate | null> {
    const result = await db.send(
        new GetCommand({
            TableName: TABLE_NAME,

            Key: {
                updateId,
            },
        })
    );

    const update =
        result.Item as
            | DailySiteUpdate
            | undefined;

    if (!update) {
        return null;
    }

    if (
        update.companyId !== companyId
    ) {
        return null;
    }

    return update;
}

/* =========================================================
   CREATE INPUT
========================================================= */

export interface CreateDailyUpdateInput {
    projectId: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    date: string;

    workersPresent: number;

    tasksCompleted: number;

    materialReceived: number;

    materialUsed: number;
    materialsUsed?: Array<{
        materialId: string;
        quantity: number;
    }>;

    issues: number;

    issueDescription?: string;

    photos?: string[];

    note?: string;

    submittedBy: string;

    submittedByName?: string;
}

/* =========================================================
   CREATE DAILY UPDATE
========================================================= */

export async function createDailyUpdate(
    companyId: string,
    input: CreateDailyUpdateInput
): Promise<DailySiteUpdate> {
    const now =
        new Date().toISOString();

    const update: DailySiteUpdate = {
        updateId:
            crypto.randomUUID(),

        companyId,

        projectId:
            input.projectId,

        projectName:
            input.projectName,

        siteId:
            input.siteId,

        siteName:
            input.siteName,

        date:
            input.date,

        workersPresent:
            Number(
                input.workersPresent || 0
            ),

        tasksCompleted:
            Number(
                input.tasksCompleted || 0
            ),

        materialReceived:
            Number(
                input.materialReceived || 0
            ),

        materialUsed:
            Number(
                input.materialUsed || 0
            ),

        issues:
            Number(
                input.issues || 0
            ),

        issueDescription:
            input.issueDescription?.trim() ||
            undefined,

        photos:
            input.photos || [],

        note:
            input.note?.trim() ||
            undefined,

        submittedBy:
            input.submittedBy,

        submittedByName:
            input.submittedByName,

        createdAt:
            now,

        updatedAt:
            now,
    };

    const usageByMaterial = new Map<string, number>();
    for (const usage of input.materialsUsed || []) {
        const materialId = usage.materialId.trim();
        const quantity = Number(usage.quantity);

        if (!materialId || !Number.isFinite(quantity) || quantity <= 0) {
            throw new Error("Enter a valid material and quantity used.");
        }

        usageByMaterial.set(
            materialId,
            (usageByMaterial.get(materialId) || 0) + quantity
        );
    }

    const transactionItems = [];

    for (const [materialId, quantity] of usageByMaterial) {
        const materialResult = await db.send(
            new GetCommand({
                TableName: MATERIALS_TABLE,
                Key: { materialId },
            })
        );
        const material = materialResult.Item as
            | { companyId?: string; projectId?: string; materialName?: string; unit?: string; quantity?: number }
            | undefined;

        if (
            !material ||
            material.companyId !== companyId ||
            material.projectId !== input.projectId
        ) {
            throw new Error("A selected material is not available for this project.");
        }

        const available = Number(material.quantity || 0);
        if (available < quantity) {
            throw new Error(
                `${material.materialName || "Material"} is not available in the requested quantity. Available: ${available} ${material.unit || ""}.`
            );
        }

        update.materialsUsed = [
            ...(update.materialsUsed || []),
            { materialId, materialName: material.materialName || "Material", quantity, unit: material.unit || "" },
        ];

        transactionItems.push({
            Update: {
                TableName: MATERIALS_TABLE,
                Key: { materialId },
                UpdateExpression: "SET quantity = quantity - :used, updatedAt = :updatedAt",
                ConditionExpression:
                    "companyId = :companyId AND projectId = :projectId AND quantity >= :used",
                ExpressionAttributeValues: {
                    ":used": quantity,
                    ":updatedAt": now,
                    ":companyId": companyId,
                    ":projectId": input.projectId,
                },
            },
        });
    }

    transactionItems.push({
        Put: {
            TableName: TABLE_NAME,
            Item: update,
            ConditionExpression: "attribute_not_exists(updateId)",
        },
    });

    try {
        await db.send(new TransactWriteCommand({ TransactItems: transactionItems }));
    } catch (error) {
        if (usageByMaterial.size > 0) {
            throw new Error(
                "Material stock changed or is insufficient. Refresh the project materials and try again."
            );
        }
        throw error;
    }

    return update;
}

/* =========================================================
   UPDATE DAILY UPDATE
========================================================= */

export async function updateDailyUpdate(
    updateId: string,
    companyId: string,
    input: Partial<CreateDailyUpdateInput>
): Promise<DailySiteUpdate | null> {
    const existing =
        await getDailyUpdateById(
            updateId,
            companyId
        );

    if (!existing) {
        return null;
    }

    const updated: DailySiteUpdate = {
        ...existing,

        ...(input.projectId !==
            undefined && {
            projectId:
                input.projectId,
        }),

        ...(input.projectName !==
            undefined && {
            projectName:
                input.projectName,
        }),

        ...(input.siteId !==
            undefined && {
            siteId:
                input.siteId,
        }),

        ...(input.siteName !==
            undefined && {
            siteName:
                input.siteName,
        }),

        ...(input.date !==
            undefined && {
            date:
                input.date,
        }),

        ...(input.workersPresent !==
            undefined && {
            workersPresent:
                Number(
                    input.workersPresent
                ),
        }),

        ...(input.tasksCompleted !==
            undefined && {
            tasksCompleted:
                Number(
                    input.tasksCompleted
                ),
        }),

        ...(input.materialReceived !==
            undefined && {
            materialReceived:
                Number(
                    input.materialReceived
                ),
        }),

        ...(input.materialUsed !==
            undefined && {
            materialUsed:
                Number(
                    input.materialUsed
                ),
        }),

        ...(input.issues !==
            undefined && {
            issues:
                Number(
                    input.issues
                ),
        }),

        ...(input.issueDescription !==
            undefined && {
            issueDescription:
                input.issueDescription
                    ?.trim() ||
                undefined,
        }),

        ...(input.photos !==
            undefined && {
            photos:
                input.photos,
        }),

        ...(input.note !==
            undefined && {
            note:
                input.note?.trim() ||
                undefined,
        }),

        updatedAt:
            new Date().toISOString(),
    };

    await db.send(
        new PutCommand({
            TableName: TABLE_NAME,

            Item: updated,
        })
    );

    return updated;
}

/* =========================================================
   DELETE DAILY UPDATE
========================================================= */

export async function deleteDailyUpdate(
    updateId: string,
    companyId: string
): Promise<boolean> {
    const existing =
        await getDailyUpdateById(
            updateId,
            companyId
        );

    if (!existing) {
        return false;
    }

    const transactionItems = [];

    for (const usage of existing.materialsUsed || []) {
        transactionItems.push({
            Update: {
                TableName: MATERIALS_TABLE,
                Key: { materialId: usage.materialId },
                UpdateExpression: "SET quantity = if_not_exists(quantity, :zero) + :quantity, updatedAt = :updatedAt",
                ConditionExpression: "companyId = :companyId",
                ExpressionAttributeValues: {
                    ":zero": 0,
                    ":quantity": usage.quantity,
                    ":updatedAt": new Date().toISOString(),
                    ":companyId": companyId,
                },
            },
        });
    }

    transactionItems.push({
        Delete: {
            TableName: TABLE_NAME,
            Key: { updateId },
            ConditionExpression: "companyId = :companyId",
            ExpressionAttributeValues: { ":companyId": companyId },
        },
    });

    await db.send(new TransactWriteCommand({ TransactItems: transactionItems }));

    return true;
}