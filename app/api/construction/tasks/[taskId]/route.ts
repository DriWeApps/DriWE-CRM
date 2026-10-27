
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  getTaskById,
  getTaskByIdForAuthorization,
  updateTask,
  deleteTask,
} from "@/services/construction-task.service";
import { getProjectById } from "@/services/construction-project.service";
import type { ConstructionTaskStatus } from "@/types/construction";

type ConstructionUser = {
  userId: string;
  employeeId?: string;
  email: string;
  name?: string;
  role: string;
  companyId?: string;
};

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

const isAdmin = (user: ConstructionUser) =>
  ["ADMIN", "CONSTRUCTIONADMIN"].includes(user.role.toUpperCase());

const isManager = (user: ConstructionUser) =>
  user.role.toUpperCase() === "CONSTRUCTIONPROJECTMANAGER";

const isWorker = (user: ConstructionUser) =>
  user.role.toUpperCase() === "CONSTRUCTIONEMPLOYEE";

const getCompanyId = (user: ConstructionUser) =>
  user.companyId || user.userId;

function isAssignedToUser(task: any, user: ConstructionUser) {
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
}

async function canManageTaskProject(
  user: ConstructionUser,
  projectId: string
) {
  const project = await getProjectById(
    projectId,
    getCompanyId(user)
  );

  if (!project) return false;

  if (isAdmin(user)) return true;

  return (
    isManager(user) &&
    project.projectManagerUserId === user.userId
  );
}

export async function GET(
  req: Request,
  context: RouteContext
) {
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

    if (!isAdmin(user) && !isManager(user) && !isWorker(user)) {
      return NextResponse.json(
        { error: "You cannot view this task." },
        { status: 403 }
      );
    }

    const { taskId } = await context.params;

    let task;

    if (isWorker(user)) {
      task = await getTaskByIdForAuthorization(taskId);

      if (!task || !isAssignedToUser(task, user)) {
        return NextResponse.json(
          { error: "Task not found or not assigned to you." },
          { status: 404 }
        );
      }
    } else {
      task = await getTaskById(taskId, getCompanyId(user));

      if (!task) {
        return NextResponse.json(
          { error: "Task not found." },
          { status: 404 }
        );
      }

      if (
        isManager(user) &&
        !(await canManageTaskProject(user, task.projectId))
      ) {
        return NextResponse.json(
          { error: "You cannot access this task." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("GET construction task error:", error);

    return NextResponse.json(
      { error: "Failed to fetch task." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: RouteContext
) {
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

    if (!isAdmin(user) && !isManager(user) && !isWorker(user)) {
      return NextResponse.json(
        { error: "You cannot update this task." },
        { status: 403 }
      );
    }

    const { taskId } = await context.params;

    let task;

    if (isWorker(user)) {
      task = await getTaskByIdForAuthorization(taskId);

      if (!task || !isAssignedToUser(task, user)) {
        return NextResponse.json(
          { error: "Task not found or not assigned to you." },
          { status: 404 }
        );
      }
    } else {
      task = await getTaskById(taskId, getCompanyId(user));

      if (!task) {
        return NextResponse.json(
          { error: "Task not found." },
          { status: 404 }
        );
      }

      if (
        isManager(user) &&
        !(await canManageTaskProject(user, task.projectId))
      ) {
        return NextResponse.json(
          { error: "You cannot update this task." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();

    const allowedStatuses: ConstructionTaskStatus[] = [
      "Pending",
      "In Progress",
      "Completed",
      "Delayed",
    ];

    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid task status." },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown>;

    if (isWorker(user)) {
      /*
       * Workers can change only these fields.
       * Ignore all other fields sent by the client.
       */
      updateData = {};

      if (Object.prototype.hasOwnProperty.call(body, "status")) {
        updateData.status = body.status;
      }

      if (Object.prototype.hasOwnProperty.call(body, "remarks")) {
        updateData.remarks = body.remarks;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "completionDescription"
        )
      ) {
        updateData.completionDescription = body.completionDescription;
      }

      if (Object.prototype.hasOwnProperty.call(body, "completionLink")) {
        updateData.completionLink = body.completionLink;
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: "No permitted task fields were provided." },
          { status: 400 }
        );
      }
    } else {
      const allowedPriorities = ["Low", "Medium", "High"];

      if (
        body.priority &&
        !allowedPriorities.includes(body.priority)
      ) {
        return NextResponse.json(
          { error: "Invalid task priority." },
          { status: 400 }
        );
      }

      updateData = {};

      const editableFields = [
        "title",
        "description",
        "priority",
        "status",
        "startDate",
        "dueDate",
        "remarks",
        "completionDescription",
        "completionLink",
        "assignedTo",
        "assignedToName",
        "assignedToEmail",
      ];

      for (const field of editableFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
          updateData[field] = body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: "No editable task fields were provided." },
          { status: 400 }
        );
      }
    }

    /*
     * Use the task's stored companyId after authorization.
     * This supports assigned workers whose account companyId differs.
     */
    const updatedTask = await updateTask(
      taskId,
      task.companyId,
      updateData as any
    );

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Task could not be updated." },
        { status: 404 }
      );
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("PUT construction task error:", error);

    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: RouteContext
) {
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

    if (!isAdmin(user) && !isManager(user)) {
      return NextResponse.json(
        { error: "Workers cannot delete tasks." },
        { status: 403 }
      );
    }

    const { taskId } = await context.params;

    const task = await getTaskById(taskId, getCompanyId(user));

    if (!task) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    if (
      isManager(user) &&
      !(await canManageTaskProject(user, task.projectId))
    ) {
      return NextResponse.json(
        { error: "You cannot delete this task." },
        { status: 403 }
      );
    }

    const deleted = await deleteTask(taskId, task.companyId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Task could not be deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE construction task error:", error);

    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
