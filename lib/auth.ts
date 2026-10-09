import {
  SignJWT,
  jwtVerify,
} from "jose";

import type {
  JWTPayload,
} from "jose";

import {
  NextRequest,
} from "next/server";

import {
  getUserById,
} from "@/services/auth.service";

/* =========================================================
   JWT SECRET
========================================================= */

const secret =
  new TextEncoder().encode(
    process.env.JWT_SECRET!
  );

/* =========================================================
   PORTAL TYPE
========================================================= */

export type Portal =
  | "crm"
  | "construction"
  | "both";

/* =========================================================
   USER TOKEN PAYLOAD
========================================================= */

export interface UserTokenPayload
  extends JWTPayload {
  userId: string;

  employeeId: string;

  email: string;

  role: string;

  /*
   * Company ID is included so construction
   * users can be isolated by company.
   */
  companyId?: string;

  pageAccess?: string[];

  portal?: Portal;
}

/* =========================================================
   CREATE TOKEN
========================================================= */

export async function createToken(
  payload: UserTokenPayload
) {
  return await new SignJWT(
    payload
  )
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/* =========================================================
   VERIFY TOKEN
========================================================= */

export async function verifyToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const {
      payload,
    } = await jwtVerify(
      token,
      secret
    );

    return payload as UserTokenPayload;
  } catch (error) {
    console.error(
      "JWT verification failed:",
      error
    );

    return null;
  }
}

/* =========================================================
   GET USER FROM REQUEST
========================================================= */

export async function getUserFromRequest(
  req: Request | NextRequest
) {
  let token:
    | string
    | undefined;

  /* -------------------------------------------------------
     Read token from NextRequest cookies
  ------------------------------------------------------- */

  if (
    "cookies" in req &&
    typeof req.cookies?.get ===
      "function"
  ) {
    token =
      req.cookies.get(
        "token"
      )?.value;
  } else {
    /* -----------------------------------------------------
       Read token from standard Request cookie header
    ----------------------------------------------------- */

    const cookieHeader =
      req.headers.get(
        "cookie"
      ) ?? "";

    const cookie =
      cookieHeader
        .split(";")
        .map(
          (item) =>
            item.trim()
        )
        .find(
          (item) =>
            item.startsWith(
              "token="
            )
        );

    token =
      cookie?.slice(
        "token=".length
      );
  }

  /* -------------------------------------------------------
     No token
  ------------------------------------------------------- */

  if (!token) {
    return null;
  }

  /* -------------------------------------------------------
     Verify token
  ------------------------------------------------------- */

  const payload =
    await verifyToken(
      token
    );

  if (!payload) {
    return null;
  }

  /* -------------------------------------------------------
     Get fresh user from DB
  ------------------------------------------------------- */

  const dbUser =
    await getUserById(
      payload.userId
    );

  if (!dbUser) {
    return null;
  }

  /*
   * Return current DB user.
   *
   * This means changes to:
   *
   * - portal
   * - pageAccess
   * - role
   * - companyId
   *
   * are reflected without waiting for
   * the old JWT to expire.
   */
  return dbUser as {
    userId: string;

    employeeId: string;

    email: string;

    name?: string;

    role?: string;

    companyId?: string;

    pageAccess?: string[];

    portal?: Portal;
  };
}

/* =========================================================
   ADMIN CHECK
========================================================= */

export function isAdminUser(
  user:
    | {
        role?: string;
      }
    | null
    | undefined
) {
  return (
    user?.role
      ?.trim()
      .toLowerCase() ===
    "admin"
  );
}

/* =========================================================
   MANAGER CHECK
========================================================= */

export function isManagerUser(
  user:
    | {
        role?: string;
      }
    | null
    | undefined
) {
  return (
    user?.role
      ?.trim()
      .toLowerCase() ===
    "manager"
  );
}

/* =========================================================
   TASK ASSIGNMENT PERMISSION
========================================================= */

export function canAssignTask(
  user:
    | {
        role?: string;
      }
    | null
    | undefined
) {
  const role =
    user?.role
      ?.trim()
      .toUpperCase();

  return (
    role === "ADMIN" ||
    role === "MANAGER"
  );
}

/* =========================================================
   PAGE ACCESS
========================================================= */

/*
 * Admin + Manager = full CRM page access.
 *
 * Other users need explicit pageAccess.
 *
 * ConstructionEmployee is intentionally NOT
 * automatically granted CRM page access.
 */
export function hasPageAccess(
  user: {
    role?: string;

    pageAccess?: string[];
  },

  page: string
): boolean {
  const role =
    user.role
      ?.trim()
      .toUpperCase();

  if (
    role === "ADMIN" ||
    role === "MANAGER"
  ) {
    return true;
  }

  if (
    !Array.isArray(
      user.pageAccess
    )
  ) {
    return false;
  }

  return user.pageAccess.some(
    (item) =>
      typeof item ===
        "string" &&
      item
        .trim()
        .toLowerCase() ===
        page
          .trim()
          .toLowerCase()
  );
}

/* =========================================================
   PORTAL ACCESS
========================================================= */

/*
 * crm
 *      → CRM only
 *
 * construction
 *      → Construction only
 *
 * both
 *      → Both portals
 *
 * Admin
 *      → Automatically allowed to access both
 */
export function hasPortalAccess(
  user:
    | {
        role?: string;

        portal?: Portal;
      }
    | null
    | undefined,

  portal:
    | "crm"
    | "construction"
): boolean {
  if (!user) {
    return false;
  }

  const role =
    user.role
      ?.trim()
      .toUpperCase();

  /* -------------------------------------------------------
     Admin
  ------------------------------------------------------- */

  if (
    role === "ADMIN"
  ) {
    return true;
  }

  /* -------------------------------------------------------
     User portal
  ------------------------------------------------------- */

  const userPortal =
    user.portal ??
    "crm";

  /* -------------------------------------------------------
     Both portals
  ------------------------------------------------------- */

  if (
    userPortal ===
    "both"
  ) {
    return true;
  }

  /* -------------------------------------------------------
     Requested portal
  ------------------------------------------------------- */

  return (
    userPortal ===
    portal
  );
}

/* =========================================================
   CONSTRUCTION EMPLOYEE CHECK
========================================================= */

export function isConstructionEmployee(
  user:
    | {
        role?: string;

        portal?: Portal;
      }
    | null
    | undefined
): boolean {
  if (!user) {
    return false;
  }

  const role =
    user.role
      ?.trim()
      .toUpperCase();

  const portal =
    user.portal;

  return (
    role ===
      "CONSTRUCTIONEMPLOYEE" &&
    (
      portal ===
        "construction" ||
      portal ===
        "both"
    )
  );
}