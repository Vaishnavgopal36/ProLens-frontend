export type EventCategory =
  "Meeting" | "Client" | "Workshop" | "Marketing" | "Launch";

export interface CalendarEvent {
  id: string;
  day: number;
  month: number; // 0-indexed (8 = September)
  year: number;
  title: string;
  startTime: string; // "10:00"
  endTime: string; // "11:30"
  category: EventCategory;
  desc?: string;
  location?: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  overflowCount?: number;
}

export type CalendarViewMode = "month" | "week" | "day";
