import type { TimeEntry, ProjectMetadata } from "@/types/timesheet";

export const PROJECT_TAXONOMY: Record<string, ProjectMetadata> = {
  "Website Design": {
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
  "Mobile App": {
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
  "Internal Project": {
    color: "#F0A500",
    dotClass: "bg-amber-500",
    badgeClass:
      "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300",
    tasks: ["Internal Retros & Spikes", "Sprint Review", "Team Sync"],
  },
};

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  {
    id: "TE-101",
    dateStr: "2026-09-14",
    project: "Website Design",
    task: "UI Design",
    hours: 4,
    mins: 30,
    location: "Tarento Office",
  },
  {
    id: "TE-102",
    dateStr: "2026-09-14",
    project: "Mobile App",
    task: "Core Architecture",
    hours: 3,
    mins: 30,
    location: "Client Site",
  },
  {
    id: "TE-103",
    dateStr: "2026-09-15",
    project: "Website Design",
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
    project: "Website Design",
    task: "Component Library",
    hours: 4,
    mins: 0,
    location: "Tarento Office",
  },
  {
    id: "TE-106",
    dateStr: "2026-09-16",
    project: "Mobile App",
    task: "Authentication Hook",
    hours: 4,
    mins: 0,
    location: "WFH",
  },
  {
    id: "TE-107",
    dateStr: "2026-09-17",
    project: "Website Design",
    task: "Design Tokens",
    hours: 4,
    mins: 30,
    location: "Tarento Office",
  },
  {
    id: "TE-108",
    dateStr: "2026-09-17",
    project: "Mobile App",
    task: "QA & Integration Testing",
    hours: 3,
    mins: 30,
    location: "Client Site",
  },
  {
    id: "TE-109",
    dateStr: "2026-09-18",
    project: "Website Design",
    task: "UI Design",
    hours: 4,
    mins: 30,
    location: "Tarento Office",
  },
  {
    id: "TE-110",
    dateStr: "2026-09-18",
    project: "Mobile App",
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
  "Website Design": {
    "UI Design": [9, 4, 4, 8, 4.5],
    "Frontend Development": [5, 5, 4, 4, 3],
    "Component Library": [4, 0, 4, 0, 4.5],
    "Design Tokens": [0, 0, 0, 4.5, 0],
  },
  "Mobile App": {
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
