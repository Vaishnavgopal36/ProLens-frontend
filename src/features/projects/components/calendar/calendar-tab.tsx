import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";

interface CalendarEvent {
  /** Day of month this event falls on (for the reference month below). */
  day: number;
  label: string;
  color: "rose" | "teal" | "amber";
}

// Fixed reference month so the mock grid renders deterministically,
// matching the source mockup (September 2026, Sprint 4).
const REFERENCE_YEAR = 2026;
const REFERENCE_MONTH = 8; // 0-indexed -> September
const TODAY_DAY = 18;

const MONTH_LABEL = new Date(REFERENCE_YEAR, REFERENCE_MONTH, 1).toLocaleDateString(
  "en-US",
  { month: "long", year: "numeric" },
);

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EVENTS: CalendarEvent[] = [
  { day: 12, label: "Kickoff Review", color: "amber" },
  { day: 20, label: "UI Design Due", color: "rose" },
  { day: 22, label: "API Auth Due", color: "teal" },
  { day: 25, label: "Sprint 4 Review", color: "amber" },
  { day: 29, label: "QA Handoff Due", color: "rose" },
];

const COLOR_CLASSES: Record<
  CalendarEvent["color"],
  { cell: string; label: string }
> = {
  rose: {
    cell: "bg-rose-50/70 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300",
    label: "text-rose-600 dark:text-rose-400",
  },
  teal: {
    cell: "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/40 dark:border-teal-900 dark:text-teal-300",
    label: "text-teal-600 dark:text-teal-400",
  },
  amber: {
    cell: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
    label: "text-amber-700 dark:text-amber-400",
  },
};

interface DayCell {
  day: number;
  inCurrentMonth: boolean;
}

function buildMonthGrid(year: number, month: number): DayCell[][] {
  const firstOfMonth = new Date(year, month, 1);
  // JS getDay(): 0 = Sunday ... 6 = Saturday. Convert to Mon-first index (0 = Mon ... 6 = Sun).
  const firstWeekdayMonFirst = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  // Leading days from the previous month to fill the first week.
  for (let i = firstWeekdayMonFirst - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inCurrentMonth: false });
  }

  // Days in the current month.
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inCurrentMonth: true });
  }

  // Trailing days from the next month to complete the final week.
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inCurrentMonth: false });
  }

  // Group into week rows.
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

interface CalendarTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function CalendarTab({ project }: CalendarTabProps) {
  const weeks = React.useMemo(
    () => buildMonthGrid(REFERENCE_YEAR, REFERENCE_MONTH),
    [],
  );

  const eventsByDay = React.useMemo(() => {
    const map = new Map<number, CalendarEvent>();
    EVENTS.forEach((event) => map.set(event.day, event));
    return map;
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon
              icon={CalendarDays}
              size={15}
              className="text-teal-600 dark:text-teal-400"
            />
            <span className="font-bold text-sm text-foreground">
              {MONTH_LABEL} Sprint Calendar
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 text-xs font-semibold dark:bg-teal-950/40 dark:text-teal-400">
              {project.activeSprint} active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-muted transition-colors"
              aria-label="Previous month"
            >
              <Icon icon={ChevronLeft} size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-muted transition-colors"
              aria-label="Next month"
            >
              <Icon icon={ChevronRight} size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="font-semibold text-muted-foreground py-1">
              {label}
            </div>
          ))}

          {weeks.map((week) =>
            week.map((cell, idx) => {
              const isToday =
                cell.inCurrentMonth && cell.day === TODAY_DAY;
              const event = cell.inCurrentMonth
                ? eventsByDay.get(cell.day)
                : undefined;

              if (event) {
                const colors = COLOR_CLASSES[event.color];
                return (
                  <div
                    key={`${cell.day}-${idx}`}
                    className={`h-20 p-2 rounded-lg border text-left font-bold ${colors.cell}`}
                  >
                    {cell.day}
                    <span
                      className={`block text-[10px] font-normal mt-1 truncate ${colors.label}`}
                    >
                      {event.label}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={`${cell.day}-${idx}`}
                  className={`h-20 p-2 rounded-lg text-left ${
                    cell.inCurrentMonth
                      ? isToday
                        ? "bg-canvas-bg/50 text-foreground font-bold border border-border-subtle"
                        : "bg-canvas-bg/50 text-muted-foreground"
                      : "bg-canvas-bg/20 text-muted-foreground/40"
                  }`}
                >
                  {cell.day}
                </div>
              );
            }),
          )}
        </div>
      </Card>
    </div>
  );
}
