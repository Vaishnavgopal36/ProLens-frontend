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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentYear, setCurrentYear] = React.useState(2026);
  const [currentMonth, setCurrentMonth] = React.useState(8); // 8 = September
  const [viewType, setViewType] = React.useState<CalendarViewMode>("month");
  const [timeScope, setTimeScope] = React.useState<TimeScope>("month");
  const [is24HourMode, setIs24HourMode] = React.useState(true);
  const [activeCategories, setActiveCategories] = React.useState<Set<EventCategory>>(
    new Set(["Marketing", "Meeting", "Client", "Workshop", "Launch"])
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals & Selection state
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = React.useState("2026-09-12");
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  const [overflowDay, setOverflowDay] = React.useState(12);

  // Week View pagination offset
  const [weekStartDay, setWeekStartDay] = React.useState(8);

  // Drag and Drop tracking
  const [draggedEventId, setDraggedEventId] = React.useState<string | null>(null);
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
    if (start === "00:00" && end === "23:59") return is24HourMode ? "00:00 - 23:59" : "All Day";
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
      prev.map((ev) => (ev.id === draggedEventId ? { ...ev, day: targetDay } : ev))
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
          e.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [events, currentMonth, currentYear, activeCategories, searchQuery]);

  return (
    <section className="max-w-[1340px] mx-auto bg-white border border-[#D8DEE5] rounded-lg shadow-sm p-5 md:p-6 mb-8 text-[#17283C]">
      {/* Top Title & Global Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-3">
        <h2 className="text-xl font-bold tracking-tight text-[#17283C]">
          Event Calendar
        </h2>
        <div className="relative w-full sm:w-80">
          <Icon
            icon={Search}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search events, clients, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-xs bg-[#F8FAFC] border-[#D8DEE5]"
          />
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 pt-1 border-b border-slate-100">
        {/* Left: Date navigation */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#D8DEE5] bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
          >
            &lt;
          </button>

          <div className="flex items-center pl-2.5 pr-2 py-1 border border-[#D8DEE5] rounded bg-white text-xs font-semibold text-slate-800 space-x-1.5">
            <Icon icon={CalendarIcon} size={14} className="text-slate-500" />
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="border-0 bg-transparent py-0 pl-1 pr-5 text-xs font-semibold text-slate-800 focus:ring-0 cursor-pointer outline-none"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="py-1 px-3 border border-[#D8DEE5] rounded bg-white text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#D8DEE5] bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
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
            className="px-3 py-1.5 border border-[#D8DEE5] rounded bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center space-x-1 transition"
          >
            <Icon icon={Clock} size={14} className="text-slate-500" />
            <span>{is24HourMode ? "24h" : "12h"}</span>
          </button>

          {/* Filter Popover Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="px-3 py-1.5 border border-[#D8DEE5] rounded bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center space-x-1.5 transition"
              >
                <Icon icon={Filter} size={14} className="text-slate-500" />
                <span>Filter</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-3 bg-white border border-[#D8DEE5] shadow-xl">
              <p className="text-xs font-bold text-slate-700 mb-2">Filter Categories</p>
              <div className="space-y-2 text-xs">
                {[
                  { key: "Marketing" as EventCategory, label: "Ads & Marketing", color: "bg-yellow-400" },
                  { key: "Meeting" as EventCategory, label: "Internal Meetings", color: "bg-blue-400" },
                  { key: "Client" as EventCategory, label: "Clients & External", color: "bg-emerald-400" },
                  { key: "Workshop" as EventCategory, label: "Workshops & Training", color: "bg-purple-400" },
                  { key: "Launch" as EventCategory, label: "Sprints & Launches", color: "bg-rose-400" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeCategories.has(item.key)}
                      onChange={() => toggleCategory(item.key)}
                      className="rounded text-[#1E8F8E] focus:ring-[#1E8F8E] h-3.5 w-3.5"
                    />
                    <span className={cn("inline-block w-2.5 h-2.5 rounded-full", item.color)} />
                    <span className="text-slate-700">{item.label}</span>
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
                className="px-3 py-1.5 border border-[#D8DEE5] rounded bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center space-x-1.5 transition capitalize"
              >
                <Icon icon={CalendarIcon} size={14} className="text-slate-500" />
                <span>{timeScope === "today" ? "Today" : timeScope === "week" ? "This Week" : timeScope === "month" ? "This Month" : "This Year"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white border border-[#D8DEE5] shadow-xl py-1">
              <DropdownMenuItem onClick={() => { setTimeScope("today"); setViewType("day"); }}>
                <span>Today</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTimeScope("week"); setViewType("week"); }}>
                <span>This Week</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTimeScope("month"); setViewType("month"); }}>
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
              className={cn(
                "p-1.5 border border-[#D8DEE5] rounded hover:bg-slate-50 text-slate-600 transition",
                viewType === "agenda" && "bg-slate-100 font-semibold"
              )}
            >
              <Icon icon={List} size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewType("week")}
              title="Week Column View"
              className={cn(
                "p-1.5 border border-[#D8DEE5] rounded hover:bg-slate-50 text-slate-600 transition",
                viewType === "week" && "bg-slate-100 font-semibold"
              )}
            >
              <Icon icon={Columns} size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewType("month")}
              title="Month Grid View"
              className={cn(
                "px-2.5 py-1.5 border border-[#D8DEE5] rounded text-xs flex items-center space-x-1 transition",
                viewType === "month" ? "bg-slate-100 font-semibold text-slate-900" : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon icon={Grid} size={14} />
              <span>Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewType("day")}
              title="Day Schedule View"
              className={cn(
                "p-1.5 border border-[#D8DEE5] rounded hover:bg-slate-50 text-slate-600 transition",
                viewType === "day" && "bg-slate-100 font-semibold"
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
            className="ml-1 px-3.5 py-1.5 rounded bg-[#0D1218] hover:bg-[#17283C] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm border border-amber-500/40 hover:border-amber-400 transition"
          >
            <span className="text-amber-400 font-bold">+</span>
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTH VIEW (Canonical Default) */}
      {viewType === "month" && (
        <div className="mt-4">
          <div className="grid grid-cols-7 border-b border-[#E2E8F0] pb-2 text-center text-xs font-semibold text-slate-700">
            {WEEKDAY_HEADERS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-[#E2E8F0] bg-white rounded-b-md">
            {gridCells.map((cell, idx) => {
              if (!cell.isCurrent || cell.day === null) {
                return (
                  <div
                    key={idx}
                    className="calendar-grid-cell p-2 bg-slate-50/40 opacity-40 min-h-[118px] border-r border-b border-[#E2E8F0]"
                  />
                );
              }

              const dayEvents = visibleEvents.filter((e) => e.day === cell.day);
              const primaryEvent = dayEvents[0];
              const isToday = cell.day === 12 && currentMonth === 8 && currentYear === 2026;
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
                    "calendar-grid-cell p-2 flex flex-col justify-between bg-white relative hover:bg-slate-50/50 cursor-pointer min-h-[118px] border-r border-b border-[#E2E8F0] transition-colors",
                    isOver && "bg-emerald-50! border-dashed border-2 border-[#1E8F8E]!"
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
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1218] text-white font-bold text-xs shadow-sm">
                        12
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-800 ml-0.5">
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
                      className="text-slate-400 hover:text-[#1E8F8E] hover:bg-slate-100 p-1 rounded transition-colors text-sm font-semibold leading-none flex items-center justify-center w-5 h-5"
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
                          primaryEvent.colorBorder
                        )}
                      >
                        <div className={cn("text-xs font-bold leading-tight truncate", primaryEvent.colorText)}>
                          {primaryEvent.title}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate mt-0.5">
                          {primaryEvent.category === "Marketing"
                            ? primaryEvent.desc || "AdSense + FB, Target ..."
                            : formatWindow(primaryEvent.startTime, primaryEvent.endTime)}
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
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-medium hover:underline"
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
              <h3 className="text-sm font-bold text-slate-800">Week Timeline (Tuesday - Monday)</h3>
              <span className="text-xs text-slate-400 font-normal">
                Sep {weekStartDay} – Sep {Math.min(weekStartDay + 6, 30)}, {currentYear}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setWeekStartDay((prev) => Math.max(1, prev - 7))}
                className="w-7 h-7 flex items-center justify-center rounded border border-[#D8DEE5] bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-sm"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => setWeekStartDay(8)}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-[#D8DEE5] bg-white hover:bg-slate-100 text-slate-800 shadow-sm"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setWeekStartDay((prev) => Math.min(24, prev + 7))}
                className="w-7 h-7 flex items-center justify-center rounded border border-[#D8DEE5] bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-sm"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-semibold py-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const dayNum = weekStartDay + i;
                const isToday = dayNum === 12;
                return (
                  <div key={i} className={isToday ? "text-[#1E8F8E] font-bold" : "text-slate-700"}>
                    Day {dayNum} {isToday && "(Today)"}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 divide-x divide-slate-100 bg-white min-h-[400px]">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const dayNum = weekStartDay + i;
                const dayEvts = visibleEvents.filter((e) => e.day === dayNum);
                return (
                  <div key={i} className="p-2 space-y-2">
                    {dayEvts.length === 0 ? (
                      <div className="text-[11px] text-slate-400 text-center pt-8">No events</div>
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
                            ev.colorBorder
                          )}
                        >
                          <span className={cn("font-bold block", ev.colorText)}>{ev.title}</span>
                          <span className="text-[10px] text-slate-600 block mt-0.5">
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
            <h3 className="text-sm font-bold text-slate-800">
              Daily Schedule - September 12, {currentYear}
            </h3>
            <span className="text-xs text-[#1E8F8E] font-medium bg-[#1E8F8E]/10 px-2 py-0.5 rounded">
              Selected Date View
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((hour) => {
              const matched = visibleEvents.filter(
                (e) => e.day === 12 && e.startTime.startsWith(hour.split(":")[0])
              );
              return (
                <div key={hour} className="flex items-start p-3 hover:bg-slate-50 transition">
                  <span className="w-20 text-xs font-semibold text-slate-400 shrink-0">
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
                            ev.colorBorder
                          )}
                        >
                          <div>
                            <span className={cn("font-bold", ev.colorText)}>{ev.title}</span>
                            <p className="text-[11px] text-slate-600">{ev.desc}</p>
                          </div>
                          <span className={cn("text-[10px] font-semibold", ev.colorText)}>
                            {formatWindow(ev.startTime, ev.endTime)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-300 italic">Available slot</span>
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
            <h3 className="text-sm font-bold text-slate-800">Month Agenda &amp; Key Deadlines</h3>
            <span className="text-xs text-slate-500">Chronological Event Stream</span>
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
                  className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between hover:border-[#1E8F8E] cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded bg-slate-100 flex flex-col items-center justify-center text-slate-800 font-bold shrink-0">
                      <span className="text-[10px] uppercase font-semibold text-slate-500">Sep</span>
                      <span className="text-sm">{ev.day}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                      <p className="text-[11px] text-slate-500">{ev.desc || "General scheduled item"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("inline-block text-[11px] font-semibold px-2 py-0.5 rounded", ev.colorBg, ev.colorText)}>
                      {formatWindow(ev.startTime, ev.endTime)}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">{ev.category}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Annual Overview 2026 Grid Cards */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-sm font-bold text-slate-800">Annual Overview - 2026</h3>
          <span className="text-xs text-slate-500">12-Month Calendar Schedule</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-3 border-slate-200 bg-white">
            <div className="text-xs font-bold text-slate-800 mb-1">Q1 (Jan - Mar)</div>
            <div className="text-[11px] text-slate-500">18 Events • 4 Projects</div>
          </Card>
          <Card className="p-3 border-slate-200 bg-white">
            <div className="text-xs font-bold text-slate-800 mb-1">Q2 (Apr - Jun)</div>
            <div className="text-[11px] text-slate-500">24 Events • 6 Projects</div>
          </Card>
          <Card className="p-3 border-[#1E8F8E] bg-[#1E8F8E]/5">
            <div className="text-xs font-bold text-[#1E8F8E] mb-1">Q3 (Jul - Sep) • Current</div>
            <div className="text-[11px] text-slate-600">32 Events • Active Sprint</div>
          </Card>
          <Card className="p-3 border-slate-200 bg-white">
            <div className="text-xs font-bold text-slate-800 mb-1">Q4 (Oct - Dec)</div>
            <div className="text-[11px] text-slate-500">15 Scheduled Deadlines</div>
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