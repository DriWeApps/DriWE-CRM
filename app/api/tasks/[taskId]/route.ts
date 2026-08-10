import { NextResponse } from "next/server";

import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/services/task.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

interface Params {
  params: Promise<{
    taskId: string;
  }>;
}

/**
 * Format YYYY-MM-DD into a readable date.
 * Example:
 * 2026-08-12 -> 12 Aug 2026
 */
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

/**
 * GET TASK BY ID
 */
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
     * ADMIN / MANAGER can view all tasks.
     * Employee can view only their assigned tasks.
     */
    const canView =
      user.role === "ADMIN" ||
      user.role === "Manager" ||
      task.assignedToEmail === user.email;

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

/**
 * UPDATE TASK
 */
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

    console.log("Request body:", body);

    /* =====================================================
       ADMIN CAN UPDATE EVERYTHING
    ===================================================== */

    if (isAdminUser(user)) {
      await updateTask(taskId, {
        ...oldTask,
        ...body,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
      });
    }

    /* =====================================================
       EMPLOYEE / MANAGER SUBMISSION DATE CHECK
    ===================================================== */

    const now = new Date();

    /* =====================================================
       ASSIGNMENT DATE
       
       This is the date from which the employee can
       start working/submitting the task.
    ===================================================== */

    const assignmentDate = new Date(
      `${oldTask.assignmentDate || oldTask.dueDate}T00:00:00`
    );

    if (isNaN(assignmentDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "This task is not currently available for submission. Please check the assignment and due dates.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DUE DATE
       
       Employee can submit until the end of this date.
    ===================================================== */

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

    const dueDate = new Date(
      `${oldTask.dueDate}T00:00:00`
    );

    if (isNaN(dueDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "This task is not currently available for submission. Please check the assignment and due dates.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       START OF ASSIGNMENT DATE
    ===================================================== */

    const assignmentDayStart = new Date(
      assignmentDate
    );

    assignmentDayStart.setHours(
      0,
      0,
      0,
      0
    );

    /* =====================================================
       END OF DUE DATE
    ===================================================== */

    const dueDayEnd = new Date(dueDate);

    dueDayEnd.setHours(
      23,
      59,
      59,
      999
    );

    /* =====================================================
       INVALID DATE RANGE
       
       Due date cannot be before assignment date.
    ===================================================== */

    if (dueDayEnd < assignmentDayStart) {
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

    /* =====================================================
       FUTURE TASK
       
       Example:
       
       Assignment Date = 15 Aug 2026
       Due Date        = 20 Aug 2026
       Today            = 10 Aug 2026
       
       Employee tries to submit.
       
       Message:
       "You can submit this task from 15 Aug 2026
        to 20 Aug 2026."
    ===================================================== */

    if (now < assignmentDayStart) {
      const rawAssignmentDate =
        oldTask.assignmentDate ||
        oldTask.createdAt?.split("T")[0] ||
        oldTask.dueDate;

      const assignmentDateFormatted =
        formatTaskDate(rawAssignmentDate);

      const dueDateFormatted =
        formatTaskDate(oldTask.dueDate);

      return NextResponse.json(
        {
          success: false,

          message:
            `You can submit this task from ${assignmentDateFormatted} to ${dueDateFormatted}.`,

          assignmentDate: rawAssignmentDate,
          dueDate: oldTask.dueDate,
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       DEADLINE PASSED
       
       Example:
       
       Assignment Date = 15 Aug
       Due Date        = 20 Aug
       Today            = 21 Aug
    ===================================================== */

    // if (now > dueDayEnd) {
    //   const assignmentDateFormatted =
    //     formatTaskDate(
    //       oldTask.assignmentDate
    //     );

    //   const dueDateFormatted =
    //     formatTaskDate(
    //       oldTask.dueDate
    //     );

    //   return NextResponse.json(
    //     {
    //       success: false,

    //       message:
    //         `The submission period for this task was from ${assignmentDateFormatted} to ${dueDateFormatted}. The due date has passed. Please contact your administrator for further changes.`,

    //       assignmentDate:
    //         oldTask.assignmentDate,

    //       dueDate:
    //         oldTask.dueDate,
    //     },
    //     {
    //       status: 403,
    //     }
    //   );
    // }


    if (now < assignmentDayStart) {
    return NextResponse.json(
        {
            success: false,
            message:
                // `You can submit this task from ${oldTask.assignmentDate} to ${oldTask.dueDate}.`,
                `You can't submit this task now.`,
        },
        {
            status: 403,
        }
    );
}
    /* =====================================================
       ASSIGNMENT DATE <= TODAY <= DUE DATE
       
       Employee is allowed to update/submit.
    ===================================================== */

    await updateTask(taskId, {
      ...oldTask,
      ...body,
      assignmentDate:
        body.assignmentDate ??
        oldTask.assignmentDate ??
        oldTask.createdAt?.split("T")[0] ??
        oldTask.dueDate,

      status: body.status,

      remarks: body.remarks,

      completionDescription:
        body.completionDescription,

      completionLink:
        body.completionLink,

      completedAt:
        body.status === "Completed"
          ? new Date().toISOString()
          : oldTask.completedAt,

      updatedAt:
        new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Update Task Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update task",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE TASK
 *
 * Only Admin can delete tasks.
 */
export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !isAdminUser(user)) {
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

    await deleteTask(taskId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Delete Task Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}