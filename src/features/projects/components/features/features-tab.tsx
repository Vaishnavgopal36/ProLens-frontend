import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";
import { FilterBar, useFilters } from "@/components/composed/filters";
import { ViewToggle, useViewLayout } from "@/components/composed/view-toggle";
import { cn } from "@/lib/utils";
import { useProjectViewer } from "../../hooks/use-project-filter-fields";
import { TASKS_BY_FEATURE } from "./task-mock-data";
import { MOCK_FEATURE_STREAMS, type FeatureStream } from "./mock-data";
import { api } from "@/lib/api";
import { mapFeatureToStream } from "@/lib/mappers";

interface FeaturesTabProps {
  project: Project;
}

/** A feature belongs to everyone who has a task in it. */
const assigneesOf = (f: FeatureStream) => [
  ...new Set((TASKS_BY_FEATURE[f.name] ?? []).map((t) => t.assigneeName)),
];

export function FeaturesTab({ project }: FeaturesTabProps) {
  const [featureStreams, setFeatureStreams] =
    React.useState<FeatureStream[]>(MOCK_FEATURE_STREAMS);

  React.useEffect(() => {
    let isMounted = true;
    api.features
      .list({ project_id: project.id })
      .then((res) => {
        if (!isMounted) return;
        if (res.length > 0) {
          setFeatureStreams(res.map(mapFeatureToStream));
        } else {
          setFeatureStreams(MOCK_FEATURE_STREAMS);
        }
      })
      .catch(() => {
        if (isMounted) setFeatureStreams(MOCK_FEATURE_STREAMS);
      });
    return () => {
      isMounted = false;
    };
  }, [project.id]);

  // Employees only see the features they're assigned to; managers and above
  // can filter by one or several people.
  const viewer = useProjectViewer<FeatureStream>(project, assigneesOf);
  const scopedStreams = React.useMemo(
    () => viewer.scope(featureStreams),
    [viewer, featureStreams],
  );
  const filters = useFilters(scopedStreams, viewer.peopleField, (f) =>
    [f.name, f.description].join(" "),
  );
  const streams = filters.filtered;
  const navigate = useNavigate();
  const [layout, setLayout] = useViewLayout("features");
  const openFeature = (stream: FeatureStream) =>
    navigate(`/projects/${project.id}/features/${stream.id}`);

  return (
    <div className="flex flex-col gap-4">
      {!viewer.isEmployee ? (
        <FilterBar filters={filters} searchPlaceholder="Search features...">
          <ViewToggle value={layout} onChange={setLayout} />
        </FilterBar>
      ) : (
        <ViewToggle value={layout} onChange={setLayout} className="self-end" />
      )}
      {streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-canvas-bg/40 py-14 text-center">
          <Icon icon={Layers} size={22} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {filters.activeCount > 0 || viewer.isEmployee
              ? "No matching features"
              : "No feature streams yet"}
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Feature streams will appear here once tasks are grouped into
            milestones for this project.
          </p>
        </div>
      ) : layout === "list" ? (
        <div className="flex flex-col gap-2">
          {streams.map((stream) => {
            const isActive = stream.status === "ACTIVE";
            return (
              <div
                key={stream.id}
                role="link"
                tabIndex={0}
                onClick={() => openFeature(stream)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFeature(stream);
                  }
                }}
                className={cn(
                  "group grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-lg border border-border-subtle bg-canvas-surface px-4 py-3 shadow-xs transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[minmax(0,2fr)_88px_minmax(120px,1.2fr)_130px_72px]",
                  isActive ? "hover:border-teal-500" : "hover:border-amber-500",
                )}
              >
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground">
                    {stream.name}
                  </h4>
                  <p className="truncate text-xs text-muted-foreground">
                    {stream.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    isActive
                      ? "w-fit border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-3xs font-bold text-teal-600 dark:text-teal-400"
                      : "w-fit border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-3xs font-bold text-amber-700 dark:text-amber-400"
                  }
                >
                  {stream.status}
                </Badge>
                <div className="col-span-2 flex items-center gap-2 md:col-span-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        isActive ? "bg-teal-500" : "bg-amber-500",
                      )}
                      style={{ width: `${stream.progress}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "w-9 shrink-0 text-right text-xs font-bold tabular-nums",
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-amber-700 dark:text-amber-400",
                    )}
                  >
                    {stream.progress}%
                  </span>
                </div>
                <span className="hidden text-xs tabular-nums text-muted-foreground md:block">
                  {stream.tasksCount} tasks ({stream.tasksCompleted} done)
                </span>
                <div className="hidden -space-x-1.5 md:flex">
                  {stream.avatars.map((avatar, index) => (
                    <Avatar
                      key={`${stream.id}-${avatar.initials}-${index}`}
                      className="h-6 w-6 border border-canvas-surface"
                    >
                      <AvatarFallback
                        className={`text-3xs font-bold text-white ${avatar.colorClass}`}
                      >
                        {avatar.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {streams.map((stream) => {
            const isActive = stream.status === "ACTIVE";

            return (
              <Card
                key={stream.id}
                role="button"
                tabIndex={0}
                onClick={() => openFeature(stream)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFeature(stream);
                  }
                }}
                className={`group flex cursor-pointer flex-col justify-between p-5 shadow-xs transition hover:shadow-md ${
                  isActive ? "hover:border-teal-500" : "hover:border-amber-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        isActive
                          ? "text-3xs px-2 py-0.5 font-bold border-teal-500/30 text-teal-600 bg-teal-500/10 dark:text-teal-400"
                          : "text-3xs px-2 py-0.5 font-bold border-amber-500/30 text-amber-700 bg-amber-500/10 dark:text-amber-400"
                      }
                    >
                      {stream.status}
                    </Badge>
                    <h4
                      className={`mt-1.5 text-base font-bold text-foreground ${
                        isActive
                          ? "group-hover:text-teal-600 dark:group-hover:text-teal-400"
                          : "group-hover:text-amber-700 dark:group-hover:text-amber-400"
                      }`}
                    >
                      {stream.name}
                    </h4>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {stream.progress}%
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {stream.description}
                </p>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      isActive ? "bg-teal-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${stream.progress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-muted-foreground">
                  <span>
                    {stream.tasksCount} Tasks ({stream.tasksCompleted}{" "}
                    Completed)
                  </span>
                  <div className="flex -space-x-1.5">
                    {stream.avatars.map((avatar, index) => (
                      <Avatar
                        key={`${stream.id}-${avatar.initials}-${index}`}
                        className="h-6 w-6 border border-canvas-surface"
                      >
                        <AvatarFallback
                          className={`text-3xs font-bold text-white ${avatar.colorClass}`}
                        >
                          {avatar.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
