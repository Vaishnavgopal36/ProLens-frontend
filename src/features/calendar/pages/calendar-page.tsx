import * as React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Grid,
  List,
  Columns,
  LayoutGrid,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { INITIAL_EVENTS } from "../api/mock-data";
import { ScheduleEventDialog } from "../components/schedule-event-dialog";
import { EventDetailsDialog } from "../components/event-details-dialog";
import { OverflowPopover } from "../components/overflow-popover";
import type {
  CalendarEvent,
  CalendarViewMode,
  EventCategory,
  TimeScope,
} from "@/types/calendar";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentYear, setCurrentYear] = React.useState(2026);
  const [currentMonth, setCurrentMonth] = React.useState(8); // 8 = September
  const [viewType, setViewType] = React.useState<CalendarViewMode>("month");
  const [timeScope, setTimeScope] = React.useState<TimeScope>("month");
  const [is24HourMode, setIs24HourMode] = React.useState(true);
  const [activeCategories, setActiveCategories] = React.useState<
    Set<EventCategory>
  >(new Set(["Marketing", "Meeting", "Client", "Workshop", "Launch"]));
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals & Selection state
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] =
    React.useState("2026-09-12");
  const [selectedEvent, setSelectedEvent] =
    React.useState<CalendarEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  const [overflowDay, setOverflowDay] = React.useState(12);

  // Week View pagination offset
  const [weekStartDay, setWeekStartDay] = React.useState(8);

  // Drag and Drop tracking
  const [draggedEventId, setDraggedEventId] = React.useState<string | null>(
    null,
  );
  const [dragOverDay, setDragOverDay] = React.useState<number | null>(null);

  // Time formatter helper
  const formatTime = (timeStr: string) => {
    if (!timeStr || is24HourMode) return timeStr;
    const parts = timeStr.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1] || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const formatWindow = (start: string, end: string) => {
    if (start === "00:00" && end === "23:59")
      return is24HourMode ? "00:00 - 23:59" : "All Day";
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Month navigation
  const changeMonth = (delta: number) => {
    let nextMonth = currentMonth + delta;
    let nextYear = currentYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear--;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  // Filter handlers
  const toggleCategory = (cat: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedEventId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (targetDay: number) => {
    if (!draggedEventId) return;
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === draggedEventId ? { ...ev, day: targetDay } : ev,
      ),
    );
    const found = events.find((e) => e.id === draggedEventId);
    toast.success(`Event "${found?.title ?? ""}" moved to Sep ${targetDay}!`);
    setDraggedEventId(null);
    setDragOverDay(null);
  };

  // Compute Days for current Month
  const gridCells = React.useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

    const cells: { day: number | null; isCurrent: boolean }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - firstDayIndex + 1;
      if (dayNum > 0 && dayNum <= daysInMonth) {
        cells.push({ day: dayNum, isCurrent: true });
      } else {
        cells.push({ day: null, isCurrent: false });
      }
    }
    return cells;
  }, [currentYear, currentMonth]);

  const visibleEvents = React.useMemo(() => {
    return events.filter(
      (e) =>
        e.month === currentMonth &&
        e.year === currentYear &&
        activeCategories.has(e.category) &&
        (searchQuery === "" ||
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.category.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [events, currentMonth, currentYear, activeCategories, searchQuery]);

  return (
    <section className="max-w-[1340px] mx-auto bg-canvas-surface border border-border-subtle rounded-lg shadow-sm p-5 md:p-6 mb-8 text-foreground">
      {/* Top Title & Global Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Event Calendar
        </h2>
        <div className="relative w-full sm:w-80">
          <Icon
            icon={Search}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search events, clients, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-xs bg-canvas-bg border-border-subtle"
          />
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 pt-1 border-b border-border-subtle">
        {/* Left: Date navigation */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle bg-canvas-surface hover:bg-canvas-bg text-muted-foreground text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            &lt;
          </button>

          <div className="flex items-center pl-2.5 pr-2 py-1 border border-border-subtle rounded bg-canvas-surface text-xs font-semibold text-foreground space-x-1.5">
            <Icon
              icon={CalendarIcon}
              size={14}
              className="text-muted-foreground"
            />
            <select
              aria-label="Month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="border-0 bg-transparent py-0 pl-1 pr-5 text-xs font-semibold text-foreground cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <select
            aria-label="Year"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="py-1 px-3 border border-border-subtle rounded bg-canvas-surface text-xs font-semibold text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle bg-canvas-surface hover:bg-canvas-bg text-muted-foreground text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            &gt;
          </button>
        </div>

        {/* Right: Actions, filters & view switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 24h Toggle */}
          <button
            type="button"
            onClick={() => setIs24HourMode((prev) => !prev)}
            className="px-3 py-1.5 border border-border-subtle rounded bg-canvas-surface hover:bg-canvas-bg text-xs font-medium text-foreground flex items-center space-x-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={Clock} size={14} className="text-muted-foreground" />
            <span>{is24HourMode ? "24h" : "12h"}</span>
          </button>

          {/* Filter Popover Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="px-3 py-1.5 border border-border-subtle rounded bg-canvas-surface hover:bg-canvas-bg text-xs font-medium text-foreground flex items-center space-x-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon
                  icon={Filter}
                  size={14}
                  className="text-muted-foreground"
                />
                <span>Filter</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-3 bg-canvas-surface border border-border-subtle shadow-xl"
            >
              <p className="text-xs font-bold text-foreground mb-2">
                Filter Categories
              </p>
              <div className="space-y-2 text-xs">
                {[
                  {
                    key: "Marketing" as EventCategory,
                    label: "Ads & Marketing",
                    color: "bg-yellow-400",
                  },
                  {
                    key: "Meeting" as EventCategory,
                    label: "Internal Meetings",
                    color: "bg-blue-400",
                  },
                  {
                    key: "Client" as EventCategory,
                    label: "Clients & External",
                    color: "bg-emerald-400",
                  },
                  {
                    key: "Workshop" as EventCategory,
                    label: "Workshops & Training",
                    color: "bg-purple-400",
                  },
                  {
                    key: "Launch" as EventCategory,
                    label: "Sprints & Launches",
                    color: "bg-rose-400",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center space-x-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={activeCategories.has(item.key)}
                      onChange={() => toggleCategory(item.key)}
                      className="rounded text-teal-600 dark:text-teal-400 focus:ring-teal-500 h-3.5 w-3.5"
                    />
                    <span
                      className={cn(
                        "inline-block w-2.5 h-2.5 rounded-full",
                        item.color,
                      )}
                    />
                    <span className="text-foreground">{item.label}</span>
                  </label>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Time Scope Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="px-3 py-1.5 border border-border-subtle rounded bg-canvas-surface hover:bg-canvas-bg text-xs font-medium text-foreground flex items-center space-x-1.5 transition capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon
                  icon={CalendarIcon}
                  size={14}
                  className="text-muted-foreground"
                />
                <span>
                  {timeScope === "today"
                    ? "Today"
                    : timeScope === "week"
                      ? "This Week"
                      : timeScope === "month"
                        ? "This Month"
                        : "This Year"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-canvas-surface border border-border-subtle shadow-xl py-1"
            >
              <DropdownMenuItem
                onClick={() => {
                  setTimeScope("today");
                  setViewType("day");
                }}
              >
                <span>Today</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTimeScope("week");
                  setViewType("week");
                }}
              >
                <span>This Week</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTimeScope("month");
                  setViewType("month");
                }}
              >
                <span>This Month</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeScope("year")}>
                <span>This Year (2026)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggles */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setViewType("agenda")}
              title="Agenda List View"
              aria-label="Agenda list view"
              aria-pressed={viewType === "agenda"}
              className={cn(
                "p-1.5 border border-border-subtle rounded hover:bg-canvas-bg text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                viewType === "agenda" &&
                  "bg-muted font-semibold text-foreground",
              )}
            >
              <Icon icon={List} size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewType("week")}
              title="Week Column View"
              aria-label="Week column view"
              aria-pressed={viewType === "week"}
              className={cn(
                "p-1.5 border border-border-subtle rounded hover:bg-canvas-bg text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                viewType === "week" && "bg-muted font-semibold text-foreground",
              )}
            >
              <Icon icon={Columns} size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewType("month")}
              title="Month Grid View"
              aria-pressed={viewType === "month"}
              className={cn(
                "px-2.5 py-1.5 border border-border-subtle rounded text-xs flex items-center space-x-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                viewType === "month"
                  ? "bg-muted font-semibold text-foreground"
                  : "bg-canvas-surface text-muted-foreground hover:bg-canvas-bg",
              )}
            >
              <Icon icon={Grid} size={14} />
              <span>Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewType("day")}
              title="Day Schedule View"
              aria-label="Day schedule view"
              aria-pressed={viewType === "day"}
              className={cn(
                "p-1.5 border border-border-subtle rounded hover:bg-canvas-bg text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                viewType === "day" && "bg-muted font-semibold text-foreground",
              )}
            >
              <Icon icon={LayoutGrid} size={15} />
            </button>
          </div>

          {/* + Add Event Primary Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedDateForAdd("2026-09-12");
              setAddModalOpen(true);
            }}
            className="ml-1 px-3.5 py-1.5 rounded bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm border border-amber-500/40 hover:border-amber-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-amber-400 font-bold">+</span>
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTH VIEW (Canonical Default) */}
      {viewType === "month" && (
        <div className="mt-4">
          <div className="grid grid-cols-7 border-b border-border-subtle pb-2 text-center text-xs font-semibold text-foreground">
            {WEEKDAY_HEADERS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-border-subtle bg-canvas-surface rounded-b-md">
            {gridCells.map((cell, idx) => {
              if (!cell.isCurrent || cell.day === null) {
                return (
                  <div
                    key={idx}
                    className="calendar-grid-cell p-2 bg-canvas-bg/60 opacity-40 min-h-[118px] border-r border-b border-border-subtle"
                  />
                );
              }

              const dayEvents = visibleEvents.filter((e) => e.day === cell.day);
              const primaryEvent = dayEvents[0];
              const isToday =
                cell.day === 12 && currentMonth === 8 && currentYear === 2026;
              const isOver = dragOverDay === cell.day;

              return (
                <div
                  key={idx}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDay(cell.day);
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(cell.day!);
                  }}
                  className={cn(
                    "calendar-grid-cell p-2 flex flex-col justify-between bg-canvas-surface relative hover:bg-canvas-bg/60 cursor-pointer min-h-[118px] border-r border-b border-border-subtle transition-colors",
                    isOver &&
                      "bg-emerald-50! border-dashed border-2 border-teal-500!",
                  )}
                  onClick={() => {
                    const dStr = String(cell.day).padStart(2, "0");
                    const mStr = String(currentMonth + 1).padStart(2, "0");
                    setSelectedDateForAdd(`${currentYear}-${mStr}-${dStr}`);
                    setAddModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-1 w-full">
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy-900 text-white font-bold text-xs shadow-sm">
                        12
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-foreground ml-0.5">
                        {cell.day}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dStr = String(cell.day).padStart(2, "0");
                        const mStr = String(currentMonth + 1).padStart(2, "0");
                        setSelectedDateForAdd(`${currentYear}-${mStr}-${dStr}`);
                        setAddModalOpen(true);
                      }}
                      className="text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-muted p-1 rounded transition-colors text-sm font-semibold leading-none flex items-center justify-center w-5 h-5"
                      aria-label="Add event"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary Event Chip */}
                  <div className="space-y-1 my-auto">
                    {primaryEvent && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, primaryEvent.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(primaryEvent);
                          setDetailsOpen(true);
                        }}
                        className={cn(
                          "p-1.5 rounded-md border cursor-pointer hover:opacity-90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition select-none",
                          primaryEvent.colorBg,
                          primaryEvent.colorBorder,
                        )}
                      >
                        <div
                          className={cn(
                            "text-xs font-bold leading-tight truncate",
                            primaryEvent.colorText,
                          )}
                        >
                          {primaryEvent.title}
                        </div>
                        <div className="text-3xs text-muted-foreground truncate mt-0.5">
                          {primaryEvent.category === "Marketing"
                            ? primaryEvent.desc || "AdSense + FB, Target ..."
                            : formatWindow(
                                primaryEvent.startTime,
                                primaryEvent.endTime,
                              )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overflow footer */}
                  <div className="mt-1 text-center">
                    {dayEvents.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOverflowDay(cell.day!);
                          setOverflowOpen(true);
                        }}
                        className="text-2xs text-muted-foreground hover:text-foreground font-medium hover:underline"
                      >
                        +{dayEvents.length - 1} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK TIMELINE VIEW */}
      {viewType === "week" && (
        <div className="mt-4">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-bold text-foreground">
                Week Timeline (Tuesday - Monday)
              </h3>
              <span className="text-xs text-muted-foreground font-normal">
                Sep {weekStartDay} – Sep {Math.min(weekStartDay + 6, 30)},{" "}
                {currentYear}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setWeekStartDay((prev) => Math.max(1, prev - 7))}
                aria-label="Previous week"
                className="w-7 h-7 flex items-center justify-center rounded border border-border-subtle bg-canvas-surface hover:bg-muted text-foreground text-xs font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => setWeekStartDay(8)}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-border-subtle bg-canvas-surface hover:bg-muted text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() =>
                  setWeekStartDay((prev) => Math.min(24, prev + 7))
                }
                aria-label="Next week"
                className="w-7 h-7 flex items-center justify-center rounded border border-border-subtle bg-canvas-surface hover:bg-muted text-foreground text-xs font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border-subtle rounded-lg">
            <div className="grid grid-cols-7 bg-canvas-bg border-b border-border-subtle text-center text-xs font-semibold py-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const dayNum = weekStartDay + i;
                const isToday = dayNum === 12;
                return (
                  <div
                    key={i}
                    className={
                      isToday
                        ? "text-teal-600 dark:text-teal-400 font-bold"
                        : "text-foreground"
                    }
                  >
                    Day {dayNum} {isToday && "(Today)"}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 divide-x divide-border-subtle bg-canvas-surface min-h-[400px]">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const dayNum = weekStartDay + i;
                const dayEvts = visibleEvents.filter((e) => e.day === dayNum);
                return (
                  <div key={i} className="p-2 space-y-2">
                    {dayEvts.length === 0 ? (
                      <div className="text-2xs text-muted-foreground text-center pt-8">
                        No events
                      </div>
                    ) : (
                      dayEvts.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setDetailsOpen(true);
                          }}
                          className={cn(
                            "p-2 rounded border text-xs cursor-pointer shadow-sm hover:opacity-95",
                            ev.colorBg,
                            ev.colorBorder,
                          )}
                        >
                          <span className={cn("font-bold block", ev.colorText)}>
                            {ev.title}
                          </span>
                          <span className="text-3xs text-muted-foreground block mt-0.5">
                            {formatWindow(ev.startTime, ev.endTime)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DAY TIMELINE VIEW */}
      {viewType === "day" && (
        <div className="mt-4">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-sm font-bold text-foreground">
              Daily Schedule - September 12, {currentYear}
            </h3>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium bg-teal-500/10 px-2 py-0.5 rounded">
              Selected Date View
            </span>
          </div>

          <div className="border border-border-subtle rounded-lg bg-canvas-surface divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
            {[
              "08:00",
              "09:00",
              "10:00",
              "11:00",
              "12:00",
              "13:00",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
            ].map((hour) => {
              const matched = visibleEvents.filter(
                (e) =>
                  e.day === 12 && e.startTime.startsWith(hour.split(":")[0]),
              );
              return (
                <div
                  key={hour}
                  className="flex items-start p-3 hover:bg-canvas-bg transition"
                >
                  <span className="w-20 text-xs font-semibold text-muted-foreground shrink-0">
                    {formatTime(hour)}
                  </span>
                  <div className="flex-1 space-y-1.5">
                    {matched.length > 0 ? (
                      matched.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setDetailsOpen(true);
                          }}
                          className={cn(
                            "border p-2 rounded text-xs cursor-pointer shadow-sm flex items-center justify-between",
                            ev.colorBg,
                            ev.colorBorder,
                          )}
                        >
                          <div>
                            <span className={cn("font-bold", ev.colorText)}>
                              {ev.title}
                            </span>
                            <p className="text-2xs text-muted-foreground">
                              {ev.desc}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-3xs font-semibold",
                              ev.colorText,
                            )}
                          >
                            {formatWindow(ev.startTime, ev.endTime)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground/70 italic">
                        Available slot
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: AGENDA LIST VIEW */}
      {viewType === "agenda" && (
        <div className="mt-4">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-sm font-bold text-foreground">
              Month Agenda &amp; Key Deadlines
            </h3>
            <span className="text-xs text-muted-foreground">
              Chronological Event Stream
            </span>
          </div>

          <div className="space-y-3">
            {visibleEvents
              .sort((a, b) => a.day - b.day)
              .map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setDetailsOpen(true);
                  }}
                  className="bg-canvas-surface p-3 rounded-lg border border-border-subtle shadow-sm flex items-center justify-between hover:border-teal-500 cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded bg-muted flex flex-col items-center justify-center text-foreground font-bold shrink-0">
                      <span className="text-3xs uppercase font-semibold text-muted-foreground">
                        Sep
                      </span>
                      <span className="text-sm">{ev.day}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {ev.title}
                      </h4>
                      <p className="text-2xs text-muted-foreground">
                        {ev.desc || "General scheduled item"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "inline-block text-2xs font-semibold px-2 py-0.5 rounded",
                        ev.colorBg,
                        ev.colorText,
                      )}
                    >
                      {formatWindow(ev.startTime, ev.endTime)}
                    </span>
                    <span className="block text-3xs text-muted-foreground mt-1">
                      {ev.category}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Annual Overview 2026 Grid Cards */}
      <div className="mt-6 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-sm font-bold text-foreground">
            Annual Overview - 2026
          </h3>
          <span className="text-xs text-muted-foreground">
            12-Month Calendar Schedule
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-3 border-border-subtle bg-canvas-surface">
            <div className="text-xs font-bold text-foreground mb-1">
              Q1 (Jan - Mar)
            </div>
            <div className="text-2xs text-muted-foreground">
              18 Events • 4 Projects
            </div>
          </Card>
          <Card className="p-3 border-border-subtle bg-canvas-surface">
            <div className="text-xs font-bold text-foreground mb-1">
              Q2 (Apr - Jun)
            </div>
            <div className="text-2xs text-muted-foreground">
              24 Events • 6 Projects
            </div>
          </Card>
          <Card className="p-3 border-teal-500 bg-teal-500/5">
            <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-1">
              Q3 (Jul - Sep) • Current
            </div>
            <div className="text-2xs text-muted-foreground">
              32 Events • Active Sprint
            </div>
          </Card>
          <Card className="p-3 border-border-subtle bg-canvas-surface">
            <div className="text-xs font-bold text-foreground mb-1">
              Q4 (Oct - Dec)
            </div>
            <div className="text-2xs text-muted-foreground">
              15 Scheduled Deadlines
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Schedule New Event */}
      <ScheduleEventDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        defaultDate={selectedDateForAdd}
        onAddEvent={(newEv) => setEvents((prev) => [...prev, newEv])}
      />

      {/* MODAL 2: Event Details & Delete */}
      <EventDetailsDialog
        event={selectedEvent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onDelete={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
        is24HourMode={is24HourMode}
      />

      {/* MODAL 3: Overflow +N Events Popover */}
      <OverflowPopover
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
        dayNum={overflowDay}
        events={visibleEvents.filter((e) => e.day === overflowDay)}
        onSelectEvent={(ev) => {
          setSelectedEvent(ev);
          setDetailsOpen(true);
        }}
        is24HourMode={is24HourMode}
      />
    </section>
  );
}
