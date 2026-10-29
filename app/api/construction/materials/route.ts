
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

import {
  getMaterials,
  getMaterialsByProject,
  getMaterialsBySite,
  createMaterial,
} from "@/services/construction-material.service";

import {
  getProjectById,
  getAllProjects,
} from "@/services/construction-project.service";

import type {
  MaterialStatus,
} from "@/services/construction-material.service";

/* ============================================================
   TYPES
============================================================ */

type ConstructionUser = {
  userId: string;
  employeeId: string;
  email: string;
  name?: string;
  role?: string;
  companyId?: string;
  pageAccess?: string[];
  portal?: "crm" | "construction" | "both";
};

type ConstructionProject = {
  projectId: string;
  projectName?: string;
  companyId: string;
  companyName?: string;

  // Project ownership and manager assignment fields
  createdBy?: string;
  createdByEmail?: string;
  projectCreatorId?: string;
  projectManagerId?: string;
  managerId?: string;
  assignedManagerId?: string;
  projectManagerEmail?: string;
  managerEmail?: string;
  assignedManagerEmail?: string;
  assignedTo?: string;
  assignedToEmail?: string;

  [key: string]: any;
};

const VALID_STATUSES: MaterialStatus[] = [
  "Active",
  "Inactive",
];

const isConstructionAdmin = (user: ConstructionUser) =>
  ["ADMIN", "CONSTRUCTIONADMIN"].includes(
    (user.role || "").toUpperCase()
  );

const getCompanyId = (user: ConstructionUser) =>
  user.companyId || user.userId;

/* ============================================================
   PROJECT PERMISSIONS
============================================================ */


function canManageProject(
  user: ConstructionUser,
  project: ConstructionProject
): boolean {
  const userIdentifiers = [
    user.userId,
    user.email,
    user.employeeId,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase());

  const creatorValues = [
    project.createdBy,
    project.projectCreatorId,
    project.createdByEmail,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase());

  const managerValues = [
    project.projectManagerId,
    project.managerId,
    project.assignedManagerId,
    project.projectManagerEmail,
    project.managerEmail,
    project.assignedManagerEmail,
    project.assignedTo,
    project.assignedToEmail,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase());

  const isCreator = creatorValues.some((value) =>
    userIdentifiers.includes(value)
  );

  const isProjectManager = managerValues.some((value) =>
    userIdentifiers.includes(value)
  );

  return isCreator || isProjectManager;
}


/* ============================================================
   GET MATERIALS
============================================================ */

