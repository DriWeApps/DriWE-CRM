
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

import {
  createDailyUpdate,
  getDailyUpdates,
} from "@/services/construction-daily-update.service";

import {
  getProjectById,
  getAllProjects,
} from "@/services/construction-project.service";

type DailyUpdateUser = {
  userId: string;
  companyId?: string;
  name?: string;
  employeeName?: string;
  fullName?: string;
  email?: string;
  role?: string;
};

type ConstructionProject = {
  projectId: string;
  projectName?: string;
  companyId: string;
  companyName?: string;
};

function isConstructionAdmin(user: DailyUpdateUser): boolean {
  return ["ADMIN", "CONSTRUCTIONADMIN"].includes(
    (user.role || "").toUpperCase()
  );
}

function getCompanyId(user: DailyUpdateUser): string {
  return user.companyId || user.userId;
}

function getUserName(user: DailyUpdateUser): string {
  return (
    user.name ||
    user.employeeName ||
    user.fullName ||
    user.email ||
    "User"
  );
}

export async function GET(req: Request) {
  try {
    const user = (await getUserFromRequest(req)) as
      | DailyUpdateUser
      | null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;

    let updates: any[] = [];

    if (isConstructionAdmin(user)) {
      const projects = (await getAllProjects()) as ConstructionProject[];

      if (projectId) {
        const project = projects.find(
          (item) => item.projectId === projectId
        );

        if (!project) {
          return NextResponse.json(
            { success: false, error: "Project not found" },
            { status: 404 }
          );
        }

        updates = await getDailyUpdates(
          project.companyId,
          project.projectId
        );
      } else {
        const results = await Promise.all(
          projects.map((project) =>
            getDailyUpdates(project.companyId, project.projectId)
          )
        );

        const uniqueUpdates = new Map<string, any>();

        for (const group of results) {
          for (const update of group) {
            uniqueUpdates.set(update.updateId, update);
          }
        }

        updates = Array.from(uniqueUpdates.values());
      }
    } else {
      const companyId = getCompanyId(user);

      if (projectId) {
        const project = await getProjectById(projectId, companyId);

        if (!project) {
          return NextResponse.json(
            { success: false, error: "Project not found" },
            { status: 404 }
          );
        }
      }

      updates = await getDailyUpdates(companyId, projectId);
    }

    updates.sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || ""))
    );

    return NextResponse.json({
      success: true,
      updates,
    });
  } catch (error) {
    console.error("GET construction daily updates error:", error);

    return NextResponse.json(
      { error: "Failed to load daily site updates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = (await getUserFromRequest(req)) as
      | DailyUpdateUser
      | null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const projectId =
      typeof body.projectId === "string"
        ? body.projectId.trim()
        : "";

    if (!projectId) {
      return NextResponse.json(
        { error: "Project is required" },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    let project: ConstructionProject | null = null;

    if (isConstructionAdmin(user)) {
      const projects = (await getAllProjects()) as ConstructionProject[];

      project =
        projects.find((item) => item.projectId === projectId) || null;
    } else {
      const foundProject = await getProjectById(
        projectId,
        getCompanyId(user)
      );

      project = foundProject as ConstructionProject | null;
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you cannot access this project." },
        { status: 403 }
      );
    }

    const workersPresent = Number(body.workersPresent ?? 0);
    const tasksCompleted = Number(body.tasksCompleted ?? 0);
    const materialReceived = Number(body.materialReceived ?? 0);
    const materialUsed = Number(body.materialUsed ?? 0);
    const issues = Number(body.issues ?? 0);

    const counts = [
      workersPresent,
      tasksCompleted,
      materialReceived,
      materialUsed,
      issues,
    ];

    if (
      counts.some(
        (value) => !Number.isFinite(value) || value < 0
      )
    ) {
      return NextResponse.json(
        { error: "Daily update counts must be valid non-negative numbers." },
        { status: 400 }
      );
    }

    const materialsUsed = Array.isArray(body.materialsUsed)
      ? body.materialsUsed.map(
          (item: { materialId?: unknown; quantity?: unknown }) => ({
            materialId:
              typeof item.materialId === "string"
                ? item.materialId
                : "",
            quantity: Number(item.quantity),
          })
        )
      : [];

    if (
      materialsUsed.some(
        (item: { materialId: string; quantity: number }) =>
          !item.materialId ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      return NextResponse.json(
        { error: "Each material used must have a valid material ID and positive quantity." },
        { status: 400 }
      );
    }

    const update = await createDailyUpdate(
      project.companyId,
      {
        projectId: project.projectId,
        projectName: project.projectName || body.projectName || "",
        date: body.date,
        workersPresent,
        tasksCompleted,
        materialReceived,
        materialUsed,
        materialsUsed,
        issues,
        issueDescription: body.issueDescription || "",
        photos: Array.isArray(body.photos) ? body.photos : [],
        note: body.note || "",
        submittedBy: user.userId,
        submittedByName: getUserName(user),
      }
    );

    return NextResponse.json(
      { success: true, update },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST construction daily update error:", error);

    if (
      error instanceof Error &&
      /not available|valid material|selected material|insufficient|stock changed/i.test(
        error.message
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create daily site update" },
      { status: 500 }
    );
  }
}
