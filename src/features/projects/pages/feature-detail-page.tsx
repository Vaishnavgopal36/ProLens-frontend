import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Check, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { FilterBar, useFilters } from "@/components/composed/filters";
import type { FilterFieldDef } from "@/components/composed/filters";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import { cn } from "@/lib/utils";
import { PRIORITY_BADGE_CLASSES } from "@/features/projects/lib/badge-styles";
import { useProjectViewer } from "../hooks/use-project-filter-fields";
import { MOCK_PROJECTS } from "../api/mock-data";
import { MOCK_FEATURE_STREAMS } from "../components/features/mock-data";
import {
  SUBTASKS_BY_TASK,
  TASKS_BY_FEATURE,
  type FeatureTask,
} from "../components/features/task-mock-data";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  "To Do": "bg-canvas-overlay text-muted-foreground",
  "In Progress":
    "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
  "In Review":
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300",
  Done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
};

const STATUSES: FeatureTask["status"][] = [
  "To Do",
  "In Progress",
  "In Review",
  "Done",
];

export function FeatureDetailPage() {
  const { projectId, featureId } = useParams<{
    projectId: string;
    featureId: string;
  }>();
  const isLoading = useSimulatedLoading();
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  const feature = MOCK_FEATURE_STREAMS.find((f) => f.id === featureId);

  // Hooks below need a project, so fall back to the first one until the guard
  // redirects; they never run their results in that case.
  const viewer = useProjectViewer<FeatureTask>(
    project ?? MOCK_PROJECTS[0],
    (t) => t.assigneeName,
  );
  const allTasks = React.useMemo(
    () => (feature ? (TASKS_BY_FEATURE[feature.name] ?? []) : []),
    [feature],
  );
  const scopedTasks = React.useMemo(
    () => viewer.scope(allTasks),
    [allTasks, viewer],
  );
  const fields: FilterFieldDef<FeatureTask>[] = [
    ...viewer.peopleField,
    {
      key: "status",
      label: "Status",
      options: STATUSES.map((s) => ({ value: s, label: s })),
      accessor: (t) => t.status,
    },
    {
      key: "priority",
      label: "Priority",
      options: ["High", "Medium", "Low"].map((p) => ({ value: p, label: p })),
      accessor: (t) => t.priority,
    },
  ];
  const filters = useFilters(scopedTasks, fields, (t) => t.title);

  if (!project || !feature) {
    return (
      <Navigate
        to={project ? `/projects/${project.id}` : "/projects"}
        replace
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton columns={4} rows={4} />
      </div>
    );
  }

  const isActive = feature.status === "ACTIVE";
  const tasks = filters.filtered;
  const subtasksOf = (t: FeatureTask) => SUBTASKS_BY_TASK[t.id] ?? [];
  const subDone = scopedTasks.reduce(
    (n, t) => n + subtasksOf(t).filter((s) => s.done).length,
    0,
  );
  const subTotal = scopedTasks.reduce((n, t) => n + subtasksOf(t).length, 0);
  const tasksDone = scopedTasks.filter((t) => t.status === "Done").length;

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link to="/projects" className="hover:text-foreground">
          Projects
        </Link>
        <Icon icon={ChevronRight} size={12} />
        <Link to={`/projects/${project.id}`} className="hover:text-foreground">
          {project.name}
        </Link>
        <Icon icon={ChevronRight} size={12} />
        <Link
          to={`/projects/${project.id}?tab=features`}
          className="hover:text-foreground"
        >
          Features
        </Link>
        <Icon icon={ChevronRight} size={12} />
        <span className="font-semibold text-foreground">{feature.name}</span>
      </nav>

      <Card className="space-y-4 border-border-subtle bg-canvas-surface p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
              isActive
                ? "border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
            )}
          >
            <Icon icon={Layers} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {feature.name}
              </h1>
              <Badge
                variant="outline"
                className={
                  isActive
                    ? "border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-3xs font-bold text-teal-600 dark:text-teal-400"
                    : "border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-3xs font-bold text-amber-700 dark:text-amber-400"
                }
              >
                {feature.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {feature.description}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className="font-semibold tabular-nums text-foreground">
              {feature.progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                isActive ? "bg-teal-500" : "bg-amber-500",
              )}
              style={{ width: `${feature.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 sm:grid-cols-3">
          {[
            {
              label: viewer.isEmployee ? "My tasks" : "Tasks",
              value: scopedTasks.length,
            },
            {
              label: "Tasks done",
              value: `${tasksDone}/${scopedTasks.length}`,
            },
            { label: "Subtasks done", value: `${subDone}/${subTotal}` },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xs font-medium text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <FilterBar filters={filters} searchPlaceholder="Search tasks..." />

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle p-6 text-center text-xs text-muted-foreground">
          {filters.activeCount > 0
            ? "No tasks match these filters."
            : viewer.isEmployee
              ? "You have no tasks assigned in this feature."
              : "No tasks in this feature yet."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => {
            const subs = subtasksOf(task);
            const done = subs.filter((s) => s.done).length;
            const open = !collapsed.has(task.id);
            return (
              <Card
                key={task.id}
                className="border-border-subtle bg-canvas-surface shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      {task.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-3xs font-semibold",
                          STATUS_BADGE_CLASSES[task.status],
                        )}
                      >
                        {task.status}
                      </span>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-3xs font-semibold",
                          PRIORITY_BADGE_CLASSES[task.priority],
                        )}
                      >
                        {task.priority}
                      </span>
                      <span className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-500 text-4xs font-bold text-white dark:bg-foreground dark:text-background">
                          {task.assigneeInitials}
                        </span>
                        {task.assigneeName}
                      </span>
                    </div>
                  </div>

                  {subs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggle(task.id)}
                      aria-expanded={open}
                      className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {done}/{subs.length} subtasks
                      <Icon
                        icon={open ? ChevronDown : ChevronRight}
                        size={13}
                      />
                    </button>
                  )}
                </div>

                {subs.length > 0 && open && (
                  <ul className="divide-y divide-border-subtle border-t border-border-subtle bg-canvas-bg/40">
                    {subs.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            s.done
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-border-subtle bg-canvas-surface",
                          )}
                        >
                          {s.done && (
                            <Icon icon={Check} size={11} strokeWidth={3} />
                          )}
                        </span>
                        <span
                          className={cn(
                            s.done
                              ? "text-muted-foreground line-through"
                              : "text-foreground",
                          )}
                        >
                          {s.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
