
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  getTasks,
  getTasksByProject,
  getTasksByAssignee,
  getTasksForAssigneeAcrossCompanies,
  createTask,
} from "@/services/construction-task.service";
import {
  getProjectById,
  getProjects,
  getAllProjects,
} from "@/services/construction-project.service";
import { getWorkers } from "@/services/construction-worker.service";
import type { ConstructionTaskStatus } from "@/types/construction";

type ConstructionUser = {
  userId: string;
  employeeId?: string;
  email: string;
  name?: string;
  role: string;
  companyId?: string;
};

type AssignedTask = {
  taskId: string;
  companyId: string;
  projectId: string;
  assignedTo?: string;
  assignedToEmail?: string;
  dueDate?: string;
  createdAt?: string;
};

type AssignedProject = {
  projectId: string;
  projectName?: string;
  companyId: string;
  companyName?: string;
  projectManagerUserId?: string;
};

const isAdmin = (user: ConstructionUser) =>
  ["ADMIN", "CONSTRUCTIONADMIN"].includes(user.role.toUpperCase());

const isProjectManager = (user: ConstructionUser) =>
  user.role.toUpperCase() === "CONSTRUCTIONPROJECTMANAGER";

const isWorker = (user: ConstructionUser) =>
  user.role.toUpperCase() === "CONSTRUCTIONEMPLOYEE";

const getCompanyId = (user: ConstructionUser) =>
  user.companyId || user.userId;

const isAssignedToUser = (
  task: AssignedTask,
  user: ConstructionUser
) => {
  const identifiers = [
    user.userId,
    user.employeeId,
    user.email,
  ]
    .filter(Boolean)
    .map((value) => value!.trim().toLowerCase());

  return [task.assignedTo, task.assignedToEmail]
    .filter(Boolean)
    .some((value) => identifiers.includes(value!.trim().toLowerCase()));
};

async function getAuthorizedProject(
  user: ConstructionUser,
  projectId: string
) {
  if (!isAdmin(user) && !isProjectManager(user)) {
    return null;
  }

  // Admins can access projects across companies.
  if (isAdmin(user)) {
    const projects = (await getAllProjects()) as AssignedProject[];

    return (
      projects.find((project) => project.projectId === projectId) || null
    );
  }

  // Project Managers remain restricted to their own company and projects.
  const project = await getProjectById(projectId, getCompanyId(user));

  if (!project) return null;

  if (project.projectManagerUserId !== user.userId) {
    return null;
  }

  return project;
}

