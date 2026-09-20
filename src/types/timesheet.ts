export type WorkLocation = "Tarento Office" | "WFH" | "Client Site";

export interface TimeEntry {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  project: string;
  task: string;
  /** Optional free-text note about the work done (Kronos "Activity" field). */
  activity?: string;
  hours: number;
  mins: number;
  location: WorkLocation;
}

type WorkKind = "project" | "activity";

export interface ProjectMetadata {
  /** "project" = delivery work assigned to the user; "activity" = everything else (leave, training…). */
  kind?: WorkKind;
  /** Activity code shown in pickers, e.g. "784" → "[784] Training". */
  code?: string;
  color: string;
  dotClass: string;
  badgeClass: string;
  tasks: string[];
}

export type TimesheetTab = "tracking" | "report";
