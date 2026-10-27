
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = [
  "/",
  "/login",
  "/construction-signup",
  "/api/auth",
  "/api/construction-signup",
  "/_next",
  "/favicon.ico",
];

const CONSTRUCTION_TASKS_PATH = "/DriWE-Construction/tasks";

function isPathOrChild(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some((publicPath) =>
    isPathOrChild(pathname, publicPath)
  );

  const token = request.cookies.get("token")?.value;

  // Allow public pages, but redirect an already-authenticated
  // construction employee away from the public landing/login pages.
  if (isPublicPath) {
    if (token && (pathname === "/" || pathname === "/login")) {
      const payload = await verifyToken(token);

      if (payload?.role === "CONSTRUCTIONEMPLOYEE") {
        return NextResponse.redirect(
          new URL(CONSTRUCTION_TASKS_PATH, request.url)
        );
      }
    }

    return NextResponse.next();
  }

  // Require authentication for all protected routes.
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.delete("token");
    return response;
  }

  // Construction employees can access only their Tasks page
  // and its nested routes. They cannot access the regular CRM
  // or other construction portal pages.
  if (payload.role === "CONSTRUCTIONEMPLOYEE") {
    if (!isPathOrChild(pathname, CONSTRUCTION_TASKS_PATH)) {
      return NextResponse.redirect(
        new URL(CONSTRUCTION_TASKS_PATH, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
