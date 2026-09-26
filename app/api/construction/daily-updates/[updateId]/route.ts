import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    deleteDailyUpdate,
    getDailyUpdateById,
    updateDailyUpdate,
} from "@/services/construction-daily-update.service";

type RouteContext = {
    params: Promise<{
        updateId: string;
    }>;
};

function getCompanyId(user: any): string {
    return user.companyId || user.userId;
}

export async function GET(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { updateId } = await params;

        const companyId = getCompanyId(user);

        const update = await getDailyUpdateById(
            updateId,
            companyId
        );

        if (!update) {
            return NextResponse.json(
                { error: "Daily update not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            update,
        });
    } catch (error) {
        console.error(
            "GET daily update error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to load daily update",
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { updateId } = await params;

        const body = await req.json();

        const companyId = getCompanyId(user);

        const existing = await getDailyUpdateById(
            updateId,
            companyId
        );

        if (!existing) {
            return NextResponse.json(
                { error: "Daily update not found" },
                { status: 404 }
            );
        }

        const update = await updateDailyUpdate(
            updateId,
            companyId,
            {
                projectId: body.projectId,
                projectName: body.projectName,

                date: body.date,

                workersPresent:
                    body.workersPresent !== undefined
                        ? Number(body.workersPresent)
                        : undefined,

                tasksCompleted:
                    body.tasksCompleted !== undefined
                        ? Number(body.tasksCompleted)
                        : undefined,

                materialReceived:
                    body.materialReceived !== undefined
                        ? Number(body.materialReceived)
                        : undefined,

                materialUsed:
                    body.materialUsed !== undefined
                        ? Number(body.materialUsed)
                        : undefined,

                issues:
                    body.issues !== undefined
                        ? Number(body.issues)
                        : undefined,

                issueDescription:
                    body.issueDescription,

                photos: body.photos,

                note: body.note,
            }
        );

        return NextResponse.json({
            success: true,
            update,
        });
    } catch (error) {
        console.error(
            "PUT daily update error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to update daily site update",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { updateId } = await params;

        const companyId = getCompanyId(user);

        const deleted = await deleteDailyUpdate(
            updateId,
            companyId
        );

        if (!deleted) {
            return NextResponse.json(
                { error: "Daily update not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Daily update deleted successfully",
        });
    } catch (error) {
        console.error(
            "DELETE daily update error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to delete daily site update",
            },
            { status: 500 }
        );
    }
}