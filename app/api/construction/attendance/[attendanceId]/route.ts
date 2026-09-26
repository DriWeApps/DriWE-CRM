import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
} from "@/services/construction-attendance.service";

type RouteContext = {
    params: Promise<{
        attendanceId: string;
    }>;
};

type ConstructionUser = {
    userId: string;
    employeeId?: string;
    email: string;
    name?: string;
    role?: string;
    pageAccess?: string[];
    portal?: "crm" | "construction" | "both";
    companyId?: string;
};

type AttendanceStatus =
    | "Present"
    | "Absent"
    | "Half Day";

// ============================================================
// GET - Get Attendance Record by ID
// ============================================================

export async function GET(
    req: Request,
    context: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { attendanceId } = await context.params;

        if (!attendanceId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Attendance ID is required",
                },
                { status: 400 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        const attendance =
            await getAttendanceById(
                attendanceId,
                companyId
            );

        if (!attendance) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Attendance record not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            attendance,
        });
    } catch (error) {
        console.error(
            "GET /api/construction/attendance/[attendanceId] error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch attendance record",
            },
            { status: 500 }
        );
    }
}

// ============================================================
// PUT - Update Attendance Record
// ============================================================

export async function PUT(
    req: Request,
    context: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { attendanceId } = await context.params;

        if (!attendanceId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Attendance ID is required",
                },
                { status: 400 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        // ----------------------------------------------------
        // Get existing attendance
        // ----------------------------------------------------

        const existingAttendance =
            await getAttendanceById(
                attendanceId,
                companyId
            );

        if (!existingAttendance) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Attendance record not found",
                },
                { status: 404 }
            );
        }

        // ----------------------------------------------------
        // Read body
        // ----------------------------------------------------

        const body = await req.json();

        // ----------------------------------------------------
        // Allowed fields
        // ----------------------------------------------------

        const date =
            body.date !== undefined
                ? String(body.date).trim()
                : existingAttendance.date;

        const status =
            body.status !== undefined
                ? String(body.status).trim()
                : existingAttendance.status;

        const remarks =
            body.remarks !== undefined
                ? String(body.remarks).trim()
                : existingAttendance.remarks || "";

        // ----------------------------------------------------
        // Validate date
        // ----------------------------------------------------

        if (!date) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Attendance date is required",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------------------
        // Validate date format
        // ----------------------------------------------------

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid date format. Use YYYY-MM-DD",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------------------
        // Validate status
        // ----------------------------------------------------

        const validStatuses: AttendanceStatus[] = [
            "Present",
            "Absent",
            "Half Day",
        ];

        if (
            !validStatuses.includes(
                status as AttendanceStatus
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid attendance status. Use Present, Absent or Half Day.",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------------------
        // Update attendance
        //
        // Project, site and worker relationships are NOT
        // changed here.
        //
        // This keeps the attendance record attached to the
        // original worker/site/project.
        // ----------------------------------------------------

        const updatedAttendance =
            await updateAttendance(
                attendanceId,
                companyId,
                {
                    date,
                    status:
                        status as AttendanceStatus,
                    remarks,
                }
            );

        if (!updatedAttendance) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Failed to update attendance record",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Attendance updated successfully",
            attendance: updatedAttendance,
        });
    } catch (error) {
        console.error(
            "PUT /api/construction/attendance/[attendanceId] error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to update attendance record",
            },
            { status: 500 }
        );
    }
}

// ============================================================
// DELETE - Delete Attendance Record
// ============================================================

export async function DELETE(
    req: Request,
    context: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { attendanceId } = await context.params;

        if (!attendanceId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Attendance ID is required",
                },
                { status: 400 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        // ----------------------------------------------------
        // Check attendance exists
        // ----------------------------------------------------

        const existingAttendance =
            await getAttendanceById(
                attendanceId,
                companyId
            );

        if (!existingAttendance) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Attendance record not found",
                },
                { status: 404 }
            );
        }

        // ----------------------------------------------------
        // Delete attendance
        // ----------------------------------------------------

        const deleted =
            await deleteAttendance(
                attendanceId,
                companyId
            );

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Failed to delete attendance record",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Attendance deleted successfully",
            attendanceId,
        });
    } catch (error) {
        console.error(
            "DELETE /api/construction/attendance/[attendanceId] error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Failed to delete attendance record",
            },
            { status: 500 }
        );
    }
}