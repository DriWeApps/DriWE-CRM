import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";

export async function getDashboardStats() {
  const [
    employees,
    companies,
    tasks,
    meetings,
    activities,
  ] = await Promise.all([
    db.send(
      new ScanCommand({
        TableName: process.env.EMPLOYEES_TABLE!,
        Select: "COUNT",
      })
    ),
    db.send(
      new ScanCommand({
        TableName: process.env.COMPANIES_TABLE!,
        Select: "COUNT",
      })
    ),
    db.send(
      new ScanCommand({
        TableName: process.env.TASKS_TABLE!,
        Select: "COUNT",
      })
    ),
    db.send(
      new ScanCommand({
        TableName: process.env.MEETINGS_TABLE!,
        Select: "COUNT",
      })
    ),
    db.send(
      new ScanCommand({
        TableName: process.env.FOLLOWUPS_TABLE!,
        Limit: 10,
      })
    ),
  ]);

  return {
    employees: employees.Count ?? 0,
    companies: companies.Count ?? 0,
    tasks: tasks.Count ?? 0,
    meetings: meetings.Count ?? 0,
    recentActivities: activities.Items ?? [],
  };
}