import { apiClient } from "./client";
import type { ActivityRead, EntityStatus } from "./types";

export interface ListActivitiesParams {
  id?: string;
  project_id?: string;
  status?: EntityStatus;
  limit?: number;
  offset?: number;
}

export interface CreateActivityPayload {
  project_id?: string | null;
  name: string;
  description?: string | null;
  status?: EntityStatus;
}

export interface UpdateActivityPayload {
  project_id?: string | null;
  name?: string;
  description?: string | null;
  status?: EntityStatus;
}

export const activitiesApi = {
  list: (params: ListActivitiesParams = {}) =>
    apiClient<ActivityRead[]>("/activities", {
      method: "GET",
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    }),

  create: (payload: CreateActivityPayload) =>
    apiClient<ActivityRead>("/activities", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateActivityPayload) =>
    apiClient<ActivityRead>(`/activities/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: string) =>
    apiClient<null>(`/activities/${id}`, {
      method: "DELETE",
    }),
};
