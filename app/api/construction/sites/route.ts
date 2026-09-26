import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
    getSites,
    getSitesByProject,
    createSite,
} from "@/services/construction-site.service";
import { getProjectById } from "@/services/construction-project.service";

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
// GET - Get Construction Sites
//
// Supported:
//
// GET /api/construction/sites
//
// GET /api/construction/sites?projectId=PROJECT_ID
// ============================================================

export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        const { searchParams } =
            new URL(req.url);

        const projectId =
            searchParams.get("projectId");

        let sites;

        // ----------------------------------------------------
        // Get sites for a specific project
        // ----------------------------------------------------

        if (projectId) {
            // First verify that the project belongs
            // to the current company.
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
                    { status: 404 }
                );
            }

            sites =
                await getSitesByProject(
                    projectId,
                    companyId
                );
        } else {
            // ------------------------------------------------
            // Get all company sites
            // ------------------------------------------------

            sites =
                await getSites(companyId);
        }

        return NextResponse.json({
            success: true,
            sites,
            count: sites.length,
        });
    } catch (error) {
        console.error(
            "GET /api/construction/sites error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch construction sites",
            },
            { status: 500 }
        );
    }
}

// ============================================================
// POST - Create Construction Site
//
// Expected body:
//
// {
//   "projectId": "PROJECT_ID",
//   "siteName": "Main Site",
//   "location": "Pune, Maharashtra",
//   "active": true
// }
//
// Project is required because every site belongs to
// a project.
// ============================================================

export async function POST(req: Request) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        // ----------------------------------------------------
        // Read body
        // ----------------------------------------------------

        const body = await req.json();

        const projectId =
            String(body.projectId || "").trim();

        const siteName =
            String(body.siteName || "").trim();

        const location =
            String(body.location || "").trim();

        const active =
            body.active !== undefined
                ? Boolean(body.active)
                : true;

        // ----------------------------------------------------
        // Validate project
        // ----------------------------------------------------

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Project ID is required",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------------------
        // Validate site name
        // ----------------------------------------------------

        if (!siteName) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Site name is required",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------------------
        // Verify project belongs to current company
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
                    error: "Project not found",
                },
                { status: 404 }
            );
        }

        // ----------------------------------------------------
        // Create site
        // ----------------------------------------------------

        const site =
            await createSite({
                companyId,
                projectId,
                projectName:
                    project.projectName,
                siteName,
                location,
                active,
            });

        return NextResponse.json(
            {
                success: true,
                message:
                    "Site created successfully",
                site,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "POST /api/construction/sites error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create construction site",
            },
            { status: 500 }
        );
    }
}