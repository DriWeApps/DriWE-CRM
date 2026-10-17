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
 * Admins can access any project in their company.
 * Project managers can access only projects assigned to them.
 */
async function getAuthorizedProject(
    user: ConstructionUser,
    projectId: string
): Promise<AssignedProject | null> {
    if (!isAdmin(user) && !isProjectManager(user)) {
        return null;
    }

    const project = await getProjectById(
        projectId,
        getCompanyId(user)
    );

    if (!project) {
        return null;
    }

    const assignedProject = project as AssignedProject;

    if (
        isProjectManager(user) &&
        assignedProject.projectManagerUserId !== user.userId
    ) {
        return null;
    }

    return assignedProject;
}

/**
 * Resolve the logged-in worker's worker record.
 *
 * This supports setups where employeeId equals workerId,
 * or where userId equals workerId.
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

/**
 * GET:
 * Admin: company-wide attendance, or filtered by project/worker.
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

        // Workers can never query another worker or project.
        if (isWorker(user)) {
            const worker = await getLoggedInWorker(user);

            if (!worker) {
                return notFound(
                    "Your worker account could not be found. Please contact your administrator."
                );
            }

            attendance = await getAttendanceByWorker(
                worker.workerId,
                companyId
            );

            // Ignore all requested IDs and enforce ownership.
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
                    companyId
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
                    companyId
                );

                attendance = attendance.filter(
                    (record) =>
                        record.projectId === project.projectId
                );
            } else {
                attendance = await getAttendanceByProject(
                    project.projectId,
                    companyId
                );
            }
        } else if (requestedWorkerId) {
            const worker = await getWorkerById(
                requestedWorkerId,
                companyId
            );

            if (!worker) {
                return notFound("Worker not found.");
            }

            if (isProjectManager(user)) {
                const project = await getAuthorizedProject(
                    user,
                    worker.projectId
                );

                if (!project) {
                    return forbidden();
                }
            }

            attendance = await getAttendanceByWorker(
                worker.workerId,
                companyId
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
                        companyId
                    )
                )
            );

            attendance = records.flat();
        } else {
            attendance = await getAttendance(companyId);
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
 * Admin: can mark attendance for any project in their company.
 * Project manager: can mark attendance only for assigned projects.
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

        const companyId = getCompanyId(user);
        const body = await req.json();

            if (Array.isArray(body?.records)) {
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

                if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    return badRequest("Invalid attendance date. Use YYYY-MM-DD.");
                }

                const parsedDate = new Date(`${date}T00:00:00.000Z`);
                if (
                    Number.isNaN(parsedDate.getTime()) ||
                    parsedDate.toISOString().slice(0, 10) !== date
                ) {
                    return badRequest("Invalid attendance date.");
                }

                const project = await getAuthorizedProject(user, projectId);
                if (!project) {
                    return forbidden();
                }

                const validStatuses: AttendanceStatus[] = [
                    "Present",
                    "Absent",
                    "Half Day",
                ];
                const submittedRecords = body.records as unknown[];

                if (submittedRecords.length === 0) {
                    return badRequest("At least one worker attendance record is required.");
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
                    const recordWorkerId =
                        typeof recordData.workerId === "string"
                            ? recordData.workerId.trim()
                            : "";
                    const status = recordData.status;

                    if (!recordWorkerId) {
                        return badRequest("Worker is required for each attendance record.");
                    }

                    if (workerIds.has(recordWorkerId)) {
                        return badRequest("A worker can appear only once in an attendance submission.");
                    }
                    workerIds.add(recordWorkerId);

                    if (
                        typeof status !== "string" ||
                        !validStatuses.includes(status as AttendanceStatus)
                    ) {
                        return badRequest("Invalid attendance status.");
                    }

                    const worker = await getWorkerById(recordWorkerId, companyId);
                    if (!worker) {
                        return notFound("Worker not found.");
                    }

                    if (worker.projectId !== project.projectId) {
                        return badRequest(
                            "A selected worker does not belong to this project."
                        );
                    }

                    recordsToCreate.push({
                        companyId,
                        projectId: project.projectId,
                        projectName: project.projectName,
                        workerId: worker.workerId,
                        workerName: worker.name,
                        date,
                        status: status as AttendanceStatus,
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
                        message: "Attendance saved successfully.",
                        attendance: attendanceRecords,
                        count: attendanceRecords.length,
                    },
                    { status: 201 }
                );
            }

        const projectId =
            typeof body.projectId === "string"
                ? body.projectId.trim()
                : "";

        const workerId =
            typeof body.workerId === "string"
                ? body.workerId.trim()
                : "";

        const date =
            typeof body.date === "string"
                ? body.date.trim()
                : "";

        const status =
            typeof body.status === "string"
                ? body.status.trim()
                : "";

        const remarks =
            typeof body.remarks === "string"
                ? body.remarks.trim()
                : "";

        if (!projectId) {
            return badRequest("Project is required.");
        }

        if (!workerId) {
            return badRequest("Worker is required.");
        }

        if (!date) {
            return badRequest("Attendance date is required.");
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return badRequest(
                "Invalid date format. Use YYYY-MM-DD."
            );
        }

        const parsedDate = new Date(`${date}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== date
        ) {
            return badRequest("Invalid attendance date.");
        }

        const validStatuses: AttendanceStatus[] = [
            "Present",
            "Absent",
            "Half Day",
        ];

        if (!validStatuses.includes(status as AttendanceStatus)) {
            return badRequest(
                "Invalid attendance status. Use Present, Absent or Half Day."
            );
        }

        const project = await getAuthorizedProject(
            user,
            projectId
        );

        if (!project) {
            return forbidden();
        }

        const worker = await getWorkerById(
            workerId,
            companyId
        );

        if (!worker) {
            return notFound("Worker not found.");
        }

        if (worker.projectId !== project.projectId) {
            return badRequest(
                "The selected worker does not belong to the selected project."
            );
        }

        const attendance = await createAttendance({
            companyId,
            projectId: project.projectId,
            projectName: project.projectName,
            workerId: worker.workerId,
            workerName: worker.name,
            date,
            status: status as AttendanceStatus,
            remarks,
            createdBy: user.userId,
            createdByName: user.name || user.email,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Attendance marked successfully.",
                attendance,
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