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
    AttendanceStatus,
} from "@/types/construction";

// ============================================================
// DynamoDB Client
// ============================================================

const client = new DynamoDBClient({
    region:
        process.env.AWS_REGION ||
        "eu-north-1",
});

// ============================================================
// Table
// ============================================================

const TABLE =
    process.env.CONSTRUCTION_ATTENDANCE_TABLE ||
    "CRM_ConstructionAttendance";

// ============================================================
// Types
// ============================================================

export interface ConstructionAttendance {
    attendanceId: string;

    companyId: string;
    companyName?: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    workerId: string;
    workerName?: string;

    date: string;

    status: AttendanceStatus;

    remarks?: string;

    createdBy?: string;
    createdByName?: string;

    createdAt: string;
    updatedAt: string;
}

// ============================================================
// GET ALL ATTENDANCE
// ============================================================

export async function getAttendance(
    companyId: string
) {
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
        result.Items || []
    ) as ConstructionAttendance[];
}

// ============================================================
// GET ATTENDANCE BY PROJECT
// ============================================================

export async function getAttendanceByProject(
    projectId: string,
    companyId: string
) {
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
        result.Items || []
    ) as ConstructionAttendance[];
}

// ============================================================
// GET ATTENDANCE BY SITE
// ============================================================

export async function getAttendanceBySite(
    siteId: string,
    companyId: string
) {
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
        result.Items || []
    ) as ConstructionAttendance[];
}

// ============================================================
// GET ATTENDANCE BY WORKER
// ============================================================

export async function getAttendanceByWorker(
    workerId: string,
    companyId: string
) {
    const result = await client.send(
        new ScanCommand({
            TableName: TABLE,

            FilterExpression:
                "companyId = :companyId AND workerId = :workerId",

            ExpressionAttributeValues: {
                ":companyId": companyId,
                ":workerId": workerId,
            },
        })
    );

    return (
        result.Items || []
    ) as ConstructionAttendance[];
}

// ============================================================
// GET ATTENDANCE BY ID
// ============================================================

export async function getAttendanceById(
    attendanceId: string,
    companyId: string
) {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,

            Key: {
                attendanceId,
            },
        })
    );

    const attendance =
        result.Item as
            | ConstructionAttendance
            | undefined;

    if (
        !attendance ||
        attendance.companyId !== companyId
    ) {
        return null;
    }

    return attendance;
}

// ============================================================
// CREATE ATTENDANCE
// ============================================================

export async function createAttendance(
    data: {
        companyId: string;
        companyName?: string;

        projectId: string;
        projectName?: string;

        siteId: string;
        siteName?: string;

        workerId: string;
        workerName?: string;

        date: string;

        status: AttendanceStatus;

        remarks?: string;

        createdBy?: string;
        createdByName?: string;
    }
) {
    const now =
        new Date().toISOString();

    const attendance: ConstructionAttendance =
        {
            attendanceId:
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

            workerId:
                data.workerId,

            workerName:
                data.workerName,

            date:
                data.date,

            status:
                data.status,

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

            Item: attendance,
        })
    );

    return attendance;
}

// ============================================================
// UPDATE ATTENDANCE
// ============================================================

export async function updateAttendance(
    attendanceId: string,
    companyId: string,
    data: Partial<
        Pick<
            ConstructionAttendance,
            | "date"
            | "status"
            | "remarks"
        >
    >
) {
    const existing =
        await getAttendanceById(
            attendanceId,
            companyId
        );

    if (!existing) {
        return null;
    }

    const updated: ConstructionAttendance =
        {
            ...existing,

            ...data,

            attendanceId,

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

// ============================================================
// DELETE ATTENDANCE
// ============================================================

export async function deleteAttendance(
    attendanceId: string,
    companyId: string
) {
    const existing =
        await getAttendanceById(
            attendanceId,
            companyId
        );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,

            Key: {
                attendanceId,
            },
        })
    );

    return true;
}