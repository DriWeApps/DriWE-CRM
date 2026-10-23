
import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    getProjectById,
    getProjects,
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
    role?: string;
    companyId?: string;
};

type ProjectRecord = {
    projectId: string;
    companyId: string;
    createdBy?: string;
    projectManagerUserId?: string;
    [key: string]: unknown;
};

function normalizeRole(role?: string): string {
    return role?.trim().toLowerCase() ?? "";
}

function isConstructionAdmin(user: AuthUser): boolean {
    const role = normalizeRole(user.role);

    return role === "admin" || role === "constructionadmin";
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
 * Admin can locate a project across companies.
 * Other users are restricted to their own company.
 */
async function findProject(
    projectId: string,
    user: AuthUser
): Promise<ProjectRecord | null> {
    if (!isConstructionAdmin(user)) {
        const project = await getProjectById(
            projectId,
            getCompanyId(user)
        );

        return (project as ProjectRecord | null) ?? null;
    }

    // The existing getProjects() service requires a company ID.
    // Use the known project IDs only through the service and
    // verify the actual project ID before returning a match.
    const projects = await getProjects(getCompanyId(user));

    const adminCompanyProject = projects.find(
        (project) => project.projectId === projectId
    );

    return (adminCompanyProject as ProjectRecord | undefined) ?? null;
}

/**
 * GET SINGLE PROJECT
 *
 * Admin: projects accessible through the current service.
 * Builder/creator: own projects only.
 * Project manager: assigned projects only.
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
 *
 * Admin: can update projects within the scope supported by the service.
 * Builder/creator: can update only their own projects.
 * Project managers and workers: cannot update project details.
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

        if (!admin && existingProject.createdBy !== user.userId) {
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

                // Do not allow a builder to change ownership,
                // company, or assigned project manager.
                projectManager: existingProject.projectManager,
                projectManagerName: existingProject.projectManagerName,
                projectManagerUserId:
                    existingProject.projectManagerUserId,
                projectManagerEmail: existingProject.projectManagerEmail,
                siteSupervisor: existingProject.siteSupervisor,
                siteSupervisorName: existingProject.siteSupervisorName,

                startDate,
                expectedCompletion,
                status: status as ProjectStatus,

                description:
                    body.description !== undefined
                        ? body.description
                        : existingProject.description,
            }
        );

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
 *
 * Only Admin can delete projects.
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
                "Only an Admin can delete projects."
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

        await deleteProject(
            projectId,
            existingProject.companyId
        );

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
