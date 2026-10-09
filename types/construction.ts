
export type ProjectStatus =
    | "Planning"
    | "Active"
    | "On Hold"
    | "Completed"
    | "Cancelled";

export type WorkerType =
    | "Employee"
    | "Contract Worker"
    | "Daily Wage"
    | "Subcontractor";

export type AttendanceStatus =
    | "Present"
    | "Absent"
    | "Half Day";

export type ConstructionTaskStatus =
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Delayed";

export type MaterialTransactionType =
    | "RECEIVE"
    | "ISSUE"
    | "TRANSFER";

/* =========================================================
   PROJECT
========================================================= */

export interface ConstructionProject {
    projectId: string;

    companyId: string;
    companyName?: string;

    projectName: string;
    location: string;

    projectManager?: string;
    projectManagerName?: string;

    siteSupervisor?: string;
    siteSupervisorName?: string;

    startDate: string;
    expectedCompletion: string;

    status: ProjectStatus;

    description?: string;

    createdBy: string;
    createdByName?: string;

    createdAt: string;
    updatedAt: string;
}

/* =========================================================
   SITE
========================================================= */

export interface ConstructionSite {
    siteId: string;

    companyId: string;

    projectId: string;
    projectName?: string;

    siteName: string;
    location?: string;

    active: boolean;

    createdAt: string;
    updatedAt: string;
}

/* =========================================================
   WORKER
========================================================= */

export interface ConstructionWorker {
    workerId: string;
    userId: string;

    companyId: string;

    projectId: string;
    projectName?: string;

    siteId: string;
    siteName?: string;

    name: string;
    phone: string;
    email: string;

    role?: string;

    workerType: WorkerType;

    salary: number;
    dailyWage?: number;

    active: boolean;
    loginEnabled: boolean;

    createdAt: string;
    updatedAt: string;
}
/* =========================================================
   TASKs
========================================================= */

export interface ConstructionTask {
    taskId: string;

    companyId: string;

    projectId: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    title: string;
    description?: string;

    assignedTo: string;
    assignedToName: string;

    dueDate: string;

    status: ConstructionTaskStatus;

    createdBy: string;
    createdByName?: string;

    createdAt: string;
    updatedAt: string;
}

/* =========================================================
   MATERIAL
========================================================= */

export interface ConstructionMaterial {
    materialId: string;

    companyId: string;

    name: string;
    unit: string;

    currentQuantity: number;
    minimumQuantity?: number;

    createdAt: string;
    updatedAt: string;
}

/* =========================================================
   MATERIAL TRANSACTION
========================================================= */

export interface MaterialTransaction {
    transactionId: string;

    companyId: string;

    materialId: string;
    materialName: string;

    transactionType: MaterialTransactionType;

    quantity: number;

    projectId: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    fromProjectId?: string;
    fromProjectName?: string;

    toProjectId?: string;
    toProjectName?: string;

    person: string;

    photoUrl?: string;

    note?: string;

    transactionDate: string;

    createdAt: string;
}

/* =========================================================
   DAILY SITE UPDATE
========================================================= */

export interface DailySiteUpdate {
    updateId: string;

    companyId: string;

    projectId: string;
    projectName?: string;

    siteId?: string;
    siteName?: string;

    date: string;

    workersPresent: number;

    tasksCompleted: number;

    materialReceived: number;

    materialUsed: number;

    issues: number;

    issueDescription?: string;

    photos?: string[];

    note?: string;

    submittedBy: string;
    submittedByName?: string;

    createdAt: string;
    updatedAt: string;
}