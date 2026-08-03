import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {

    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            );
        }
        const isAdmin =
            user.role === "ADMIN";
        const tasks = await db.send(
            new ScanCommand({
                TableName: "CRM_Tasks"
            })
        );
        const meetings = await db.send(
            new ScanCommand({
                TableName: "CRM_Meetings"
            })
        );
        const followups = await db.send(
            new ScanCommand({
                TableName: "CRM_FollowUps"
            })
        );
        let employeeTasks = tasks.Items || [];
        let employeeMeetings = meetings.Items || [];
        let employeeFollowups = followups.Items || [];
        // Employee can see only own data
        if (!isAdmin) {

            employeeTasks = employeeTasks.filter(
                (task: any) => task.assignedTo === user.employeeId
            );
            employeeMeetings = employeeMeetings.filter(
                (meeting: any) =>
                    meeting.participants?.some(
                        (participant: any) =>
                            participant.employeeId === user.employeeId
                    )
            );
            employeeFollowups =
                employeeFollowups.filter(
                    (follow: any) =>
                        follow.employeeId === user.employeeId
                );
        }

        const completedTasks = employeeTasks.filter(
            (task: any) => task.status === "Completed"
        ).length;

        const pendingTasks = employeeTasks.filter(
            (task: any) => task.status !== "Completed"
        ).length;


        return NextResponse.json({
            success: true,

            role: user.role,
            employeeId: user.employeeId,

            reports: {
                tasks: employeeTasks,
                meetings: employeeMeetings,
                followups: employeeFollowups,

                summary: {
                    totalTasks: employeeTasks.length,
                    completedTasks,
                    pendingTasks,
                    totalMeetings: employeeMeetings.length,
                    totalFollowups: employeeFollowups.length,
                }
            }
        });

    } catch (error) {
        console.error(error);




        return NextResponse.json(
            {
                success: false,
                message: "Failed to load reports"
            },
            {
                status: 500
            }
        );
    }
}