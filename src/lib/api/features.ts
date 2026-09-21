import { apiClient, ApiError } from "./client";
import type { EntityStatus, FeatureRead } from "./types";

export interface ListFeaturesParams {
  id?: string;
  project_id?: string;
  status?: EntityStatus;
  limit?: number;
  offset?: number;
}

export interface CreateFeaturePayload {
  project_id: string;
  name: string;
  description?: string | null;
  status?: EntityStatus;
  start_date?: string | null;
  due_date?: string | null;
}

export interface UpdateFeaturePayload {
  name?: string;
  description?: string | null;
  status?: EntityStatus;
  start_date?: string | null;
  due_date?: string | null;
}

export interface FeatureMemberRead {
  id: string;
  organization_id: string;
  feature_id: string;
  user_id: string;
  added_by: string;
  added_at: string;
  removed_at: string | null;
}

export const featuresApi = {
  list: (params: ListFeaturesParams = {}) =>
    apiClient<FeatureRead[]>("/features", {
      method: "GET",
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    }),

  getById: async (id: string): Promise<FeatureRead> => {
    const list = await apiClient<FeatureRead[]>("/features", {
      method: "GET",
      params: { id },
    });
    if (!list || list.length === 0) {
      throw new ApiError(404, "Not Found", "Feature not found");
    }
    return list[0];
  },

  create: (payload: CreateFeaturePayload) =>
    apiClient<FeatureRead>("/features", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateFeaturePayload) =>
    apiClient<FeatureRead>(`/features/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: string) =>
    apiClient<null>(`/features/${id}`, {
      method: "DELETE",
    }),

  listMembers: (featureId: string) =>
    apiClient<FeatureMemberRead[]>("/feature-members", {
      method: "GET",
      params: { feature_id: featureId },
    }),

  addMember: (featureId: string, userId: string) =>
    apiClient<FeatureMemberRead>("/feature-members", {
      method: "POST",
      body: { feature_id: featureId, user_id: userId },
    }),

  removeMember: (memberId: string) =>
    apiClient<null>(`/feature-members/${memberId}`, {
      method: "DELETE",
    }),
};
