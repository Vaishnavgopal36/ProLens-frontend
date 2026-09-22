import * as React from "react";
import { GanttChartSquare, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard, StatusIndicator } from "@/components/composed";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import { MOCK_LIST_TASKS } from "@/features/projects/components/list/mock-data";

interface GanttStream {
  id: string;
  name: string;
  dateRange: string;
  progress: number;
  /** Position of the bar within the track, as a percentage. */
  offsetPercent: number;
  widthPercent: number;
  color: "teal-500" | "teal-600" | "amber-500";
}

const STREAMS: GanttStream[] = [
  {
    id: "s-1",
    name: "Design System",
    dateRange: "Sep 1 - Sep 30",
    progress: 75,
    offsetPercent: 0,
    widthPercent: 30,
    color: "teal-500",
  },
  {
    id: "s-2",
    name: "Authentication",
    dateRange: "Sep 15 - Oct 15",
    progress: 52,
    offsetPercent: 15,
    widthPercent: 30,
    color: "teal-600",
  },
  {
    id: "s-3",
    name: "Reporting",
    dateRange: "Oct 1 - Oct 31",
    progress: 25,
    offsetPercent: 30,
    widthPercent: 30,
    color: "amber-500",
  },
  {
    id: "s-4",
    name: "QA & Hardening",
    dateRange: "Nov 1 - Nov 20",
    progress: 10,
    offsetPercent: 62,
    widthPercent: 20,
    color: "amber-500",
  },
];

const BAR_COLOR_CLASSES: Record<GanttStream["color"], string> = {
  "teal-500": "bg-teal-500 text-white",
  "teal-600": "bg-teal-600 text-white",
  "amber-500": "bg-amber-500 text-navy-900 dark:text-background",
};

const STATUS_DOT_CLASSES: Record<string, string> = {
  "In Progress": "bg-teal-500",
  Delivered: "bg-slate-400",
  Backlog: "bg-amber-500",
};

// Weekly axis header spanning the project window (Sep 1 – Nov 30).
const WEEK_LABELS = [
  "Sep 1",
  "Sep 8",
  "Sep 15",
  "Sep 22",
  "Sep 29",
  "Oct 6",
  "Oct 13",
  "Oct 20",
  "Oct 27",
  "Nov 3",
  "Nov 10",
  "Nov 17",
  "Nov 24",
];
// Roughly where "today" (Sep 18) falls within the project window, as a %.
const TODAY_OFFSET_PERCENT = 19;

interface TimelineTabProps {
  project: Project;
}

