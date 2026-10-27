
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { getUserFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

import {
    createUser,
    getUserByEmail,
} from "@/services/auth.service";

import {
    createProject,
    deleteProject,
    getProjects,
    getAllProjects,
} from "@/services/construction-project.service";

import {
    createWorker,
    getWorkers,
    getWorkersByProject,
} from "@/services/construction-worker.service";

import type {
    ProjectStatus,
    WorkerType,
} from "@/types/construction";

type AuthUser = {
    userId: string;
    name?: string;
    email?: string;
    role?: string;
    companyId?: string;
};

function normalizeRole(role?: string) {
    return role?.trim().toLowerCase() ?? "";
}

function isConstructionAdmin(user: AuthUser) {
    const role = normalizeRole(user.role);
    const email = user.email?.trim().toLowerCase();

    return (
        role === "constructionadmin" ||
        (role === "admin" && email === "adminc@driwe.com")
    );
}

function isProjectManager(user: AuthUser) {
    return normalizeRole(user.role) === "constructionprojectmanager";
}

function isConstructionWorker(user: AuthUser) {
    return normalizeRole(user.role) === "constructionemployee";
}

function getCompanyId(user: AuthUser) {
    return user.companyId || user.userId;
}

const validStatuses: ProjectStatus[] = [
    "Planning",
    "Active",
    "On Hold",
    "Completed",
    "Cancelled",
];

const validWorkerTypes: WorkerType[] = [
    "Employee",
    "Contract Worker",
    "Daily Wage",
    "Subcontractor",
];

/**
 * GET /api/construction/projects
 *
 * Admin: all projects.
 * Project manager: projects assigned to them.
 * Construction employee: projects assigned to them.
 * Builder: projects created by their account.
 *
 * Each returned project includes workerCount.
 * Optional query: ?projectId=...
 */
export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const authUser = user as AuthUser;
        const admin = isConstructionAdmin(authUser);
        const manager = isProjectManager(authUser);
        const worker = isConstructionWorker(authUser);

        const url = new URL(req.url);
        const requestedProjectId = url.searchParams.get("projectId");

        let projects = admin
            ? await getAllProjects()
            : await getProjects(getCompanyId(authUser));

        if (admin) {
            // Admin can view all projects.
        } else if (manager) {
            projects = projects.filter(
                (project) =>
                    project.projectManagerUserId === authUser.userId
            );
        } else if (worker) {
            const assignedWorkers = await getWorkers(
                getCompanyId(authUser)
            );

            const assignedProjectIds = new Set(
                assignedWorkers
                    .filter(
                        (assignedWorker) =>
                            assignedWorker.userId === authUser.userId
                    )
                    .map((assignedWorker) => assignedWorker.projectId)
            );

            projects = projects.filter((project) =>
                assignedProjectIds.has(project.projectId)
            );
        } else {
            projects = projects.filter(
                (project) => project.createdBy === authUser.userId
            );
        }

        if (requestedProjectId) {
            projects = projects.filter(
                (project) => project.projectId === requestedProjectId
            );
        }

        // Fetch workers for each individual project.
        const projectsWithWorkerCounts = await Promise.all(
            projects.map(async (project) => {
                try {
                    const workers = await getWorkersByProject(
                        project.projectId,
                        project.companyId
                    );

                    return {
                        ...project,
                        workerCount: workers.length,
                    };
                } catch (error) {
                    console.error(
                        `Failed to fetch workers for project ${project.projectId}:`,
                        error
                    );

                    // Avoid failing the entire project list if one
                    // worker-count lookup fails.
                    return {
                        ...project,
                        workerCount: 0,
                    };
                }
            })
        );

        return NextResponse.json({
            success: true,
            projects: projectsWithWorkerCounts,
        });
    } catch (error) {
        console.error("GET construction projects error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch projects.",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/construction/projects
 *
 * Admin and builder accounts may create projects.
 * The server determines createdBy and companyId from the authenticated user.
 */
export async function POST(req: Request) {
    let createdProjectId: string | null = null;
    let createdCompanyId: string | null = null;
    let createdManagerUserId: string | null = null;

    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const authUser = user as AuthUser;

        if (
            isProjectManager(authUser) ||
            isConstructionWorker(authUser)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Project managers and construction employees cannot create projects.",
                },
                { status: 403 }
            );
        }

        const body = await req.json();
        const project = body.project ?? body;
        const workers = body.workers ?? [];

        if (
            !project ||
            typeof project !== "object" ||
            Array.isArray(project)
        ) {
            return NextResponse.json(
                { success: false, error: "Invalid project details." },
                { status: 400 }
            );
        }

        const projectName = String(project.projectName ?? "").trim();
        const location = String(project.location ?? "").trim();
        const startDate = String(project.startDate ?? "").trim();
        const expectedCompletion = String(
            project.expectedCompletion ?? ""
        ).trim();

        const projectManagerName = String(
            project.projectManagerName ?? ""
        ).trim();

        const managerEmail = String(
            project.projectManagerEmail ??
                project.managerEmail ??
                ""
        ).trim().toLowerCase();

        const managerPassword =
            project.projectManagerPassword ??
            project.managerPassword;

        const status = (
            project.status || "Planning"
        ) as ProjectStatus;

        if (
            !projectName ||
            !location ||
            !startDate ||
            !expectedCompletion
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Project name, location, start date and expected completion date are required.",
                },
                { status: 400 }
            );
        }

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: "Invalid project status." },
                { status: 400 }
            );
        }

        if (!projectManagerName) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Project manager name is required.",
                },
                { status: 400 }
            );
        }

        if (
            !managerEmail ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmail)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "A valid project manager email is required.",
                },
                { status: 400 }
            );
        }

        if (
            typeof managerPassword !== "string" ||
            managerPassword.length < 6
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Project manager password must be at least 6 characters.",
                },
                { status: 400 }
            );
        }

        if (!Array.isArray(workers)) {
            return NextResponse.json(
                { success: false, error: "Workers must be an array." },
                { status: 400 }
            );
        }

        const seenWorkerEmails = new Set<string>();

        for (const worker of workers) {
            if (!worker || typeof worker !== "object") {
                return NextResponse.json(
                    { success: false, error: "Invalid worker details." },
                    { status: 400 }
                );
            }

            const name = String(worker.name ?? "").trim();
            const phone = String(worker.phone ?? "").trim();
            const email = String(worker.email ?? "")
                .trim()
                .toLowerCase();

            const password = worker.password;
            const workerType = worker.workerType as WorkerType;
            const salary = Number(worker.salary);

            if (!name) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Every worker must have a name.",
                    },
                    { status: 400 }
                );
            }

            if (!/^\d{10}$/.test(phone)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Invalid phone number for worker ${name}.`,
                    },
                    { status: 400 }
                );
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Invalid email for worker ${name}.`,
                    },
                    { status: 400 }
                );
            }

            if (
                typeof password !== "string" ||
                password.length < 6
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            `Password for worker ${name} must be at least 6 characters.`,
                    },
                    { status: 400 }
                );
            }

            if (!validWorkerTypes.includes(workerType)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Invalid worker type for ${name}.`,
                    },
                    { status: 400 }
                );
            }

            if (!Number.isFinite(salary) || salary <= 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            `Salary for worker ${name} must be greater than zero.`,
                    },
                    { status: 400 }
                );
            }

            if (email === managerEmail) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "The project manager email cannot also be used for a worker account.",
                    },
                    { status: 400 }
                );
            }

            if (seenWorkerEmails.has(email)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Duplicate worker email: ${email}`,
                    },
                    { status: 400 }
                );
            }

            seenWorkerEmails.add(email);
        }

        const existingManager = await getUserByEmail(managerEmail);

        if (existingManager) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "An account already exists with the project manager email. Use a new email address.",
                },
                { status: 409 }
            );
        }

        for (const email of seenWorkerEmails) {
            const existingWorkerUser = await getUserByEmail(email);

            if (existingWorkerUser) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            `An account already exists for worker email ${email}.`,
                    },
                    { status: 409 }
                );
            }
        }

        const companyId = getCompanyId(authUser);
        createdCompanyId = companyId;

        const managerUserId = randomUUID();
        const managerEmployeeId = randomUUID();
        createdManagerUserId = managerUserId;

        const hashedManagerPassword =
            await hashPassword(managerPassword);

        await createUser({
            userId: managerUserId,
            employeeId: managerEmployeeId,
            companyId,
            name: projectManagerName,
            email: managerEmail,
            password: hashedManagerPassword,
            role: "ConstructionProjectManager",
            pageAccess: [],
            portal: "construction",
        });

        const createdProject = await createProject({
            companyId,
            projectName,
            location,
            projectManager: managerUserId,
            projectManagerName,
            projectManagerUserId: managerUserId,
            projectManagerEmail: managerEmail,
            startDate,
            expectedCompletion,
            status,
            description: project.description
                ? String(project.description).trim()
                : undefined,
            createdBy: authUser.userId,
            createdByName: authUser.name,
        });

        createdProjectId = createdProject.projectId;

        for (const worker of workers) {
            await createWorker({
                companyId,
                projectId: createdProject.projectId,
                projectName: createdProject.projectName,
                name: String(worker.name).trim(),
                phone: String(worker.phone).trim(),
                email: String(worker.email).trim().toLowerCase(),
                password: worker.password,
                workerType: worker.workerType,
                salary: Number(worker.salary),
                role: "ConstructionEmployee",
                active: true,
            });
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    "Project, project manager account and workers created successfully.",
                project: {
                    ...createdProject,
                    workerCount: workers.length,
                },
                projectManager: {
                    userId: managerUserId,
                    employeeId: managerEmployeeId,
                    name: projectManagerName,
                    email: managerEmail,
                    role: "ConstructionProjectManager",
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST construction projects error:", error);

        if (createdProjectId && createdCompanyId) {
            try {
                await deleteProject(
                    createdProjectId,
                    createdCompanyId
                );
            } catch (cleanupError) {
                console.error(
                    "Project cleanup failed:",
                    cleanupError
                );
            }
        }

        if (createdManagerUserId) {
            console.error(
                "A project manager account may need cleanup:",
                createdManagerUserId
            );
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create project.",
            },
            { status: 500 }
        );
    }
}
