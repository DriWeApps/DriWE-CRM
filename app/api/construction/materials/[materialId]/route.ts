import { NextResponse } from "next/server";

import {
    getUserFromRequest,
} from "@/lib/auth";

import {
    getMaterialById,
    updateMaterial,
    deleteMaterial,
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

type RouteContext = {
    params: Promise<{
        materialId: string;
    }>;
};

const VALID_UNITS = [
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
] as const;

const VALID_STATUSES = [
    "Active",
    "Inactive",
] as const;

/* ============================================================
   GET MATERIAL BY ID
============================================================ */

export async function GET(
    req: Request,
    context: RouteContext
) {
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

        const { materialId } =
            await context.params;

        if (!materialId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        const material =
            await getMaterialById(
                materialId,
                companyId
            );

        if (!material) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            material,
        });
    } catch (error) {
        console.error(
            "GET construction material error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch construction material",
            },
            {
                status: 500,
            }
        );
    }
}

/* ============================================================
   UPDATE MATERIAL
============================================================ */

export async function PUT(
    req: Request,
    context: RouteContext
) {
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

        const { materialId } =
            await context.params;

        if (!materialId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        /* ----------------------------------------------------
           CHECK MATERIAL
        ---------------------------------------------------- */

        const existingMaterial =
            await getMaterialById(
                materialId,
                companyId
            );

        if (!existingMaterial) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material not found",
                },
                {
                    status: 404,
                }
            );
        }

        const body =
            await req.json();

        /* ----------------------------------------------------
           MATERIAL NAME
        ---------------------------------------------------- */

        if (
            body.materialName !==
                undefined &&
            (
                typeof body.materialName !==
                    "string" ||
                !body.materialName.trim()
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material name cannot be empty",
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
            body.unit !==
                undefined &&
            !VALID_UNITS.includes(
                body.unit
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
           STATUS VALIDATION
        ---------------------------------------------------- */

        if (
            body.status !==
                undefined &&
            !VALID_STATUSES.includes(
                body.status
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
           QUANTITY VALIDATION
        ---------------------------------------------------- */

        if (
            body.quantity !==
                undefined
        ) {
            const quantity =
                Number(
                    body.quantity
                );

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
        }

        /* ----------------------------------------------------
           MINIMUM STOCK VALIDATION
        ---------------------------------------------------- */

        if (
            body.minimumStock !==
                undefined &&
            body.minimumStock !== ""
        ) {
            const minimumStock =
                Number(
                    body.minimumStock
                );

            if (
                !Number.isFinite(
                    minimumStock
                ) ||
                minimumStock < 0
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
        }

        /* ----------------------------------------------------
           UNIT PRICE VALIDATION
        ---------------------------------------------------- */

        if (
            body.unitPrice !==
                undefined &&
            body.unitPrice !== ""
        ) {
            const unitPrice =
                Number(
                    body.unitPrice
                );

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
        }

        /* ----------------------------------------------------
           PREPARE UPDATE DATA
        ---------------------------------------------------- */

        const updateData: Record<
            string,
            unknown
        > = {};

        if (
            body.materialName !==
                undefined
        ) {
            updateData.materialName =
                body.materialName.trim();
        }

        if (
            body.category !==
                undefined
        ) {
            updateData.category =
                body.category
                    ? String(
                          body.category
                      ).trim()
                    : undefined;
        }

        if (
            body.unit !==
                undefined
        ) {
            updateData.unit =
                body.unit;
        }

        if (
            body.quantity !==
                undefined
        ) {
            updateData.quantity =
                Number(
                    body.quantity
                );
        }

        if (
            body.minimumStock !==
                undefined
        ) {
            updateData.minimumStock =
                body.minimumStock ===
                ""
                    ? undefined
                    : Number(
                          body.minimumStock
                      );
        }

        if (
            body.unitPrice !==
                undefined
        ) {
            updateData.unitPrice =
                body.unitPrice ===
                ""
                    ? 0
                    : Number(
                          body.unitPrice
                      );
        }

        if (
            body.supplierName !==
                undefined
        ) {
            updateData.supplierName =
                body.supplierName
                    ? String(
                          body.supplierName
                      ).trim()
                    : undefined;
        }

        if (
            body.supplierContact !==
                undefined
        ) {
            updateData.supplierContact =
                body.supplierContact
                    ? String(
                          body.supplierContact
                      ).trim()
                    : undefined;
        }

        if (
            body.status !==
                undefined
        ) {
            updateData.status =
                body.status;
        }

        if (
            body.description !==
                undefined
        ) {
            updateData.description =
                body.description
                    ? String(
                          body.description
                      ).trim()
                    : undefined;
        }

        if (
            body.remarks !==
                undefined
        ) {
            updateData.remarks =
                body.remarks
                    ? String(
                          body.remarks
                      ).trim()
                    : undefined;
        }

        /* ----------------------------------------------------
           UPDATE
        ---------------------------------------------------- */

        const updatedMaterial =
            await updateMaterial(
                materialId,
                companyId,
                updateData as any
            );

        if (!updatedMaterial) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Failed to update material",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Material updated successfully",
            material:
                updatedMaterial,
        });
    } catch (error) {
        console.error(
            "PUT construction material error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update construction material",
            },
            {
                status: 500,
            }
        );
    }
}

/* ============================================================
   DELETE MATERIAL
============================================================ */

export async function DELETE(
    req: Request,
    context: RouteContext
) {
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

        const { materialId } =
            await context.params;

        if (!materialId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const companyId =
            user.companyId ||
            user.userId;

        /* ----------------------------------------------------
           CHECK MATERIAL OWNERSHIP
        ---------------------------------------------------- */

        const existingMaterial =
            await getMaterialById(
                materialId,
                companyId
            );

        if (!existingMaterial) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* ----------------------------------------------------
           DELETE
        ---------------------------------------------------- */

        const deleted =
            await deleteMaterial(
                materialId,
                companyId
            );

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Failed to delete material",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Material deleted successfully",
        });
    } catch (error) {
        console.error(
            "DELETE construction material error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete construction material",
            },
            {
                status: 500,
            }
        );
    }
}