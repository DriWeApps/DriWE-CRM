
import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    getProjectById,
    updateProject,
    deleteProject,
} from "@/services/construction-project.service";

import type { ProjectStatus } from "@/types/construction";

type RouteContext = {
    params: Promise<{
        projectId: string;
    }>;
};

function normalizeRole(role?: string): string {
    return role?.trim().toLowerCase() ?? "";
}

function isConstructionAdmin(user: { role?: string }): boolean {
    const role = normalizeRole(user.role);

    return role === "admin" || role === "constructionadmin";
}

function isProjectManager(user: { role?: string }): boolean {
    return normalizeRole(user.role) === "constructionprojectmanager";
}

function getCompanyId(user: {
    companyId?: string;
    userId: string;
}): string {
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

// GET SINGLE PROJECT
export async function GET(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const admin = isConstructionAdmin(user);
        const manager = isProjectManager(user);

        if (!admin && !manager) {
            return forbidden(
                "You are not allowed to view project details."
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

        const companyId = getCompanyId(user);

        const project = await getProjectById(
            projectId,
            companyId
        );

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found.",
                },
                { status: 404 }
            );
        }

        // Managers can view only projects assigned to their account.
        if (
            manager &&
            project.projectManagerUserId !== user.userId
        ) {
            return forbidden(
                "You can only view projects assigned to you."
            );
        }

        return NextResponse.json({
            success: true,
            project,
        });
    } catch (error) {
        console.error(
            "GET construction project error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch project.",
            },
            { status: 500 }
        );
    }
}

// UPDATE PROJECT
export async function PUT(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        if (!isConstructionAdmin(user)) {
            return forbidden(
                "Only a Construction Admin can update project details."
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

        const companyId = getCompanyId(user);

        const existingProject = await getProjectById(
            projectId,
            companyId
        );

        if (!existingProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found.",
                },
                { status: 404 }
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
                : existingProject.projectName;

        const location =
            typeof body.location === "string"
                ? body.location.trim()
                : existingProject.location;

        const startDate =
            typeof body.startDate === "string"
                ? body.startDate.trim()
                : existingProject.startDate;

        const expectedCompletion =
            typeof body.expectedCompletion === "string"
                ? body.expectedCompletion.trim()
                : existingProject.expectedCompletion;

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
                {
                    success: false,
                    message: "Invalid project status.",
                },
                { status: 400 }
            );
        }

        const updatedProject = await updateProject(
            projectId,
            companyId,
            {
                projectName,
                location,

                // Preserve the existing manager assignment.
                projectManager:
                    existingProject.projectManager,

                projectManagerName:
                    existingProject.projectManagerName,

                projectManagerUserId:
                    existingProject.projectManagerUserId,

                projectManagerEmail:
                    existingProject.projectManagerEmail,

                siteSupervisor:
                    existingProject.siteSupervisor,

                siteSupervisorName:
                    existingProject.siteSupervisorName,

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
        console.error(
            "PUT construction project error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update project.",
            },
            { status: 500 }
        );
    }
}

// DELETE PROJECT
export async function DELETE(
    req: Request,
    { params }: RouteContext
) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
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
                {
                    success: false,
                    message: "Project ID is required.",
                },
                { status: 400 }
            );
        }

        const companyId = getCompanyId(user);

        const existingProject = await getProjectById(
            projectId,
            companyId
        );

        if (!existingProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found.",
                },
                { status: 404 }
            );
        }

        await deleteProject(projectId, companyId);

        return NextResponse.json({
            success: true,
            message: "Project deleted successfully.",
        });
    } catch (error) {
        console.error(
            "DELETE construction project error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete project.",
            },
            { status: 500 }
        );
    }
}
