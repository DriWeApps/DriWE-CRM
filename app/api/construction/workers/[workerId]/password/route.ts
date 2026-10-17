import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { getUserById, updateUserPassword } from "@/services/auth.service";
import { getProjectById } from "@/services/construction-project.service";
import { getWorkerById } from "@/services/construction-worker.service";

type RouteContext = {
    params: Promise<{
        workerId: string;
    }>;
};

export async function PATCH(
    request: Request,
    context: RouteContext
) {
    try {
        const currentUser = await getUserFromRequest(request);

        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const { workerId } = await context.params;

        if (!workerId) {
            return NextResponse.json(
                { success: false, message: "Worker ID is required." },
                { status: 400 }
            );
        }

        const companyId = currentUser.companyId || currentUser.userId;

        if (!companyId) {
            return NextResponse.json(
                { success: false, message: "Company information is missing." },
                { status: 400 }
            );
        }

        const worker = await getWorkerById(workerId, companyId);

        if (!worker) {
            return NextResponse.json(
                { success: false, message: "Worker not found." },
                { status: 404 }
            );
        }

        const currentRole = (currentUser.role ?? "")
            .trim()
            .toLowerCase();

        const hasCompanyWideAccess = [
            "admin",
            "manager",
            "constructionadmin",
        ].includes(currentRole);

        if (!hasCompanyWideAccess) {
            const project = await getProjectById(
                worker.projectId,
                companyId
            );

            const isProjectManager =
                currentRole === "constructionprojectmanager" &&
                project?.projectManagerUserId === currentUser.userId;

            const isProjectCreator =
                project?.createdBy === currentUser.userId;

            if (!isProjectManager && !isProjectCreator) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "You can reset passwords only for workers in projects you manage or created.",
                    },
                    { status: 403 }
                );
            }
        }

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

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON request body." },
                { status: 400 }
            );
        }

        if (typeof body !== "object" || body === null || Array.isArray(body)) {
            return NextResponse.json(
                { success: false, message: "Invalid password details." },
                { status: 400 }
            );
        }

        const password =
            "password" in body && typeof body.password === "string"
                ? body.password
                : "";
        const confirmPassword =
            "confirmPassword" in body &&
            typeof body.confirmPassword === "string"
                ? body.confirmPassword
                : "";

        if (!password) {
            return NextResponse.json(
                { success: false, message: "New password is required." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be at least 6 characters.",
                },
                { status: 400 }
            );
        }

        if (confirmPassword && password !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: "Passwords do not match." },
                { status: 400 }
            );
        }

        const linkedUser = await getUserById(worker.userId);

        if (!linkedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Linked login account was not found.",
                },
                { status: 404 }
            );
        }

        const hashedPassword = await hashPassword(password);
        await updateUserPassword(worker.userId, hashedPassword);

        return NextResponse.json(
            {
                success: true,
                message: "Worker password updated successfully.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH construction worker password error:", error);

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