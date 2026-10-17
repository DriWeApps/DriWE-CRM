
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
} from "@/services/construction-attendance.service";
import { getProjectById } from "@/services/construction-project.service";
import type { AttendanceStatus } from "@/types/construction";

type ConstructionUser = {
    userId: string;
    employeeId?: string;
    email: string;
    name?: string;
    role?: string;
    companyId?: string;
};

type AssignedProject = {
    projectId: string;
    projectManagerUserId?: string;
};

type RouteContext = {
    params: Promise<{ attendanceId: string }>;
};

function roleOf(user: ConstructionUser) {
    return user.role?.trim().toLowerCase() ?? "";
}

function isAdmin(user: ConstructionUser) {
    return ["admin", "constructionadmin"].includes(roleOf(user));
}

function isManager(user: ConstructionUser) {
    return roleOf(user) === "constructionprojectmanager";
}

function companyOf(user: ConstructionUser) {
    return user.companyId || user.userId;
}

function unauthorized() {
    return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
    );
}

function forbidden() {
    return NextResponse.json(
        { success: false, message: "You do not have permission to modify this attendance." },
        { status: 403 }
    );
}

function notFound() {
    return NextResponse.json(
        { success: false, message: "Attendance record not found." },
        { status: 404 }
    );
}

function badRequest(message: string) {
    return NextResponse.json(
        { success: false, message },
        { status: 400 }
    );
}

async function authorizeAttendance(
    user: ConstructionUser,
    attendanceId: string
) {
    if (!isAdmin(user) && !isManager(user)) {
        return { response: forbidden() };
    }

    const companyId = companyOf(user);
    const attendance = await getAttendanceById(
        attendanceId,
        companyId
    );

    if (!attendance) {
        return { response: notFound() };
    }

    if (isManager(user)) {
        const project = await getProjectById(
            attendance.projectId,
            companyId
        );

        if (
            !project ||
            (project as AssignedProject).projectManagerUserId !== user.userId
        ) {
            return { response: forbidden() };
        }
    }

    return { attendance, companyId };
}

function isValidDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
    );
}

const validStatuses: AttendanceStatus[] = [
    "Present",
    "Absent",
    "Half Day",
];

export async function PUT(
    req: Request,
    context: RouteContext
) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) return unauthorized();

        const { attendanceId } = await context.params;
        const authorization = await authorizeAttendance(
            user,
            attendanceId
        );

        if ("response" in authorization) {
            return authorization.response;
        }

        const body = await req.json();
        const update: Partial<{
            date: string;
            status: AttendanceStatus;
            remarks: string;
        }> = {};

        if (body.date !== undefined) {
            if (
                typeof body.date !== "string" ||
                !isValidDate(body.date.trim())
            ) {
                return badRequest(
                    "Invalid attendance date. Use YYYY-MM-DD."
                );
            }

            update.date = body.date.trim();
        }

        if (body.status !== undefined) {
            if (
                typeof body.status !== "string" ||
                !validStatuses.includes(body.status as AttendanceStatus)
            ) {
                return badRequest(
                    "Invalid status. Use Present, Absent or Half Day."
                );
            }

            update.status = body.status as AttendanceStatus;
        }

        if (body.remarks !== undefined) {
            if (typeof body.remarks !== "string") {
                return badRequest("Remarks must be a string.");
            }

            update.remarks = body.remarks.trim();
        }

        if (Object.keys(update).length === 0) {
            return badRequest(
                "Provide at least one field to update: date, status or remarks."
            );
        }

        const attendance = await updateAttendance(
            attendanceId,
            authorization.companyId,
            update
        );

        if (!attendance) return notFound();

        return NextResponse.json({
            success: true,
            message: "Attendance updated successfully.",
            attendance,
        });
    } catch (error) {
        console.error(
            "PUT /api/construction/attendance/[attendanceId] error:",
            error
        );

        return NextResponse.json(
            { success: false, message: "Failed to update attendance." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    context: RouteContext
) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) return unauthorized();

        const { attendanceId } = await context.params;
        const authorization = await authorizeAttendance(
            user,
            attendanceId
        );

        if ("response" in authorization) {
            return authorization.response;
        }

        const deleted = await deleteAttendance(
            attendanceId,
            authorization.companyId
        );

        if (!deleted) return notFound();

        return NextResponse.json({
            success: true,
            message: "Attendance deleted successfully.",
        });
    } catch (error) {
        console.error(
            "DELETE /api/construction/attendance/[attendanceId] error:",
            error
        );

        return NextResponse.json(
            { success: false, message: "Failed to delete attendance." },
            { status: 500 }
        );
    }
}
