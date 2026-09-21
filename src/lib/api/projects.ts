import { apiClient, ApiError } from "./client";
import type { ProjectMemberRead, ProjectRead, ProjectStatus } from "./types";

export interface ListProjectsParams {
  id?: string;
  status?: ProjectStatus;
  organization_id?: string;
  include_insights?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateProjectPayload {
  name: string;
  description?: string | null;
  client_name?: string | null;
  client_contact?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string | null;
  client_name?: string | null;
  client_contact?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: ProjectStatus;
  budget?: number | null;
}

export interface AddProjectMemberPayload {
  project_id: string;
  user_id?: string;
  email?: string;
}

export const projectsApi = {
  list: (params: ListProjectsParams = {}) =>
    apiClient<ProjectRead[]>("/projects", {
      method: "GET",
      params: {
        ...params,
        include_insights: params.include_insights ?? true,
      },
    }),

  getById: async (id: string): Promise<ProjectRead> => {
    const list = await apiClient<ProjectRead[]>("/projects", {
      method: "GET",
      params: { id, include_insights: true },
    });
    if (!list || list.length === 0) {
      throw new ApiError(404, "Not Found", "Project not found");
    }
    return list[0];
  },

  create: (payload: CreateProjectPayload) =>
    apiClient<ProjectRead>("/projects", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateProjectPayload) =>
    apiClient<ProjectRead>(`/projects/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: string) =>
    apiClient<null>(`/projects/${id}`, {
      method: "DELETE",
    }),

  listMembers: (projectId: string) =>
    apiClient<ProjectMemberRead[]>("/project-members", {
      method: "GET",
      params: { project_id: projectId },
    }),

  addMember: (payload: AddProjectMemberPayload) =>
    apiClient<ProjectMemberRead>("/project-members", {
      method: "POST",
      body: payload,
    }),

  removeMember: (memberId: string) =>
    apiClient<null>(`/project-members/${memberId}`, {
      method: "DELETE",
    }),
};
