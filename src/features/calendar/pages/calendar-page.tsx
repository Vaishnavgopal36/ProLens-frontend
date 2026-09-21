import * as React from "react";
import { CalendarOff, ChevronLeft, ChevronRight, Clock, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toLocalISODate } from "@/lib/date";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { INITIAL_EVENTS } from "../api/mock-data";
import { ApplyLeaveDialog } from "../components/apply-leave-dialog";
import { ScheduleEventDialog } from "../components/schedule-event-dialog";
import { EventDetailsDialog } from "../components/event-details-dialog";
import { OverflowPopover } from "../components/overflow-popover";
import type {
  CalendarEvent,
  CalendarViewMode,
  EventCategory,
} from "@/types/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_PILLS_PER_DAY = 2;
const HOUR_ROW_PX = 56;

const CATEGORIES: { key: EventCategory; label: string; dot: string }[] = [
  { key: "Meeting", label: "Meetings", dot: "bg-blue-400" },
  { key: "Client", label: "Clients", dot: "bg-emerald-400" },
  { key: "Workshop", label: "Workshops", dot: "bg-purple-400" },
  { key: "Launch", label: "Launches", dot: "bg-rose-400" },
  { key: "Marketing", label: "Marketing", dot: "bg-yellow-400" },
  { key: "Leave", label: "Leave", dot: "bg-slate-400" },
];

const VIEWS: { key: CalendarViewMode; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

/* ---------- date helpers ---------- */

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = toLocalISODate;
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfWeek = (d: Date) => addDays(d, -d.getDay());
const isSameDay = (a: Date, b: Date) => toISO(a) === toISO(b);
const onDate = (e: CalendarEvent, d: Date) =>
  e.day === d.getDate() &&
  e.month === d.getMonth() &&
  e.year === d.getFullYear();
const isAllDay = (e: CalendarEvent) =>
  e.startTime === "00:00" && e.endTime === "23:59";
const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString("en-US", opts);

function viewTitle(view: CalendarViewMode, cursor: Date) {
  if (view === "day")
    return fmt(cursor, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  if (view === "week") {
    const start = startOfWeek(cursor);
    const end = addDays(start, 6);
    const sameMonth = start.getMonth() === end.getMonth();
    return `${fmt(start, { day: "numeric", month: sameMonth ? undefined : "short" })} – ${fmt(end, { day: "numeric", month: "short" })} ${end.getFullYear()}`;
  }
  return fmt(cursor, { month: "long", year: "numeric" });
}

/* ---------- small shared pieces ---------- */

function DateBadge({ date, today }: { date: Date; today: Date }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums",
        isSameDay(date, today) ? "bg-navy-500 text-white" : "text-foreground",
      )}
    >
      {date.getDate()}
    </span>
  );
}

/* ---------- page ---------- */

