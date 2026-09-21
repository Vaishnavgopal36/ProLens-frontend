/**
 * API Types mirroring the ProLens FastAPI Backend Schemas.
 */

export interface APIResponse<T> {
  status_code: number;
  status_message: string;
  error_message?: string | null;
  response_data: T;
}

export type UserRole = "super_admin" | "admin" | "manager" | "employee";
export type UserStatus = "invited" | "active" | "suspended";
export type OrgStatus = "active" | "suspended";
export type ProjectStatus = "active" | "on_hold" | "completed";
export type EntityStatus = "to_do" | "in_progress" | "in_review" | "done";
export type PriorityLevel = "low" | "medium" | "high" | "urgent";
export type LeaveType = "sick" | "casual" | "vacation";
export type CalendarEventType =
  "holiday" | "milestone" | "leave" | "release" | "team_event";
export type SSOProvider = "azure_ad" | "google";

export interface CurrentUser {
  id: string;
  organization_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  designation: string | null;
  role: UserRole;
}

export interface UserRead {
  id: string;
  organization_id: string | null;
  designation_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface DesignationRead {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
}

export interface ProjectInsights {
  task_count: number;
  completed_task_count: number;
  completion_rate_pct: number;
  estimated_hours_total: number;
  actual_hours_total: number;
  health_status: "on_track" | "at_risk" | "delayed";
}

export interface ProjectRead {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  client_name: string | null;
  client_contact: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  budget: number | null;
  insights?: ProjectInsights | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
}

export interface ProjectMemberRead {
  id: string;
  organization_id: string;
  project_id: string;
  user_id: string;
  user_name?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  designation?: string | null;
  added_by: string;
  added_at: string;
  removed_at: string | null;
  removed_by: string | null;
}

export interface FeatureRead {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  start_date: string | null;
  due_date: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskRead {
  id: string;
  organization_id: string;
  feature_id: string | null;
  project_id?: string | null;
  name: string;
  description: string | null;
  status: EntityStatus;
  priority: PriorityLevel;
  estimated_hours?: number | null;
  labels?: string[] | null;
  subtasks?: TaskSubtask[] | null;
  start_date: string | null;
  due_date: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
}

export interface TaskAssigneeRead {
  id: string;
  organization_id: string;
  task_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  removed_at: string | null;
  removed_by: string | null;
}

export interface TimeLogRead {
  id: string;
  organization_id: string;
  user_id: string;
  task_id: string | null;
  activity_id: string | null;
  log_date: string; // YYYY-MM-DD
  duration_minutes: number;
  description: string | null;
  created_at: string;
}

export interface ActivityRead {
  id: string;
  organization_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_by: string;
  updated_by: string | null;
  created_at: string;
}

export interface CalendarEventRead {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  start_time: string; // ISO DateTime
  end_time: string; // ISO DateTime
  created_by: string;
  source_leave_log_id: string | null;
  created_at: string;
}

export interface LeaveLogRead {
  id: string;
  organization_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: LeaveType;
  reason: string | null;
  created_at: string;
}

export interface SSOConnectionRead {
  id: string;
  organization_id: string;
  provider: SSOProvider;
  tenant_id: string;
  client_id: string;
  created_at: string;
}

export interface SSOSyncResult {
  users_created: number;
  users_updated: number;
  users_suspended: number;
}

export interface OrganizationRead {
  id: string;
  name: string;
  domain: string;
  status: OrgStatus;
  active_projects?: number | null;
  total_members?: number | null;
  audit_logs?: Array<{
    id: string;
    action: string;
    table_name: string;
    changed_at: string;
    user_agent?: string | null;
  }> | null;
  created_at: string;
}

export interface AttachmentUploadRequest {
  file_name: string;
  mime_type: string;
  size_bytes: number;
}

export interface AttachmentUploadUrl {
  upload_url: string;
  s3_key: string;
  expires_in: number;
}

export interface AttachmentCreate {
  project_id?: string | null;
  feature_id?: string | null;
  task_id?: string | null;
  activity_id?: string | null;
  file_name: string;
  s3_key: string;
  size_bytes: number;
  mime_type: string;
}

export interface AttachmentRead {
  id: string;
  organization_id: string;
  uploaded_by: string;
  project_id: string | null;
  feature_id: string | null;
  task_id: string | null;
  activity_id: string | null;
  file_name: string;
  s3_key: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
}

export interface AttachmentDownloadUrl {
  download_url: string;
  expires_in: number;
}
