import type { LucideIcon } from "lucide-react";

export type ActivityCategory = "project" | "non-project";

export interface ActivityItem {
  id: string;
  category: ActivityCategory;
  categoryLabel: string; // e.g. "External / Professional", "Project Task Completed"
  title: string;
  description: string;
  timestamp: string; // e.g. "Today, 12:30 PM - 1:30 PM"
  durationHours: string; // e.g. "1.0 hr", "2.5 hrs"
  statusBadge: {
    label: string; // "Completed", "In Progress", "Approved"
    variant: "success" | "secondary" | "warning" | "neutral";
  };
  projectName?: string; // If project-related
  loggedBy?: string;
  assignees?: string;
  pinColor: "navy" | "teal" | "gold" | "secondary";
  metaNote?: {
    icon: LucideIcon;
    text: string;
  };
}

export interface ActivityDateGroup {
  groupTitle: string; // "Today", "Yesterday", "Earlier This Week"
  dateLabel: string; // "Sep 18, 2026"
  items: ActivityItem[];
}

export interface ActivityMetric {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  subtext: string;
  icon: LucideIcon;
  highlight?: boolean;
  progressPercent?: number;
}