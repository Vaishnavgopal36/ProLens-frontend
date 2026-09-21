import type { LucideIcon } from "lucide-react";

export type ActivityCategory = "project" | "non-project";

export interface ActivityMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  progressPercent?: number;
  highlight?: boolean;
}

export interface ActivityItem {
  id: string;
  category: ActivityCategory;
  categoryLabel?: string;
  projectName?: string;
  title: string;
  description?: string;
  date: string; // "YYYY-MM-DD"
  timeWindow: string; // e.g. "2:00 PM – 3:30 PM"
  durationHours: string;
  statusBadge?: {
    label: string;
    variant: "default" | "secondary" | "accent" | "outline" | "destructive" | "success" | "warning" | "neutral";
  };
  pinColor?: "teal" | "navy" | "gold";
  loggedBy?: string;
}
