export type ActivityType = "project" | "non-project";
export type ActivityCategory = "project" | "non-project";

export interface ActivitySubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityModuleSpec {
  id: string;
  title: string;
  status: "verified" | "pending" | "none";
  specs: string[];
}

export interface ActivityDetailTask {
  id: string;
  title: string;
  duration?: string;
  scope?: string;
  completed: boolean;
  subtasks?: ActivitySubtask[];
  modules?: ActivityModuleSpec[];
}

// Backward compatibility alias so any other imports don't break
export type ActivityTask = ActivityDetailTask;

export interface ActivityCardItem {
  id: string;
  type: ActivityType;
  title: string;
  projectName?: string;
  streamName?: string;
  date: string;
  scheduledTime?: string;
  description: string;
  duration: string;
  loggedHours: string;
  tasksCount?: number;
  scope?: string;
  taskTag?: string;
  assignedLead?: {
    name: string;
    initials: string;
    role?: string;
  };
  priority?: "High" | "Medium" | "Low";
  referenceCode?: string;
  members: string[];
  moreMembersCount?: number;
  tasks?: ActivityDetailTask[];
  // Optional badge for backward compatibility
  statusBadge?: {
    label: string;
    variant: "neutral" | "secondary" | "success" | "warning" | "destructive";
  };
}

// Backward compatibility alias
export type ActivityItem = ActivityCardItem;