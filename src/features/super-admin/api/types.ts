export type OrganizationStatus = "active" | "suspended";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  primaryContact: {
    name: string;
    email: string;
  };
  activeProjects: number;
  totalMembers: number;
  createdAt: string; // ISO date
}

export interface OrgDesignationBreakdown {
  designation: string;
  count: number;
}

export interface TenantDetail {
  organization: Organization;
  designationBreakdown: OrgDesignationBreakdown[];
  recentProjects: { id: string; name: string; status: string }[];
}

export type AuditEventType =
  "org_created" | "org_suspended" | "org_activated" | "admin_assigned";

export interface AuditLogEntry {
  id: string;
  type: AuditEventType;
  message: string;
  actor: string;
  organization: string;
  timestamp: string; // e.g. "2h ago"
}

export interface PlatformMetrics {
  totalOrganizations: number;
  totalUsers: number;
  activeProjects: number;
  totalHoursLogged: number;
}

export interface ProvisionOrganizationInput {
  name: string;
  slug: string;
  primaryAdminName: string;
  primaryAdminEmail: string;
}
