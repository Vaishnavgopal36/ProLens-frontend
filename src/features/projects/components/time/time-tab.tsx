import { useMemo, useState } from "react";
import { ChevronRight, Clock3, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FilterBar } from "@/components/composed/filters";
import { useFilters } from "@/components/composed/filters";
import type { FilterFieldDef } from "@/components/composed/filters";
import { useProjectViewer } from "../../hooks/use-project-filter-fields";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import {
  MOCK_TIME_FEATURES,
  type FeatureTimeStatus,
  type TimeFeatureGroup,
  type TimeTaskEntry,
} from "./mock-data";
import { LogTimeSheet } from "./log-time-sheet";
import { useModalHotkey } from "@/hooks/use-hotkey";

const STATUS_META: Record<
  FeatureTimeStatus,
  { badgeClassName: string; valueClassName: string; barClassName: string }
> = {
  ACTIVE: {
    badgeClassName:
      "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border-transparent",
    valueClassName: "text-teal-600 dark:text-teal-400",
    barClassName: "bg-teal-500",
  },
  COMPLETED: {
    badgeClassName:
      "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-transparent",
    valueClassName: "text-teal-600 dark:text-teal-400",
    barClassName: "bg-teal-600",
  },
};

function sum(nums: number[]) {
  return nums.reduce((total, n) => total + n, 0);
}

function percentOf(logged: number, estimated: number) {
  if (estimated <= 0) return 0;
  return Math.min(100, Math.round((logged / estimated) * 100));
}

type TimeRow = TimeTaskEntry & {
  featureId: string;
  featureStatus: FeatureTimeStatus;
};

interface TimeTabProps {
  project: Project;
}

