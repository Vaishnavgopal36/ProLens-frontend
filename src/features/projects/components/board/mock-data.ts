export type BoardPriority = "High" | "Medium" | "Low";

export type BoardColumnId = "backlog" | "in_progress" | "delivered";

export interface BoardTask {
  id: string;
  code: string;
  title: string;
  description?: string;
  feature: string;
  priority: BoardPriority;
  assigneeName: string;
  assigneeInitials: string;
  dueDate?: string;
  isOverdue?: boolean;
  completedDate?: string;
  subtasksDone?: number;
  subtasksTotal?: number;
  column: BoardColumnId;
}

export interface BoardColumnMeta {
  id: BoardColumnId;
  title: string;
  dotClassName: string;
  countBadgeClassName: string;
}

export const BOARD_COLUMNS: BoardColumnMeta[] = [
  {
    id: "backlog",
    title: "Backlog",
    dotClassName: "bg-slate-400 dark:bg-slate-500",
    countBadgeClassName:
      "bg-canvas-surface text-muted-foreground border border-border-subtle",
  },
  {
    id: "in_progress",
    title: "In Progress",
    dotClassName: "bg-teal-500 animate-pulse",
    countBadgeClassName:
      "bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  },
  {
    id: "delivered",
    title: "Delivered",
    dotClassName: "bg-teal-600",
    countBadgeClassName:
      "bg-canvas-surface text-teal-700 border border-teal-200 dark:text-teal-300 dark:border-teal-800",
  },
];

export const BOARD_FEATURES = ["Design System", "Authentication", "Reporting"];

export const BOARD_ASSIGNEES = ["Sarah Jenkins", "John Doe", "Mike Ross"];

export const MOCK_BOARD_TASKS: BoardTask[] = [
  {
    id: "t-24",
    code: "PROL-24",
    title: "Analytics Schema",
    description:
      "Define unified event triggers for GA4 and data warehouse ingestion.",
    feature: "Reporting",
    priority: "Low",
    assigneeName: "Sarah Jenkins",
    assigneeInitials: "SJ",
    column: "backlog",
  },
  {
    id: "t-23",
    code: "PROL-23",
    title: "Copywriting Review",
    description: "Pass over onboarding flow copy for tone and clarity.",
    feature: "Design System",
    priority: "Medium",
    assigneeName: "Mike Ross",
    assigneeInitials: "MR",
    column: "backlog",
  },
  {
    id: "t-12",
    code: "PROL-12",
    title: "UI Design & Prototyping",
    description: "High-fidelity mockups for the core component library.",
    feature: "Design System",
    priority: "High",
    assigneeName: "Sarah Jenkins",
    assigneeInitials: "SJ",
    dueDate: "Sep 20",
    isOverdue: true,
    subtasksDone: 2,
    subtasksTotal: 3,
    column: "in_progress",
  },
  {
    id: "t-14",
    code: "PROL-14",
    title: "Frontend Layout Grid",
    description: "Responsive grid primitives for the app shell.",
    feature: "Design System",
    priority: "High",
    assigneeName: "John Doe",
    assigneeInitials: "JD",
    dueDate: "Sep 20",
    column: "in_progress",
  },
  {
    id: "t-15",
    code: "PROL-15",
    title: "API Authentication Hook",
    description: "React hook wrapping the token refresh lifecycle.",
    feature: "Authentication",
    priority: "Medium",
    assigneeName: "Mike Ross",
    assigneeInitials: "MR",
    dueDate: "Sep 22",
    column: "in_progress",
  },
  {
    id: "t-04",
    code: "PROL-04",
    title: "Color Token System",
    feature: "Design System",
    priority: "Medium",
    assigneeName: "John Doe",
    assigneeInitials: "JD",
    completedDate: "Sep 4",
    column: "delivered",
  },
  {
    id: "t-08",
    code: "PROL-08",
    title: "SVG Asset Pipeline",
    feature: "Design System",
    priority: "Low",
    assigneeName: "Mike Ross",
    assigneeInitials: "MR",
    completedDate: "Sep 8",
    column: "delivered",
  },
  {
    id: "t-01",
    code: "PROL-01",
    title: "Information Architecture",
    feature: "Reporting",
    priority: "Medium",
    assigneeName: "Sarah Jenkins",
    assigneeInitials: "SJ",
    completedDate: "Sep 1",
    column: "delivered",
  },
];
