// export type TaskPriority = "Low" | "Medium" | "High";

// export type TaskStatus =
//   | "Pending"
//   | "In Progress"
//   | "Completed"
//   | "Cancelled";

// export interface Task {
//   taskId: string;

//   title: string;
//   description: string;

//   companyId: string;
//   companyName: string;

//   assignedTo: string;
//   assignedToName: string;

//   assignedBy: string;
//   assignedByName: string;

//   priority: TaskPriority;
//   status: TaskStatus;

//   dueDate: string;

//   remarks?: string;

//   createdAt: string;
//   updatedAt: string;
// }


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

  priority: TaskPriority;
  status: TaskStatus;

  dueDate: string;

  remarks?: string;

  createdAt: string;
  updatedAt: string;
}