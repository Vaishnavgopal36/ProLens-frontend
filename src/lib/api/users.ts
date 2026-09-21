import { apiClient } from "./client";
import type {
  DesignationRead,
  SSOConnectionRead,
  SSOSyncResult,
  UserRead,
  UserRole,
  UserStatus,
} from "./types";

export interface ListUsersParams {
  id?: string;
  organization_id?: string;
  role?: UserRole;
  status?: UserStatus;
  limit?: number;
  offset?: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  password?: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  designation_id?: string | null;
  designation_name?: string | null;
  organization_id?: string | null;
}

export interface UpdateUserPayload {
  first_name?: string | null;
  last_name?: string | null;
  role?: UserRole;
  status?: UserStatus;
  designation_id?: string | null;
  password?: string | null;
  current_password?: string | null;
}

export interface CreateSSOConnectionPayload {
  provider: "azure_ad" | "google";
  tenant_id: string;
  client_id: string;
  client_secret: string;
}

export const usersApi = {
  list: (params: ListUsersParams = {}) =>
    apiClient<UserRead[]>("/users", {
      method: "GET",
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    }),

  create: (payload: CreateUserPayload) =>
    apiClient<UserRead>("/users", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateUserPayload) =>
    apiClient<UserRead>(`/users/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: string) =>
    apiClient<null>(`/users/${id}`, {
      method: "DELETE",
    }),

  listDesignations: () =>
    apiClient<DesignationRead[]>("/designations", {
      method: "GET",
    }),

  listSsoConnections: () =>
    apiClient<SSOConnectionRead[]>("/sso-connections", {
      method: "GET",
    }),

  createSsoConnection: (payload: CreateSSOConnectionPayload) =>
    apiClient<SSOConnectionRead>("/sso-connections", {
      method: "POST",
      body: payload,
    }),

  deleteSsoConnection: (id: string) =>
    apiClient<null>(`/sso-connections/${id}`, {
      method: "DELETE",
    }),

  syncSsoConnection: (id: string) =>
    apiClient<SSOSyncResult>(`/sso-connections/${id}/sync`, {
      method: "POST",
    }),
};
