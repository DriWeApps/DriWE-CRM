import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { getSiteById } from "@/services/construction-site.service";

type RouteContext = {
    params: Promise<{ siteId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const { siteId } = await params;
        const site = await getSiteById(
            siteId,
            user.companyId || user.userId
        );

        if (!site) {
            return NextResponse.json(
                { success: false, message: "Site not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, site });
    } catch (error) {
        console.error("GET construction site error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch construction site." },
            { status: 500 }
        );
    }
}
