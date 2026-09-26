import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

import {
    createMaterialTransaction,
    getMaterialTransactions,
    getMaterialTransactionsByProject,
    getMaterialTransactionsBySite,
    getMaterialTransactionsByMaterial,
} from "@/services/construction-material-transaction.service";

import { getProjectById } from "@/services/construction-project.service";
import { getSiteById } from "@/services/construction-site.service";
import { getMaterialById } from "@/services/construction-material.service";

import type { MaterialTransactionType } from "@/types/construction";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getCompanyId(user: {
    companyId?: string;
    userId: string;
}) {
    return user.companyId || user.userId;
}

function isValidTransactionType(
    value: unknown
): value is MaterialTransactionType {
    return (
        value === "RECEIVE" ||
        value === "ISSUE" ||
        value === "TRANSFER"
    );
}

/* -------------------------------------------------------------------------- */
/* GET                                                                         */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
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

        const constructionUser =
            user as typeof user & {
                companyId?: string;
            };

        const companyId =
            getCompanyId(constructionUser);

        const { searchParams } =
            new URL(req.url);

        const projectId =
            searchParams.get("projectId");

        const siteId =
            searchParams.get("siteId");

        const materialId =
            searchParams.get("materialId");

        let transactions;

        if (materialId) {
            transactions =
                await getMaterialTransactionsByMaterial(
                    materialId,
                    companyId
                );
        } else if (siteId) {
            transactions =
                await getMaterialTransactionsBySite(
                    siteId,
                    companyId
                );
        } else if (projectId) {
            transactions =
                await getMaterialTransactionsByProject(
                    projectId,
                    companyId
                );
        } else {
            transactions =
                await getMaterialTransactions(
                    companyId
                );
        }

        return NextResponse.json({
            success: true,
            transactions,
            count: transactions.length,
        });
    } catch (error) {
        console.error(
            "GET material transactions error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch material transactions",
            },
            { status: 500 }
        );
    }
}

