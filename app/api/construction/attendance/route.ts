
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

import {
    getAttendance,
    getAttendanceByProject,
    getAttendanceByWorker,
    createAttendance,
} from "@/services/construction-attendance.service";

import {
    getProjectById,
    getProjects,
    getAllProjects,
} from "@/services/construction-project.service";

import {
    getWorkerById,
} from "@/services/construction-worker.service";

import type { AttendanceStatus } from "@/types/construction";

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

type AssignedProject = {
    projectId: string;
    projectName: string;
    companyId: string;
    projectManagerUserId?: string;
};

function normalizedRole(user: ConstructionUser) {
    return user.role?.trim().toLowerCase() ?? "";
}

function isAdmin(user: ConstructionUser) {
    return ["admin", "constructionadmin"].includes(
        normalizedRole(user)
    );
}

function isProjectManager(user: ConstructionUser) {
    return normalizedRole(user) === "constructionprojectmanager";
}

function isWorker(user: ConstructionUser) {
    return normalizedRole(user) === "constructionemployee";
}

function getCompanyId(user: ConstructionUser) {
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
        {
            success: false,
            message: "You do not have permission to access this attendance.",
        },
        { status: 403 }
    );
}

function badRequest(message: string) {
    return NextResponse.json(
        { success: false, message },
        { status: 400 }
    );
}

function notFound(message: string) {
    return NextResponse.json(
        { success: false, message },
        { status: 404 }
    );
}

function serverError(message: string) {
    return NextResponse.json(
        { success: false, message },
        { status: 500 }
    );
}

/**
 * Admins can access any construction project.
 * Project managers can access only their assigned projects
 * within their own company.
 */
async function getAuthorizedProject(
    user: ConstructionUser,
    projectId: string
): Promise<AssignedProject | null> {
    if (!isAdmin(user) && !isProjectManager(user)) {
        return null;
    }

    let project: AssignedProject | undefined;

    if (isAdmin(user)) {
        const projects = await getAllProjects();

        project = (projects as AssignedProject[]).find(
            (item) => item.projectId === projectId
        );
    } else {
        const foundProject = await getProjectById(
            projectId,
            getCompanyId(user)
        );

        project = foundProject as AssignedProject | undefined;
    }

    if (!project || !project.companyId) {
        return null;
    }

    if (
        isProjectManager(user) &&
        project.projectManagerUserId !== user.userId
    ) {
        return null;
    }

    return project;
}

/**
 * Resolve the logged-in worker's record.
 */
async function getLoggedInWorker(user: ConstructionUser) {
    const companyId = getCompanyId(user);

    const possibleIds = [
        user.employeeId,
        user.userId,
    ].filter((id): id is string => Boolean(id));

    for (const workerId of [...new Set(possibleIds)]) {
        const worker = await getWorkerById(workerId, companyId);

        if (worker && worker.userId === user.userId) {
            return worker;
        }
    }

    return null;
}

function sortAttendance<
    T extends { date: string; createdAt: string }
>(records: T[]) {
    return records.sort((a, b) => {
        const dateDifference =
            new Date(b.date).getTime() -
            new Date(a.date).getTime();

        if (dateDifference !== 0) {
            return dateDifference;
        }

        return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    });
}

function validDate(date: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
    );
}

const VALID_STATUSES: AttendanceStatus[] = [
    "Present",
    "Absent",
    "Half Day",
];

/**
 * GET:
 * Admin: attendance across all companies, optionally filtered by project/worker.
 * Project manager: attendance for assigned projects only.
 * Worker: their own attendance only.
 */
