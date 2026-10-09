import { NextResponse } from "next/server";

import {
    getUserFromRequest,
} from "@/lib/auth";

import {
    getWorkers,
    getWorkersByProject,
    getWorkersBySite,
    createWorker,
} from "@/services/construction-worker.service";

import {
    getProjectById,
} from "@/services/construction-project.service";

import {
    getSiteById,
} from "@/services/construction-site.service";

import {
    getUserByEmail,
} from "@/services/auth.service";

import type {
    WorkerType,
} from "@/types/construction";

/* =========================================================
   HELPERS
========================================================= */

function getCompanyId(user: any): string {
    return user.companyId || user.userId;
}

function isValidWorkerType(
    value: string
): value is WorkerType {
    return (
        value === "Employee" ||
        value === "Contract Worker" ||
        value === "Daily Wage" ||
        value === "Subcontractor"
    );
}

/* =========================================================
   GET WORKERS
========================================================= */

export async function GET(req: Request) {
    try {
        const user =
            await getUserFromRequest(req);

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
            getCompanyId(user);

        const url =
            new URL(req.url);

        const projectId =
            url.searchParams.get(
                "projectId"
            );

        const siteId =
            url.searchParams.get(
                "siteId"
            );

        let workers;

        if (siteId) {
            workers =
                await getWorkersBySite(
                    siteId,
                    companyId
                );
        } else if (projectId) {
            workers =
                await getWorkersByProject(
                    projectId,
                    companyId
                );
        } else {
            workers =
                await getWorkers(
                    companyId
                );
        }

        return NextResponse.json(
            {
                success: true,
                workers,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "GET construction workers error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch workers",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   CREATE WORKER
========================================================= */

export async function POST(req: Request) {
    try {
        /* =====================================================
           AUTHENTICATION
        ===================================================== */

        const user =
            await getUserFromRequest(req);

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

        /* =====================================================
           PREVENT CONSTRUCTION EMPLOYEES FROM
           CREATING OTHER WORKERS
        ===================================================== */

        const currentRole =
            user.role
                ?.trim()
                .toLowerCase();

        if (
            currentRole ===
            "constructionemployee"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Construction employees cannot create workers.",
                },
                {
                    status: 403,
                }
            );
        }

        /* =====================================================
           READ REQUEST BODY
        ===================================================== */

        const body =
            await req.json();

        /* =====================================================
           BASIC WORKER FIELDS
        ===================================================== */

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        const phone =
            typeof body.phone === "string"
                ? body.phone
                    .replace(/\D/g, "")
                    .slice(0, 10)
                : "";

        const siteId =
            typeof body.siteId === "string"
                ? body.siteId.trim()
                : "";

        const workerType =
            typeof body.workerType === "string"
                ? body.workerType.trim()
                : "";

        const salary =
            Number(body.salary);

        /* =====================================================
           LOGIN FIELDS
        ===================================================== */

        const email =
            typeof body.email === "string"
                ? body.email
                    .trim()
                    .toLowerCase()
                : "";

        const password =
            typeof body.password === "string"
                ? body.password
                : "";

        /* =====================================================
           VALIDATE WORKER NAME
        ===================================================== */

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (name.length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker name must contain at least 2 characters.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           VALIDATE PHONE
        ===================================================== */

        if (!phone) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker mobile number is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !/^\d{10}$/.test(phone)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please enter a valid 10-digit mobile number.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           VALIDATE SITE
        ===================================================== */

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Site is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           COMPANY
        ===================================================== */

        const companyId =
            getCompanyId(user);

        /* =====================================================
           VERIFY SITE
        ===================================================== */

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
                        "Site not found or you do not have access to this site.",
                },
                {
                    status: 404,
                }
            );
        }

        /* =====================================================
           VERIFY PROJECT
        ===================================================== */

        const project =
            await getProjectById(
                site.projectId,
                companyId
            );

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project associated with this site was not found or you do not have access to it.",
                },
                {
                    status: 404,
                }
            );
        }

        /* =====================================================
           VALIDATE EMAIL
        ===================================================== */

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker login email is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(email)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please enter a valid email address.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CHECK DUPLICATE LOGIN EMAIL
        ===================================================== */

        const existingUser =
            await getUserByEmail(
                email
            );

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "An account with this email already exists.",
                },
                {
                    status: 409,
                }
            );
        }

        /* =====================================================
           VALIDATE PASSWORD
        ===================================================== */

        if (!password) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker login password is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            password.length < 6
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Worker password must be at least 6 characters.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           VALIDATE WORKER TYPE
        ===================================================== */

        if (
            !isValidWorkerType(
                workerType
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid worker type.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           VALIDATE SALARY
        ===================================================== */

        if (
            !Number.isFinite(
                salary
            ) ||
            salary <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Salary / wage must be greater than 0.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CREATE WORKER + LOGIN ACCOUNT
           
           IMPORTANT:
           
           createWorker() is responsible for:
           
           1. Creating CRM_ConstructionWorkers record
           2. Hashing the password
           3. Creating CRM_Users record
           
           DO NOT call createUser() here.
        ===================================================== */

        const worker =
            await createWorker({
                companyId,

                projectId:
                    site.projectId,

                projectName:
                    project.projectName,

                siteId:
                    site.siteId,

                siteName:
                    site.siteName,

                name,

                phone,

                email,

                password,

                role:
                    "ConstructionEmployee",

                workerType,

                salary,

                dailyWage:
                    workerType ===
                    "Daily Wage"
                        ? salary
                        : undefined,

                active:
                    body.active !== undefined
                        ? Boolean(
                            body.active
                        )
                        : true,
            });

        /* =====================================================
           SUCCESS RESPONSE
           
           Never return the password.
        ===================================================== */

        return NextResponse.json(
            {
                success: true,

                message:
                    "Worker and construction login account created successfully.",

                worker: {
                    ...worker,
                },

                login: {
                    email:
                        worker.email,

                    role:
                        "ConstructionEmployee",

                    portal:
                        "construction",

                    loginEnabled:
                        worker.loginEnabled ??
                        true,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "POST construction worker error:",
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : "Failed to create worker";

        /* =====================================================
           DUPLICATE EMAIL
        ===================================================== */

        if (
            message
                .toLowerCase()
                .includes(
                    "email already exists"
                )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "An account with this email already exists.",
                },
                {
                    status: 409,
                }
            );
        }

        /* =====================================================
           DUPLICATE USER / CONDITION FAILURE
        ===================================================== */

        if (
            message
                .toLowerCase()
                .includes(
                    "conditional request failed"
                )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "An account with this email or user already exists.",
                },
                {
                    status: 409,
                }
            );
        }

        /* =====================================================
           GENERAL ERROR
        ===================================================== */

        return NextResponse.json(
            {
                success: false,
                message,
            },
            {
                status: 500,
            }
        );
    }
}