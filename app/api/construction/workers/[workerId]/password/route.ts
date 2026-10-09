import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { getWorkerById } from "@/services/construction-worker.service";
import {
    getUserById,
    updateUserPassword,
} from "@/services/auth.service";

type RouteContext = {
    params: Promise<{
        workerId: string;
    }>;
};

export async function PATCH(
    req: Request,
    context: RouteContext
) {
    try {
        // --------------------------------------------------
        // 1. Check logged-in user
        // --------------------------------------------------
        const currentUser = await getUserFromRequest(req);

        if (!currentUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        // IMPORTANT:
        // ?? "" guarantees this is always a string
        const currentRole = (currentUser.role ?? "")
            .trim()
            .toLowerCase();

        // --------------------------------------------------
        // 2. Get worker ID
        // --------------------------------------------------
        const { workerId } = await context.params;

        if (!workerId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Worker ID is required.",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 3. Check permission
        // --------------------------------------------------
        if (
            currentRole !== "admin" &&
            currentRole !== "manager"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You do not have permission to reset worker passwords.",
                },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 4. Determine company
        // --------------------------------------------------
        const companyId =
            currentUser.companyId || currentUser.userId;

        if (!companyId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Company information is missing.",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 5. Find worker
        // --------------------------------------------------
        const worker = await getWorkerById(
            workerId,
            companyId
        );

        if (!worker) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Worker not found.",
                },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 6. Worker must have linked CRM user
        // --------------------------------------------------
        if (!worker.userId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This worker does not have a linked login account.",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 7. Read request body
        // --------------------------------------------------
        const body = await req.json();

        const password =
            typeof body.password === "string"
                ? body.password
                : "";

        const confirmPassword =
            typeof body.confirmPassword === "string"
                ? body.confirmPassword
                : "";

        // --------------------------------------------------
        // 8. Validate password
        // --------------------------------------------------
        if (!password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "New password is required.",
                },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password must be at least 6 characters.",
                },
                { status: 400 }
            );
        }

        if (confirmPassword && password !== confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Passwords do not match.",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 9. Verify linked CRM user exists
        // --------------------------------------------------
        const linkedUser = await getUserById(worker.userId);

        if (!linkedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Linked login account was not found.",
                },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 10. Hash new password
        // --------------------------------------------------
        const hashedPassword =
            await hashPassword(password);

        // --------------------------------------------------
        // 11. Update CRM user password
        // --------------------------------------------------
        await updateUserPassword(
            worker.userId,
            hashedPassword
        );

        // --------------------------------------------------
        // 12. Success
        // --------------------------------------------------
        return NextResponse.json(
            {
                success: true,
                message:
                    "Worker password updated successfully.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "PATCH construction worker password error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to update worker password.",
            },
            { status: 500 }
        );
    }
}