import type { UserRole } from "@/app/providers";
export type { UserRole } from "@/app/providers";

export type ProjectStatus = "ongoing" | "pending" | "completed";

export type ProjectFilterTab = "all" | "ongoing" | "pending" | "completed";

export interface ProjectInvite {
  id: string;
  email: string;
  role: UserRole | string;
  expiresInDays: number;
}

// Alias for backward compatibility across pending invite components
export type PendingInvite = ProjectInvite;

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole | string;
  designation: string;
  avatarUrl?: string;
  assignedTasksCount: number;
  assignedFeaturesCount: number;
  hoursLogged: number;
  status: "active" | "inactive";
}

export interface SprintConfig {
  cadenceWeeks: 1 | 2 | 3 | 4;
  currentSprintGoal: string;
  startDate: string;
  endDate: string;
  velocityEstimatePts?: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  lead: string;
  activeSprint: string;
  dateRange: string;
  dueDate: string;
  completionPercentage: number;
  estimatedHours: number;
  loggedHours: number;
  tasksCount: number;
  coreFeaturesCount: number;
  icon?: string;
  members: ProjectMember[];
  pendingInvites: ProjectInvite[];
}
