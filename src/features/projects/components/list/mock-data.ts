export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "In Progress" | "Done" | "Backlog";

export interface ListTask {
  id: string;
  code: string;
  title: string;
  feature: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  isOverdue: boolean;
  subtasksCompleted: number;
  subtasksTotal: number;
  loggedHours: number;
  estimatedHours: number;
}

export const MOCK_LIST_TASKS: ListTask[] = [
  {
    id: "t-12",
    code: "PROL-12",
    title: "UI Design & Prototyping",
    feature: "Design System",
    assignee: "Sarah Jenkins",
    priority: "High",
    status: "In Progress",
    dueDate: "Sep 20, 2026",
    isOverdue: true,
    subtasksCompleted: 2,
    subtasksTotal: 3,
    loggedHours: 24,
    estimatedHours: 32,
  },
  {
    id: "t-14",
    code: "PROL-14",
    title: "Frontend Layout Grid",
    feature: "Design System",
    assignee: "John Doe",
    priority: "High",
    status: "In Progress",
    dueDate: "Sep 20, 2026",
    isOverdue: false,
    subtasksCompleted: 3,
    subtasksTotal: 4,
    loggedHours: 18,
    estimatedHours: 24,
  },
  {
    id: "t-15",
    code: "PROL-15",
    title: "API Authentication Hook",
    feature: "Authentication",
    assignee: "Mike Ross",
    priority: "Medium",
    status: "In Progress",
    dueDate: "Sep 22, 2026",
    isOverdue: false,
    subtasksCompleted: 1,
    subtasksTotal: 2,
    loggedHours: 10,
    estimatedHours: 20,
  },
  {
    id: "t-04",
    code: "PROL-04",
    title: "Color Token System",
    feature: "Design System",
    assignee: "John Doe",
    priority: "Medium",
    status: "Done",
    dueDate: "Sep 12, 2026",
    isOverdue: false,
    subtasksCompleted: 2,
    subtasksTotal: 2,
    loggedHours: 16,
    estimatedHours: 16,
  },
  {
    id: "t-24",
    code: "PROL-24",
    title: "Analytics Schema",
    feature: "Reporting",
    assignee: "Sarah Jenkins",
    priority: "Low",
    status: "Backlog",
    dueDate: "Oct 5, 2026",
    isOverdue: false,
    subtasksCompleted: 0,
    subtasksTotal: 3,
    loggedHours: 0,
    estimatedHours: 12,
  },
];
