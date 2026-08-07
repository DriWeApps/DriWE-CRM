import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(payload: {
  userId: string;
  employeeId: string;
  email: string;
  role: string;
  pageAccess?: string[];
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// 

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    console.log("JWT Payload:", payload);

    return payload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: Request | NextRequest) {
  let token: string | undefined;

  if ("cookies" in req && typeof req.cookies?.get === "function") {
    token = req.cookies.get("token")?.value;
  } else {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const cookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("token="));

    token = cookie?.slice("token=".length);
  }

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  return payload as {
  userId: string;
  employeeId: string;
  email: string;
  role?: string;
  pageAccess?: string[];
};
}

export function isAdminUser(user: { role?: string } | null | undefined) {
  return user?.role?.toLowerCase() === "admin";
}

export function canAssignTask(user: any) {
  return (
    user?.role === "ADMIN" ||
    user?.role === "Manager"
  );
}

export function hasPageAccess(
  user: {
    role?: string;
    pageAccess?: string[];
  },
  page: string
): boolean {
  const role = user.role?.trim().toUpperCase();

  // ADMIN + MANAGER = full access
  if (role === "ADMIN" || role === "MANAGER") {
    return true;
  }

  if (!Array.isArray(user.pageAccess)) {
    return false;
  }

  return user.pageAccess.some(
    (item) =>
      typeof item === "string" &&
      item.trim().toLowerCase() === page.trim().toLowerCase()
  );
}


interface UserTokenPayload extends JWTPayload {
  userId: string;
  employeeId: string;
  email: string;
  role: string;
  pageAccess?: string[];
}