export function CalendarPage() {
  const today = React.useMemo(() => new Date(), []);
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [cursor, setCursor] = React.useState<Date>(today);
  const [view, setView] = React.useState<CalendarViewMode>("month");
  const [is24Hour, setIs24Hour] = React.useState(true);
  const [activeCategories, setActiveCategories] = React.useState<
    Set<EventCategory>
  >(new Set(CATEGORIES.map((c) => c.key)));
  const [query, setQuery] = React.useState("");

  const [addOpen, setAddOpen] = React.useState(false);
  const [leaveOpen, setLeaveOpen] = React.useState(false);
  const [addDate, setAddDate] = React.useState(toISO(today));
  const [selected, setSelected] = React.useState<CalendarEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [overflowDate, setOverflowDate] = React.useState<Date | null>(null);

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverISO, setDragOverISO] = React.useState<string | null>(null);

  const formatTime = (t: string) => {
    if (is24Hour) return t;
    const [h, m] = t.split(":");
    const hour = Number(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };
  const formatWindow = (e: CalendarEvent) =>
    isAllDay(e)
      ? "All day"
      : `${formatTime(e.startTime)} – ${formatTime(e.endTime)}`;

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter(
        (e) =>
          activeCategories.has(e.category) &&
          (!q ||
            e.title.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            e.desc?.toLowerCase().includes(q)),
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, activeCategories, query]);

  const eventsOn = (d: Date) => visible.filter((e) => onDate(e, d));

  /* navigation */
  const step = (dir: 1 | -1) =>
    setCursor((c) => {
      if (view === "day") return addDays(c, dir);
      if (view === "week") return addDays(c, 7 * dir);
      return new Date(c.getFullYear(), c.getMonth() + dir, 1);
    });

  /* actions */
  const openAdd = (d: Date) => {
    setAddDate(toISO(d));
    setAddOpen(true);
  };
  const openEvent = (e: CalendarEvent) => {
    setSelected(e);
    setDetailsOpen(true);
  };
  const toggleCategory = (key: EventCategory) =>
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Ctrl/⌘ + K toggles "new event" on the day being viewed (today in
  // month/week views).
  useModalHotkey({
    open: addOpen,
    onOpen: () => openAdd(view === "day" ? cursor : today),
    onClose: () => setAddOpen(false),
  });

  const dragProps = (e: CalendarEvent) => ({
    draggable: true,
    onDragStart: (ev: React.DragEvent) => {
      setDraggedId(e.id);
      ev.dataTransfer.setData("text/plain", e.id);
      ev.dataTransfer.effectAllowed = "move";
    },
    onDragEnd: () => {
      setDraggedId(null);
      setDragOverISO(null);
    },
  });

  const dropProps = (d: Date) => ({
    onDragOver: (ev: React.DragEvent) => {
      if (!draggedId) return;
      ev.preventDefault();
      setDragOverISO(toISO(d));
    },
    onDragLeave: () => setDragOverISO(null),
    onDrop: (ev: React.DragEvent) => {
      ev.preventDefault();
      const moved = events.find((x) => x.id === draggedId);
      setDraggedId(null);
      setDragOverISO(null);
      if (!moved || onDate(moved, d)) return;
      setEvents((prev) =>
        prev.map((x) =>
          x.id === moved.id
            ? {
                ...x,
                day: d.getDate(),
                month: d.getMonth(),
                year: d.getFullYear(),
              }
            : x,
        ),
      );
      toast.success(
        `"${moved.title}" moved to ${fmt(d, { month: "short", day: "numeric" })}`,
      );
    },
  });

  /* event chip used in month cells */
  const renderPill = (e: CalendarEvent) => (
    <button
      key={e.id}
      type="button"
      {...dragProps(e)}
      onClick={(ev) => {
        ev.stopPropagation();
        openEvent(e);
      }}
      title={`${e.title} · ${formatWindow(e)}`}
      className={cn(
        "flex w-full items-center gap-1 rounded border px-1.5 py-0.5 text-left text-2xs font-semibold leading-tight transition hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        e.colorBg,
        e.colorBorder,
        e.colorText,
        draggedId === e.id && "opacity-40",
      )}
    >
      {!isAllDay(e) && (
        <span className="shrink-0 font-medium tabular-nums opacity-70">
          {formatTime(e.startTime)}
        </span>
      )}
      <span className="truncate">{e.title}</span>
    </button>
  );

  /* ---------- views ---------- */

  const monthCells = React.useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();
    const weeks = Math.ceil((first.getDay() + daysInMonth) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  }, [cursor]);

  const monthView = (
    <div className="overflow-hidden rounded-lg border border-border-subtle">
      <div className="grid grid-cols-7 border-b border-border-subtle bg-canvas-bg">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-2xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthCells.map((date) => {
          const dayEvents = eventsOn(date);
          const inMonth = date.getMonth() === cursor.getMonth();
          const shown = dayEvents.slice(0, MAX_PILLS_PER_DAY);
          const hidden = dayEvents.length - shown.length;
          return (
            <div
              key={toISO(date)}
              {...dropProps(date)}
              onClick={() => openAdd(date)}
              className={cn(
                "group relative min-h-[116px] cursor-pointer border-b border-r border-border-subtle p-1.5 transition-colors [&:nth-child(7n)]:border-r-0",
                inMonth
                  ? "bg-canvas-surface hover:bg-canvas-bg/60"
                  : "bg-canvas-bg/50 text-muted-foreground",
                dragOverISO === toISO(date) &&
                  "bg-teal-500/10 ring-2 ring-inset ring-teal-500",
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={cn(!inMonth && "opacity-50")}>
                  <DateBadge date={date} today={today} />
                </span>
                <button
                  type="button"
                  aria-label={`Add event on ${fmt(date, { month: "short", day: "numeric" })}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAdd(date);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                >
                  <Icon icon={Plus} size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {shown.map(renderPill)}
                {hidden > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOverflowDate(date);
                    }}
                    className="px-1 text-2xs font-medium text-teal-700 hover:underline dark:text-teal-300"
                  >
                    +{hidden} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(cursor), i),
  );

  const weekView = (
    <div className="overflow-hidden rounded-lg border border-border-subtle">
      <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-7 sm:divide-x sm:divide-y-0">
        {weekDays.map((date) => {
          const dayEvents = eventsOn(date);
          return (
            <div
              key={toISO(date)}
              {...dropProps(date)}
              className={cn(
                "flex min-h-[360px] flex-col bg-canvas-surface transition-colors",
                dragOverISO === toISO(date) && "bg-teal-500/10",
              )}
            >
              <div className="flex items-center justify-between border-b border-border-subtle bg-canvas-bg px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {WEEKDAYS[date.getDay()]}
                  </span>
                  <DateBadge date={date} today={today} />
                </div>
                <button
                  type="button"
                  aria-label={`Add event on ${fmt(date, { month: "short", day: "numeric" })}`}
                  onClick={() => openAdd(date)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon icon={Plus} size={14} />
                </button>
              </div>
              <div className="flex-1 space-y-1.5 p-2">
                {dayEvents.length === 0 ? (
                  <p className="pt-6 text-center text-2xs text-muted-foreground/60">
                    No events
                  </p>
                ) : (
                  dayEvents.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      {...dragProps(e)}
                      onClick={() => openEvent(e)}
                      className={cn(
                        "block w-full rounded-md border p-2 text-left transition hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        e.colorBg,
                        e.colorBorder,
                        draggedId === e.id && "opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "block text-xs font-semibold leading-snug",
                          e.colorText,
                        )}
                      >
                        {e.title}
                      </span>
                      <span className="mt-0.5 block text-3xs tabular-nums text-muted-foreground">
                        {formatWindow(e)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const dayScrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (view === "day" && dayScrollRef.current)
      dayScrollRef.current.scrollTop = 8 * HOUR_ROW_PX;
  }, [view]);

  const dayEvents = eventsOn(cursor);
  const allDayEvents = dayEvents.filter(isAllDay);
  const dayView = (
    <div className="overflow-hidden rounded-lg border border-border-subtle">
      {allDayEvents.length > 0 && (
        <div className="flex items-start gap-3 border-b border-border-subtle bg-canvas-bg px-3 py-2">
          <span className="w-16 shrink-0 pt-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            All day
          </span>
          <div className="flex flex-1 flex-wrap gap-1.5">
            {allDayEvents.map(renderPill)}
          </div>
        </div>
      )}
      <div ref={dayScrollRef} className="max-h-[620px] overflow-y-auto">
        {Array.from({ length: 24 }, (_, hour) => {
          const key = pad(hour);
          const inHour = dayEvents.filter(
            (e) => !isAllDay(e) && e.startTime.startsWith(key),
          );
          return (
            <div
              key={hour}
              style={{ minHeight: HOUR_ROW_PX }}
              className="group flex border-b border-border-subtle last:border-b-0"
            >
              <span className="w-16 shrink-0 border-r border-border-subtle px-3 py-2 text-2xs tabular-nums text-muted-foreground">
                {formatTime(`${key}:00`)}
              </span>
              <div
                onClick={() => openAdd(cursor)}
                className="flex-1 cursor-pointer space-y-1.5 p-1.5 transition-colors hover:bg-canvas-bg/60"
              >
                {inHour.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      openEvent(e);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      e.colorBg,
                      e.colorBorder,
                    )}
                  >
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-xs font-semibold",
                          e.colorText,
                        )}
                      >
                        {e.title}
                      </span>
                      {e.desc && (
                        <span className="block truncate text-2xs text-muted-foreground">
                          {e.desc}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-2xs font-medium tabular-nums text-muted-foreground">
                      {formatWindow(e)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="mx-auto mb-8 max-w-[1340px] space-y-4 rounded-lg border border-border-subtle bg-canvas-surface p-5 text-foreground shadow-sm md:p-6">
      {/* Header: title + navigation, primary action right-aligned */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="min-w-[13rem] text-xl font-bold tracking-tight">
            {viewTitle(view, cursor)}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => step(-1)}
              aria-label="Previous"
            >
              <Icon icon={ChevronLeft} size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCursor(today)}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => step(1)}
              aria-label="Next"
            >
              <Icon icon={ChevronRight} size={16} />
            </Button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold"
            onClick={() => setLeaveOpen(true)}
          >
            <Icon icon={CalendarOff} size={16} />
            Add Leave
          </Button>
          <Button
            variant="accent"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold"
            title="Add event (Ctrl+K)"
            onClick={() => openAdd(view === "day" ? cursor : today)}
          >
            <Icon icon={Plus} size={16} />
            Add Event
          </Button>
        </div>
      </div>

      {/* Controls: search + filters on the left, display options on the right */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border-subtle py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Icon
              icon={Search}
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search events…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 border-border-subtle bg-canvas-bg pl-9 text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => {
              const on = activeCategories.has(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCategory(c.key)}
                  aria-pressed={on}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on
                      ? "border-border-subtle bg-canvas-surface text-foreground"
                      : "border-transparent bg-muted/60 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      on ? c.dot : "bg-muted-foreground/30",
                    )}
                  />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs tabular-nums"
            onClick={() => setIs24Hour((v) => !v)}
            aria-label="Toggle 12 or 24 hour time"
          >
            <Icon icon={Clock} size={14} className="text-muted-foreground" />
            {is24Hour ? "24h" : "12h"}
          </Button>
          <div
            role="group"
            aria-label="Calendar view"
            className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5"
          >
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setView(v.key)}
                aria-pressed={view === v.key}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  view === v.key
                    ? "bg-canvas-surface font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "month" && monthView}
      {view === "week" && weekView}
      {view === "day" && dayView}

      <ScheduleEventDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultDate={addDate}
        onAddEvent={(ev) => setEvents((prev) => [...prev, ev])}
      />

      <ApplyLeaveDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        defaultDate={toISO(view === "day" ? cursor : today)}
        onApplyLeave={(evs) => setEvents((prev) => [...prev, ...evs])}
      />

      <EventDetailsDialog
        event={selected}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onDelete={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
        is24HourMode={is24Hour}
      />

      <OverflowPopover
        open={overflowDate !== null}
        onOpenChange={(o) => !o && setOverflowDate(null)}
        dateLabel={
          overflowDate
            ? fmt(overflowDate, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""
        }
        events={overflowDate ? eventsOn(overflowDate) : []}
        onSelectEvent={openEvent}
        is24HourMode={is24Hour}
      />
    </section>
  );
}
