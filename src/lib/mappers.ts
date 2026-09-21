import type { Project, ProjectMember, ProjectStatus } from "@/types/project";
import type {
  FeatureRead,
  ProjectMemberRead,
  ProjectRead,
  TaskRead,
} from "./api/types";
import type {
  BoardColumnId,
  BoardPriority,
  BoardTask,
} from "@/features/projects/components/board/mock-data";
import type {
  ListTask,
  TaskPriority,
  TaskStatus,
} from "@/features/projects/components/list/mock-data";
import type { FeatureStream } from "@/features/projects/components/features/mock-data";

export function mapBackendProjectToProject(
  p: ProjectRead,
  members: ProjectMemberRead[] = [],
): Project {
  const statusMap: Record<string, ProjectStatus> = {
    active: "ongoing",
    on_hold: "pending",
    completed: "completed",
    ongoing: "ongoing",
    pending: "pending",
  };

  const projectMembers: ProjectMember[] = members.map((m) => {
    const email = m.user_email || "member@prolens.internal";
    const name = m.user_name || email.split("@")[0];
    const initials = m.user_name
      ? m.user_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : email.slice(0, 2).toUpperCase();

    return {
      id: m.user_id,
      name,
      email,
      initials,
      role: (m.user_role as any) || "employee",
      designation: m.designation || "Team Member",
      assignedTasksCount: 0,
      assignedFeaturesCount: 0,
      hoursLogged: 0,
      status: "active",
    };
  });

  const leadMember = projectMembers.find(
    (m) =>
      m.role === "manager" || m.role === "admin" || m.role === "super_admin",
  );

  return {
    id: p.id,
    name: p.name,
    client: p.client_name || "Internal",
    description: p.description || "",
    status: statusMap[p.status] || "ongoing",
    lead: leadMember?.name || "Unassigned",
    activeSprint: "Sprint 1: Active",
    dateRange:
      p.start_date && p.end_date
        ? `${p.start_date} – ${p.end_date}`
        : p.end_date || "Ongoing",
    dueDate: p.end_date || "Ongoing",
    completionPercentage: 0,
    estimatedHours: 0,
    loggedHours: 0,
    tasksCount: 0,
    coreFeaturesCount: 0,
    pendingInvites: [],
    members: projectMembers,
  };
}

export function mapTaskToBoardTask(
  task: TaskRead,
  featureName = "General",
  assigneeName = "Unassigned",
): BoardTask {
  const priorityMap: Record<string, BoardPriority> = {
    urgent: "High",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const columnMap: Record<string, BoardColumnId> = {
    to_do: "backlog",
    in_progress: "in_progress",
    in_review: "in_progress",
    done: "delivered",
  };

  return {
    id: task.id,
    code: `TASK-${task.id.slice(0, 4).toUpperCase()}`,
    title: task.name,
    description: task.description ?? undefined,
    feature: featureName,
    priority: priorityMap[task.priority] || "Medium",
    assigneeName,
    assigneeInitials:
      assigneeName === "Unassigned"
        ? "--"
        : assigneeName.slice(0, 2).toUpperCase(),
    dueDate: task.due_date ?? undefined,
    isOverdue: Boolean(task.due_date && new Date(task.due_date) < new Date()),
    completedDate: task.status === "done" ? "Recently" : undefined,
    subtasksDone: task.subtasks?.filter((s) => s.done).length ?? 0,
    subtasksTotal: task.subtasks?.length ?? 0,
    column: columnMap[task.status] || "backlog",
  };
}

export function mapTaskToListTask(
  task: TaskRead,
  featureName = "General",
  assigneeName = "Unassigned",
): ListTask {
  const priorityMap: Record<string, TaskPriority> = {
    urgent: "High",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const statusMap: Record<string, TaskStatus> = {
    to_do: "Backlog",
    in_progress: "In Progress",
    in_review: "In Progress",
    done: "Delivered",
  };

  return {
    id: task.id,
    code: `TASK-${task.id.slice(0, 4).toUpperCase()}`,
    title: task.name,
    feature: featureName,
    assignee: assigneeName,
    priority: priorityMap[task.priority] || "Medium",
    status: statusMap[task.status] || "Backlog",
    dueDate: task.due_date || "No due date",
    isOverdue: Boolean(task.due_date && new Date(task.due_date) < new Date()),
    subtasksCompleted: task.subtasks?.filter((s) => s.done).length ?? 0,
    subtasksTotal: task.subtasks?.length ?? 0,
    loggedHours: 0,
    estimatedHours: Number(task.estimated_hours ?? 0),
  };
}

export function mapFeatureToStream(f: FeatureRead): FeatureStream {
  return {
    id: f.id,
    name: f.name,
    description: f.description || "",
    status: f.status === "done" ? "COMPLETED" : "ACTIVE",
    progress: f.status === "done" ? 100 : f.status === "in_progress" ? 50 : 0,
    tasksCount: 0,
    tasksCompleted: 0,
    avatars: [],
  };
}