/* -------------------------------------------------------------------------- */
/* POST                                                                        */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
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

        const constructionUser =
            user as typeof user & {
                companyId?: string;
            };

        const companyId =
            getCompanyId(constructionUser);

        const body = await req.json();

        const {
            transactionType,
            projectId,
            siteId,
            materialId,
            quantity,
            unit,
            referenceNumber,
            supplierName,
            remarks,
            toSiteId,
        } = body;

        /* ------------------------------------------------------------------ */
        /* Basic validation                                                    */
        /* ------------------------------------------------------------------ */

        if (!isValidTransactionType(transactionType)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Transaction type must be RECEIVE, ISSUE or TRANSFER",
                },
                { status: 400 }
            );
        }

        if (!projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project is required",
                },
                { status: 400 }
            );
        }

        if (!siteId && transactionType !== "TRANSFER") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Site is required",
                },
                { status: 400 }
            );
        }

        if (!materialId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Material is required",
                },
                { status: 400 }
            );
        }

        const parsedQuantity =
            Number(quantity);

        if (
            !Number.isFinite(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Quantity must be greater than 0",
                },
                { status: 400 }
            );
        }

        /* ------------------------------------------------------------------ */
        /* Project verification                                                */
        /* ------------------------------------------------------------------ */

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
                { status: 404 }
            );
        }

        /* ------------------------------------------------------------------ */
        /* Material verification                                               */
        /* ------------------------------------------------------------------ */

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
                { status: 404 }
            );
        }

        if (material.projectId !== projectId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Material does not belong to the selected project",
                },
                { status: 400 }
            );
        }

        /* ------------------------------------------------------------------ */
        /* RECEIVE / ISSUE                                                     */
        /* ------------------------------------------------------------------ */

        if (
            transactionType === "RECEIVE" ||
            transactionType === "ISSUE"
        ) {
            if (!siteId) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Site is required",
                    },
                    { status: 400 }
                );
            }

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
                    { status: 404 }
                );
            }

            if (
                site.projectId !==
                projectId
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Site does not belong to the selected project",
                    },
                    { status: 400 }
                );
            }

            if (
                material.siteId !==
                siteId
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Material does not belong to the selected site",
                    },
                    { status: 400 }
                );
            }

            const transaction =
                await createMaterialTransaction(
                    transactionType ===
                        "RECEIVE"
                        ? {
                              transactionType:
                                  "RECEIVE",

                              companyId,
                              companyName:
                                  project.companyName,

                              projectId,
                              projectName:
                                  project.projectName,

                              siteId,
                              siteName:
                                  site.siteName,

                              materialId,
                              materialName:
                                  material.materialName,

                              quantity:
                                  parsedQuantity,

                              unit:
                                  unit ||
                                  material.unit,

                              referenceNumber:
                                  referenceNumber ||
                                  undefined,

                              supplierName:
                                  supplierName ||
                                  undefined,

                              remarks:
                                  remarks ||
                                  undefined,

                              createdBy:
                                  constructionUser.userId,

                              createdByName:
                                  constructionUser.name ||
                                  constructionUser.email,
                          }
                        : {
                              transactionType:
                                  "ISSUE",

                              companyId,
                              companyName:
                                  project.companyName,

                              projectId,
                              projectName:
                                  project.projectName,

                              siteId,
                              siteName:
                                  site.siteName,

                              materialId,
                              materialName:
                                  material.materialName,

                              quantity:
                                  parsedQuantity,

                              unit:
                                  unit ||
                                  material.unit,

                              referenceNumber:
                                  referenceNumber ||
                                  undefined,

                              remarks:
                                  remarks ||
                                  undefined,

                              createdBy:
                                  constructionUser.userId,

                              createdByName:
                                  constructionUser.name ||
                                  constructionUser.email,
                          }
                );

            return NextResponse.json(
                {
                    success: true,
                    message:
                        transactionType ===
                        "RECEIVE"
                            ? "Material received successfully"
                            : "Material issued successfully",
                    transaction,
                },
                { status: 201 }
            );
        }

        /* ------------------------------------------------------------------ */
        /* TRANSFER                                                            */
        /* ------------------------------------------------------------------ */

        if (transactionType === "TRANSFER") {
            if (!siteId) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Source site is required for transfer",
                    },
                    { status: 400 }
                );
            }

            if (!toSiteId) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Destination site is required for transfer",
                    },
                    { status: 400 }
                );
            }

            if (siteId === toSiteId) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Source site and destination site cannot be the same",
                    },
                    { status: 400 }
                );
            }

            const sourceSite =
                await getSiteById(
                    siteId,
                    companyId
                );

            if (!sourceSite) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Source site not found",
                    },
                    { status: 404 }
                );
            }

            if (
                sourceSite.projectId !==
                projectId
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Source site does not belong to the selected project",
                    },
                    { status: 400 }
                );
            }

            const destinationSite =
                await getSiteById(
                    toSiteId,
                    companyId
                );

            if (!destinationSite) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Destination site not found",
                    },
                    { status: 404 }
                );
            }

            if (
                destinationSite.projectId !==
                projectId
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Destination site does not belong to the selected project",
                    },
                    { status: 400 }
                );
            }

            if (
                material.siteId !==
                siteId
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Material does not belong to the source site",
                    },
                    { status: 400 }
                );
            }

            const transaction =
                await createMaterialTransaction({
                    transactionType:
                        "TRANSFER",

                    companyId,

                    companyName:
                        project.companyName,

                    projectId,

                    projectName:
                        project.projectName,

                    fromSiteId:
                        siteId,

                    fromSiteName:
                        sourceSite.siteName,

                    toSiteId,

                    toSiteName:
                        destinationSite.siteName,

                    materialId,

                    materialName:
                        material.materialName,

                    quantity:
                        parsedQuantity,

                    unit:
                        unit ||
                        material.unit,

                    referenceNumber:
                        referenceNumber ||
                        undefined,

                    remarks:
                        remarks ||
                        undefined,

                    createdBy:
                        constructionUser.userId,

                    createdByName:
                        constructionUser.name ||
                        constructionUser.email,
                });

            return NextResponse.json(
                {
                    success: true,
                    message:
                        "Material transferred successfully",
                    transaction,
                },
                { status: 201 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unsupported transaction type",
            },
            { status: 400 }
        );
    } catch (error) {
        console.error(
            "POST material transaction error:",
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : "Failed to create material transaction";

        return NextResponse.json(
            {
                success: false,
                message,
            },
            { status: 500 }
        );
    }
}