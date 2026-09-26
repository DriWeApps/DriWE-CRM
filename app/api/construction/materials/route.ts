import { NextResponse } from "next/server";

import {
    getUserFromRequest,
} from "@/lib/auth";

import {
    getMaterials,
    getMaterialsByProject,
    getMaterialsBySite,
    createMaterial,
} from "@/services/construction-material.service";

import {
    getProjectById,
} from "@/services/construction-project.service";

import {
    getSiteById,
} from "@/services/construction-site.service";

import type {
    MaterialUnit,
    MaterialStatus,
} from "@/services/construction-material.service";

/* ============================================================
   TYPES
============================================================ */

type ConstructionUser = {
    userId: string;
    employeeId: string;
    email: string;
    name?: string;
    role?: string;
    companyId?: string;
    pageAccess?: string[];
    portal?: "crm" | "construction" | "both";
};

const VALID_UNITS: MaterialUnit[] = [
    "Kg",
    "Gram",
    "Ton",
    "Litre",
    "ML",
    "Piece",
    "Box",
    "Bag",
    "Meter",
    "Square Feet",
    "Cubic Feet",
    "Other",
];

const VALID_STATUSES: MaterialStatus[] = [
    "Active",
    "Inactive",
];

/* ============================================================
   GET MATERIALS
============================================================ */

export async function GET(req: Request) {
    try {
        const user =
            (await getUserFromRequest(
                req
            )) as ConstructionUser | null;

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        const { searchParams } =
            new URL(req.url);

        const projectId =
            searchParams.get(
                "projectId"
            );

        const siteId =
            searchParams.get(
                "siteId"
            );

        let materials;

        /* ----------------------------------------------------
           FILTER BY PROJECT
        ---------------------------------------------------- */

        if (projectId) {
            materials =
                await getMaterialsByProject(
                    projectId,
                    companyId
                );
        }

        /* ----------------------------------------------------
           FILTER BY SITE
        ---------------------------------------------------- */

        else if (siteId) {
            materials =
                await getMaterialsBySite(
                    siteId,
                    companyId
                );
        }

        /* ----------------------------------------------------
           ALL MATERIALS
        ---------------------------------------------------- */

        else {
            materials =
                await getMaterials(
                    companyId
                );
        }

        /* ----------------------------------------------------
           SORT
        ---------------------------------------------------- */

        materials.sort((a, b) => {
            return (
                new Date(
                    b.createdAt
                ).getTime() -
                new Date(
                    a.createdAt
                ).getTime()
            );
        });

        return NextResponse.json({
            success: true,
            materials,
            count: materials.length,
        });
    } catch (error) {
        console.error(
            "GET construction materials error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch construction materials",
            },
            {
                status: 500,
            }
        );
    }
}

/* ============================================================
   CREATE MATERIAL
============================================================ */

export async function POST(req: Request) {
    try {
        const user =
            (await getUserFromRequest(
                req
            )) as ConstructionUser | null;

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        const body =
            await req.json();

        /* ----------------------------------------------------
           INPUT
        ---------------------------------------------------- */

        const projectId =
            body.projectId?.trim();

        const siteId =
            body.siteId?.trim();

        const materialName =
            body.materialName?.trim();

        const category =
            body.category?.trim();

        const unit =
            body.unit;

        const quantity =
            Number(body.quantity);

        const minimumStock =
            body.minimumStock !==
                undefined &&
            body.minimumStock !== ""
                ? Number(
                      body.minimumStock
                  )
                : undefined;

        const unitPrice =
            body.unitPrice !==
                undefined &&
            body.unitPrice !== ""
                ? Number(
                      body.unitPrice
                  )
                : 0;

        const supplierName =
            body.supplierName?.trim();

        const supplierContact =
            body.supplierContact?.trim();

        const status =
            body.status ||
            "Active";

        const description =
            body.description?.trim();

        const remarks =
            body.remarks?.trim();

        /* ----------------------------------------------------
           REQUIRED FIELDS
        ---------------------------------------------------- */

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project ID is required",
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
                    message:
                        "Site ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!materialName) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material name is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!unit) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material unit is required",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           UNIT VALIDATION
        ---------------------------------------------------- */

        if (
            !VALID_UNITS.includes(
                unit
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid material unit",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           QUANTITY VALIDATION
        ---------------------------------------------------- */

        if (
            !Number.isFinite(
                quantity
            ) ||
            quantity < 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Quantity must be a valid number greater than or equal to 0",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           MINIMUM STOCK VALIDATION
        ---------------------------------------------------- */

        if (
            minimumStock !==
                undefined &&
            (
                !Number.isFinite(
                    minimumStock
                ) ||
                minimumStock < 0
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Minimum stock must be a valid number greater than or equal to 0",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           UNIT PRICE VALIDATION
        ---------------------------------------------------- */

        if (
            !Number.isFinite(
                unitPrice
            ) ||
            unitPrice < 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unit price must be a valid number greater than or equal to 0",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           STATUS VALIDATION
        ---------------------------------------------------- */

        if (
            !VALID_STATUSES.includes(
                status
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid material status",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           GET PROJECT
        ---------------------------------------------------- */

        const project =
            await getProjectById(
                projectId,
                companyId
            );

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* ----------------------------------------------------
           GET SITE
        ---------------------------------------------------- */

        const site =
            await getSiteById(
                siteId,
                companyId
            );

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Site not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* ----------------------------------------------------
           VERIFY SITE BELONGS TO PROJECT
        ---------------------------------------------------- */

        if (
            site.projectId !==
            projectId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Selected site does not belong to the selected project",
                },
                {
                    status: 400,
                }
            );
        }

        /* ----------------------------------------------------
           CREATE MATERIAL
        ---------------------------------------------------- */

        const material =
            await createMaterial({
                companyId,

                companyName:
                    project.companyName,

                projectId:
                    project.projectId,

                projectName:
                    project.projectName,

                siteId:
                    site.siteId,

                siteName:
                    site.siteName,

                materialName,

                category:
                    category ||
                    undefined,

                unit,

                quantity,

                minimumStock,

                unitPrice,

                supplierName:
                    supplierName ||
                    undefined,

                supplierContact:
                    supplierContact ||
                    undefined,

                status,

                description:
                    description ||
                    undefined,

                remarks:
                    remarks ||
                    undefined,

                createdBy:
                    user.userId,

                createdByName:
                    user.name ||
                    user.email,
            });

        /* ----------------------------------------------------
           RESPONSE
        ---------------------------------------------------- */

        return NextResponse.json(
            {
                success: true,
                message:
                    "Material created successfully",
                material,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "POST construction material error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create construction material",
            },
            {
                status: 500,
            }
        );
    }
}