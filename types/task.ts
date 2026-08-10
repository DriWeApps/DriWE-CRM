export type TaskPriority = "Low" | "Medium" | "High";

export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface Task {
  taskId: string;

  title: string;
  description: string;

  companyId: string;
  companyName: string;

  assignedTo: string;
  assignedToName: string;
  assignedToEmail: string;

  assignedBy: string;
  assignedByName: string;

  assignmentDate: string;
  dueDate: string;

  priority: TaskPriority;
  status: TaskStatus;

  remarks?: string;

  createdAt: string;
  updatedAt: string;


  completionDescription?: string;

completionLink?: string;

completedAt?: string;
}