import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Timer,
  Flag,
  CheckCircle2,
  Clock,
  Printer,
  Building,
  Home,
  Globe,
  Edit2,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  INITIAL_TIME_ENTRIES,
  PROJECT_TAXONOMY,
  REPORT_PRESETS,
} from "../api/mock-data";
import {
  AddTimeDialog,
  EditTimeDialog,
} from "../components/time-entry-dialogs";
import type { TimeEntry, TimesheetTab, WorkLocation } from "@/types/timesheet";

export function TimesheetPage() {
  const [entries, setEntries] =
    React.useState<TimeEntry[]>(INITIAL_TIME_ENTRIES);
  const [activeTab, setActiveTab] = React.useState<TimesheetTab>("tracking");
  const [weekOffset, setWeekOffset] = React.useState(0);
  const baseWeekStart = new Date(2026, 8, 14); // Sep 14, 2026 (Mon)

  // Filter state
  const [projectFilter, setProjectFilter] = React.useState("ALL");
  const [locationFilter, setLocationFilter] = React.useState("ALL");

  // Collapsed state for project report table
  const [collapsedProjects, setCollapsedProjects] = React.useState<
    Record<string, boolean>
  >({
    "Internal Project": false,
  });

  // Dialog State
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] =
    React.useState("2026-09-14");
  const [presetProjectForAdd, setPresetProjectForAdd] =
    React.useState("Website Design");
  const [presetTaskForAdd, setPresetTaskForAdd] = React.useState("");

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [activeEditEntry, setActiveEditEntry] =
    React.useState<TimeEntry | null>(null);

  // Helper date generators
  const weekDays = React.useMemo(() => {
    const start = new Date(baseWeekStart);
    start.setDate(start.getDate() + weekOffset * 7);
    const arr: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [weekOffset]);

  const formatDateISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatMins = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes <= 0) return "0h 00m";
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${String(m).padStart(2, "0")}m`;
  };

  const formatCol = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes <= 0) return "-";
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Header week range string
  const weekRangeLabel = React.useMemo(() => {
    const startMonth = weekDays[0].toLocaleString("default", {
      month: "short",
    });
    const endMonth = weekDays[6].toLocaleString("default", { month: "short" });
    const startDay = weekDays[0].getDate();
    const endDay = weekDays[6].getDate();
    const year = weekDays[6].getFullYear();
    return startMonth === endMonth
      ? `${startMonth} ${startDay} – ${endDay}, ${year}`
      : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  }, [weekDays]);

  // Calculations for cards
  const { totalWeeklyMins, projectRollups } = React.useMemo(() => {
    let total = 0;
    const rollups: Record<string, number> = {
      "Website Design": 0,
      "Mobile App": 0,
      "Internal Project": 0,
    };

    weekDays.forEach((d) => {
      const iso = formatDateISO(d);
      let dayList = entries.filter((e) => e.dateStr === iso);
      if (projectFilter !== "ALL")
        dayList = dayList.filter((e) => e.project === projectFilter);
      if (locationFilter !== "ALL")
        dayList = dayList.filter((e) => e.location === locationFilter);

      dayList.forEach((e) => {
        const m = e.hours * 60 + e.mins;
        total += m;
        rollups[e.project] = (rollups[e.project] || 0) + m;
      });
    });

    return { totalWeeklyMins: total, projectRollups: rollups };
  }, [entries, weekDays, projectFilter, locationFilter]);

  const targetMins = 40 * 60;
  const diffMins = totalWeeklyMins - targetMins;

  // Render location pill
  const renderLocationBadge = (loc: WorkLocation) => {
    if (loc === "Tarento Office") {
      return (
        <span className="inline-flex items-center gap-1 text-3xs text-muted-foreground font-medium">
          <span className="text-teal-600 font-bold">·</span>
          <Icon icon={Building} size={12} className="opacity-70" />
          <span>Office</span>
        </span>
      );
    }
    if (loc === "Client Site") {
      return (
        <span className="inline-flex items-center gap-1 text-3xs text-muted-foreground font-medium">
          <span className="text-muted-foreground font-bold">·</span>
          <Icon icon={Globe} size={12} className="opacity-70" />
          <span>Client</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-3xs text-muted-foreground font-medium">
        <span className="text-amber-500 font-bold">·</span>
        <Icon icon={Home} size={12} className="opacity-70" />
        <span>WFH</span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Bar: Shadcn Line Tabs & Right Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Line Tabs */}
        <div className="flex items-center border-b border-border-subtle gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className={cn(
              "relative pb-2.5 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-sm",
              activeTab === "tracking"
                ? "text-foreground font-semibold border-b-2 border-navy-500 dark:border-teal-400"
                : "text-muted-foreground hover:text-foreground border-b-2 border-transparent",
            )}
          >
            <Icon
              icon={Timer}
              size={18}
              className={
                activeTab === "tracking"
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-muted-foreground"
              }
            />
            <span>Time Tracking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={cn(
              "relative pb-2.5 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-sm",
              activeTab === "report"
                ? "text-foreground font-semibold border-b-2 border-navy-500 dark:border-teal-400"
                : "text-muted-foreground hover:text-foreground border-b-2 border-transparent",
            )}
          >
            <Icon
              icon={Clock}
              size={18}
              className={
                activeTab === "report"
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-muted-foreground"
              }
            />
            <span>Project Report</span>
          </button>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
              >
                <Icon
                  icon={Filter}
                  size={15}
                  className="text-muted-foreground"
                />
                <span>Filter</span>
                <Icon icon={ChevronDown} size={13} className="opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-3 bg-canvas-surface border-border-subtle"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle font-semibold text-xs text-foreground">
                <span>Filter Timesheets</span>
                <button
                  type="button"
                  onClick={() => {
                    setProjectFilter("ALL");
                    setLocationFilter("ALL");
                    toast.info("Filters reset.");
                  }}
                  className="text-2xs text-teal-600 hover:underline"
                >
                  Reset
                </button>
              </div>
              <div className="py-2.5 space-y-3 text-xs">
                <div>
                  <label className="text-2xs font-medium text-muted-foreground block mb-1">
                    Project
                  </label>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="w-full text-xs rounded-md border border-input bg-canvas-surface py-1.5 px-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="ALL">All Projects</option>
                    {Object.keys(PROJECT_TAXONOMY).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-2xs font-medium text-muted-foreground block mb-1">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full text-xs rounded-md border border-input bg-canvas-surface py-1.5 px-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="ALL">All Locations</option>
                    <option value="Tarento Office">Tarento Office</option>
                    <option value="WFH">WFH</option>
                    <option value="Client Site">Client Site</option>
                  </select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
              >
                <Icon
                  icon={Download}
                  size={15}
                  className="text-muted-foreground"
                />
                <span>Export</span>
                <Icon icon={ChevronDown} size={13} className="opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 bg-canvas-surface border-border-subtle"
            >
              <DropdownMenuItem
                onClick={() => toast.info("Exporting CSV file...")}
                className="gap-2 text-xs cursor-pointer"
              >
                <Icon
                  icon={FileSpreadsheet}
                  size={14}
                  className="text-teal-600"
                />
                <span>CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Exporting Excel file...")}
                className="gap-2 text-xs cursor-pointer"
              >
                <Icon
                  icon={FileSpreadsheet}
                  size={14}
                  className="text-teal-600"
                />
                <span>Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Generating PDF report...")}
                className="gap-2 text-xs cursor-pointer"
              >
                <Icon icon={FileText} size={14} className="text-teal-600" />
                <span>PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Action Button */}
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setSelectedDateForAdd("2026-09-15");
              setPresetProjectForAdd("Website Design");
              setPresetTaskForAdd("");
              setAddModalOpen(true);
            }}
            className="gap-1.5 font-semibold text-xs shadow-xs"
          >
            <Icon icon={Plus} size={16} />
            <span>Log Time</span>
          </Button>
        </div>
      </div>

      {/* Header Section: Title & Synchronized Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {activeTab === "tracking" ? "Time Reporting" : "Project Report"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeTab === "tracking"
              ? "Weekly timesheet compliance, project billable effort, and work location verification."
              : "Track, review, and allocate weekly project and task breakdown hours."}
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-1.5 bg-canvas-surface p-1 rounded-lg border border-border-subtle shadow-xs self-start sm:self-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Previous week"
          >
            <Icon icon={ChevronLeft} size={16} />
          </Button>

          <div className="flex items-center gap-2 px-2.5">
            <Icon
              icon={CalendarIcon}
              size={16}
              className="text-teal-600 dark:text-teal-400"
            />
            <span className="text-xs font-semibold text-foreground font-mono">
              {weekRangeLabel}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Next week"
          >
            <Icon icon={ChevronRight} size={16} />
          </Button>
        </div>
      </div>

      {/* ==================== VIEW 1: TIME TRACKING ==================== */}
      {activeTab === "tracking" && (
        <div className="space-y-5">
          {/* Summary Metric Strip Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Logged */}
            <Card className="p-4 border-border-subtle bg-canvas-surface flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Icon icon={Timer} size={20} />
              </div>
              <div>
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Total Logged
                </span>
                <span className="text-xl font-bold text-foreground font-mono">
                  {formatMins(totalWeeklyMins)}
                </span>
              </div>
            </Card>

            {/* Weekly Target */}
            <Card className="p-4 border-border-subtle bg-canvas-surface flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <Icon icon={Flag} size={20} />
              </div>
              <div>
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Weekly Target
                </span>
                <span className="text-xl font-bold text-foreground font-mono">
                  40h 00m
                </span>
              </div>
            </Card>

            {/* Difference / Status */}
            <Card className="p-4 border-border-subtle bg-canvas-surface flex items-center gap-3.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-md flex items-center justify-center border",
                  diffMins >= 0
                    ? "bg-teal-500/10 text-teal-600 border-teal-500/20"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                )}
              >
                <Icon icon={diffMins >= 0 ? CheckCircle2 : Clock} size={20} />
              </div>
              <div>
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Difference / Status
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      "text-base font-bold font-mono",
                      diffMins >= 0
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {diffMins >= 0
                      ? `+${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
                      : `-${Math.floor(Math.abs(diffMins) / 60)}h ${Math.abs(diffMins) % 60}m`}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-3xs font-semibold border",
                      diffMins >= 0
                        ? "bg-teal-500/10 text-teal-600 border-teal-500/30"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30",
                    )}
                  >
                    {diffMins >= 0 ? "In Compliance" : "Under Target"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Project Allocation Breakdown */}
            <Card className="p-3.5 border-border-subtle bg-canvas-surface flex flex-col justify-center">
              <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Project Allocation
              </span>
              <div className="flex flex-col gap-1 text-xs">
                {Object.keys(PROJECT_TAXONOMY).map((proj) => (
                  <div
                    key={proj}
                    className="flex items-center justify-between text-2xs"
                  >
                    <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          PROJECT_TAXONOMY[proj]?.dotClass,
                        )}
                      />
                      <span className="truncate max-w-[110px]">{proj}</span>
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatMins(projectRollups[proj] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 7-Day Weekly Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 items-start">
            {weekDays.map((d) => {
              const iso = formatDateISO(d);
              const dayShort = d.toLocaleString("default", {
                weekday: "short",
              });
              const dayNum = d.getDate();

              let dayEntries = entries.filter((e) => e.dateStr === iso);
              if (projectFilter !== "ALL")
                dayEntries = dayEntries.filter(
                  (e) => e.project === projectFilter,
                );
              if (locationFilter !== "ALL")
                dayEntries = dayEntries.filter(
                  (e) => e.location === locationFilter,
                );

              const dayMinutes = dayEntries.reduce(
                (acc, curr) => acc + curr.hours * 60 + curr.mins,
                0,
              );

              return (
                <Card
                  key={iso}
                  className="p-3 flex flex-col min-h-[480px] border-border-subtle bg-canvas-surface shadow-xs"
                >
                  {/* Column Header */}
                  <div className="pb-2.5 border-b border-border-subtle mb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {dayShort} {dayNum}
                      </span>
                      <span
                        className={cn(
                          "text-2xs font-mono font-bold",
                          dayMinutes >= 480
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatMins(dayMinutes)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDateForAdd(iso);
                        setPresetProjectForAdd("Website Design");
                        setPresetTaskForAdd("");
                        setAddModalOpen(true);
                      }}
                      className="w-full mt-2 py-1 h-7 text-2xs font-medium border-border-subtle gap-1"
                    >
                      <Icon
                        icon={Plus}
                        size={14}
                        className="text-teal-600 dark:text-teal-400"
                      />
                      <span>Add Time</span>
                    </Button>
                  </div>

                  {/* Day Entries List */}
                  <div className="space-y-2 flex-1">
                    {dayEntries.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-border-subtle rounded-lg text-center my-3 bg-canvas-bg/30">
                        <Icon
                          icon={Clock}
                          size={16}
                          className="text-muted-foreground/40 mb-1"
                        />
                        <span className="text-2xs text-muted-foreground">
                          No time entries
                        </span>
                      </div>
                    ) : (
                      dayEntries.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveEditEntry(item);
                            setEditModalOpen(true);
                          }}
                          className="bg-canvas-surface border border-border-subtle hover:border-teal-500 rounded-lg p-2.5 shadow-xs cursor-pointer transition flex flex-col justify-between gap-2 group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-tight truncate max-w-[90px]">
                                {item.project}
                              </span>
                              {renderLocationBadge(item.location)}
                            </div>
                            <h5 className="text-xs font-semibold text-foreground mt-1 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                              {item.task}
                            </h5>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                            <span className="text-2xs font-mono font-bold text-teal-600 dark:text-teal-400">
                              {item.hours}h {String(item.mins).padStart(2, "0")}
                              m
                            </span>
                            <Icon
                              icon={Edit2}
                              size={13}
                              className="text-muted-foreground/40 group-hover:text-teal-600 transition"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== VIEW 2: PROJECT REPORT ==================== */}
      {activeTab === "report" && (
        <div className="space-y-4">
          {/* Summary Bar */}
          <Card className="px-5 py-3 border-border-subtle bg-canvas-surface flex items-center gap-5 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span className="text-muted-foreground font-medium">
                Total Hours:
              </span>
              <span className="font-bold text-foreground text-sm font-mono">
                {formatMins(totalWeeklyMins)}
              </span>
            </div>
            <div className="h-4 w-px bg-border-subtle" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-navy-500" />
              <span className="text-muted-foreground font-medium">
                Active Projects:
              </span>
              <span className="font-bold text-foreground text-sm">3</span>
            </div>
          </Card>

          {/* Data Table */}
          <div className="rounded-lg border border-border-subtle bg-canvas-surface shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-canvas-bg/60 border-b border-border-subtle text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-5 min-w-[260px]">Project / Task</th>
                    {weekDays.slice(0, 5).map((d) => (
                      <th
                        key={d.toISOString()}
                        className="py-3 px-3 text-center w-24"
                      >
                        {d.toLocaleString("default", { weekday: "short" })}{" "}
                        <span className="text-muted-foreground block font-normal text-3xs">
                          {d.toLocaleString("default", { month: "short" })}{" "}
                          {d.getDate()}
                        </span>
                      </th>
                    ))}
                    <th className="py-3 px-5 text-right w-28 font-bold text-foreground">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-subtle/70">
                  {Object.keys(PROJECT_TAXONOMY).map((projKey) => {
                    if (projectFilter !== "ALL" && projectFilter !== projKey)
                      return null;
                    const isCollapsed = !!collapsedProjects[projKey];
                    const pMeta = PROJECT_TAXONOMY[projKey];

                    // Project totals across Mon-Fri
                    const projDailyMins = [0, 0, 0, 0, 0];
                    let projTotalM = 0;

                    weekDays.slice(0, 5).forEach((dayObj, dayIdx) => {
                      const iso = formatDateISO(dayObj);
                      const userEntries = entries.filter(
                        (e) => e.project === projKey && e.dateStr === iso,
                      );
                      const userM = userEntries.reduce(
                        (acc, c) => acc + c.hours * 60 + c.mins,
                        0,
                      );

                      let presetM = 0;
                      if (REPORT_PRESETS[projKey]) {
                        Object.keys(REPORT_PRESETS[projKey]).forEach((t) => {
                          presetM += Math.round(
                            (REPORT_PRESETS[projKey][t][dayIdx] || 0) * 60,
                          );
                        });
                      }

                      const finalM = Math.max(userM, presetM);
                      projDailyMins[dayIdx] = finalM;
                      projTotalM += finalM;
                    });

                    return (
                      <React.Fragment key={projKey}>
                        {/* Parent Project Accordion Row */}
                        <tr
                          onClick={() =>
                            setCollapsedProjects((prev) => ({
                              ...prev,
                              [projKey]: !prev[projKey],
                            }))
                          }
                          className="bg-canvas-bg/30 hover:bg-teal-500/5 transition-colors cursor-pointer select-none border-b border-border-subtle"
                        >
                          <td className="py-3 px-5 flex items-center gap-2.5">
                            <span className="text-muted-foreground transition-transform">
                              <Icon
                                icon={ChevronDown}
                                size={16}
                                className={cn(
                                  "transition-transform",
                                  isCollapsed && "-rotate-90",
                                )}
                              />
                            </span>
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                pMeta.dotClass,
                              )}
                            />
                            <span className="font-bold text-foreground text-xs">
                              {projKey}
                            </span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-3xs font-medium ml-1",
                                pMeta.badgeClass,
                              )}
                            >
                              {pMeta.tasks.length} tasks
                            </span>
                          </td>

                          {projDailyMins.map((m, idx) => (
                            <td
                              key={idx}
                              className={cn(
                                "py-3 px-3 text-center font-mono font-semibold",
                                m > 0
                                  ? "text-foreground bg-canvas-bg/40"
                                  : "text-muted-foreground/50",
                              )}
                            >
                              {formatCol(m)}
                            </td>
                          ))}

                          <td className="py-3 px-5 text-right font-mono font-extrabold text-foreground text-xs">
                            {formatMins(projTotalM)}
                          </td>
                        </tr>

                        {/* Nested Task Child Rows */}
                        {!isCollapsed &&
                          pMeta.tasks.map((taskName) => {
                            let taskTotalM = 0;
                            return (
                              <tr
                                key={taskName}
                                className="bg-canvas-surface hover:bg-canvas-bg/50 transition-colors text-foreground"
                              >
                                <td className="py-2.5 px-5 pl-12 flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground/50 font-mono">
                                    ↳
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {taskName}
                                  </span>
                                </td>

                                {weekDays.slice(0, 5).map((dayObj, dayIdx) => {
                                  const iso = formatDateISO(dayObj);
                                  const userMatches = entries.filter(
                                    (e) =>
                                      e.project === projKey &&
                                      e.task === taskName &&
                                      e.dateStr === iso,
                                  );
                                  const userM = userMatches.reduce(
                                    (acc, c) => acc + c.hours * 60 + c.mins,
                                    0,
                                  );
                                  const presetM = Math.round(
                                    (REPORT_PRESETS[projKey]?.[taskName]?.[
                                      dayIdx
                                    ] || 0) * 60,
                                  );
                                  const cellM = userM > 0 ? userM : presetM;
                                  taskTotalM += cellM;

                                  return (
                                    <td
                                      key={iso}
                                      onClick={() => {
                                        const match = userMatches[0];
                                        if (match) {
                                          setActiveEditEntry(match);
                                          setEditModalOpen(true);
                                        } else {
                                          setSelectedDateForAdd(iso);
                                          setPresetProjectForAdd(projKey);
                                          setPresetTaskForAdd(taskName);
                                          setAddModalOpen(true);
                                        }
                                      }}
                                      className="py-2.5 px-3 text-center font-mono cursor-pointer hover:bg-teal-500/10 text-muted-foreground transition group"
                                      title="Click to edit or add time"
                                    >
                                      {cellM > 0 ? (
                                        <span className="font-semibold text-teal-600 dark:text-teal-400 group-hover:underline">
                                          {formatCol(cellM)}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground/30 group-hover:text-teal-600 group-hover:font-bold">
                                          +
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}

                                <td className="py-2.5 px-5 text-right font-mono font-bold text-foreground text-xs">
                                  {formatMins(taskTotalM)}
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-canvas-bg/80 border-t-2 border-border-subtle font-bold text-xs text-foreground">
                    <td className="py-3.5 px-5 uppercase tracking-wider text-2xs text-muted-foreground">
                      Total
                    </td>
                    {[0, 1, 2, 3, 4].map((dayIdx) => {
                      let colMins = 0;
                      Object.keys(PROJECT_TAXONOMY).forEach((p) => {
                        const iso = formatDateISO(weekDays[dayIdx]);
                        const userM = entries
                          .filter((e) => e.project === p && e.dateStr === iso)
                          .reduce((acc, c) => acc + c.hours * 60 + c.mins, 0);
                        let presetM = 0;
                        if (REPORT_PRESETS[p]) {
                          Object.keys(REPORT_PRESETS[p]).forEach((t) => {
                            presetM += Math.round(
                              (REPORT_PRESETS[p][t][dayIdx] || 0) * 60,
                            );
                          });
                        }
                        colMins += Math.max(userM, presetM);
                      });

                      return (
                        <td
                          key={dayIdx}
                          className="py-3.5 px-3 text-center font-mono text-foreground"
                        >
                          {formatMins(colMins)}
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-5 text-right font-mono text-sm text-teal-600 dark:text-teal-400 font-extrabold">
                      {formatMins(totalWeeklyMins)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Print Sheet Utility Bar */}
            <div className="px-5 py-3 bg-canvas-bg/30 border-t border-border-subtle flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing 3 project breakdowns with nested tasks. Click project
                row to toggle.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs h-7"
              >
                <Icon icon={Printer} size={14} />
                <span>Print Sheet</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD TIME */}
      <AddTimeDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        defaultDateStr={selectedDateForAdd}
        defaultProject={presetProjectForAdd}
        defaultTask={presetTaskForAdd}
        onSave={(newEntry) => setEntries((prev) => [newEntry, ...prev])}
      />

      {/* MODAL 2: EDIT & DELETE TIME */}
      <EditTimeDialog
        entry={activeEditEntry}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdate={(updated) =>
          setEntries((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e)),
          )
        }
        onDelete={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
      />
    </div>
  );
}
