export type OrgStatus = "active" | "suspended";

export type AuditAction = "insert" | "update" | "delete";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  primaryAdminName: string;
  primaryAdminEmail: string;
  activeProjectsCount: number;
  totalUsersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId?: string | null;
  organizationName?: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  changedAt: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalPlatformUsers: number;
  activeProjects: number;
  totalLoggedHoursMonth: number;
}
