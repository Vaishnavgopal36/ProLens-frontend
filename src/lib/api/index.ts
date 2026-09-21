export * from "./types";
export * from "./client";
export * from "./auth";
export * from "./projects";
export * from "./features";
export * from "./tasks";
export * from "./timesheets";
export * from "./calendar";
export * from "./activities";
export * from "./users";
export * from "./organizations";
export * from "./attachments";

import { authApi } from "./auth";
import { projectsApi } from "./projects";
import { featuresApi } from "./features";
import { tasksApi } from "./tasks";
import { timesheetsApi } from "./timesheets";
import { calendarApi } from "./calendar";
import { activitiesApi } from "./activities";
import { usersApi } from "./users";
import { organizationsApi } from "./organizations";
import { attachmentsApi } from "./attachments";

export const api = {
  auth: authApi,
  projects: projectsApi,
  features: featuresApi,
  tasks: tasksApi,
  timesheets: timesheetsApi,
  calendar: calendarApi,
  activities: activitiesApi,
  users: usersApi,
  organizations: organizationsApi,
  attachments: attachmentsApi,
};

export default api;
