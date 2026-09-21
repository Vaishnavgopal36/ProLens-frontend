import { apiClient } from "./client";
import type { OrganizationRead, OrgStatus } from "./types";

export interface ListOrganizationsParams {
  id?: string;
  status?: OrgStatus;
  include_metrics?: boolean;
  include_audit_logs?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateOrganizationPayload {
  name: string;
  domain: string;
  admin_email?: string | null;
  admin_password?: string | null;
  admin_first_name?: string | null;
  admin_last_name?: string | null;
}

export interface UpdateOrganizationPayload {
  name?: string;
  status?: OrgStatus;
}

export const organizationsApi = {
  list: (params: ListOrganizationsParams = {}) =>
    apiClient<OrganizationRead[]>("/organizations", {
      method: "GET",
      params: {
        ...params,
        include_metrics: params.include_metrics ?? true,
        include_audit_logs: params.include_audit_logs ?? true,
      },
    }),

  create: (payload: CreateOrganizationPayload) =>
    apiClient<OrganizationRead>("/organizations", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateOrganizationPayload) =>
    apiClient<OrganizationRead>(`/organizations/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: string) =>
    apiClient<null>(`/organizations/${id}`, {
      method: "DELETE",
    }),
};