export function TimelineTab({ project }: TimelineTabProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleStream = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const streamsWithTasks = React.useMemo(
    () =>
      STREAMS.map((stream) => ({
        stream,
        tasks: MOCK_LIST_TASKS.filter((t) => t.feature === stream.name),
      })),
    [],
  );

  const avgProgress = Math.round(
    STREAMS.reduce((s, w) => s + w.progress, 0) / STREAMS.length,
  );
  const atRiskStreams = STREAMS.filter((s) => s.progress < 30);
  const totalTasks = MOCK_LIST_TASKS.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Project Window"
          value={project.activeSprint || "Active"}
          subtext={project.dateRange}
        />
        <KpiCard
          label="Timeline Progress"
          value={`${avgProgress}%`}
          subtext={`Avg. across ${STREAMS.length} streams`}
          trend={{
            value: "+6.5%",
            direction: "up",
            timeframe: "this cycle",
          }}
          sparklineData={[
            Math.max(0, avgProgress - 15),
            Math.max(0, avgProgress - 10),
            Math.max(0, avgProgress - 5),
            avgProgress,
          ]}
        />
        <KpiCard
          label="Scheduled Workstreams"
          value={STREAMS.length}
          subtext={`${totalTasks} total tasks on roadmap`}
          sparklineData={[
            STREAMS.length,
            STREAMS.length,
            STREAMS.length,
            STREAMS.length,
          ]}
        />
        <KpiCard
          label="Needs Attention"
          value={`${atRiskStreams.length} stream${atRiskStreams.length === 1 ? "" : "s"}`}
          badge={
            atRiskStreams.length > 0
              ? { text: "Alert", variant: "destructive" }
              : undefined
          }
          subtext={
            atRiskStreams.length > 0
              ? atRiskStreams.map((s) => s.name).join(", ")
              : "All streams on pace"
          }
          alertLink={
            atRiskStreams.length > 0
              ? { to: "#timeline-gantt", label: "View at-risk streams" }
              : undefined
          }
          isPositiveGood={false}
          sparklineData={[0, 0, 1, atRiskStreams.length]}
          strokeColor={atRiskStreams.length > 0 ? "stroke-rose-500" : undefined}
        />
      </div>

      <Card id="timeline-gantt" tabIndex={-1} className="p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon
              icon={GanttChartSquare}
              size={15}
              className="text-teal-600 dark:text-teal-400"
            />
            <h4 className="font-bold text-sm text-foreground">
              Project Gantt &amp; Stream Timeline
            </h4>
          </div>
          <span className="text-xs text-muted-foreground">
            {project.dateRange}
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Week axis header */}
            <div className="flex items-center gap-4 pl-[8.5rem] mb-1.5">
              <div className="flex-1 relative h-4">
                {WEEK_LABELS.map((label, i) => (
                  <span
                    key={label}
                    className="absolute text-4xs text-muted-foreground -translate-x-1/2"
                    style={{ left: `${(i / (WEEK_LABELS.length - 1)) * 100}%` }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              {streamsWithTasks.map(({ stream, tasks }) => {
                const isExpanded = expanded.has(stream.id);
                return (
                  <div key={stream.id}>
                    <button
                      type="button"
                      onClick={() => toggleStream(stream.id)}
                      className="flex w-full items-center gap-4 py-1.5 rounded-md hover:bg-canvas-overlay/50 transition-colors text-left"
                    >
                      <span className="w-32 shrink-0 flex items-center gap-1.5 font-semibold text-foreground truncate">
                        <Icon
                          icon={ChevronRight}
                          size={12}
                          className={cn(
                            "shrink-0 text-muted-foreground transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                        {stream.name}
                      </span>
                      <div className="flex-1 bg-muted h-6 rounded-lg overflow-hidden relative">
                        {/* Today marker */}
                        <div
                          className="absolute top-0 h-full w-px bg-rose-500/70"
                          style={{ left: `${TODAY_OFFSET_PERCENT}%` }}
                        />
                        <div
                          className={`absolute h-full rounded-lg font-bold text-3xs flex items-center px-2 whitespace-nowrap ${BAR_COLOR_CLASSES[stream.color]}`}
                          style={{
                            left: `${stream.offsetPercent}%`,
                            width: `${stream.widthPercent}%`,
                          }}
                        >
                          {stream.dateRange} ({stream.progress}%)
                        </div>
                      </div>
                      <span className="w-14 shrink-0 text-right text-2xs text-muted-foreground">
                        {tasks.length} task{tasks.length === 1 ? "" : "s"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="pl-8 pb-2 space-y-1.5">
                        {tasks.length === 0 ? (
                          <p className="text-2xs text-muted-foreground py-1">
                            No tasks scheduled yet.
                          </p>
                        ) : (
                          tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 py-1 text-2xs"
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full shrink-0",
                                  STATUS_DOT_CLASSES[task.status] ??
                                    "bg-muted-foreground",
                                )}
                              />
                              <span className="tabular-nums text-muted-foreground/70 shrink-0">
                                {task.code}
                              </span>
                              <span className="font-medium text-foreground truncate flex-1">
                                {task.title}
                              </span>
                              <StatusIndicator status={task.status} />
                              <span className="text-muted-foreground shrink-0 w-20 text-right">
                                {task.loggedHours}h / {task.estimatedHours}h
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center gap-4 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-500" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> At risk /
            upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 bg-rose-500/70" /> Today
          </span>
        </div>
      </Card>
    </div>
  );
}
