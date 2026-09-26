import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    getProjectById,
    updateProject,
    deleteProject,
} from "@/services/construction-project.service";

type RouteContext = {
    params: Promise<{
        projectId: string;
    }>;
};

function getCompanyId(user: any): string {
    return user.companyId || user.userId;
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

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project ID is required",
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
                    message: "Project not found",
                },
                { status: 404 }
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
                message: "Failed to fetch project",
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

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project ID is required",
                },
                { status: 400 }
            );
        }

        const companyId = getCompanyId(user);

        // Check that the project belongs to this company
        const existingProject = await getProjectById(
            projectId,
            companyId
        );

        if (!existingProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found",
                },
                { status: 404 }
            );
        }

        const body = await req.json();

        const projectName =
            typeof body.projectName === "string"
                ? body.projectName.trim()
                : existingProject.projectName;

        const location =
            typeof body.location === "string"
                ? body.location.trim()
                : existingProject.location;

        const startDate =
            body.startDate ||
            existingProject.startDate;

        const expectedCompletion =
            body.expectedCompletion ||
            existingProject.expectedCompletion;

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

        const updatedProject = await updateProject(
            projectId,
            companyId,
            {
                projectName,
                location,

                projectManager:
                    body.projectManager ||
                    existingProject.projectManager,

                projectManagerName:
                    body.projectManagerName ||
                    existingProject.projectManagerName,

                siteSupervisor:
                    body.siteSupervisor ||
                    existingProject.siteSupervisor,

                siteSupervisorName:
                    body.siteSupervisorName ||
                    existingProject.siteSupervisorName,

                startDate,

                expectedCompletion,

                status:
                    body.status ||
                    existingProject.status,

                description:
                    body.description !== undefined
                        ? body.description
                        : existingProject.description,
            }
        );

        return NextResponse.json({
            success: true,
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
                message: "Failed to update project",
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

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project ID is required",
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
                    message: "Project not found",
                },
                { status: 404 }
            );
        }

        await deleteProject(
            projectId,
            companyId
        );

        return NextResponse.json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error(
            "DELETE construction project error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete project",
            },
            { status: 500 }
        );
    }
}