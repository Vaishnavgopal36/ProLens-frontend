import { apiClient } from "./client";
import type { TimeLogRead } from "./types";

export interface ListTimeLogsParams {
  id?: string;
  user_id?: string;
  task_id?: string;
  activity_id?: string;
  log_date?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTimeLogPayload {
  task_id?: string | null;
  activity_id?: string | null;
  log_date: string; // YYYY-MM-DD
  duration_minutes: number;
  description?: string | null;
}

export interface UpdateTimeLogPayload {
  log_date?: string;
  duration_minutes?: number;
  description?: string | null;
}

export const timesheetsApi = {
  list: (params: ListTimeLogsParams = {}) =>
    apiClient<TimeLogRead[]>("/time-logs", {
      method: "GET",
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    }),

  create: (payload: CreateTimeLogPayload) =>
    apiClient<TimeLogRead>("/time-logs", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateTimeLogPayload) =>
    apiClient<TimeLogRead>(`/time-logs/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: string) =>
    apiClient<null>(`/time-logs/${id}`, {
      method: "DELETE",
    }),
};
