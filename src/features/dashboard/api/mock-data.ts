import type {
  MetricCardData,
  ActivityItem,
  AdminProjectRow,
  TeamDistributionItem,
  ManagerTaskRow,
  ManagerProjectItem,
  EmployeePriorityRow,
  EmployeeWeeklyEffort,
} from "@/types/dashboard";

// -------------------------------------------------------------
// 1. SHARED DATA (Present at the bottom of all 3 dashboards)
// -------------------------------------------------------------
export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    title: "Client Meeting",
    type: "Project Activity",
    time: "Today, 3:00 PM",
    project: "Apex Analytics Platform",
  },
  {
    id: "act-2",
    title: "Toastmasters Session",
    type: "Non-Project",
    time: "Tomorrow, 10:00 AM",
    project: "Internal Learning",
  },
  {
    id: "act-3",
    title: "Team Review",
    type: "Project Activity",
    time: "Sep 20, 2:00 PM",
    project: "Nova Mobile Dev",
  },
];

// -------------------------------------------------------------
// 2. ADMINISTRATOR DASHBOARD DATA ("Executive overview")
// -------------------------------------------------------------
export const ADMIN_METRICS: MetricCardData[] = [
  {
    id: "adm-1",
    label: "Active projects",
    value: 14,
    subtext: "Across 4 departments",
  },
  {
    id: "adm-2",
    label: "Org delivery rate",
    value: "74.2%",
    badge: { text: "+2.4%", variant: "success" },
    subtext: "vs previous quarter",
  },
  {
    id: "adm-3",
    label: "Total effort logged",
    value: "2,140.0h",
    subtext: "This month",
  },
  {
    id: "adm-4",
    label: "Projects at risk",
    value: "2 projects",
    badge: { text: "Alert", variant: "destructive" },
    subtext: "1 delayed, 1 budget alert",
  },
];

export const ADMIN_PROJECTS_TABLE: AdminProjectRow[] = [
  {
    id: "p-1",
    name: "Apex Analytics Platform",
    subname: "v2.4 migration",
    client: "Horizon Media",
    manager: "Alex Morgan",
    status: "Active",
    hoursLogged: 386.0,
  },
  {
    id: "p-2",
    name: "Nova Mobile Dev",
    subname: "iOS & Android codebase",
    client: "Fintech Global",
    manager: "Alex Morgan",
    status: "Active",
    hoursLogged: 135.0,
  },
  {
    id: "p-3",
    name: "Cloud Migration Phase 2",
    subname: "Kubernetes transition",
    client: "Enterprise Cloud",
    manager: "Sarah Connor",
    status: "Active",
    hoursLogged: 258.0,
  },
  {
    id: "p-4",
    name: "SupplySync Portal",
    subname: "Warehouse API layer",
    client: "Nordic Logistics",
    manager: "Priya Patel",
    status: "On-hold",
    hoursLogged: 304.5,
  },
  {
    id: "p-5",
    name: "Biometric Access System",
    subname: "Firmware patch audit",
    client: "SecureID Labs",
    manager: "David Kim",
    status: "Delayed",
    hoursLogged: 102.5,
  },
];

export const ADMIN_TEAM_DISTRIBUTION: TeamDistributionItem[] = [
  { department: "Engineering", details: "18 members • 4 active projects" },
  { department: "Design & Product", details: "6 members • 2 active projects" },
  { department: "QA & Testing", details: "5 members • 4 active projects" },
];

// -------------------------------------------------------------
// 3. MANAGER DASHBOARD DATA ("Project management")
// -------------------------------------------------------------
export const MANAGER_METRICS: MetricCardData[] = [
  {
    id: "mgr-1",
    label: "Managed projects",
    value: 2,
    subtext: "Active assignments",
  },
  {
    id: "mgr-2",
    label: "Open sprint tasks",
    value: 24,
    subtext: "Distributed in backlog",
  },
  {
    id: "mgr-3",
    label: "Logged this week",
    value: "186.5h",
    subtext: "Across engineering squads",
  },
  {
    id: "mgr-4",
    label: "Tasks needing attention",
    value: "2 items",
    subtext: "At risk or blocked",
    highlight: true, // Highlights the amber warning card from the design
  },
];

