export type AppErrorStatus =
  | "Pass"
  | "Fail"
  | "In Progress";

export type AppModule =
  | "DriWE"
  | "DriWE Partners";

export interface AppError {
  errorId: string;

  module: AppModule;

  errorTitle: string;

  occurredError: string;

  expectedError: string;

  status: AppErrorStatus;

  reportedBy: string;

  reportedByName: string;

  reportedByEmail: string;

  createdAt: string;

  updatedAt: string;
}