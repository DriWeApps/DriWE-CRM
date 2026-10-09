
import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";
import { getUserFromRequest } from "@/lib/auth";

const TABLES = {
  projects:
    process.env.CONSTRUCTION_PROJECTS_TABLE ||
    "CRM_ConstructionProjects",
  workers:
    process.env.CONSTRUCTION_WORKERS_TABLE ||
    "CRM_ConstructionWorkers",
  attendance:
    process.env.CONSTRUCTION_ATTENDANCE_TABLE ||
    "CRM_ConstructionAttendance",
  tasks:
    process.env.CONSTRUCTION_TASKS_TABLE ||
    "CRM_ConstructionTasks",
};

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = (user.role ?? "").trim().toLowerCase();
    const companyId = user.companyId || user.userId;

    const isAdminOrManager =
      role === "admin" || role === "manager";

    const [projectsResult, workersResult, attendanceResult, tasksResult] =
      await Promise.all([
        db.send(
          new ScanCommand({
            TableName: TABLES.projects,
          })
        ),
        db.send(
          new ScanCommand({
            TableName: TABLES.workers,
          })
        ),
        db.send(
          new ScanCommand({
            TableName: TABLES.attendance,
          })
        ),
        db.send(
          new ScanCommand({
            TableName: TABLES.tasks,
          })
        ),
      ]);

    const belongsToCompany = (item: any) =>
      item.companyId === companyId;

    const projects = (projectsResult.Items ?? []).filter(
      belongsToCompany
    );

    let workers = (workersResult.Items ?? []).filter(
      belongsToCompany
    );
    let attendance = (attendanceResult.Items ?? []).filter(
      belongsToCompany
    );
    let tasks = (tasksResult.Items ?? []).filter(
      belongsToCompany
    );

    if (!isAdminOrManager) {
      workers = workers.filter(
        (worker: any) =>
          worker.userId === user.userId ||
          worker.email?.toLowerCase() === user.email?.toLowerCase()
      );

      const workerIds = new Set(
        workers.map((worker: any) => worker.workerId)
      );

      attendance = attendance.filter(
        (record: any) =>
          workerIds.has(record.workerId) ||
          record.userId === user.userId ||
          record.employeeId === user.employeeId
      );

      tasks = tasks.filter(
        (task: any) =>
          task.assignedTo === user.userId ||
          task.assignedTo === user.employeeId ||
          task.assignedTo === user.email ||
          task.assignedToUserId === user.userId ||
          task.workerId && workerIds.has(task.workerId)
      );
    }

    const completedTasks = tasks.filter(
      (task: any) =>
        String(task.status ?? "").toLowerCase() === "completed"
    ).length;

    const pendingTasks = tasks.filter(
      (task: any) =>
        String(task.status ?? "").toLowerCase() !== "completed"
    ).length;

    const presentAttendance = attendance.filter(
      (record: any) =>
        String(record.status ?? "").toLowerCase() === "present"
    ).length;

    return NextResponse.json({
      success: true,
      role: user.role,
      reports: {
        projects,
        workers,
        attendance,
        tasks,
        summary: {
          totalProjects: projects.length,
          totalWorkers: workers.length,
          totalAttendanceRecords: attendance.length,
          presentAttendance,
          totalTasks: tasks.length,
          completedTasks,
          pendingTasks,
        },
      },
    });
  } catch (error) {
    console.error("GET construction reports error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load construction reports.",
      },
      { status: 500 }
    );
  }
}
