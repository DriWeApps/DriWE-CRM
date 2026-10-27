
import { NextResponse } from "next/server";
import {
    getUserFromRequest,
} from "@/lib/auth";

import {
    getProjectById,
    getProjects,
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
    portal?: string;
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

function normalizeRole(role?: string): string {
    return role?.trim().toLowerCase() ?? "";
}

/**
 * Only the dedicated Construction Admin account receives
 * cross-company Construction Admin access.
 *
 * Other existing Construction Admin roles retain admin
 * permissions within the company resolved by this API.
 */
function isConstructionAdmin(user: AuthUser): boolean {
    const role = normalizeRole(user.role);
    const email = user.email?.trim().toLowerCase();

    return (
        (role === "admin" && email === "adminc@driwe.com") ||
        role === "constructionadmin"
    );
}

function isProjectManager(user: AuthUser): boolean {
    return normalizeRole(user.role) === "constructionprojectmanager";
}

function getCompanyId(user: AuthUser): string {
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

/**
 * Dedicated Construction Admin:
 * Search all projects and match the exact project ID.
 *
 * Other users:
 * Search only within their own company.
 */
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

/**
 * GET SINGLE PROJECT
 */
export async function GET(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "Project ID is required." },
                { status: 400 }
            );
        }

        const project = await findProject(projectId, user);

        if (!project) {
            return NextResponse.json(
                { success: false, message: "Project not found." },
                { status: 404 }
            );
        }

        const admin = isConstructionAdmin(user);
        const manager = isProjectManager(user);

        if (
            !admin &&
            manager &&
            project.projectManagerUserId !== user.userId
        ) {
            return forbidden(
                "You can only view projects assigned to you."
            );
        }

        if (
            !admin &&
            !manager &&
            project.createdBy !== user.userId
        ) {
            return forbidden(
                "You can only view projects created by you."
            );
        }

        return NextResponse.json({
            success: true,
            project,
        });
    } catch (error) {
        console.error("GET construction project error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch project." },
            { status: 500 }
        );
    }
}

/**
 * UPDATE PROJECT
 */
export async function PUT(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const admin = isConstructionAdmin(user);
        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "Project ID is required." },
                { status: 400 }
            );
        }

        const existingProject = await findProject(projectId, user);

        if (!existingProject) {
            return NextResponse.json(
                { success: false, message: "Project not found." },
                { status: 404 }
            );
        }

        if (
            !admin &&
            existingProject.createdBy !== user.userId
        ) {
            return forbidden(
                "You can only edit projects created by you."
            );
        }

        const body = await req.json();

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid project details." },
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

        const companyId = existingProject.companyId;

        const updatedProject = await updateProject(
            projectId,
            companyId,
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
                { success: false, message: "Project could not be updated." },
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
            { success: false, message: "Failed to update project." },
            { status: 500 }
        );
    }
}

/**
 * DELETE PROJECT
 */
export async function DELETE(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!isConstructionAdmin(user)) {
            return forbidden(
                "Only a Construction Admin can delete projects."
            );
        }

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "Project ID is required." },
                { status: 400 }
            );
        }

        const existingProject = await findProject(projectId, user);

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
                { success: false, message: "Project could not be deleted." },
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
            { success: false, message: "Failed to delete project." },
            { status: 500 }
        );
    }
}
