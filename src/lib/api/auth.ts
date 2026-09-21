import { apiClient } from "./client";
import type { CurrentUser } from "./types";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient<null>("/auth/login", {
      method: "POST",
      body: payload,
    }),

  getMe: () =>
    apiClient<CurrentUser>("/auth/me", {
      method: "GET",
    }),

  refresh: () =>
    apiClient<null>("/auth/refresh", {
      method: "POST",
    }),

  logout: () =>
    apiClient<null>("/auth/logout", {
      method: "POST",
    }),

  ssoAuthorize: () =>
    apiClient<{ authorize_url: string }>("/auth/sso/authorize", {
      method: "GET",
    }),
};