export async function GET(req: Request) {
  try {
    const user = (await getUserFromRequest(
      req
    )) as ConstructionUser | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const companyId = getCompanyId(user);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const siteId = searchParams.get("siteId");

    let materials: any[] = [];

    if (projectId) {
      if (isConstructionAdmin(user)) {
        const projects = (await getAllProjects()) as ConstructionProject[];
        const project = projects.find(
          (item) => item.projectId === projectId
        );

        if (!project) {
          return NextResponse.json(
            { success: false, message: "Project not found" },
            { status: 404 }
          );
        }

        materials = await getMaterialsByProject(
          project.projectId,
          project.companyId
        );
      } else {
        const project = await getProjectById(projectId, companyId);

        if (!project) {
          return NextResponse.json(
            { success: false, message: "Project not found" },
            { status: 404 }
          );
        }

        materials = await getMaterialsByProject(
          projectId,
          companyId
        );
      }
    } else if (siteId) {
      if (isConstructionAdmin(user)) {
        const projects = (await getAllProjects()) as ConstructionProject[];
        const companyIds = [
          ...new Set(projects.map((project) => project.companyId)),
        ];

        const results = await Promise.all(
          companyIds.map((id) => getMaterialsBySite(siteId, id))
        );

        materials = results.flat();
      } else {
        materials = await getMaterialsBySite(siteId, companyId);
      }
    } else if (isConstructionAdmin(user)) {
      const projects = (await getAllProjects()) as ConstructionProject[];

      const results = await Promise.all(
        projects.map((project) => getMaterials(project.companyId))
      );

      const uniqueMaterials = new Map<string, any>();

      for (const group of results) {
        for (const material of group) {
          uniqueMaterials.set(material.materialId, material);
        }
      }

      materials = Array.from(uniqueMaterials.values());
    } else {
      materials = await getMaterials(companyId);
    }

    materials.sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return NextResponse.json({
      success: true,
      materials,
      count: materials.length,
    });
  } catch (error) {
    console.error("GET construction materials error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch construction materials",
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   CREATE MATERIAL
   Only the project manager, project creator, or admin can create.
============================================================ */

export async function POST(req: Request) {
  try {
    const user = (await getUserFromRequest(
      req
    )) as ConstructionUser | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const projectId =
      typeof body.projectId === "string"
        ? body.projectId.trim()
        : "";

    const materialName =
      typeof body.materialName === "string"
        ? body.materialName.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const unit =
      typeof body.unit === "string"
        ? body.unit.trim()
        : "";

    const quantity = Number(body.quantity);

    const minimumStock =
      body.minimumStock !== undefined &&
      body.minimumStock !== ""
        ? Number(body.minimumStock)
        : undefined;

    const unitPrice =
      body.unitPrice !== undefined &&
      body.unitPrice !== ""
        ? Number(body.unitPrice)
        : 0;

    const supplierName =
      typeof body.supplierName === "string"
        ? body.supplierName.trim()
        : "";

    const supplierContact =
      typeof body.supplierContact === "string"
        ? body.supplierContact.trim()
        : "";

    const status: MaterialStatus = body.status || "Active";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const remarks =
      typeof body.remarks === "string"
        ? body.remarks.trim()
        : "";

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!materialName) {
      return NextResponse.json(
        { success: false, message: "Material name is required" },
        { status: 400 }
      );
    }

    if (
      !unit ||
      unit.length > 50 ||
      !/[a-zA-Z]/.test(unit)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid unit (for example kg, bags, or pieces). Enter the stock count in quantity.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quantity must be a valid number greater than or equal to 0",
        },
        { status: 400 }
      );
    }

    if (
      minimumStock !== undefined &&
      (!Number.isFinite(minimumStock) || minimumStock < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Minimum stock must be a valid number greater than or equal to 0",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unit price must be a valid number greater than or equal to 0",
        },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid material status" },
        { status: 400 }
      );
    }

    /*
     * Load the actual project from the database.
     * Never trust ownership or manager IDs supplied by the browser.
     */
    let project: ConstructionProject | null = null;

    if (isConstructionAdmin(user)) {
      const projects = (await getAllProjects()) as ConstructionProject[];

      project =
        projects.find((item) => item.projectId === projectId) || null;
    } else {
      project = (await getProjectById(
        projectId,
        getCompanyId(user)
      )) as ConstructionProject | null;
    }

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    /*
     * Authorization:
     * - Admins can create materials.
     * - The project creator can create materials.
     * - The assigned project manager can create materials.
     * - Everyone else is denied.
     */
    if (
      !isConstructionAdmin(user) &&
      !canManageProject(user, project)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can create materials only for projects you created or manage.",
        },
        { status: 403 }
      );
    }

    // Always use the actual project's company and identity.
    const companyId = project.companyId;

    const material = await createMaterial({
      companyId,
      companyName: project.companyName,
      projectId: project.projectId,
      projectName: project.projectName,
      materialName,
      category: category || undefined,
      unit,
      quantity,
      minimumStock,
      unitPrice,
      supplierName: supplierName || undefined,
      supplierContact: supplierContact || undefined,
      status,
      description: description || undefined,
      remarks: remarks || undefined,
      createdBy: user.userId,
      createdByName: user.name || user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Material created successfully",
        material,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST construction material error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create construction material",
      },
      { status: 500 }
    );
  }
}