export const MANAGER_TASKS_TABLE: ManagerTaskRow[] = [
  {
    id: "t-1",
    name: "PostgreSQL connection pool...",
    subtext: "Infra routing update",
    project: "Apex Analytics",
    assignee: { name: "Elena Rostova", initials: "ER" },
    dueDate: "Tomorrow",
  },
  {
    id: "t-2",
    name: "Biometric auth SDK wrapper",
    subtext: "iOS & Android baseline",
    project: "Nova Mobile",
    assignee: { name: "Marcus Chen", initials: "MC" },
    dueDate: "Sep 18",
  },
  {
    id: "t-3",
    name: "EventBridge rule triggers",
    subtext: "Queue dispatcher logic",
    project: "Apex Analytics",
    assignee: { name: "David Kim", initials: "DK" },
    dueDate: "Sep 20",
  },
  {
    id: "t-4",
    name: "Snapshot aggregation work...",
    subtext: "Metrics pipeline",
    project: "Apex Analytics",
    assignee: { name: "Elena Rostova", initials: "ER" },
    dueDate: "Sep 22",
  },
];

export const MANAGER_PROJECTS_LIST: ManagerProjectItem[] = [
  {
    id: "p-1",
    name: "Apex Analytics Platform",
    subtext: "Enterprise telemetry streaming",
    status: "Active",
    progress: 82,
    loggedHours: 186.5,
    members: ["AM", "ER", "MC", "SJ"],
    moreMembers: 3,
  },
  {
    id: "p-2",
    name: "Nova Mobile Dev",
    subtext: "Cross-platform client portal",
    status: "Active",
    progress: 48,
    loggedHours: 135.0,
    members: ["AM", "MC", "DK"],
    moreMembers: 2,
  },
];

// -------------------------------------------------------------
// 4. EMPLOYEE DASHBOARD DATA ("Good morning, Elena")
// -------------------------------------------------------------
export const EMPLOYEE_METRICS: MetricCardData[] = [
  {
    id: "emp-1",
    label: "My active tasks",
    value: 6,
  },
  {
    id: "emp-2",
    label: "Due this week",
    value: 3,
  },
  {
    id: "emp-3",
    label: "Logged this week",
    value: "38.5h",
    subtext: "Target: 40.0h",
  },
  {
    id: "emp-4",
    label: "Upcoming leave",
    value: "0 days",
    subtext: "Next holiday: Oct 2",
  },
];

export const EMPLOYEE_PRIORITIES_TABLE: EmployeePriorityRow[] = [
  {
    id: "ep-1",
    priority: "Urgent",
    title: "Connection pooler config",
    project: "Apex Analytics",
    dueDate: "Tomorrow",
    status: "In progress",
  },
  {
    id: "ep-2",
    priority: "High",
    title: "RLS predicate integration",
    project: "Apex Analytics",
    dueDate: "Sep 18",
    status: "To do",
  },
  {
    id: "ep-3",
    priority: "Medium",
    title: "Snapshot aggregation worker",
    project: "Apex Analytics",
    dueDate: "Sep 22",
    status: "In progress",
  },
  {
    id: "ep-4",
    priority: "Low",
    title: "Design system token review",
    project: "Nova Mobile",
    dueDate: "Sep 25",
    status: "To do",
  },
];

export const EMPLOYEE_WEEKLY_EFFORT: EmployeeWeeklyEffort = {
  totalHours: 38.5,
  targetHours: 40.0,
  percentage: 96,
  breakdown: [
    { day: "Monday", hours: 8.0 },
    { day: "Tuesday", hours: 8.5 },
    { day: "Wednesday", hours: 7.5 },
    { day: "Thursday", hours: 8.0 },
    { day: "Friday", hours: 6.5 },
  ],
};