export function TimeTab({ project }: TimeTabProps) {
  const [timeFeatures, setTimeFeatures] = useState(MOCK_TIME_FEATURES);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  // Ctrl/⌘ + K toggles the log-time sheet (defaults to today's date).
  useModalHotkey({
    open: isLogTimeOpen,
    onOpen: () => setIsLogTimeOpen(true),
    onClose: () => setIsLogTimeOpen(false),
  });

  // Flatten to one row per task so the shared filters can work on it, then
  // regroup by feature for display.
  const rows = useMemo(
    () =>
      timeFeatures.flatMap((feature) =>
        feature.tasks.map((task) => ({
          ...task,
          featureId: feature.id,
          featureStatus: feature.status,
        })),
      ),
    [timeFeatures],
  );
  const viewer = useProjectViewer<TimeRow>(project, (r) => r.assigneeName);
  const scopedRows = useMemo(() => viewer.scope(rows), [rows, viewer]);
  const fields: FilterFieldDef<TimeRow>[] = [
    ...viewer.peopleField,
    {
      key: "feature",
      label: "Feature",
      options: timeFeatures.map((f) => ({ value: f.id, label: f.name })),
      accessor: (r) => r.featureId,
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "COMPLETED", label: "Completed" },
      ],
      accessor: (r) => r.featureStatus,
    },
  ];
  const filters = useFilters(scopedRows, fields, (r) =>
    [r.title, r.code].join(" "),
  );

  const filteredFeatures: TimeFeatureGroup[] = useMemo(() => {
    const keep = new Set(filters.filtered.map((r) => r.id));
    return timeFeatures
      .map((feature) => ({
        ...feature,
        tasks: feature.tasks.filter((task) => keep.has(task.id)),
      }))
      .filter((feature) => feature.tasks.length > 0);
  }, [timeFeatures, filters.filtered]);

  const totals = useMemo(() => {
    const allTasks = filteredFeatures.flatMap((f) => f.tasks);
    return {
      logged: sum(allTasks.map((t) => t.hoursLogged)),
      estimated: sum(allTasks.map((t) => t.hoursEstimated)),
    };
  }, [filteredFeatures]);

  const toggleFeature = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLogTime = (taskId: string, hours: number) => {
    setTimeFeatures((prev) =>
      prev.map((feature) => ({
        ...feature,
        tasks: feature.tasks.map((task) =>
          task.id === taskId
            ? { ...task, hoursLogged: task.hoursLogged + hours }
            : task,
        ),
      })),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterBar filters={filters} searchPlaceholder="Search tasks...">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon icon={Clock3} size={13} />
          <span className="font-semibold text-foreground">
            {totals.logged.toFixed(1)}h
          </span>
          <span>
            logged of {totals.estimated.toFixed(1)}h estimated in {project.name}
          </span>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setIsLogTimeOpen(true)}
          title="Log time (Ctrl+K)"
          className="h-8 gap-1.5 text-xs font-semibold"
        >
          <Icon icon={Plus} size={14} />
          <span>Log Time</span>
        </Button>
      </FilterBar>

      <LogTimeSheet
        open={isLogTimeOpen}
        onOpenChange={setIsLogTimeOpen}
        features={timeFeatures}
        onLogTime={handleLogTime}
      />

      {/* Breakdown Table */}
      <Card className="border-border-subtle bg-canvas-surface p-0 shadow-xs overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_160px] items-center gap-3 border-b border-border-subtle bg-canvas-bg/60 px-4 py-2 text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Feature / Task</span>
          <span className="text-right">Assignee</span>
          <span className="text-right">Logged / Estimated</span>
        </div>

        {filteredFeatures.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            No time entries match your filters.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {filteredFeatures.map((feature) => {
              const meta = STATUS_META[feature.status];
              const featureLogged = sum(
                feature.tasks.map((t) => t.hoursLogged),
              );
              const featureEstimated = sum(
                feature.tasks.map((t) => t.hoursEstimated),
              );
              const featurePercent = percentOf(featureLogged, featureEstimated);
              const isCollapsed = collapsed.has(feature.id);

              return (
                <div key={feature.id}>
                  {/* Feature row */}
                  <button
                    type="button"
                    onClick={() => toggleFeature(feature.id)}
                    className="grid w-full grid-cols-[1fr_140px_160px] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas-overlay/40"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon
                        icon={ChevronRight}
                        size={14}
                        className={cn(
                          "shrink-0 text-muted-foreground transition-transform",
                          !isCollapsed && "rotate-90",
                        )}
                      />
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 rounded text-3xs font-bold shrink-0",
                          meta.badgeClassName,
                        )}
                      >
                        {feature.status}
                      </Badge>
                      <span className="truncate text-sm font-semibold text-foreground">
                        {feature.name}
                      </span>
                    </div>

                    <span className="text-right text-2xs text-muted-foreground">
                      {feature.tasks.length} task
                      {feature.tasks.length === 1 ? "" : "s"}
                    </span>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold">
                        <span className={meta.valueClassName}>
                          {featureLogged.toFixed(1)}h
                        </span>
                        <span className="ml-1 font-normal text-muted-foreground">
                          / {featureEstimated.toFixed(1)}h ({featurePercent}%)
                        </span>
                      </span>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            meta.barClassName,
                          )}
                          style={{ width: `${featurePercent}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Task rows */}
                  {!isCollapsed &&
                    feature.tasks.map((task) => {
                      const taskPercent = percentOf(
                        task.hoursLogged,
                        task.hoursEstimated,
                      );
                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-[1fr_140px_160px] items-center gap-3 border-t border-border-subtle/60 bg-canvas-bg/30 px-4 py-2.5 pl-10"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="tabular-nums text-3xs text-muted-foreground/70 shrink-0">
                              {task.code}
                            </span>
                            <span className="truncate text-xs font-medium text-foreground">
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 text-right">
                            <span className="truncate text-2xs text-muted-foreground">
                              {task.assigneeName}
                            </span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-500 text-4xs font-bold text-white dark:bg-foreground dark:text-background">
                              {task.assigneeInitials}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="text-2xs font-medium">
                              <span className="text-foreground">
                                {task.hoursLogged.toFixed(1)}h
                              </span>
                              <span className="ml-1 text-muted-foreground">
                                / {task.hoursEstimated.toFixed(1)}h
                              </span>
                            </span>
                            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-500/70"
                                style={{ width: `${taskPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
