import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { getSites } from "@/services/construction-site.service";

export async function GET(request: Request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const companyId = user.companyId || user.userId;
        const projectId = new URL(request.url).searchParams.get("projectId")?.trim();
        const sites = await getSites(companyId, projectId || undefined);

        return NextResponse.json({ success: true, sites });
    } catch (error) {
        console.error("GET construction sites error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch construction sites." },
            { status: 500 }
        );
    }
}
