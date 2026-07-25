import { NextResponse } from "next/server";

import {
    getAppErrorById,
    updateAppError,
    deleteAppError,
} from "@/services/app-error.service";

import { getUserFromRequest } from "@/lib/auth";

interface Params {
    params: Promise<{
        errorId: string;
    }>;
}

/**
 * Check Admin / Manager
 */
function isAdminOrManager(user: any) {
    const role = String(user?.role || "").toUpperCase();

    return role === "ADMIN" || role === "MANAGER";
}

/**
 * GET APP ERROR
 */
export async function GET(
    req: Request,
    { params }: Params,
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        const { errorId } = await params;

        const error = await getAppErrorById(errorId);

        if (!error) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error not found.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            error,
        });
    } catch (error) {
        console.error("GET APP ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch error.",
            },
            {
                status: 500,
            },
        );
    }
}

/**
 * UPDATE APP ERROR
 */
export async function PUT(
    req: Request,
    { params }: Params,
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        const { errorId } = await params;

        const oldError = await getAppErrorById(errorId);

        if (!oldError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error not found.",
                },
                {
                    status: 404,
                },
            );
        }

        const body = await req.json();

        const adminOrManager = isAdminOrManager(user);

        const currentUserId =
            user.employeeId || user.userId;

        const isOwner =
            oldError.reportedBy === currentUserId;

        if (!adminOrManager && !isOwner) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You can edit only errors reported by you.",
                },
                {
                    status: 403,
                }
            );
        }

        const updateData: any = {
            module: body.module,
            errorTitle: body.errorTitle,
            occurredError: body.occurredError,
            expectedError: body.expectedError,
        };





        if (body.status !== undefined) {
            updateData.status = body.status;
        }

        console.log("UPDATE DATA:", updateData);

        const updatedError = await updateAppError(
            errorId,
            updateData
        );

        return NextResponse.json({
            success: true,
            message: "Error updated successfully.",
            error: updatedError,
        });



    } catch (error) {
        console.error("UPDATE APP ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update error.",
            },
            {
                status: 500,
            },
        );
    }
}

/**
 * DELETE APP ERROR
 *
 * ONLY ADMIN / MANAGER
 */
export async function DELETE(
    req: Request,
    { params }: Params,
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        if (!isAdminOrManager(user)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only Admin or Manager can delete errors.",
                },
                {
                    status: 403,
                },
            );
        }

        const { errorId } = await params;

        const existingError =
            await getAppErrorById(errorId);

        if (!existingError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error not found.",
                },
                {
                    status: 404,
                },
            );
        }

        await deleteAppError(errorId);

        return NextResponse.json({
            success: true,
            message: "Error deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE APP ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete error.",
            },
            {
                status: 500,
            },
        );
    }
}