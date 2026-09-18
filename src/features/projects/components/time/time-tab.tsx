import { useMemo, useState } from "react";
import { ChevronRight, Clock3, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import {
  MOCK_TIME_FEATURES,
  type FeatureTimeStatus,
  type TimeFeatureGroup,
} from "./mock-data";
import { LogTimeSheet } from "./log-time-sheet";

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

const ALL_VALUE = "all";

function sum(nums: number[]) {
  return nums.reduce((total, n) => total + n, 0);
}

function percentOf(logged: number, estimated: number) {
  if (estimated <= 0) return 0;
  return Math.min(100, Math.round((logged / estimated) * 100));
}

interface TimeTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function TimeTab({
  project,
  selectedMemberId: _selectedMemberId,
}: TimeTabProps) {
  const [timeFeatures, setTimeFeatures] = useState(MOCK_TIME_FEATURES);
  const [featureFilter, setFeatureFilter] = useState(ALL_VALUE);
  const [assigneeFilter, setAssigneeFilter] = useState(ALL_VALUE);
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  const assigneeOptions = useMemo(() => {
    const names = new Set<string>();
    timeFeatures.forEach((feature) =>
      feature.tasks.forEach((task) => names.add(task.assigneeName)),
    );
    return Array.from(names);
  }, [timeFeatures]);

  const filteredFeatures: TimeFeatureGroup[] = useMemo(() => {
    return timeFeatures
      .filter(
        (feature) =>
          featureFilter === ALL_VALUE || feature.id === featureFilter,
      )
      .filter(
        (feature) =>
          statusFilter === ALL_VALUE || feature.status === statusFilter,
      )
      .map((feature) => ({
        ...feature,
        tasks: feature.tasks.filter(
          (task) =>
            assigneeFilter === ALL_VALUE ||
            task.assigneeName === assigneeFilter,
        ),
      }))
      .filter((feature) => feature.tasks.length > 0);
  }, [timeFeatures, featureFilter, assigneeFilter, statusFilter]);

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
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas-surface p-3 rounded-xl border border-border-subtle shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={featureFilter} onValueChange={setFeatureFilter}>
            <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
              <SelectValue placeholder="All Features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Features</SelectItem>
              {timeFeatures.map((feature) => (
                <SelectItem key={feature.id} value={feature.id}>
                  {feature.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
              <SelectValue placeholder="All People" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All People</SelectItem>
              {assigneeOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon icon={Clock3} size={13} />
            <span className="font-semibold text-foreground">
              {totals.logged.toFixed(1)}h
            </span>
            <span>
              logged of {totals.estimated.toFixed(1)}h estimated in{" "}
              {project.name}
            </span>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsLogTimeOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Icon icon={Plus} size={14} />
            <span>Log Time</span>
          </Button>
        </div>
      </div>

      <LogTimeSheet
        open={isLogTimeOpen}
        onOpenChange={setIsLogTimeOpen}
        features={timeFeatures}
        onLogTime={handleLogTime}
      />

      {/* Breakdown Table */}
      <Card className="border-border-subtle bg-canvas-surface p-0 shadow-xs overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_160px] items-center gap-3 border-b border-border-subtle bg-canvas-bg/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                          "px-2 py-0.5 rounded text-[10px] font-bold shrink-0",
                          meta.badgeClassName,
                        )}
                      >
                        {feature.status}
                      </Badge>
                      <span className="truncate text-sm font-semibold text-foreground">
                        {feature.name}
                      </span>
                    </div>

                    <span className="text-right text-[11px] text-muted-foreground">
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
                            <span className="font-mono text-[10px] text-muted-foreground/70 shrink-0">
                              {task.code}
                            </span>
                            <span className="truncate text-xs font-medium text-foreground">
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 text-right">
                            <span className="truncate text-[11px] text-muted-foreground">
                              {task.assigneeName}
                            </span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-500 text-[9px] font-bold text-white dark:bg-foreground dark:text-background">
                              {task.assigneeInitials}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] font-medium">
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
