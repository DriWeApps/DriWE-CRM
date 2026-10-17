
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import type { AttendanceStatus } from "@/types/construction";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-north-1",
});

const TABLE =
    process.env.CONSTRUCTION_ATTENDANCE_TABLE ||
    "CRM_ConstructionAttendance";

export interface ConstructionAttendance {
    attendanceId: string;
    companyId: string;
    companyName?: string;
    projectId: string;
    projectName?: string;

    // Optional legacy fields; new records do not require them.
    siteId?: string;
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

export async function getAttendance(
    companyId: string
): Promise<ConstructionAttendance[]> {
    const result = await client.send(
        new ScanCommand({
            TableName: TABLE,
            FilterExpression: "companyId = :companyId",
            ExpressionAttributeValues: {
                ":companyId": companyId,
            },
        })
    );

    return (result.Items || []) as ConstructionAttendance[];
}

export async function getAttendanceByProject(
    projectId: string,
    companyId: string
): Promise<ConstructionAttendance[]> {
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

    return (result.Items || []) as ConstructionAttendance[];
}

export async function getAttendanceByWorker(
    workerId: string,
    companyId: string
): Promise<ConstructionAttendance[]> {
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

    return (result.Items || []) as ConstructionAttendance[];
}

export async function getAttendanceById(
    attendanceId: string,
    companyId: string
): Promise<ConstructionAttendance | null> {
    const result = await client.send(
        new GetCommand({
            TableName: TABLE,
            Key: { attendanceId },
        })
    );

    const attendance =
        result.Item as ConstructionAttendance | undefined;

    if (!attendance || attendance.companyId !== companyId) {
        return null;
    }

    return attendance;
}

export async function createAttendance(data: {
    companyId: string;
    companyName?: string;
    projectId: string;
    projectName?: string;
    workerId: string;
    workerName?: string;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
    createdBy?: string;
    createdByName?: string;
}) {
    const now = new Date().toISOString();

    const attendance: ConstructionAttendance = {
        attendanceId: randomUUID(),
        companyId: data.companyId,
        companyName: data.companyName,
        projectId: data.projectId,
        projectName: data.projectName,
        workerId: data.workerId,
        workerName: data.workerName,
        date: data.date,
        status: data.status,
        remarks: data.remarks,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: now,
        updatedAt: now,
    };

    await client.send(
        new PutCommand({
            TableName: TABLE,
            Item: attendance,
        })
    );

    return attendance;
}

export async function updateAttendance(
    attendanceId: string,
    companyId: string,
    data: Partial<
        Pick<ConstructionAttendance, "date" | "status" | "remarks">
    >
) {
    const existing = await getAttendanceById(
        attendanceId,
        companyId
    );

    if (!existing) {
        return null;
    }

    const updated: ConstructionAttendance = {
        ...existing,
        ...data,
        attendanceId,
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

export async function deleteAttendance(
    attendanceId: string,
    companyId: string
) {
    const existing = await getAttendanceById(
        attendanceId,
        companyId
    );

    if (!existing) {
        return false;
    }

    await client.send(
        new DeleteCommand({
            TableName: TABLE,
            Key: { attendanceId },
        })
    );

    return true;
}
