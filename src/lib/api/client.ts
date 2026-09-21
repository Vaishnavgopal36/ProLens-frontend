import type { APIResponse } from "./types";

export class ApiError extends Error {
  statusCode: number;
  statusMessage: string;

  constructor(statusCode: number, statusMessage: string, message?: string) {
    super(message || statusMessage);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  skipAuthRefresh?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<(ok: boolean) => void> = [];

function onRefreshed(ok: boolean) {
  refreshSubscribers.forEach((cb) => cb(ok));
  refreshSubscribers = [];
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    params,
    body,
    skipAuthRefresh,
    headers: customHeaders,
    ...rest
  } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== null && val !== undefined) {
        searchParams.append(key, String(val));
      }
    }
    const query = searchParams.toString();
    if (query) {
      url += (url.includes("?") ? "&" : "?") + query;
    }
  }

  const headers = new Headers(customHeaders);
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined && body !== null) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body: requestBody,
    credentials: "include", // Required for HttpOnly cookies
  });

  // Handle 401 token refresh (only for non-auth endpoints to prevent infinite loops)
  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    !endpoint.includes("/auth/")
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        isRefreshing = false;
        if (refreshRes.ok) {
          onRefreshed(true);
        } else {
          onRefreshed(false);
          throw new ApiError(401, "Session expired. Please sign in again.");
        }
      } catch {
        isRefreshing = false;
        onRefreshed(false);
        throw new ApiError(401, "Session expired. Please sign in again.");
      }
    } else {
      // Wait for ongoing refresh
      const refreshed = await new Promise<boolean>((resolve) => {
        refreshSubscribers.push(resolve);
      });
      if (!refreshed) {
        throw new ApiError(401, "Session expired. Please sign in again.");
      }
    }

    // Retry original request once
    return apiClient<T>(endpoint, { ...options, skipAuthRefresh: true });
  }

  const contentType = response.headers.get("content-type");
  let data: any = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg =
      data?.error_message ||
      data?.status_message ||
      data?.detail ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, response.statusText, errorMsg);
  }

  // If backend returns standard APIResponse envelope
  if (
    data &&
    typeof data === "object" &&
    "status_code" in data &&
    "response_data" in data
  ) {
    const envelope = data as APIResponse<T>;
    if (envelope.status_code >= 400) {
      throw new ApiError(
        envelope.status_code,
        envelope.status_message,
        envelope.error_message || envelope.status_message,
      );
    }
    return envelope.response_data;
  }

  return data as T;
}

apiClient.get = <T>(endpoint: string, options?: RequestOptions): Promise<T> =>
  apiClient<T>(endpoint, { ...options, method: "GET" });

apiClient.post = <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> => apiClient<T>(endpoint, { ...options, method: "POST", body });

apiClient.put = <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> => apiClient<T>(endpoint, { ...options, method: "PUT", body });

apiClient.patch = <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> => apiClient<T>(endpoint, { ...options, method: "PATCH", body });

apiClient.delete = <T>(
  endpoint: string,
  options?: RequestOptions,
): Promise<T> => apiClient<T>(endpoint, { ...options, method: "DELETE" });
