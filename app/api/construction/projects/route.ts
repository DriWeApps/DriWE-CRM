
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { getUserFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

import {
  createUser,
  getUserByEmail,
} from "@/services/auth.service";

import {
  createProject,
  deleteProject,
  getProjects,
  getAllProjects,
} from "@/services/construction-project.service";

import {
  createWorker,
  getWorkers,
} from "@/services/construction-worker.service";

import type {
  ProjectStatus,
  WorkerType,
} from "@/types/construction";

function normalizeRole(role?: string) {
  return role?.trim().toLowerCase() ?? "";
}

function isConstructionAdmin(user: { role?: string }) {
  const role = normalizeRole(user.role);
  return role === "admin" || role === "constructionadmin";
}

function isProjectManager(user: { role?: string }) {
  return normalizeRole(user.role) === "constructionprojectmanager";
}

function isConstructionWorker(user: { role?: string }) {
  return normalizeRole(user.role) === "constructionemployee";
}

function getCompanyId(user: {
  companyId?: string;
  userId: string;
}) {
  return user.companyId || user.userId;
}

const validStatuses: ProjectStatus[] = [
  "Planning",
  "Active",
  "On Hold",
  "Completed",
  "Cancelled",
];

const validWorkerTypes: WorkerType[] = [
  "Employee",
  "Contract Worker",
  "Daily Wage",
  "Subcontractor",
];

/**
 * GET /api/construction/projects
 *
 * Construction Admin:
 *   Can see every project across companies.
 *
 * Project Manager:
 *   Can see projects assigned to them.
 *
 * Construction Employee:
 *   Can see projects to which they are assigned.
 *
 * Builder / Project Creator:
 *   Can see only projects they created.
 *
 * Optional query:
 *   ?projectId=...
 */
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const admin = isConstructionAdmin(user);
    const manager = isProjectManager(user);
    const worker = isConstructionWorker(user);

    const url = new URL(req.url);
    const requestedProjectId =
      url.searchParams.get("projectId");

    // Admins retrieve projects across all companies.
    // Other roles start with projects in their own company.
    let projects = admin
      ? await getAllProjects()
      : await getProjects(getCompanyId(user));

    if (manager) {
      projects = projects.filter(
        (project) =>
          project.projectManagerUserId === user.userId
      );
    } else if (worker) {
      const assignedWorkers = await getWorkers(
        getCompanyId(user)
      );

      const assignedProjectIds = new Set(
        assignedWorkers
          .filter(
            (assignedWorker) =>
              assignedWorker.userId === user.userId
          )
          .map((assignedWorker) => assignedWorker.projectId)
      );

      projects = projects.filter((project) =>
        assignedProjectIds.has(project.projectId)
      );
    } else if (!admin) {
      // Builders and other project creators see only their own projects.
      projects = projects.filter(
        (project) => project.createdBy === user.userId
      );
    }

    // Apply the same permissions before returning a specific project.
    if (requestedProjectId) {
      projects = projects.filter(
        (project) =>
          project.projectId === requestedProjectId
      );
    }

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("GET construction projects error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/construction/projects
 *
 * Admin and builder/project-creator accounts can create projects.
 * Project managers and construction employees cannot use this endpoint.
 *
 * New projects are always assigned to the authenticated creator's
 * company and record the authenticated user's ID as createdBy.
 */
export async function POST(req: Request) {
  let createdProjectId: string | null = null;
  let createdCompanyId: string | null = null;
  let createdManagerUserId: string | null = null;

  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      isProjectManager(user) ||
      isConstructionWorker(user)
    ) {
      return NextResponse.json(
        {
          error:
            "Project managers and construction employees cannot create projects.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const project = body.project ?? body;
    const workers = body.workers ?? [];

    if (
      !project ||
      typeof project !== "object" ||
      Array.isArray(project)
    ) {
      return NextResponse.json(
        { error: "Invalid project details." },
        { status: 400 }
      );
    }

    const projectName = String(
      project.projectName ?? ""
    ).trim();

    const location = String(
      project.location ?? ""
    ).trim();

    const startDate = String(
      project.startDate ?? ""
    ).trim();

    const expectedCompletion = String(
      project.expectedCompletion ?? ""
    ).trim();

    const projectManagerName = String(
      project.projectManagerName ?? ""
    ).trim();

    const managerEmail = String(
      project.projectManagerEmail ??
        project.managerEmail ??
        ""
    )
      .trim()
      .toLowerCase();

    const managerPassword =
      project.projectManagerPassword ??
      project.managerPassword;

    const status = (
      project.status || "Planning"
    ) as ProjectStatus;

    if (
      !projectName ||
      !location ||
      !startDate ||
      !expectedCompletion
    ) {
      return NextResponse.json(
        {
          error:
            "Project name, location, start date and expected completion date are required.",
        },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid project status." },
        { status: 400 }
      );
    }

    if (!projectManagerName) {
      return NextResponse.json(
        { error: "Project manager name is required." },
        { status: 400 }
      );
    }

    if (
      !managerEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmail)
    ) {
      return NextResponse.json(
        { error: "A valid project manager email is required." },
        { status: 400 }
      );
    }

    if (
      typeof managerPassword !== "string" ||
      managerPassword.length < 6
    ) {
      return NextResponse.json(
        {
          error:
            "Project manager password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(workers)) {
      return NextResponse.json(
        { error: "Workers must be an array." },
        { status: 400 }
      );
    }

    // Validate worker inputs before creating any records.
    const seenWorkerEmails = new Set<string>();

    for (const worker of workers) {
      if (!worker || typeof worker !== "object") {
        return NextResponse.json(
          { error: "Invalid worker details." },
          { status: 400 }
        );
      }

      const name = String(worker.name ?? "").trim();
      const phone = String(worker.phone ?? "").trim();
      const email = String(worker.email ?? "")
        .trim()
        .toLowerCase();

      const password = worker.password;
      const workerType = worker.workerType as WorkerType;
      const salary = Number(worker.salary);

      if (!name) {
        return NextResponse.json(
          { error: "Every worker must have a name." },
          { status: 400 }
        );
      }

      if (!/^\d{10}$/.test(phone)) {
        return NextResponse.json(
          {
            error: `Invalid phone number for worker ${name}.`,
          },
          { status: 400 }
        );
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: `Invalid email for worker ${name}.` },
          { status: 400 }
        );
      }

      if (
        typeof password !== "string" ||
        password.length < 6
      ) {
        return NextResponse.json(
          {
            error:
              `Password for worker ${name} must be at least 6 characters.`,
          },
          { status: 400 }
        );
      }

      if (!validWorkerTypes.includes(workerType)) {
        return NextResponse.json(
          { error: `Invalid worker type for ${name}.` },
          { status: 400 }
        );
      }

      if (!Number.isFinite(salary) || salary <= 0) {
        return NextResponse.json(
          {
            error:
              `Salary for worker ${name} must be greater than zero.`,
          },
          { status: 400 }
        );
      }

      if (email === managerEmail) {
        return NextResponse.json(
          {
            error:
              "The project manager email cannot also be used for a worker account.",
          },
          { status: 400 }
        );
      }

      if (seenWorkerEmails.has(email)) {
        return NextResponse.json(
          { error: `Duplicate worker email: ${email}` },
          { status: 400 }
        );
      }

      seenWorkerEmails.add(email);
    }

    // Check that the project manager email is not already registered.
    const existingManager = await getUserByEmail(managerEmail);

    if (existingManager) {
      return NextResponse.json(
        {
          error:
            "An account already exists with the project manager email. Use a new email address.",
        },
        { status: 409 }
      );
    }

    // Check worker emails before writing records.
    for (const email of seenWorkerEmails) {
      const existingWorkerUser = await getUserByEmail(email);

      if (existingWorkerUser) {
        return NextResponse.json(
          {
            error:
              `An account already exists for worker email ${email}.`,
          },
          { status: 409 }
        );
      }
    }

    // Always derive the company and creator from the authenticated user.
    // Do not accept companyId or createdBy from the request body.
    const companyId = getCompanyId(user);
    createdCompanyId = companyId;

    // Create the project manager login.
    const managerUserId = randomUUID();
    const managerEmployeeId = randomUUID();
    createdManagerUserId = managerUserId;

    const hashedManagerPassword =
      await hashPassword(managerPassword);

    await createUser({
      userId: managerUserId,
      employeeId: managerEmployeeId,
      companyId,
      name: projectManagerName,
      email: managerEmail,
      password: hashedManagerPassword,
      role: "ConstructionProjectManager",
      pageAccess: [],
      portal: "construction",
    });

    // Create the project and record its authenticated creator.
    const createdProject = await createProject({
      companyId,
      projectName,
      location,
      projectManager: managerUserId,
      projectManagerName,
      projectManagerUserId: managerUserId,
      projectManagerEmail: managerEmail,
      startDate,
      expectedCompletion,
      status,
      description: project.description
        ? String(project.description).trim()
        : undefined,
      createdBy: user.userId,
      createdByName: user.name,
    });

    createdProjectId = createdProject.projectId;

    // Create workers for the new project.
    for (const worker of workers) {
      await createWorker({
        companyId,
        projectId: createdProject.projectId,
        projectName: createdProject.projectName,
        name: String(worker.name).trim(),
        phone: String(worker.phone).trim(),
        email: String(worker.email).trim().toLowerCase(),
        password: worker.password,
        workerType: worker.workerType,
        salary: Number(worker.salary),
        role: "ConstructionEmployee",
        active: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Project, project manager account and workers created successfully.",
        project: createdProject,
        projectManager: {
          userId: managerUserId,
          employeeId: managerEmployeeId,
          name: projectManagerName,
          email: managerEmail,
          role: "ConstructionProjectManager",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST construction projects error:", error);

    // Best-effort cleanup if project creation or worker creation fails.
    if (createdProjectId && createdCompanyId) {
      try {
        await deleteProject(
          createdProjectId,
          createdCompanyId
        );
      } catch (cleanupError) {
        console.error(
          "Project cleanup failed:",
          cleanupError
        );
      }
    }

    // A manager account created before a later failure may need cleanup.
    if (createdManagerUserId) {
      console.error(
        "A project manager account may need cleanup:",
        createdManagerUserId
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create project.",
      },
      { status: 500 }
    );
  }
}