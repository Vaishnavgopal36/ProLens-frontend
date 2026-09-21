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
import { toLocalISODate } from "@/lib/date";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { INITIAL_TIME_ENTRIES, WORK_TAXONOMY } from "../api/mock-data";
import {
  AddTimeDialog,
  EditTimeDialog,
} from "../components/time-entry-dialogs";
import type { TimeEntry, WorkLocation } from "@/types/timesheet";

export function TimesheetPage() {
  const [entries, setEntries] =
    React.useState<TimeEntry[]>(INITIAL_TIME_ENTRIES);
  const [weekOffset, setWeekOffset] = React.useState(0);
  const baseWeekStart = new Date(2026, 8, 14); // Sep 14, 2026 (Mon)

  // Filter state
  const [projectFilter, setProjectFilter] = React.useState("ALL");
  const [locationFilter, setLocationFilter] = React.useState("ALL");

  // Dialog State
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] =
    React.useState("2026-09-14");
  const [presetProjectForAdd, setPresetProjectForAdd] = React.useState("");
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

  const formatDateISO = toLocalISODate;

  // Ctrl/⌘ + K toggles the add-time modal, defaulting to today.
  useModalHotkey({
    open: addModalOpen,
    onOpen: () => {
      setSelectedDateForAdd(formatDateISO(new Date()));
      setPresetProjectForAdd("");
      setPresetTaskForAdd("");
      setAddModalOpen(true);
    },
    onClose: () => setAddModalOpen(false),
    disabled: editModalOpen,
  });

  const formatMins = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes <= 0) return "0h 00m";
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${String(m).padStart(2, "0")}m`;
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

  // Calculations for summary cards
  const { totalWeeklyMins, projectRollups } = React.useMemo(() => {
    let total = 0;
    const rollups: Record<string, number> = {};

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
      {/* Top Controls: Title, Filter, Export & Week Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            Time Reporting
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log, track, and monitor daily effort allocations across active
            projects and client initiatives.
          </p>
        </div>

        {/* Action Buttons & Date Navigator */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
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
                    <option value="ALL">All projects &amp; activities</option>
                    {(["project", "activity"] as const).map((kind) => (
                      <optgroup
                        key={kind}
                        label={kind === "project" ? "Projects" : "Activities"}
                      >
                        {Object.keys(WORK_TAXONOMY)
                          .filter((p) => WORK_TAXONOMY[p].kind === kind)
                          .map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                      </optgroup>
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

          {/* Date Navigator */}
          <div className="flex items-center gap-1 bg-canvas-surface p-1 rounded-lg border border-border-subtle shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Previous week"
            >
              <Icon icon={ChevronLeft} size={15} />
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              <Icon
                icon={CalendarIcon}
                size={14}
                className="text-teal-600 dark:text-teal-400"
              />
              <span className="text-xs font-semibold text-foreground tabular-nums">
                {weekRangeLabel}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Next week"
            >
              <Icon icon={ChevronRight} size={15} />
            </Button>
          </div>
        </div>
      </div>

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
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
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
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
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
              Variance
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "text-base font-bold tabular-nums",
                  diffMins >= 0
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              >
                {diffMins >= 0
                  ? `+${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
                  : `-${Math.floor(Math.abs(diffMins) / 60)}h ${Math.abs(diffMins) % 60}m`}
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
            {Object.keys(WORK_TAXONOMY)
              .filter((proj) => (projectRollups[proj] || 0) > 0)
              .map((proj) => (
                <div
                  key={proj}
                  className="flex items-center justify-between text-2xs"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        WORK_TAXONOMY[proj]?.dotClass,
                      )}
                    />
                    <span className="truncate max-w-[110px]">{proj}</span>
                  </span>
                  <span className="tabular-nums font-semibold text-foreground">
                    {formatMins(projectRollups[proj] || 0)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* 7-Day Weekly Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 rounded-lg border border-border-subtle bg-canvas-surface shadow-xs overflow-hidden">
        {weekDays.map((d) => {
          const iso = formatDateISO(d);
          const dayShort = d.toLocaleString("default", {
            weekday: "short",
          });
          const dayNum = d.getDate();
          const dayMonth = d.toLocaleString("default", { month: "short" });

          let dayEntries = entries.filter((e) => e.dateStr === iso);
          if (projectFilter !== "ALL")
            dayEntries = dayEntries.filter((e) => e.project === projectFilter);
          if (locationFilter !== "ALL")
            dayEntries = dayEntries.filter(
              (e) => e.location === locationFilter,
            );

          const dayMinutes = dayEntries.reduce(
            (acc, curr) => acc + curr.hours * 60 + curr.mins,
            0,
          );

          return (
            <div
              key={iso}
              className="p-3 flex flex-col min-h-[480px] border-b border-border-subtle last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              {/* Column Header */}
              <div className="pb-2.5 border-b border-border-subtle mb-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-foreground block">
                      {dayShort}
                    </span>
                    <span className="text-2xs text-muted-foreground tabular-nums">
                      {dayNum} {dayMonth}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs tabular-nums font-bold",
                      dayMinutes > 0
                        ? "text-foreground"
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
                    setPresetProjectForAdd("");
                    setPresetTaskForAdd("");
                    setAddModalOpen(true);
                  }}
                  className="mt-2 h-8 w-full gap-1.5 text-xs font-semibold"
                >
                  <Icon icon={Plus} size={16} />
                  <span>Add Time</span>
                </Button>
              </div>

              {/* Day Entries List */}
              <div className="space-y-2 flex-1">
                {dayEntries.length === 0 ? (
                  <p className="text-2xs text-muted-foreground/60 text-center py-6">
                    No time entries
                  </p>
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
                        {item.activity && (
                          <p className="mt-0.5 truncate text-2xs text-muted-foreground">
                            {item.activity}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                        <span className="text-2xs tabular-nums font-bold text-teal-600 dark:text-teal-400">
                          {item.hours}h {String(item.mins).padStart(2, "0")}m
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
            </div>
          );
        })}
      </div>

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
