import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
    getSiteById,
    updateSite,
    deleteSite,
} from "@/services/construction-site.service";
import { getProjectById } from "@/services/construction-project.service";

type RouteContext = {
    params: Promise<{
        siteId: string;
    }>;
};

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
// GET - Get Site by ID
// ============================================================

export async function GET(
    req: Request,
    context: RouteContext
) {
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

        const { siteId } = await context.params;

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Site ID is required",
                },
                { status: 400 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        /*
         * Current company isolation logic.
         *
         * If companyId exists, use it.
         * Otherwise fall back to userId.
         */
        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        const site = await getSiteById(
            siteId,
            companyId
        );

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Site not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            site,
        });
    } catch (error) {
        console.error(
            "GET /api/construction/sites/[siteId] error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch site",
            },
            { status: 500 }
        );
    }
}

// ============================================================
// PUT - Update Site
// ============================================================

export async function PUT(
    req: Request,
    context: RouteContext
) {
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

        const { siteId } = await context.params;

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Site ID is required",
                },
                { status: 400 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        // ----------------------------------------------------
        // Get existing site
        // ----------------------------------------------------

        const existingSite =
            await getSiteById(
                siteId,
                companyId
            );

        if (!existingSite) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Site not found",
                },
                { status: 404 }
            );
        }

        // ----------------------------------------------------
        // Read request body
        // ----------------------------------------------------

        const body = await req.json();

        // ----------------------------------------------------
        // Prepare values
        // ----------------------------------------------------

        const siteName =
            body.siteName !== undefined
                ? String(body.siteName).trim()
                : existingSite.siteName;

        const location =
            body.location !== undefined
                ? String(body.location).trim()
                : existingSite.location || "";

        const active =
            body.active !== undefined
                ? Boolean(body.active)
                : existingSite.active;

        // ----------------------------------------------------
        // Validation
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
        // Verify parent project
        // ----------------------------------------------------

        if (existingSite.projectId) {
            const project =
                await getProjectById(
                    existingSite.projectId,
                    companyId
                );

            if (!project) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Parent project not found",
                    },
                    { status: 404 }
                );
            }
        }

        // ----------------------------------------------------
        // Update site
        // ----------------------------------------------------

        const updatedSite =
            await updateSite(
                siteId,
                companyId,
                {
                    siteName,
                    location,
                    active,
                }
            );

        if (!updatedSite) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to update site",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Site updated successfully",
            site: updatedSite,
        });
    } catch (error) {
        console.error(
            "PUT /api/construction/sites/[siteId] error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to update site",
            },
            { status: 500 }
        );
    }
}

// ============================================================
// DELETE - Delete Site
// ============================================================

export async function DELETE(
    req: Request,
    context: RouteContext
) {
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

        const { siteId } = await context.params;

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Site ID is required",
                },
                { status: 400 }
            );
        }

        const constructionUser =
            user as ConstructionUser;

        const companyId =
            constructionUser.companyId ||
            constructionUser.userId;

        // ----------------------------------------------------
        // Check site exists
        // ----------------------------------------------------

        const existingSite =
            await getSiteById(
                siteId,
                companyId
            );

        if (!existingSite) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Site not found",
                },
                { status: 404 }
            );
        }

        // ----------------------------------------------------
        // Delete site
        // ----------------------------------------------------

        const deleted =
            await deleteSite(
                siteId,
                companyId
            );

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to delete site",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Site deleted successfully",
            siteId,
        });
    } catch (error) {
        console.error(
            "DELETE /api/construction/sites/[siteId] error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete site",
            },
            { status: 500 }
        );
    }
}