import type { TimeEntry, ProjectMetadata } from "@/types/timesheet";

export const PROJECT_TAXONOMY: Record<string, ProjectMetadata> = {
  "Website Redesign": {
    color: "#1E8F8E",
    dotClass: "bg-[#1E8F8E]",
    badgeClass:
      "bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300",
    tasks: [
      "UI Design",
      "Frontend Development",
      "Component Library",
      "Design Tokens",
    ],
  },
  "Mobile App v2.0": {
    color: "#1F344D",
    dotClass: "bg-navy-700 dark:bg-slate-400",
    badgeClass:
      "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    tasks: [
      "Core Architecture",
      "QA & Integration Testing",
      "Push Notification Engine",
      "Authentication Hook",
    ],
  },
};

const project = (
  color: string,
  dotClass: string,
  badgeClass: string,
  tasks: string[],
): ProjectMetadata => ({ kind: "project", color, dotClass, badgeClass, tasks });

// Delivery projects. Keys match project names in the projects mock data; the
// time-entry dialog only offers the ones the signed-in user is assigned to.
PROJECT_TAXONOMY["Cloud Migration"] = project(
  "#6B7280",
  "bg-slate-500",
  "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  ["Discovery & Planning", "Data Migration Scripts", "Cutover Rehearsal"],
);
PROJECT_TAXONOMY["Design System Rollout"] = project(
  "#0E7490",
  "bg-cyan-600",
  "bg-cyan-50 text-cyan-700 border border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300",
  ["Token Migration", "Component Documentation", "Team Onboarding"],
);
PROJECT_TAXONOMY["Analytics Portal"] = project(
  "#7C3AED",
  "bg-violet-500",
  "bg-violet-50 text-violet-700 border border-violet-200/60 dark:bg-violet-950/40 dark:text-violet-300",
  ["Dashboard Widgets", "Scheduled Exports", "Role-based Access"],
);
Object.values(PROJECT_TAXONOMY).forEach((m) => (m.kind ??= "project"));

const activity = (
  code: string,
  dotClass: string,
  badgeClass: string,
  tasks: string[],
): ProjectMetadata => ({
  kind: "activity",
  code,
  color: "#9CA3AF",
  dotClass,
  badgeClass,
  tasks,
});

// Non-project time, like the Kronos activity list.
export const ACTIVITY_TAXONOMY: Record<string, ProjectMetadata> = {
  "Internal Project": {
    color: "#F0A500",
    dotClass: "bg-amber-500",
    badgeClass:
      "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300",
    tasks: ["Internal Retros & Spikes", "Sprint Review", "Team Sync"],
    kind: "activity",
    code: "701",
  },
  Leave: activity(
    "782",
    "bg-rose-400",
    "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300",
    ["Annual Leave", "Sick Leave", "Casual Leave", "Comp Off"],
  ),
  Training: activity(
    "784",
    "bg-emerald-500",
    "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    [
      "Mentoring",
      "Trainings - Internal",
      "Trainings - External",
      "Trainer Effort",
      "Trainings - Graduate Hire",
      "Meetings",
    ],
  ),
  Recruitment: activity(
    "1110",
    "bg-sky-500",
    "bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300",
    ["Interviews", "Campus Hiring", "Referral Screening"],
  ),
  "Pre-sales": activity(
    "2189",
    "bg-orange-500",
    "bg-orange-50 text-orange-700 border border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-300",
    ["Proposal Writing", "Client Demo", "Effort Estimation"],
  ),
  "People Engagement": activity(
    "2192",
    "bg-pink-500",
    "bg-pink-50 text-pink-700 border border-pink-200/60 dark:bg-pink-950/40 dark:text-pink-300",
    ["Team Events", "Town Halls", "Volunteering"],
  ),
  Travel: activity(
    "2193",
    "bg-indigo-500",
    "bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300",
    ["Client Travel", "Office Travel"],
  ),
};

/** Every bucket time can be logged against (projects + activities). */
export const WORK_TAXONOMY: Record<string, ProjectMetadata> = {
  ...PROJECT_TAXONOMY,
  ...ACTIVITY_TAXONOMY,
};

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  {
    id: "TE-101",
    dateStr: "2026-09-14",
    project: "Website Redesign",
    task: "UI Design",
    hours: 4,
    mins: 30,
    location: "Tarento Office",
  },
  {
    id: "TE-102",
    dateStr: "2026-09-14",
    project: "Mobile App v2.0",
    task: "Core Architecture",
    hours: 3,
    mins: 30,
    location: "Client Site",
  },
  {
    id: "TE-103",
    dateStr: "2026-09-15",
    project: "Website Redesign",
    task: "Frontend Development",
    hours: 5,
    mins: 0,
    location: "Tarento Office",
  },
  {
    id: "TE-104",
    dateStr: "2026-09-15",
    project: "Internal Project",
    task: "Sprint Review",
    hours: 2,
    mins: 30,
    location: "WFH",
  },
  {
    id: "TE-105",
    dateStr: "2026-09-16",
    project: "Website Redesign",
    task: "Component Library",
    hours: 4,
    mins: 0,
    location: "Tarento Office",
  },
  {
    id: "TE-106",
    dateStr: "2026-09-16",
    project: "Mobile App v2.0",
    task: "Authentication Hook",
    hours: 4,
    mins: 0,
    location: "WFH",
  },
  {
    id: "TE-107",
    dateStr: "2026-09-17",
    project: "Website Redesign",
    task: "Design Tokens",
    hours: 4,
    mins: 30,
    location: "Tarento Office",
  },
  {
    id: "TE-108",
    dateStr: "2026-09-17",
    project: "Mobile App v2.0",
    task: "QA & Integration Testing",
    hours: 3,
    mins: 30,
    location: "Client Site",
  },
  {
    id: "TE-109",
    dateStr: "2026-09-18",
    project: "Website Redesign",
    task: "UI Design",
    hours: 4,
    mins: 30,
    location: "Tarento Office",
  },
  {
    id: "TE-110",
    dateStr: "2026-09-18",
    project: "Mobile App v2.0",
    task: "Push Notification Engine",
    hours: 4,
    mins: 0,
    location: "WFH",
  },
  {
    id: "TE-111",
    dateStr: "2026-09-18",
    project: "Internal Project",
    task: "Team Sync",
    hours: 0,
    mins: 30,
    location: "Tarento Office",
  },
];

export const REPORT_PRESETS: Record<string, Record<string, number[]>> = {
  "Website Redesign": {
    "UI Design": [9, 4, 4, 8, 4.5],
    "Frontend Development": [5, 5, 4, 4, 3],
    "Component Library": [4, 0, 4, 0, 4.5],
    "Design Tokens": [0, 0, 0, 4.5, 0],
  },
  "Mobile App v2.0": {
    "Core Architecture": [7.5, 0, 0, 0, 0],
    "QA & Integration Testing": [0, 0, 0, 7.5, 0],
    "Push Notification Engine": [0, 0, 0, 0, 8],
    "Authentication Hook": [0, 0, 8, 0, 0],
  },
  "Internal Project": {
    "Internal Retros & Spikes": [0, 0, 0, 2, 0],
    "Sprint Review": [0, 2.5, 0, 0, 0],
    "Team Sync": [0, 0, 0, 0, 1],
  },
};
