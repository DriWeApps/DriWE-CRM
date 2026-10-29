
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

import {
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject,
} from "@/services/construction-project.service";

import type { ProjectStatus } from "@/types/construction";

type RouteContext = {
    params: Promise<{
        projectId: string;
    }>;
};

type AuthUser = {
    userId: string;
    email?: string;
    role?: string;
    companyId?: string;
};

type ProjectRecord = {
    projectId: string;
    companyId: string;
    createdBy?: string;
    projectManagerUserId?: string;
    projectName?: string;
    location?: string;
    startDate?: string;
    expectedCompletion?: string;
    status?: ProjectStatus;
    [key: string]: unknown;
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

function forbidden(message: string) {
    return NextResponse.json(
        { success: false, message },
        { status: 403 }
    );
}

async function findProject(
    projectId: string,
    user: AuthUser
): Promise<ProjectRecord | null> {
    if (isConstructionAdmin(user)) {
        const projects = await getAllProjects();

        return (
            (projects.find(
                (project) => project.projectId === projectId
            ) as ProjectRecord | undefined) ?? null
        );
    }

    const project = await getProjectById(
        projectId,
        getCompanyId(user)
    );

    return (project as ProjectRecord | null) ?? null;
}

export async function GET(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const authUser = user as AuthUser;
        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project ID is required.",
                },
                { status: 400 }
            );
        }

        const project = await findProject(projectId, authUser);

        if (!project) {
            return NextResponse.json(
                { success: false, message: "Project not found." },
                { status: 404 }
            );
        }

        const admin = isConstructionAdmin(authUser);
        const manager = isProjectManager(authUser);

        if (!admin && manager) {
            if (project.projectManagerUserId !== authUser.userId) {
                return forbidden(
                    "You can only view projects assigned to you."
                );
            }
        } else if (!admin) {
            if (project.createdBy !== authUser.userId) {
                return forbidden(
                    "You can only view projects created by you."
                );
            }
        }

        return NextResponse.json({
            success: true,
            project,
        });
    } catch (error) {
        console.error("GET construction project error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch project.",
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
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const authUser = user as AuthUser;
        const admin = isConstructionAdmin(authUser);
        const manager = isProjectManager(authUser);
        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project ID is required.",
                },
                { status: 400 }
            );
        }

        const existingProject = await findProject(
            projectId,
            authUser
        );

        if (!existingProject) {
            return NextResponse.json(
                { success: false, message: "Project not found." },
                { status: 404 }
            );
        }

        if (
            !admin &&
            (manager || existingProject.createdBy !== authUser.userId)
        ) {
            return forbidden(
                "Only the Construction Admin or the builder who created this project can edit it."
            );
        }

        const body = await req.json();

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid project details.",
                },
                { status: 400 }
            );
        }

        const projectName =
            typeof body.projectName === "string"
                ? body.projectName.trim()
                : String(existingProject.projectName ?? "");

        const location =
            typeof body.location === "string"
                ? body.location.trim()
                : String(existingProject.location ?? "");

        const startDate =
            typeof body.startDate === "string"
                ? body.startDate.trim()
                : String(existingProject.startDate ?? "");

        const expectedCompletion =
            typeof body.expectedCompletion === "string"
                ? body.expectedCompletion.trim()
                : String(existingProject.expectedCompletion ?? "");

        const status =
            body.status !== undefined
                ? body.status
                : existingProject.status;

        if (
            !projectName ||
            !location ||
            !startDate ||
            !expectedCompletion
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project name, location, start date and expected completion are required.",
                },
                { status: 400 }
            );
        }

        if (
            typeof status !== "string" ||
            !validStatuses.includes(status as ProjectStatus)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid project status." },
                { status: 400 }
            );
        }

        const updatedProject = await updateProject(
            projectId,
            existingProject.companyId,
            {
                projectName,
                location,
                projectManager:
                    typeof existingProject.projectManager === "string"
                        ? existingProject.projectManager
                        : undefined,
                projectManagerName:
                    typeof existingProject.projectManagerName === "string"
                        ? existingProject.projectManagerName
                        : undefined,
                projectManagerUserId:
                    typeof existingProject.projectManagerUserId === "string"
                        ? existingProject.projectManagerUserId
                        : undefined,
                projectManagerEmail:
                    typeof existingProject.projectManagerEmail === "string"
                        ? existingProject.projectManagerEmail
                        : undefined,
                siteSupervisor:
                    typeof existingProject.siteSupervisor === "string"
                        ? existingProject.siteSupervisor
                        : undefined,
                siteSupervisorName:
                    typeof existingProject.siteSupervisorName === "string"
                        ? existingProject.siteSupervisorName
                        : undefined,
                startDate,
                expectedCompletion,
                status: status as ProjectStatus,
                description:
                    body.description !== undefined
                        ? body.description
                        : existingProject.description,
            }
        );

        if (!updatedProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project could not be updated.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Project updated successfully.",
            project: updatedProject,
        });
    } catch (error) {
        console.error("PUT construction project error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update project.",
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
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const authUser = user as AuthUser;

        if (!isConstructionAdmin(authUser)) {
            return forbidden(
                "Only a Construction Admin can delete projects."
            );
        }

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project ID is required.",
                },
                { status: 400 }
            );
        }

        const existingProject = await findProject(
            projectId,
            authUser
        );

        if (!existingProject) {
            return NextResponse.json(
                { success: false, message: "Project not found." },
                { status: 404 }
            );
        }

        const deleted = await deleteProject(
            projectId,
            existingProject.companyId
        );

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project could not be deleted.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Project deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE construction project error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete project.",
            },
            { status: 500 }
        );
    }
}
