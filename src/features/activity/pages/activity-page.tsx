import * as React from "react";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  LayoutList,
  LayoutGrid,
  Timeline,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { ActivityCard } from "../components/activity-card";
import { AddActivityDialog } from "../components/add-activity-dialog";
import type { ActivityCategory, ActivityItem } from "@/types/activity";

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-today-1",
    category: "project",
    categoryLabel: "Sprint Review",
    projectName: "Apex Analytics Platform",
    title: "Client Quarterly Architecture Review",
    description:
      "Executive presentation with client stakeholders discussing migration phases.",
    timestamp: "Today, 2:00 PM – 3:30 PM",
    durationHours: "1 hour 30 minutes",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    pinColor: "teal",
    loggedBy: "Alex Morgan",
  },
  {
    id: "act-today-2",
    category: "non-project",
    categoryLabel: "Internal Session",
    title: "Engineering Guild: Frontend State Management",
    description:
      "Knowledge sharing and patterns review on modern React performance.",
    timestamp: "Today, 4:00 PM – 5:00 PM",
    durationHours: "1 hour",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    pinColor: "navy",
    loggedBy: "Elena Rostova",
  },
  {
    id: "act-tomorrow-1",
    category: "project",
    categoryLabel: "Client Meeting",
    projectName: "Nova Mobile Dev",
    title: "Biometrics SDK Demo & Security Audit",
    description:
      "Walkthrough of authentication token exchanges and mobile fallback flows.",
    timestamp: "Tomorrow, 10:30 AM – 11:30 AM",
    durationHours: "1 hour",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    pinColor: "teal",
    loggedBy: "Alex Morgan",
  },
  {
    id: "act-dayafter-1",
    category: "project",
    categoryLabel: "Release Sprint",
    projectName: "Apex Analytics Platform",
    title: "Staging Pipeline Verification & Sign-off",
    description:
      "Regression test suite run and integration testing before main branch merge.",
    timestamp: "Day after tomorrow, 3:00 PM – 4:30 PM",
    durationHours: "1 hour 30 minutes",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    pinColor: "teal",
    loggedBy: "David Kim",
  },
];

export function ActivityPage() {
  const [activeFilter, setActiveFilter] = React.useState<
    "all" | ActivityCategory
  >("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"compact" | "expanded">(
    "expanded",
  );
  const [addOpen, setAddOpen] = React.useState(false);

  // Ctrl/⌘ + K toggles "add activity".
  useModalHotkey({
    open: addOpen,
    onOpen: () => setAddOpen(true),
    onClose: () => setAddOpen(false),
  });
  const [activities, setActivities] =
    React.useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  const counts = React.useMemo(
    () => ({
      all: activities.length,
      project: activities.filter((i) => i.category === "project").length,
      nonProject: activities.filter((i) => i.category === "non-project").length,
    }),
    [activities],
  );

  const filteredActivities = React.useMemo(() => {
    return activities.filter((item) => {
      const matchesCategory =
        activeFilter === "all" || item.category === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.projectName && item.projectName.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activities, activeFilter, searchQuery]);

  const groupedSections = React.useMemo(() => {
    const todayItems = filteredActivities.filter((item) =>
      item.timestamp.toLowerCase().includes("today"),
    );
    const tomorrowItems = filteredActivities.filter(
      (item) =>
        item.timestamp.toLowerCase().includes("tomorrow") &&
        !item.timestamp.toLowerCase().includes("day after"),
    );
    const dayAfterItems = filteredActivities.filter((item) =>
      item.timestamp.toLowerCase().includes("day after"),
    );
    const otherItems = filteredActivities.filter(
      (item) =>
        !item.timestamp.toLowerCase().includes("today") &&
        !item.timestamp.toLowerCase().includes("tomorrow"),
    );

    return [
      { key: "today", title: "Today", items: todayItems },
      { key: "tomorrow", title: "Tomorrow", items: tomorrowItems },
      { key: "dayAfter", title: "Day After Tomorrow", items: dayAfterItems },
      ...(otherItems.length > 0
        ? [{ key: "upcoming", title: "Upcoming", items: otherItems }]
        : []),
    ];
  }, [filteredActivities]);

  const handleAddNewActivity = (newItem: ActivityItem) => {
    setActivities((prev) => [newItem, ...prev]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((item) => item.id !== id));
    toast.success("Activity deleted successfully.");
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            Activity Schedule
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Overview of scheduled events, client milestones, and team sessions
            for Today, Tomorrow, and Day After Tomorrow.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          title="Add activity (Ctrl+K)"
          onClick={() => setAddOpen(true)}
          className="gap-1.5 font-semibold text-xs h-9 self-start sm:self-auto"
        >
          <Icon icon={Plus} size={16} />
          <span>Add Activity</span>
        </Button>
      </div>

      <Card className="p-3 border-border-subtle bg-canvas-surface shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-canvas-bg/60 rounded-lg overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all outline-none",
              activeFilter === "all"
                ? "bg-navy-500 text-white dark:bg-foreground dark:text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-canvas-surface",
            )}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full tabular-nums text-3xs bg-white/20">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("project")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all outline-none",
              activeFilter === "project"
                ? "bg-navy-500 text-white dark:bg-foreground dark:text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-canvas-surface",
            )}
          >
            <span>Project Activities</span>
            <span className="px-1.5 py-0.2 rounded-full tabular-nums text-3xs bg-muted">
              {counts.project}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("non-project")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all outline-none",
              activeFilter === "non-project"
                ? "bg-navy-500 text-white dark:bg-foreground dark:text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-canvas-surface",
            )}
          >
            <span>Non-Project Activities</span>
            <span className="px-1.5 py-0.2 rounded-full tabular-nums text-3xs bg-muted">
              {counts.nonProject}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-canvas-bg/50 p-1">
            <Button
              type="button"
              variant={viewMode === "compact" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("compact")}
              className="h-7 px-2.5 text-xs gap-1.5 font-medium"
            >
              <Icon icon={LayoutList} size={13} />
            </Button>
            <Button
              type="button"
              variant={viewMode === "expanded" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("expanded")}
              className="h-7 px-2.5 text-xs gap-1.5 font-medium"
            >
              <Icon icon={LayoutGrid} size={13} />
            </Button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Icon
              icon={Search}
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search title, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-canvas-surface border-border-subtle"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border-subtle rounded-xl text-center bg-canvas-surface/40">
            <Icon
              icon={Timeline}
              size={24}
              className="text-muted-foreground mb-2"
            />
            <p className="text-sm font-semibold text-foreground">
              No activities found
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Try adjusting your search query or switching category filters.
            </p>
          </div>
        ) : (
          groupedSections.map((section) => (
            <div key={section.key} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Icon
                  icon={CalendarIcon}
                  size={15}
                  className="text-teal-600 dark:text-teal-400"
                />
                <h2 className="text-sm font-bold text-foreground">
                  {section.title}
                </h2>
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-2xs text-muted-foreground tabular-nums">
                  {section.items.length}{" "}
                  {section.items.length === 1 ? "activity" : "activities"}
                </span>
              </div>

              {section.items.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-border-subtle text-center text-xs text-muted-foreground bg-canvas-surface/20">
                  No activities scheduled for {section.title.toLowerCase()}.
                </div>
              ) : (
                <div
                  className={cn(
                    "grid gap-3",
                    viewMode === "compact"
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1",
                  )}
                >
                  {section.items.map((item) => (
                    <ActivityCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      onDelete={handleDeleteActivity}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AddActivityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddNewActivity}
      />
    </div>
  );
}
