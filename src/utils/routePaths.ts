import type { UserRole } from "../types";

const dashboardPaths: Record<UserRole, string> = {
  parent: "/parent",
  healthWorker: "/health-worker",
  admin: "/admin",
};

export const getDashboardPath = (role: UserRole): string => dashboardPaths[role];
