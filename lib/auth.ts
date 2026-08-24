import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { NextRequest } from "next/server";
import { getUserById } from "@/services/auth.service";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

export type Portal =
  | "crm"
  | "construction"
  | "both";

export interface UserTokenPayload extends JWTPayload {
  userId: string;
  employeeId: string;
  email: string;
  role: string;
  pageAccess?: string[];
  portal?: Portal;
}

/**
 * =========================================================
 * CREATE TOKEN
 * =========================================================
 */
export async function createToken(
  payload: UserTokenPayload
) {
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * =========================================================
 * VERIFY TOKEN
 * =========================================================
 */
export async function verifyToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      secret
    );

    console.log("JWT Payload:", payload);

    return payload as UserTokenPayload;
  } catch (error) {
    console.error(
      "JWT verification failed:",
      error
    );

    return null;
  }
}

/**
 * =========================================================
 * GET USER FROM REQUEST
 * =========================================================
 */
export async function getUserFromRequest(
  req: Request | NextRequest
) {
  let token: string | undefined;

  if (
    "cookies" in req &&
    typeof req.cookies?.get === "function"
  ) {
    token = req.cookies.get("token")?.value;
  } else {
    const cookieHeader =
      req.headers.get("cookie") ?? "";

    const cookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) =>
        item.startsWith("token=")
      );

    token = cookie?.slice(
      "token=".length
    );
  }

  if (!token) {
    return null;
  }

  const payload =
    await verifyToken(token);

  if (!payload) {
    return null;
  }

  const dbUser =
    await getUserById(payload.userId);

  if (!dbUser) {
    return null;
  }

  /*
   * Return the current user from DB.
   *
   * This is important because portal/pageAccess
   * changes made by Admin are immediately reflected
   * without requiring an old JWT to contain them.
   */
  return dbUser as {
    userId: string;
    employeeId: string;
    email: string;
    name?: string;
    role?: string;
    pageAccess?: string[];
    portal?: Portal;
  };
}

/**
 * =========================================================
 * ADMIN CHECK
 * =========================================================
 */
export function isAdminUser(
  user:
    | { role?: string }
    | null
    | undefined
) {
  return (
    user?.role?.trim().toLowerCase() ===
    "admin"
  );
}

/**
 * =========================================================
 * MANAGER CHECK
 * =========================================================
 */
export function isManagerUser(
  user:
    | { role?: string }
    | null
    | undefined
) {
  return (
    user?.role?.trim().toLowerCase() ===
    "manager"
  );
}

/**
 * =========================================================
 * TASK ASSIGNMENT PERMISSION
 * =========================================================
 */
export function canAssignTask(
  user:
    | { role?: string }
    | null
    | undefined
) {
  const role =
    user?.role?.trim().toUpperCase();

  return (
    role === "ADMIN" ||
    role === "MANAGER"
  );
}

/**
 * =========================================================
 * PAGE ACCESS
 * =========================================================
 *
 * Admin + Manager = full CRM page access.
 * Other users need explicit pageAccess.
 */
export function hasPageAccess(
  user: {
    role?: string;
    pageAccess?: string[];
  },
  page: string
): boolean {
  const role =
    user.role?.trim().toUpperCase();

  if (
    role === "ADMIN" ||
    role === "MANAGER"
  ) {
    return true;
  }

  if (!Array.isArray(user.pageAccess)) {
    return false;
  }

  return user.pageAccess.some(
    (item) =>
      typeof item === "string" &&
      item.trim().toLowerCase() ===
        page.trim().toLowerCase()
  );
}

/**
 * =========================================================
 * PORTAL ACCESS
 * =========================================================
 *
 * crm          -> CRM only
 * construction -> Construction only
 * both         -> both portals
 *
 * Admin is automatically allowed to access both.
 */
export function hasPortalAccess(
  user: {
    role?: string;
    portal?: Portal;
  } | null | undefined,
  portal: "crm" | "construction"
): boolean {
  if (!user) {
    return false;
  }

  const role =
    user.role?.trim().toUpperCase();

  /*
   * Admin can access both portals.
   */
  if (role === "ADMIN") {
    return true;
  }

  const userPortal =
    user.portal ?? "crm";

  /*
   * User assigned to both portals.
   */
  if (userPortal === "both") {
    return true;
  }

  /*
   * User assigned to the requested portal.
   */
  return userPortal === portal;
}