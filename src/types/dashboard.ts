import type { UserRole } from "@/app/providers";

// 1. Top metric summary card
export interface MetricCardData {
  id: string;
  label: string;            // e.g., "Active projects", "Org delivery rate"
  value: string | number;   // e.g., 14, "74.2%", "2,140.0h"
  subtext?: string;         // e.g., "Across 4 departments" (optional)
  badge?: {
    text: string;           // e.g., "+2.4%", "Alert"
    variant: "success" | "warning" | "destructive" | "neutral";
  };
  highlight?: boolean;      // Flags warning state (e.g., Manager yellow card)
}

// 2. Upcoming activity item (bottom row in all views)
export interface ActivityItem {
  id: string;
  title: string;                                  // e.g., "Client Meeting"
  type: "Project Activity" | "Non-Project";       // Controls badge styling
  time: string;                                   // e.g., "Today, 3:00 PM"
  project: string;                                // e.g., "Apex Analytics Platform"
}

// 3. Admin View: "All active projects" table row
export interface AdminProjectRow {
  id: string;
  name: string;             // e.g., "Apex Analytics Platform"
  subname: string;          // e.g., "v2.4 migration"
  client: string;           // e.g., "Horizon Media"
  manager: string;          // e.g., "Alex Morgan"
  status: "Active" | "On-hold" | "Delayed";
  hoursLogged: number;      // e.g., 386.0
}

// 4. Admin View: "Team distribution" right card item
export interface TeamDistributionItem {
  department: string;       // e.g., "Engineering"
  details: string;          // e.g., "18 members • 4 active projects"
}

// 5. Manager View: "Active & assigned tasks" table row
export interface ManagerTaskRow {
  id: string;
  name: string;             // e.g., "PostgreSQL connection pool..."
  subtext: string;          // e.g., "Infra routing update"
  project: string;          // e.g., "Apex Analytics"
  assignee: {
    name: string;           // e.g., "Elena Rostova"
    initials: string;       // e.g., "ER" for avatar fallback
    avatarUrl?: string;
  };
  dueDate: string;          // e.g., "Tomorrow", "Sep 18"
}

// 6. Manager View: "My projects" right card item
export interface ManagerProjectItem {
  id: string;
  name: string;             // e.g., "Apex Analytics Platform"
  subtext: string;          // e.g., "Enterprise telemetry streaming"
  status: string;           // e.g., "Active"
  progress: number;         // e.g., 82 (for percentage bar)
  loggedHours: number;      // e.g., 186.5
  members: string[];        // Array of member initials: ["AM", "ER", "MC"]
  moreMembers: number;      // Count for "+3" overflow avatar
}

// 7. Employee View: "My active priorities" table row
export interface EmployeePriorityRow {
  id: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  title: string;            // e.g., "Connection pooler config"
  project: string;          // e.g., "Apex Analytics"
  dueDate: string;          // e.g., "Tomorrow"
  status: "In progress" | "To do" | "Done";
}

// 8. Employee View: "Weekly effort logged" day item
export interface DayEffort {
  day: string;              // e.g., "Monday"
  hours: number;            // e.g., 8.0
}

// 9. Employee View: "Weekly effort logged" overall container
export interface EmployeeWeeklyEffort {
  totalHours: number;       // e.g., 38.5
  targetHours: number;      // e.g., 40.0
  percentage: number;       // e.g., 96
  breakdown: DayEffort[];   // Mon through Fri list
}