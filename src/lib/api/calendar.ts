import { apiClient } from "./client";
import type {
  CalendarEventRead,
  CalendarEventType,
  LeaveLogRead,
  LeaveType,
} from "./types";

export interface ListCalendarEventsParams {
  id?: string;
  event_type?: CalendarEventType;
  start_time?: string;
  end_time?: string;
  limit?: number;
  offset?: number;
}

export interface CreateCalendarEventPayload {
  title: string;
  description?: string | null;
  event_type: CalendarEventType;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
}

export interface UpdateCalendarEventPayload {
  title?: string;
  description?: string | null;
  event_type?: CalendarEventType;
  start_time?: string;
  end_time?: string;
}

export interface ListLeaveLogsParams {
  id?: string;
  user_id?: string;
  leave_type?: LeaveType;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface CreateLeaveLogPayload {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  leave_type: LeaveType;
  reason?: string | null;
}

export const calendarApi = {
  listEvents: (params: ListCalendarEventsParams = {}) =>
    apiClient<CalendarEventRead[]>("/calendar-events", {
      method: "GET",
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    }),

  createEvent: (payload: CreateCalendarEventPayload) =>
    apiClient<CalendarEventRead>("/calendar-events", {
      method: "POST",
      body: payload,
    }),

  updateEvent: (id: string, payload: UpdateCalendarEventPayload) =>
    apiClient<CalendarEventRead>(`/calendar-events/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  deleteEvent: (id: string) =>
    apiClient<null>(`/calendar-events/${id}`, {
      method: "DELETE",
    }),

  listLeaves: (params: ListLeaveLogsParams = {}) =>
    apiClient<LeaveLogRead[]>("/leave-logs", {
      method: "GET",
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    }),

  createLeave: (payload: CreateLeaveLogPayload) =>
    apiClient<LeaveLogRead>("/leave-logs", {
      method: "POST",
      body: payload,
    }),

  deleteLeave: (id: string) =>
    apiClient<null>(`/leave-logs/${id}`, {
      method: "DELETE",
    }),
};
