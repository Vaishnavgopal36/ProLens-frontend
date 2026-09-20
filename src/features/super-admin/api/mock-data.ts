import type {
  Organization,
  AuditLogEntry,
  PlatformMetrics,
  TenantDetail,
} from "./types";

export const MOCK_PLATFORM_METRICS: PlatformMetrics = {
  totalOrganizations: 18,
  totalUsers: 642,
  activeProjects: 96,
  totalHoursLogged: 24810.5,
};

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: "org-1",
    name: "Horizon Media",
    slug: "horizon-media",
    status: "active",
    primaryContact: { name: "Alex Morgan", email: "alex@horizonmedia.com" },
    activeProjects: 6,
    totalMembers: 48,
    createdAt: "2024-11-03",
  },
  {
    id: "org-2",
    name: "Cascade Robotics",
    slug: "cascade-robotics",
    status: "active",
    primaryContact: { name: "Priya Nair", email: "priya@cascaderobotics.io" },
    activeProjects: 4,
    totalMembers: 31,
    createdAt: "2025-01-22",
  },
  {
    id: "org-3",
    name: "Northwind Logistics",
    slug: "northwind-logistics",
    status: "suspended",
    primaryContact: { name: "Daniel Kim", email: "daniel@northwind.co" },
    activeProjects: 0,
    totalMembers: 22,
    createdAt: "2024-06-14",
  },
  {
    id: "org-4",
    name: "Bluepeak Health",
    slug: "bluepeak-health",
    status: "active",
    primaryContact: {
      name: "Sara Lindqvist",
      email: "sara@bluepeakhealth.com",
    },
    activeProjects: 9,
    totalMembers: 87,
    createdAt: "2023-09-30",
  },
  {
    id: "org-5",
    name: "Vertex Studios",
    slug: "vertex-studios",
    status: "active",
    primaryContact: { name: "Miguel Torres", email: "miguel@vertexstudios.co" },
    activeProjects: 3,
    totalMembers: 15,
    createdAt: "2025-04-08",
  },
  {
    id: "org-6",
    name: "Ironclad Freight",
    slug: "ironclad-freight",
    status: "suspended",
    primaryContact: {
      name: "Elena Rostova",
      email: "elena@ironcladfreight.com",
    },
    activeProjects: 0,
    totalMembers: 9,
    createdAt: "2024-02-19",
  },
];

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "audit-1",
    type: "org_suspended",
    message: "Organization suspended for non-payment",
    actor: "System",
    organization: "Ironclad Freight",
    timestamp: "2h ago",
  },
  {
    id: "audit-2",
    type: "org_created",
    message: "New organization provisioned",
    actor: "Vaishnav Gopal",
    organization: "Vertex Studios",
    timestamp: "1d ago",
  },
  {
    id: "audit-3",
    type: "admin_assigned",
    message: "Primary admin reassigned",
    actor: "Vaishnav Gopal",
    organization: "Horizon Media",
    timestamp: "2d ago",
  },
  {
    id: "audit-4",
    type: "org_activated",
    message: "Organization reactivated after billing resolved",
    actor: "Vaishnav Gopal",
    organization: "Cascade Robotics",
    timestamp: "4d ago",
  },
  {
    id: "audit-5",
    type: "org_suspended",
    message: "Organization suspended for policy violation",
    actor: "System",
    organization: "Northwind Logistics",
    timestamp: "6d ago",
  },
];

const MOCK_TENANT_DETAILS: Record<string, TenantDetail> = {
  "org-1": {
    organization: MOCK_ORGANIZATIONS[0],
    designationBreakdown: [
      { designation: "Engineer", count: 22 },
      { designation: "Designer", count: 8 },
      { designation: "Project Manager", count: 6 },
      { designation: "QA", count: 12 },
    ],
    recentProjects: [
      { id: "p-1", name: "Apex Analytics Platform", status: "Active" },
      { id: "p-2", name: "Media Asset Pipeline", status: "On-hold" },
    ],
  },
  "org-2": {
    organization: MOCK_ORGANIZATIONS[1],
    designationBreakdown: [
      { designation: "Engineer", count: 18 },
      { designation: "Robotics Technician", count: 9 },
      { designation: "Project Manager", count: 4 },
    ],
    recentProjects: [
      { id: "p-3", name: "Autonomous Nav Rev2", status: "Active" },
    ],
  },
  "org-3": {
    organization: MOCK_ORGANIZATIONS[2],
    designationBreakdown: [
      { designation: "Dispatcher", count: 10 },
      { designation: "Engineer", count: 7 },
      { designation: "Project Manager", count: 5 },
    ],
    recentProjects: [],
  },
  "org-4": {
    organization: MOCK_ORGANIZATIONS[3],
    designationBreakdown: [
      { designation: "Clinician", count: 30 },
      { designation: "Engineer", count: 26 },
      { designation: "Designer", count: 11 },
      { designation: "Project Manager", count: 10 },
      { designation: "QA", count: 10 },
    ],
    recentProjects: [
      { id: "p-4", name: "Patient Portal Revamp", status: "Active" },
      { id: "p-5", name: "Telehealth Integration", status: "Active" },
    ],
  },
  "org-5": {
    organization: MOCK_ORGANIZATIONS[4],
    designationBreakdown: [
      { designation: "Designer", count: 7 },
      { designation: "Engineer", count: 6 },
      { designation: "Project Manager", count: 2 },
    ],
    recentProjects: [
      { id: "p-6", name: "Brand Site Relaunch", status: "Active" },
    ],
  },
  "org-6": {
    organization: MOCK_ORGANIZATIONS[5],
    designationBreakdown: [
      { designation: "Dispatcher", count: 5 },
      { designation: "Engineer", count: 4 },
    ],
    recentProjects: [],
  },
};

export function getTenantDetail(orgId: string): TenantDetail | undefined {
  return MOCK_TENANT_DETAILS[orgId];
}