export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) {
            return unauthorized();
        }

        if (
            !isAdmin(user) &&
            !isProjectManager(user) &&
            !isWorker(user)
        ) {
            return forbidden();
        }

        const companyId = getCompanyId(user);
        const { searchParams } = new URL(req.url);

        const requestedProjectId =
            searchParams.get("projectId")?.trim();

        const requestedWorkerId =
            searchParams.get("workerId")?.trim();

        let attendance: Awaited<
            ReturnType<typeof getAttendance>
        > = [];

        if (isWorker(user)) {
            const worker = await getLoggedInWorker(user);

            if (!worker) {
                return notFound(
                    "Your worker account could not be found. Please contact your administrator."
                );
            }

            attendance = await getAttendanceByWorker(
                worker.workerId,
                worker.companyId
            );

            attendance = attendance.filter(
                (record) => record.workerId === worker.workerId
            );
        } else if (requestedProjectId) {
            const project = await getAuthorizedProject(
                user,
                requestedProjectId
            );

            if (!project) {
                return forbidden();
            }

            if (requestedWorkerId) {
                const worker = await getWorkerById(
                    requestedWorkerId,
                    project.companyId
                );

                if (!worker) {
                    return notFound("Worker not found.");
                }

                if (worker.projectId !== project.projectId) {
                    return badRequest(
                        "The selected worker does not belong to this project."
                    );
                }

                attendance = await getAttendanceByWorker(
                    worker.workerId,
                    project.companyId
                );

                attendance = attendance.filter(
                    (record) =>
                        record.projectId === project.projectId
                );
            } else {
                attendance = await getAttendanceByProject(
                    project.projectId,
                    project.companyId
                );
            }
        } else if (requestedWorkerId) {
            let worker = null;

            if (isAdmin(user)) {
                // Resolve worker across companies, then use its actual company.
                const allProjects = await getAllProjects();

                for (const project of allProjects as AssignedProject[]) {
                    worker = await getWorkerById(
                        requestedWorkerId,
                        project.companyId
                    );

                    if (worker) {
                        break;
                    }
                }
            } else {
                worker = await getWorkerById(
                    requestedWorkerId,
                    companyId
                );
            }

            if (!worker) {
                return notFound("Worker not found.");
            }

            if (isProjectManager(user)) {
                const project = await getAuthorizedProject(
                    user,
                    worker.projectId
                );

                if (!project || project.companyId !== worker.companyId) {
                    return forbidden();
                }
            }

            attendance = await getAttendanceByWorker(
                worker.workerId,
                worker.companyId
            );
        } else if (isProjectManager(user)) {
            const projects = await getProjects(companyId);

            const assignedProjects = (
                projects as AssignedProject[]
            ).filter(
                (project) =>
                    project.projectManagerUserId === user.userId
            );

            const records = await Promise.all(
                assignedProjects.map((project) =>
                    getAttendanceByProject(
                        project.projectId,
                        project.companyId
                    )
                )
            );

            attendance = records.flat();
        } else if (isAdmin(user)) {
            const projects = await getAllProjects();

            const records = await Promise.all(
                (projects as AssignedProject[]).map((project) =>
                    getAttendanceByProject(
                        project.projectId,
                        project.companyId
                    )
                )
            );

            attendance = records.flat();
        }

        sortAttendance(attendance);

        return NextResponse.json({
            success: true,
            attendance,
            count: attendance.length,
        });
    } catch (error) {
        console.error(
            "GET /api/construction/attendance error:",
            error
        );

        return serverError("Failed to fetch attendance.");
    }
}

/**
 * POST:
 * Admin: can mark attendance for any project.
 * Project manager: can mark attendance for assigned projects only.
 * Worker: cannot mark attendance.
 */
export async function POST(req: Request) {
    try {
        const user = await getUserFromRequest(req) as
            | ConstructionUser
            | null;

        if (!user) {
            return unauthorized();
        }

        if (!isAdmin(user) && !isProjectManager(user)) {
            return forbidden();
        }

        const body = await req.json();

        const isBulk = Array.isArray(body?.records);

        const projectId =
            typeof body.projectId === "string"
                ? body.projectId.trim()
                : "";

        const date =
            typeof body.date === "string"
                ? body.date.trim()
                : "";

        if (!projectId) {
            return badRequest("Project is required.");
        }

        if (!validDate(date)) {
            return badRequest(
                "Invalid attendance date. Use YYYY-MM-DD."
            );
        }

        const project = await getAuthorizedProject(
            user,
            projectId
        );

        if (!project) {
            return forbidden();
        }

        const submittedRecords: unknown[] = isBulk
            ? body.records
            : [body];

        if (submittedRecords.length === 0) {
            return badRequest(
                "At least one worker attendance record is required."
            );
        }

        const workerIds = new Set<string>();
        const recordsToCreate = [];

        for (const record of submittedRecords) {
            if (
                typeof record !== "object" ||
                record === null ||
                Array.isArray(record)
            ) {
                return badRequest("Invalid attendance record.");
            }

            const recordData = record as Record<string, unknown>;

            const workerId =
                typeof recordData.workerId === "string"
                    ? recordData.workerId.trim()
                    : "";

            const status = recordData.status;

            if (!workerId) {
                return badRequest(
                    "Worker is required for each attendance record."
                );
            }

            if (workerIds.has(workerId)) {
                return badRequest(
                    "A worker can appear only once in an attendance submission."
                );
            }

            workerIds.add(workerId);

            if (
                typeof status !== "string" ||
                !VALID_STATUSES.includes(status as AttendanceStatus)
            ) {
                return badRequest(
                    "Invalid attendance status. Use Present, Absent or Half Day."
                );
            }

            const worker = await getWorkerById(
                workerId,
                project.companyId
            );

            if (!worker) {
                return notFound("Worker not found.");
            }

            if (worker.projectId !== project.projectId) {
                return badRequest(
                    "A selected worker does not belong to this project."
                );
            }

          recordsToCreate.push({
    companyId: project.companyId,
    projectId: project.projectId,
    projectName: project.projectName,
                workerId: worker.workerId,
                workerName: worker.name,
                date,
                status: status as AttendanceStatus,
                ...(!isBulk && typeof recordData.remarks === "string"
                    ? { remarks: recordData.remarks.trim() }
                    : {}),
                createdBy: user.userId,
                createdByName: user.name || user.email,
            });
        }

        const attendanceRecords = await Promise.all(
            recordsToCreate.map((record) => createAttendance(record))
        );

        return NextResponse.json(
            {
                success: true,
                message: isBulk
                    ? "Attendance saved successfully."
                    : "Attendance marked successfully.",
                attendance: attendanceRecords,
                ...(isBulk ? { count: attendanceRecords.length } : {}),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "POST /api/construction/attendance error:",
            error
        );

        return serverError("Failed to create attendance.");
    }
}