export async function GET(req: Request) {
  try {
    const user = (await getUserFromRequest(req)) as
      | ConstructionUser
      | null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(user) && !isProjectManager(user) && !isWorker(user)) {
      return NextResponse.json(
        { error: "You do not have permission to view construction tasks." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const requestedAssignee = url.searchParams.get("assignedTo");
    const companyId = getCompanyId(user);

    let tasks: AssignedTask[] = [];

    if (isWorker(user)) {
      // Workers can see only tasks assigned to their authenticated identity.
      tasks = await getTasksForAssigneeAcrossCompanies([
        user.userId,
        user.employeeId || "",
        user.email,
      ]);

      tasks = tasks.filter((task) => isAssignedToUser(task, user));
    } else if (isProjectManager(user)) {
      const projects = (await getProjects(companyId)) as AssignedProject[];

      const managedProjects = projects.filter(
        (project) => project.projectManagerUserId === user.userId
      );

      const projectIds = projectId
        ? managedProjects
            .filter((project) => project.projectId === projectId)
            .map((project) => project.projectId)
        : managedProjects.map((project) => project.projectId);

      if (projectId && projectIds.length === 0) {
        return NextResponse.json(
          { error: "You cannot access this project." },
          { status: 403 }
        );
      }

      const taskGroups = await Promise.all(
        projectIds.map((id) => getTasksByProject(id, companyId))
      );

      tasks = taskGroups.flat() as AssignedTask[];

      if (requestedAssignee) {
        tasks = tasks.filter(
          (task) =>
            task.assignedTo === requestedAssignee ||
            task.assignedToEmail?.toLowerCase() ===
              requestedAssignee.toLowerCase()
        );
      }
    } else if (projectId) {
      const project = await getAuthorizedProject(user, projectId);

      if (!project) {
        return NextResponse.json(
          { error: "You cannot access this project." },
          { status: 403 }
        );
      }

      // Use the selected project's company, not the admin's company.
      tasks = (await getTasksByProject(
        projectId,
        project.companyId
      )) as AssignedTask[];

      if (requestedAssignee) {
        tasks = tasks.filter(
          (task) =>
            task.assignedTo === requestedAssignee ||
            task.assignedToEmail?.toLowerCase() ===
              requestedAssignee.toLowerCase()
        );
      }
    } else if (isAdmin(user)) {
      // Collect tasks from every project using its actual companyId.
      const projects = (await getAllProjects()) as AssignedProject[];

      const taskGroups = await Promise.all(
        projects.map((project) =>
          getTasksByProject(project.projectId, project.companyId)
        )
      );

      tasks = taskGroups.flat() as AssignedTask[];

      if (requestedAssignee) {
        tasks = tasks.filter(
          (task) =>
            task.assignedTo === requestedAssignee ||
            task.assignedToEmail?.toLowerCase() ===
              requestedAssignee.toLowerCase()
        );
      }
    } else if (requestedAssignee) {
      tasks = (await getTasksByAssignee(
        requestedAssignee,
        companyId
      )) as AssignedTask[];
    } else {
      tasks = (await getTasks(companyId)) as AssignedTask[];
    }

    tasks.sort((a, b) => {
      const aDate = a.dueDate || a.createdAt || "";
      const bDate = b.dueDate || b.createdAt || "";
      return aDate.localeCompare(bDate);
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET construction tasks error:", error);

    return NextResponse.json(
      { error: "Failed to fetch construction tasks." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = (await getUserFromRequest(req)) as
      | ConstructionUser
      | null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(user) && !isProjectManager(user)) {
      return NextResponse.json(
        { error: "You cannot create tasks." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      projectId,
      title,
      description,
      assignedTo,
      priority,
      status,
      startDate,
      dueDate,
      remarks,
      completionDescription,
      completionLink,
    } = body;

    if (!projectId || !title?.trim()) {
      return NextResponse.json(
        { error: "Project and task title are required." },
        { status: 400 }
      );
    }

    const allowedStatuses: ConstructionTaskStatus[] = [
      "Pending",
      "In Progress",
      "Completed",
      "Delayed",
    ];

    const allowedPriorities = ["Low", "Medium", "High"];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid task status." },
        { status: 400 }
      );
    }

    if (priority && !allowedPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid task priority." },
        { status: 400 }
      );
    }

    const project = await getAuthorizedProject(user, projectId);

    if (!project) {
      return NextResponse.json(
        { error: "You cannot create tasks for this project." },
        { status: 403 }
      );
    }

    const companyId = project.companyId;

    const workers = await getWorkers(companyId);

    const worker = workers.find((item: any) =>
      [
        item.workerId,
        item.userId,
        item.employeeId,
        item.email,
      ]
        .filter(Boolean)
        .some(
          (value: string) =>
            value.trim().toLowerCase() ===
            String(assignedTo || "").trim().toLowerCase()
        )
    );

    if (assignedTo && !worker) {
      return NextResponse.json(
        { error: "The selected worker was not found in this project's company." },
        { status: 404 }
      );
    }

   if (
  worker &&
  (
    (worker as any).status === "Inactive" ||
    worker.loginEnabled === false
  )
) {
      return NextResponse.json(
        { error: "This worker is inactive or cannot log in." },
        { status: 400 }
      );
    }

    if (worker && worker.projectId && worker.projectId !== projectId) {
      return NextResponse.json(
        { error: "The selected worker does not belong to this project." },
        { status: 400 }
      );
    }

    const task = await createTask({
      companyId,
      companyName: (project as any).companyName,
      projectId,
      projectName: (project as any).projectName,
      title: title.trim(),
      description,
      assignedTo: worker
        ? worker.userId || worker.workerId
        : assignedTo,
      assignedToName: worker?.name,
      assignedToEmail: worker?.email,
      assignedBy: user.userId,
      assignedByName: user.name || user.email,
      priority: priority || "Medium",
      status: status || "Pending",
      startDate,
      dueDate,
      remarks,
      completionDescription,
      completionLink,
      createdBy: user.userId,
      createdByName: user.name || user.email,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("POST construction task error:", error);

    return NextResponse.json(
      { error: "Failed to create construction task." },
      { status: 500 }
    );
  }
}
