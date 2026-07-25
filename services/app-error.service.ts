import {
    PutCommand,
    ScanCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";
import { AppError } from "@/types/app-error";

const TABLE = process.env.APP_ERRORS_TABLE!;

/**
 * Create App Error
 */
export async function createAppError(error: AppError) {
    await db.send(
        new PutCommand({
            TableName: TABLE,
            Item: error,
        })
    );

    return error;
}

/**
 * Get All App Errors
 */
export async function getAppErrors(): Promise<AppError[]> {
    const result = await db.send(
        new ScanCommand({
            TableName: TABLE,
        }),
    );

    return (result.Items as AppError[] | undefined) ?? [];
}

/**
 * Get App Error By ID
 */
export async function getAppErrorById(errorId: string) {
    const result = await db.send(
        new GetCommand({
            TableName: TABLE,
            Key: {
                errorId,
            },
        }),
    );

    return result.Item as AppError | undefined;
}

/**
 * Update App Error
 *
 * Only fields provided in `data` are updated.
 */
export async function updateAppError(
    errorId: string,
    data: Partial<AppError>,
) {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    /**
     * Application
     * `module` is a DynamoDB reserved keyword,
     * therefore we use #module.
     */
    if (data.module !== undefined) {
        updateExpressions.push("#module = :module");
        expressionAttributeNames["#module"] = "module";
        expressionAttributeValues[":module"] = data.module;
    }

    if (data.errorTitle !== undefined) {
        updateExpressions.push("errorTitle = :errorTitle");
        expressionAttributeValues[":errorTitle"] = data.errorTitle;
    }

    if (data.occurredError !== undefined) {
        updateExpressions.push("occurredError = :occurredError");
        expressionAttributeValues[":occurredError"] =
            data.occurredError;
    }

    if (data.expectedError !== undefined) {
        updateExpressions.push("expectedError = :expectedError");
        expressionAttributeValues[":expectedError"] =
            data.expectedError;
    }

    if (data.status !== undefined) {
        updateExpressions.push("#status = :status");
        expressionAttributeNames["#status"] = "status";
        expressionAttributeValues[":status"] = data.status;
    }

    /**
     * Always update updatedAt
     */
    updateExpressions.push("updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] =
        new Date().toISOString();

    if (updateExpressions.length === 0) {
        return false;
    }

    const result = await db.send(
        new UpdateCommand({
            TableName: TABLE,

            Key: {
                errorId,
            },

            UpdateExpression: `SET ${updateExpressions.join(", ")}`,

            ExpressionAttributeNames:
                Object.keys(expressionAttributeNames).length > 0
                    ? expressionAttributeNames
                    : undefined,

            ExpressionAttributeValues:
                expressionAttributeValues,

            ReturnValues: "ALL_NEW",
        }),
    );

    return result.Attributes as AppError;
}

/**
 * Delete App Error
 */
export async function deleteAppError(errorId: string) {
    await db.send(
        new DeleteCommand({
            TableName: TABLE,
            Key: {
                errorId,
            },
        }),
    );

    return true;
}