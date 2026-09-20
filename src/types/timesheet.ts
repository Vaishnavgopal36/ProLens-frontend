export type WorkLocation = "Tarento Office" | "WFH" | "Client Site";

export interface TimeEntry {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  project: string;
  task: string;
  hours: number;
  mins: number;
  location: WorkLocation;
}

export interface ProjectMetadata {
  color: string;
  dotClass: string;
  badgeClass: string;
  tasks: string[];
}

export type TimesheetTab = "tracking" | "report";
