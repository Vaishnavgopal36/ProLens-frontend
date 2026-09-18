import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface CalendarEvent {
  /** Day of month this event falls on (for the reference month below). */
  day: number;
  label: string;
  color: "rose" | "teal" | "amber";
}

// Fixed reference "today" so the mock grid renders deterministically,
// matching the source mockup (September 2026, Sprint 4).
const TODAY_YEAR = 2026;
const TODAY_MONTH = 8; // 0-indexed -> September
const TODAY_DAY = 18;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Keyed by "year-month-day" so events only render on their real month.
const EVENTS: (CalendarEvent & { month: number; year: number })[] = [
  { year: 2026, month: 8, day: 12, label: "Kickoff Review", color: "amber" },
  { year: 2026, month: 8, day: 20, label: "UI Design Due", color: "rose" },
  { year: 2026, month: 8, day: 22, label: "API Auth Due", color: "teal" },
  { year: 2026, month: 8, day: 24, label: "Security Audit (10:00)", color: "amber" },
  { year: 2026, month: 8, day: 24, label: "Acme Client Sync (10:30)", color: "amber" },
  { year: 2026, month: 8, day: 25, label: "Sprint 4 Review", color: "amber" },
  { year: 2026, month: 8, day: 29, label: "QA Handoff Due", color: "rose" },
];

const COLOR_CLASSES: Record<
  CalendarEvent["color"],
  { chip: string; dot: string }
> = {
  rose: {
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    dot: "bg-rose-500 dark:bg-rose-400",
  },
  teal: {
    chip: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
    dot: "bg-teal-500 dark:bg-teal-400",
  },
  amber: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500 dark:bg-amber-400",
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

  for (let i = firstWeekdayMonFirst - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inCurrentMonth: true });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inCurrentMonth: false });
  }

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
  const [year, setYear] = React.useState(TODAY_YEAR);
  const [month, setMonth] = React.useState(TODAY_MONTH);

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weeks = React.useMemo(() => buildMonthGrid(year, month), [year, month]);

  const eventsByDay = React.useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const event of EVENTS) {
      if (event.year !== year || event.month !== month) continue;
      const existing = map.get(event.day) ?? [];
      existing.push(event);
      map.set(event.day, existing);
    }
    return map;
  }, [year, month]);

  const goToMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const goToToday = () => {
    setYear(TODAY_YEAR);
    setMonth(TODAY_MONTH);
  };

  const monthEvents = Array.from(eventsByDay.values()).flat();
  const conflictDays = Array.from(eventsByDay.entries()).filter(
    ([, evts]) => evts.length > 1,
  );
  const deadlineCount = monthEvents.filter((e) => e.color === "rose").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Active Sprint Cycle
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {project.activeSprint || "—"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {project.dueDate ? `Target: ${project.dueDate}` : project.dateRange}
          </p>
        </Card>
        <Card className="p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Scheduled Events
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {monthEvents.length} events
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            In {monthLabel}
          </p>
        </Card>
        <Card className="p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <Icon icon={Flag} size={11} />
            Milestone Deadlines
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">{deadlineCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">This month</p>
        </Card>
        <Card
          className={cn(
            "p-4 shadow-xs",
            conflictDays.length > 0 &&
              "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10",
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wide flex items-center gap-1",
              conflictDays.length > 0
                ? "text-amber-700 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          >
            {conflictDays.length > 0 && <Icon icon={AlertTriangle} size={11} />}
            Schedule Conflicts
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {conflictDays.length} overlapping
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {conflictDays.length > 0
              ? `Sep ${conflictDays[0][0]}: ${conflictDays[0][1].length} events same day`
              : "No conflicts this month"}
          </p>
        </Card>
      </div>

      <Card className="p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Icon
              icon={CalendarDays}
              size={15}
              className="text-teal-600 dark:text-teal-400"
            />
            <span className="font-bold text-sm text-foreground">
              {monthLabel} Sprint Calendar
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 text-xs font-semibold dark:bg-teal-950/40 dark:text-teal-400">
              {project.activeSprint}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8 text-xs font-semibold"
            >
              Today
            </Button>
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-muted transition-colors"
              aria-label="Previous month"
            >
              <Icon icon={ChevronLeft} size={16} />
            </button>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-muted transition-colors"
              aria-label="Next month"
            >
              <Icon icon={ChevronRight} size={16} />
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-7 text-center text-xs bg-canvas-bg/70 border-b border-border-subtle dark:bg-canvas-bg/70">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="font-semibold text-muted-foreground py-2"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-border-subtle">
            {weeks.map((week) =>
              week.map((cell, idx) => {
                const isToday =
                  cell.inCurrentMonth &&
                  cell.day === TODAY_DAY &&
                  year === TODAY_YEAR &&
                  month === TODAY_MONTH;
                const events = cell.inCurrentMonth
                  ? (eventsByDay.get(cell.day) ?? [])
                  : [];
                const hasConflict = events.length > 1;
                const visibleEvents = events.slice(0, 2);
                const overflowCount = events.length - visibleEvents.length;

                return (
                  <div
                    key={`${cell.day}-${idx}`}
                    className={cn(
                      "min-h-[84px] p-2 flex flex-col gap-1 text-left",
                      cell.inCurrentMonth
                        ? "bg-canvas-surface dark:bg-canvas-surface"
                        : "bg-canvas-bg/40 dark:bg-canvas-bg/40",
                      hasConflict && "bg-amber-500/5 dark:bg-amber-500/10",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
                          isToday
                            ? "bg-teal-600 text-white font-bold dark:bg-teal-500 dark:text-white"
                            : cell.inCurrentMonth
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/40 font-medium",
                        )}
                      >
                        {cell.day}
                      </span>
                      {hasConflict && (
                        <Icon
                          icon={AlertTriangle}
                          size={11}
                          className="text-amber-600 dark:text-amber-400"
                        />
                      )}
                    </div>

                    {visibleEvents.map((event, i) => (
                      <span
                        key={i}
                        className={cn(
                          "inline-flex items-center gap-1 self-start max-w-full rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          COLOR_CLASSES[event.color].chip,
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            COLOR_CLASSES[event.color].dot,
                          )}
                        />
                        <span className="truncate">{event.label}</span>
                      </span>
                    ))}
                    {overflowCount > 0 && (
                      <span className="text-[10px] text-muted-foreground font-medium pl-1">
                        +{overflowCount} more
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Feature workstream
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Deadline
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Sprint / conflict
          </span>
        </div>
      </Card>
    </div>
  );
}
