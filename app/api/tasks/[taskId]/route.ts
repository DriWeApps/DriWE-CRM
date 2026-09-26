import { NextResponse } from "next/server";

import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/services/task.service";

import {
  getUserFromRequest,
  isAdminUser,
  isManagerUser,
} from "@/lib/auth";

interface Params {
  params: Promise<{
    taskId: string;
  }>;
}

function formatTaskDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isAdminOrManager(user: {
  role?: string;
}) {
  const role = user.role?.trim().toLowerCase();

  return (
    role === "admin" ||
    role === "manager"
  );
}

export async function GET(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          message: "Task ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const task = await getTaskById(taskId);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Admin and Manager can view all tasks.
     * Other employees can only view tasks assigned to them.
     */
    const canView =
      isAdminOrManager(user) ||
      task.assignedToEmail?.trim().toLowerCase() ===
        user.email?.trim().toLowerCase();

    if (!canView) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get Task Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch task",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          message: "Task ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const oldTask = await getTaskById(taskId);

    if (!oldTask) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    console.log("Update Task Request Body:", body);

    /*
     * ---------------------------------------------------------
     * ADMIN / MANAGER
     * ---------------------------------------------------------
     *
     * Admin and Manager can fully edit the task.
     */
    if (isAdminOrManager(user)) {
      await updateTask(taskId, {
        ...oldTask,
        ...body,
        taskId,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Task updated successfully",
      });
    }

    /*
     * ---------------------------------------------------------
     * EMPLOYEE
     * ---------------------------------------------------------
     *
     * Employee can only update their assigned task submission.
     */

    const userEmail =
      user.email?.trim().toLowerCase();

    const assignedEmail =
      oldTask.assignedToEmail
        ?.trim()
        .toLowerCase();

    if (
      !assignedEmail ||
      assignedEmail !== userEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to update this task.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Assignment date
     *
     * Older tasks may not have assignmentDate,
     * therefore fall back to createdAt or dueDate.
     */
    const rawAssignmentDate =
      oldTask.assignmentDate ||
      oldTask.createdAt?.split("T")[0] ||
      oldTask.dueDate;

    if (!rawAssignmentDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This task is not currently available for submission. Please check the assignment and due dates.",
        },
        {
          status: 400,
        }
      );
    }

    if (!oldTask.dueDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This task is not currently available for submission. Please check the assignment and due dates.",
        },
        {
          status: 400,
        }
      );
    }

    const assignmentDate = new Date(
      `${rawAssignmentDate}T00:00:00`
    );

    const dueDate = new Date(
      `${oldTask.dueDate}T00:00:00`
    );

    if (isNaN(assignmentDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid task assignment date.",
        },
        {
          status: 400,
        }
      );
    }

    if (isNaN(dueDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid task due date.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Start of assignment day
     */
    const assignmentDayStart =
      new Date(assignmentDate);

    assignmentDayStart.setHours(
      0,
      0,
      0,
      0
    );

    /*
     * End of due date
     */
    const dueDayEnd =
      new Date(dueDate);

    dueDayEnd.setHours(
      23,
      59,
      59,
      999
    );

    /*
     * Validate date order
     */
    if (
      dueDayEnd <
      assignmentDayStart
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Task due date cannot be earlier than the assignment date.",
        },
        {
          status: 400,
        }
      );
    }

    const now = new Date();

    /*
     * Employee is trying to submit before
     * assignment date.
     */
    if (now < assignmentDayStart) {
      const assignmentDateFormatted =
        formatTaskDate(
          rawAssignmentDate
        );

      const dueDateFormatted =
        formatTaskDate(
          oldTask.dueDate
        );

      return NextResponse.json(
        {
          success: false,
          message:
            `You can submit this task from ${assignmentDateFormatted} to ${dueDateFormatted}.`,
          assignmentDate:
            rawAssignmentDate,
          dueDate:
            oldTask.dueDate,
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Employee is trying to submit after
     * the due date.
     */
    if (now > dueDayEnd) {
      const assignmentDateFormatted =
        formatTaskDate(
          rawAssignmentDate
        );

      const dueDateFormatted =
        formatTaskDate(
          oldTask.dueDate
        );

      return NextResponse.json(
        {
          success: false,
          message:
            `This task was available from ${assignmentDateFormatted} to ${dueDateFormatted}. The due date has passed.`,
          assignmentDate:
            rawAssignmentDate,
          dueDate:
            oldTask.dueDate,
        },
        {
          status: 403,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * EMPLOYEE UPDATE
     * ---------------------------------------------------------
     *
     * Employee should not be able to change:
     * - Project
     * - Company
     * - Assignment
     * - Assigned employee
     * - Priority
     * - Due date
     *
     * Only submission-related fields are accepted.
     */

    const allowedStatus =
      body.status === "Pending" ||
      body.status === "In Progress" ||
      body.status === "Completed" ||
      body.status === "Cancelled";

    if (
      body.status !== undefined &&
      !allowedStatus
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid task status.",
        },
        {
          status: 400,
        }
      );
    }

    const newStatus =
      body.status ??
      oldTask.status;

    const updatedTask = {
      ...oldTask,

      /*
       * Preserve all task ownership/
       * assignment information.
       */
      projectId:
        oldTask.projectId,

      projectName:
        oldTask.projectName,

      companyId:
        oldTask.companyId,

      companyName:
        oldTask.companyName,

      assignedTo:
        oldTask.assignedTo,

      assignedToName:
        oldTask.assignedToName,

      assignedToEmail:
        oldTask.assignedToEmail,

      assignedBy:
        oldTask.assignedBy,

      assignedByName:
        oldTask.assignedByName,

      priority:
        oldTask.priority,

      dueDate:
        oldTask.dueDate,

      assignmentDate:
        oldTask.assignmentDate ??
        rawAssignmentDate,

      /*
       * Employee-editable fields
       */
      status: newStatus,

      remarks:
        body.remarks ??
        oldTask.remarks,

      completionDescription:
        body.completionDescription ??
        oldTask.completionDescription,

      completionLink:
        body.completionLink ??
        oldTask.completionLink,

      completedAt:
        newStatus === "Completed"
          ? oldTask.completedAt ||
            new Date().toISOString()
          : undefined,

      updatedAt:
        new Date().toISOString(),
    };

    await updateTask(
      taskId,
      updatedTask
    );

    return NextResponse.json({
      success: true,
      message:
        "Task updated successfully",
    });
  } catch (error) {
    console.error(
      "Update Task Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update task",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const user =
      await getUserFromRequest(req);

    if (
      !user ||
      !isAdminUser(user)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only Admin can delete task",
        },
        {
          status: 403,
        }
      );
    }

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Task ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existingTask =
      await getTaskById(taskId);

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Task not found",
        },
        {
          status: 404,
        }
      );
    }

    await deleteTask(taskId);

    return NextResponse.json({
      success: true,
      message:
        "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Task Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}