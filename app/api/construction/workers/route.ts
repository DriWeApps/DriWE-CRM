
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import {
  getProjects,
  getProjectById,
} from "@/services/construction-project.service";

import {
  getWorkers,
  getWorkersByProject,
  createWorker,
} from "@/services/construction-worker.service";

import type { WorkerType } from "@/types/construction";

export const dynamic = "force-dynamic";

type AuthUser = {
  userId?: string;
  employeeId?: string;
  email?: string;
  role?: string;
  companyId?: string;
  portal?: string;
};

type PersonEntry = {
  personId: string;
  workerId?: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  personType: "Worker" | "Project Manager" | "Project Creator";
  workerType?: WorkerType;
  salary: number;
  dailyWage: number;
  compensationType: "Salary" | "Daily Wage" | "Not Set";
  compensationAmount: number;
  projectId: string;
  projectName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET or AUTH_SECRET is not configured."
    );
  }

  return new TextEncoder().encode(secret);
}

async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      getJwtSecret()
    );

    return {
      userId:
        typeof payload.userId === "string"
          ? payload.userId
          : undefined,
      employeeId:
        typeof payload.employeeId === "string"
          ? payload.employeeId
          : undefined,
      email:
        typeof payload.email === "string"
          ? payload.email
          : undefined,
      role:
        typeof payload.role === "string"
          ? payload.role
          : undefined,
      companyId:
        typeof payload.companyId === "string"
          ? payload.companyId
          : undefined,
      portal:
        typeof payload.portal === "string"
          ? payload.portal
          : undefined,
    };
  } catch {
    return null;
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message, message },
    { status }
  );
}

function getCompanyId(user: AuthUser): string | null {
  return user.companyId || user.userId || null;
}

