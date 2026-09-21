import * as React from "react";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  LayoutList,
  LayoutGrid,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { ActivityCard } from "../components/activity-card";
import { ActivityDetailsDialog } from "../components/activity-details-dialog";
import { AddActivityDialog } from "../components/add-activity-dialog";
import type { ActivityCategory, ActivityItem } from "@/types/activity";

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const now = new Date();
const todayISO = toISODate(now);

const tomorrowDate = new Date(now);
tomorrowDate.setDate(now.getDate() + 1);
const tomorrowISO = toISODate(tomorrowDate);

const dayAfterDate = new Date(now);
dayAfterDate.setDate(now.getDate() + 2);
const dayAfterISO = toISODate(dayAfterDate);

const laterDate = new Date(now);
laterDate.setDate(now.getDate() + 5);
const laterISO = toISODate(laterDate);

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-today-1",
    category: "project",
    categoryLabel: "Sprint Review",
    projectName: "Apex Analytics Platform",
    title: "Client Quarterly Architecture Review",
    description:
      "Executive presentation with client stakeholders discussing migration phases.",
    date: todayISO,
    timeWindow: "2:00 PM – 3:30 PM",
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
    date: todayISO,
    timeWindow: "4:00 PM – 5:00 PM",
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
    date: tomorrowISO,
    timeWindow: "10:30 AM – 11:30 AM",
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
    date: dayAfterISO,
    timeWindow: "3:00 PM – 4:30 PM",
    durationHours: "1 hour 30 minutes",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    pinColor: "teal",
    loggedBy: "David Kim",
  },
  {
    id: "act-upcoming-1",
    category: "project",
    categoryLabel: "Sprint Kickoff",
    projectName: "Apex Analytics Platform",
    title: "Next Quarter Milestone Planning",
    description: "Sprint velocity estimation and resource reallocations.",
    date: laterISO,
    timeWindow: "11:00 AM – 12:30 PM",
    durationHours: "1 hour 30 minutes",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    pinColor: "teal",
    loggedBy: "Alex Morgan",
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

  // Selected Activity State for Details/Edit Modal
  const [selectedActivity, setSelectedActivity] =
    React.useState<ActivityItem | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleUpdateActivity = (updated: ActivityItem) => {
    setActivities((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelectedActivity(updated);
  };

  const handleOpenDetails = (item: ActivityItem) => {
    setSelectedActivity(item);
    setDetailsOpen(true);
  };

  const handleEditClick = (item: ActivityItem) => {
    setSelectedActivity(item);
    setDetailsOpen(true);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((item) => item.id !== id));
    toast.success("Activity deleted successfully.");
  };

  const handleAddNewActivity = (newItem: ActivityItem) => {
    setActivities((prev) => [newItem, ...prev]);
  };

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

  // Calendar difference grouping
  const groupedSections = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDayDifference = (dateStr: string) => {
      if (!dateStr) return 999;
      const [y, m, d] = dateStr.split("-").map(Number);
      const target = new Date(y, m - 1, d);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    };

    const todayItems: ActivityItem[] = [];
    const tomorrowItems: ActivityItem[] = [];
    const dayAfterItems: ActivityItem[] = [];
    const upcomingItems: ActivityItem[] = [];

    const sorted = [...filteredActivities].sort((a, b) => {
      if (a.date === b.date) {
        return (a.timeWindow || "").localeCompare(b.timeWindow || "");
      }
      return (a.date || "").localeCompare(b.date || "");
    });

    sorted.forEach((item) => {
      const diff = getDayDifference(item.date);
      if (diff <= 0) {
        todayItems.push(item);
      } else if (diff === 1) {
        tomorrowItems.push(item);
      } else if (diff === 2) {
        dayAfterItems.push(item);
      } else {
        upcomingItems.push(item);
      }
    });

    const formatHeaderDate = (d: Date) =>
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    return [
      {
        key: "today",
        title: "Today",
        dateSubtitle: formatHeaderDate(now),
        items: todayItems,
      },
      {
        key: "tomorrow",
        title: "Tomorrow",
        dateSubtitle: formatHeaderDate(tomorrowDate),
        items: tomorrowItems,
      },
      {
        key: "dayAfter",
        title: "Day After Tomorrow",
        dateSubtitle: formatHeaderDate(dayAfterDate),
        items: dayAfterItems,
      },
      ...(upcomingItems.length > 0
        ? [
            {
              key: "upcoming",
              title: "Upcoming",
              dateSubtitle: "Later",
              items: upcomingItems,
            },
          ]
        : []),
    ];
  }, [filteredActivities]);

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            Activity Schedule
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organized timeline for Today, Tomorrow, Day After Tomorrow, and
            Upcoming initiatives.
          </p>
        </div>

        {/* Reusable Accent Button (Gold) */}
        <Button
          variant="accent"
          size="sm"
          title="Add activity (Ctrl+K)"
          onClick={() => setAddOpen(true)}
          className="gap-1.5 font-semibold text-xs h-9 self-start sm:self-auto"
        >
          <Icon icon={Plus} size={16} />
          <span>Add Activity</span>
        </Button>
      </div>

      {/* Toolbar Controls */}
      <Card className="p-3 border-border-subtle bg-canvas-surface shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
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

        {/* View Switcher & Search Bar */}
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

      {/* Sections */}
      <div className="space-y-6">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border-subtle rounded-xl text-center bg-canvas-surface/40">
            <Icon
              icon={Clock}
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
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-bold text-foreground">
                    {section.title}
                  </h2>
                  <span className="text-xs text-muted-foreground font-medium">
                    ({section.dateSubtitle})
                  </span>
                </div>
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-[11px] text-muted-foreground font-mono">
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
                      onSelect={handleOpenDetails}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteActivity}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Activity Details & In-Place Edit Modal */}
      <ActivityDetailsDialog
        item={selectedActivity}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onSave={handleUpdateActivity}
        onDelete={handleDeleteActivity}
      />

      {/* Add Activity Dialog */}
      <AddActivityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddNewActivity}
      />
    </div>
  );
}
