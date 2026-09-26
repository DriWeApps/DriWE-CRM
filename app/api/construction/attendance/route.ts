import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

import {
    getAttendance,
    getAttendanceByProject,
    getAttendanceBySite,
    getAttendanceByWorker,
    createAttendance,
} from "@/services/construction-attendance.service";

import { getProjectById } from "@/services/construction-project.service";
import { getSiteById } from "@/services/construction-site.service";
import { getWorkerById } from "@/services/construction-worker.service";

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

// ============================================================
// GET
//
// Supported:
//
// GET /api/construction/attendance
//
// GET /api/construction/attendance?projectId=PROJECT_ID
//
// GET /api/construction/attendance?siteId=SITE_ID
//
// GET /api/construction/attendance?workerId=WORKER_ID
// ============================================================

export async function GET(req: Request) {
    try {
        // ----------------------------------------------------
        // Authentication
        // ----------------------------------------------------

        const user =
            await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        // ----------------------------------------------------
        // Query parameters
        // ----------------------------------------------------

        const { searchParams } =
            new URL(req.url);

        const projectId =
            searchParams.get("projectId");

        const siteId =
            searchParams.get("siteId");

        const workerId =
            searchParams.get("workerId");

        let attendance;

        // ----------------------------------------------------
        // Filter by Worker
        // ----------------------------------------------------

        if (workerId) {
            const worker =
                await getWorkerById(
                    workerId,
                    companyId
                );

            if (!worker) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Worker not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            attendance =
                await getAttendanceByWorker(
                    workerId,
                    companyId
                );
        }

        // ----------------------------------------------------
        // Filter by Site
        // ----------------------------------------------------

        else if (siteId) {
            const site =
                await getSiteById(
                    siteId,
                    companyId
                );

            if (!site) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Site not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            attendance =
                await getAttendanceBySite(
                    siteId,
                    companyId
                );
        }

        // ----------------------------------------------------
        // Filter by Project
        // ----------------------------------------------------

        else if (projectId) {
            const project =
                await getProjectById(
                    projectId,
                    companyId
                );

            if (!project) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Project not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            attendance =
                await getAttendanceByProject(
                    projectId,
                    companyId
                );
        }

        // ----------------------------------------------------
        // Get all company attendance
        // ----------------------------------------------------

        else {
            attendance =
                await getAttendance(
                    companyId
                );
        }

        // ----------------------------------------------------
        // Sort newest date first
        // ----------------------------------------------------

        attendance.sort(
            (a, b) => {
                const dateA =
                    new Date(
                        a.date
                    ).getTime();

                const dateB =
                    new Date(
                        b.date
                    ).getTime();

                if (
                    dateA !==
                    dateB
                ) {
                    return (
                        dateB -
                        dateA
                    );
                }

                return (
                    new Date(
                        b.createdAt
                    ).getTime() -
                    new Date(
                        a.createdAt
                    ).getTime()
                );
            }
        );

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

        return NextResponse.json(
            {
                success: false,
                error:
                    "Failed to fetch attendance",
            },
            {
                status: 500,
            }
        );
    }
}

// ============================================================
// POST
//
// Expected body:
//
// {
//   "projectId": "PROJECT_ID",
//   "projectName": "ABC Project",
//   "siteId": "SITE_ID",
//   "siteName": "Main Site",
//   "workerId": "WORKER_ID",
//   "workerName": "Rahul",
//   "date": "2026-09-24",
//   "status": "Present",
//   "remarks": "On site"
// }
// ============================================================

export async function POST(req: Request) {
    try {
        // ----------------------------------------------------
        // Authentication
        // ----------------------------------------------------

        const user =
            await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        // ----------------------------------------------------
        // Read request body
        // ----------------------------------------------------

        const body =
            await req.json();

        const projectId =
            String(
                body.projectId || ""
            ).trim();

        const siteId =
            String(
                body.siteId || ""
            ).trim();

        const workerId =
            String(
                body.workerId || ""
            ).trim();

        const date =
            String(
                body.date || ""
            ).trim();

        const status =
            String(
                body.status || ""
            ).trim();

        const remarks =
            body.remarks !== undefined
                ? String(
                      body.remarks
                  ).trim()
                : "";

        // ----------------------------------------------------
        // Validate required fields
        // ----------------------------------------------------

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Project is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Site is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!workerId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Worker is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!date) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Attendance date is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!status) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Attendance status is required",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------------------
        // Validate date
        // ----------------------------------------------------

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                date
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid date format. Use YYYY-MM-DD",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------------------
        // Validate attendance status
        // ----------------------------------------------------

        const validStatuses: AttendanceStatus[] =
            [
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
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------------------
        // Verify Project
        // ----------------------------------------------------

        const project =
            await getProjectById(
                projectId,
                companyId
            );

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Project not found",
                },
                {
                    status: 404,
                }
            );
        }

        // ----------------------------------------------------
        // Verify Site
        // ----------------------------------------------------

        const site =
            await getSiteById(
                siteId,
                companyId
            );

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Site not found",
                },
                {
                    status: 404,
                }
            );
        }

        // ----------------------------------------------------
        // Make sure site belongs to selected project
        // ----------------------------------------------------

        if (
            site.projectId !==
            projectId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Selected site does not belong to the selected project",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------------------
        // Verify Worker
        // ----------------------------------------------------

        const worker =
            await getWorkerById(
                workerId,
                companyId
            );

        if (!worker) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Worker not found",
                },
                {
                    status: 404,
                }
            );
        }

        // ----------------------------------------------------
        // Make sure worker belongs to selected site
        // ----------------------------------------------------

        if (
            worker.siteId !==
            siteId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Selected worker does not belong to the selected site",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------------------
        // Make sure worker belongs to selected project
        // ----------------------------------------------------

        if (
            worker.projectId !==
            projectId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Selected worker does not belong to the selected project",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------------------
        // Create attendance
        // ----------------------------------------------------

        const attendance =
            await createAttendance({
                companyId,

                projectId:
                    project.projectId,

                projectName:
                    project.projectName,

                siteId:
                    site.siteId,

                siteName:
                    site.siteName,

                workerId:
                    worker.workerId,

                workerName:
                    worker.name,

                date,

                status:
                    status as AttendanceStatus,

                remarks,

                createdBy:
                    constructionUser.userId,

                createdByName:
                    constructionUser.name ||
                    constructionUser.email,
            });

        return NextResponse.json(
            {
                success: true,
                message:
                    "Attendance marked successfully",
                attendance,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "POST /api/construction/attendance error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Failed to create attendance",
            },
            {
                status: 500,
            }
        );
    }
}