function normalizeId(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isWorkerType(value: string): value is WorkerType {
  return (
    value === "Employee" ||
    value === "Contract Worker" ||
    value === "Daily Wage" ||
    value === "Subcontractor"
  );
}

function getWorkerCompensation(worker: {
  workerType?: string;
  salary?: number;
  dailyWage?: number;
}) {
  const salary = Number(worker.salary || 0);
  const dailyWage = Number(
    worker.dailyWage || 0
  );

  if (worker.workerType === "Daily Wage") {
    return {
      salary,
      dailyWage,
      compensationType: "Daily Wage" as const,
      compensationAmount:
        dailyWage || salary,
    };
  }

  return {
    salary,
    dailyWage,
    compensationType:
      salary > 0 ? ("Salary" as const) : ("Not Set" as const),
    compensationAmount: salary,
  };
}

/**
 * GET /api/construction/workers
 * GET /api/construction/workers?projectId=PROJECT_ID
 *
 * Returns workers plus project managers and project creators.
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Unauthorized. Please log in.",
        401
      );
    }

    const companyId = getCompanyId(user);

    if (!companyId) {
      return jsonError(
        "Your account is not associated with a company.",
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = normalizeId(
      searchParams.get("projectId")
    );

    let projects;

    if (projectId) {
      const project = await getProjectById(
        projectId,
        companyId
      );

      if (!project) {
        return jsonError(
          "Project not found or you do not have access to it.",
          404
        );
      }

      projects = [project];
    } else {
      projects = await getProjects(companyId);
    }

    const workers = projectId
      ? await getWorkersByProject(
          projectId,
          companyId
        )
      : await getWorkers(companyId);

    const people: PersonEntry[] = [];

    for (const worker of workers) {
      const compensation =
        getWorkerCompensation(worker);

      people.push({
        personId: worker.workerId,
        workerId: worker.workerId,
        companyId: worker.companyId,
        name: worker.name,
        email: worker.email,
        phone: worker.phone || "",
        role: worker.role || "ConstructionEmployee",
        personType: "Worker",
        workerType: worker.workerType,
        ...compensation,
        projectId: worker.projectId,
        projectName: worker.projectName || "",
        active: worker.active !== false,
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt,
      });
    }

    const workerEmails = new Set(
      workers
        .map((worker) =>
          normalizeId(worker.email).toLowerCase()
        )
        .filter(Boolean)
    );

    const workerUserIds = new Set(
      workers
        .map((worker) => normalizeId(worker.userId))
        .filter(Boolean)
    );

    for (const project of projects) {
      const projectName = project.projectName || "";

      const managerName =
        normalizeId(project.projectManagerName) ||
        normalizeId(project.projectManager);

      const managerEmail = normalizeId(
        project.projectManagerEmail
      ).toLowerCase();

      const managerUserId = normalizeId(
        project.projectManagerUserId
      );

      const managerAlreadyListed =
        (managerEmail && workerEmails.has(managerEmail)) ||
        (managerUserId && workerUserIds.has(managerUserId));

      if (managerName && !managerAlreadyListed) {
        people.push({
          personId: `manager-${project.projectId}`,
          companyId,
          name: managerName,
          email: managerEmail,
          phone: "",
          role: "ConstructionProjectManager",
          personType: "Project Manager",
          salary: 0,
          dailyWage: 0,
          compensationType: "Not Set",
          compensationAmount: 0,
          projectId: project.projectId,
          projectName,
          active: true,
        });
      }

      const creatorName = normalizeId(
        project.createdByName
      );

      const creatorId = normalizeId(
        project.createdBy
      );

      const creatorAlreadyListed =
        (creatorId && workerUserIds.has(creatorId)) ||
        (creatorId &&
          workerEmails.has(creatorId.toLowerCase())) ||
        (managerUserId && creatorId === managerUserId) ||
        (managerEmail &&
          creatorId.toLowerCase() === managerEmail);

      if (
        creatorName &&
        !creatorAlreadyListed &&
        creatorName.toLowerCase() !==
          managerName.toLowerCase()
      ) {
        people.push({
          personId: `creator-${project.projectId}`,
          companyId,
          name: creatorName,
          email: "",
          phone: "",
          role: "Project Creator",
          personType: "Project Creator",
          salary: 0,
          dailyWage: 0,
          compensationType: "Not Set",
          compensationAmount: 0,
          projectId: project.projectId,
          projectName,
          active: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      workers: people,
    });
  } catch (error) {
    console.error(
      "GET /api/construction/workers error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to retrieve workers.",
      500
    );
  }
}

/**
 * POST /api/construction/workers
 *
 * Creates a worker associated with a project.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Unauthorized. Please log in.",
        401
      );
    }

    const companyId = getCompanyId(user);

    if (!companyId) {
      return jsonError(
        "Your account is not associated with a company.",
        403
      );
    }

    const role = (user.role || "")
      .trim()
      .toUpperCase();

    const canManageWorkers = [
      "ADMIN",
      "CONSTRUCTIONADMIN",
      "CONSTRUCTIONMANAGER",
      "MANAGER",
    ].includes(role);

    if (!canManageWorkers) {
      return jsonError(
        "You do not have permission to create workers.",
        403
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return jsonError(
        "Invalid JSON request body.",
        400
      );
    }

    const projectId = normalizeId(body.projectId);
    const name = normalizeId(body.name);
    const email = normalizeId(body.email).toLowerCase();
    const phone = normalizeId(body.phone);
    const workerType = normalizeId(body.workerType);
    const password =
      typeof body.password === "string"
        ? body.password
        : "";
    const salaryInput = body.salary;
    const salary = Number(salaryInput);

    if (!projectId) {
      return jsonError(
        "Please select a project for this worker.",
        400
      );
    }

    if (!name) {
      return jsonError(
        "Worker name is required.",
        400
      );
    }

    if (!email || !phone || !password) {
      return jsonError(
        "Email, phone, and password are required.",
        400
      );
    }

    if (!isWorkerType(workerType)) {
      return jsonError(
        "Please select a valid worker type.",
        400
      );
    }

    if (
      salaryInput === undefined ||
      salaryInput === null ||
      String(salaryInput).trim() === "" ||
      !Number.isFinite(salary) ||
      salary < 0
    ) {
      return jsonError(
        "A valid non-negative salary is required.",
        400
      );
    }

    const project = await getProjectById(
      projectId,
      companyId
    );

    if (!project) {
      return jsonError(
        "Project not found or you do not have access to it.",
        404
      );
    }

    const dailyWageInput = body.dailyWage;
    const dailyWage =
      dailyWageInput !== undefined &&
      dailyWageInput !== null &&
      String(dailyWageInput).trim() !== "" &&
      Number.isFinite(Number(dailyWageInput)) &&
      Number(dailyWageInput) >= 0
        ? Number(dailyWageInput)
        : undefined;

    const worker = await createWorker({
      projectId,
      projectName:
        normalizeId(body.projectName) ||
        normalizeId(
          (project as { projectName?: string }).projectName
        ),
      companyId,
      name,
      email,
      phone,
      password,
      workerType,
      salary,
      ...(dailyWage !== undefined
        ? { dailyWage }
        : {}),
      active: body.active === false ? false : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Worker created successfully.",
        worker,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/construction/workers error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to create worker.",
      500
    );
  }
}
