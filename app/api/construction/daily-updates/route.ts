import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    createDailyUpdate,
    getDailyUpdates,
} from "@/services/construction-daily-update.service";

function getCompanyId(user: any): string {
    return user.companyId || user.userId;
}

function getUserName(user: any): string {
    return (
        user.name ||
        user.employeeName ||
        user.fullName ||
        user.email ||
        "User"
    );
}

export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const companyId = getCompanyId(user);

        const { searchParams } = new URL(req.url);

        const projectId =
            searchParams.get("projectId") || undefined;

        const updates = await getDailyUpdates(
            companyId,
            projectId
        );

        return NextResponse.json({
            success: true,
            updates,
        });
    } catch (error) {
        console.error(
            "GET construction daily updates error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to load daily site updates",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        if (!body.projectId) {
            return NextResponse.json(
                { error: "Project is required" },
                { status: 400 }
            );
        }

        if (!body.date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const companyId = getCompanyId(user);

        const update = await createDailyUpdate(
            companyId,
            {
                projectId: body.projectId,
                projectName: body.projectName,

                date: body.date,

                workersPresent: Number(
                    body.workersPresent || 0
                ),

                tasksCompleted: Number(
                    body.tasksCompleted || 0
                ),

                materialReceived: Number(
                    body.materialReceived || 0
                ),

                materialUsed: Number(
                    body.materialUsed || 0
                ),

                issues: Number(body.issues || 0),

                issueDescription:
                    body.issueDescription || "",

                photos: Array.isArray(body.photos)
                    ? body.photos
                    : [],

                note: body.note || "",

                submittedBy: user.userId,

                submittedByName:
                    body.submittedByName ||
                    getUserName(user),
            }
        );

        return NextResponse.json(
            {
                success: true,
                update,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "POST construction daily update error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to create daily site update",
            },
            { status: 500 }
        );
    }
}