import { apiClient, ApiError } from "./client";
import type {
  EntityStatus,
  PriorityLevel,
  TaskAssigneeRead,
  TaskRead,
  TaskSubtask,
} from "./types";

export interface ListTasksParams {
  id?: string;
  project_id?: string;
  feature_id?: string;
  status?: EntityStatus;
  priority?: PriorityLevel;
  limit?: number;
  offset?: number;
}

export interface CreateTaskPayload {
  name: string;
  feature_id?: string | null;
  project_id?: string | null;
  description?: string | null;
  priority?: PriorityLevel;
  estimated_hours?: number | null;
  labels?: string[] | null;
  subtasks?: TaskSubtask[] | null;
  start_date?: string | null;
  due_date?: string | null;
}

export interface UpdateTaskPayload {
  name?: string;
  feature_id?: string | null;
  project_id?: string | null;
  description?: string | null;
  status?: EntityStatus;
  priority?: PriorityLevel;
  estimated_hours?: number | null;
  labels?: string[] | null;
  subtasks?: TaskSubtask[] | null;
  start_date?: string | null;
  due_date?: string | null;
}

export const tasksApi = {
  list: (params: ListTasksParams = {}) =>
    apiClient<TaskRead[]>("/tasks", {
      method: "GET",
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    }),

  getById: async (id: string): Promise<TaskRead> => {
    const list = await apiClient<TaskRead[]>("/tasks", {
      method: "GET",
      params: { id },
    });
    if (!list || list.length === 0) {
      throw new ApiError(404, "Not Found", "Task not found");
    }
    return list[0];
  },

  create: (payload: CreateTaskPayload) =>
    apiClient<TaskRead>("/tasks", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: UpdateTaskPayload) =>
    apiClient<TaskRead>(`/tasks/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: string) =>
    apiClient<null>(`/tasks/${id}`, {
      method: "DELETE",
    }),

  listAssignees: (taskId: string) =>
    apiClient<TaskAssigneeRead[]>("/task-assignees", {
      method: "GET",
      params: { task_id: taskId },
    }),

  assignUser: (taskId: string, userId: string) =>
    apiClient<TaskAssigneeRead>("/task-assignees", {
      method: "POST",
      body: { task_id: taskId, user_id: userId },
    }),

  unassignUser: (assigneeId: string) =>
    apiClient<null>(`/task-assignees/${assigneeId}`, {
      method: "DELETE",
    }),
};
