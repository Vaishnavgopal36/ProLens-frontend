import * as React from "react";
import {
  Plus,
  Search,
  ChevronRight,
  Timeline,
  Calendar as CalendarIcon,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { ACTIVITY_METRICS, MOCK_ACTIVITY_GROUPS } from "../api/mock-data";
import { ActivityCard } from "../components/activity-card";
import { AddActivityDialog } from "../components/add-activity-dialog";
import type { ActivityCategory, ActivityItem } from "@/types/activity";

export function ActivityPage() {
  const [activeFilter, setActiveFilter] = React.useState<"all" | ActivityCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [groups, setGroups] = React.useState(MOCK_ACTIVITY_GROUPS);

  // Compute counts
  const allItems = React.useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const counts = React.useMemo(
    () => ({
      all: allItems.length,
      project: allItems.filter((i) => i.category === "project").length,
      nonProject: allItems.filter((i) => i.category === "non-project").length,
    }),
    [allItems]
  );

  // Filter groups
  const filteredGroups = React.useMemo(() => {
    return groups
      .map((group) => {
        const matchingItems = group.items.filter((item) => {
          const matchesCategory =
            activeFilter === "all" || item.category === activeFilter;
          const query = searchQuery.toLowerCase().trim();
          const matchesSearch =
            !query ||
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.projectName && item.projectName.toLowerCase().includes(query));

          return matchesCategory && matchesSearch;
        });

        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [groups, activeFilter, searchQuery]);

  const handleAddNewActivity = (newItem: ActivityItem) => {
    setGroups((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0] = {
          ...copy[0],
          items: [newItem, ...copy[0].items],
        };
      }
      return copy;
    });
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <span>Management</span>
            <Icon icon={ChevronRight} size={13} className="opacity-40" />
            <span className="text-foreground font-semibold">Activity</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Activity
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological audit and log of professional activities, project milestones, and external events
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setAddOpen(true)}
          className="gap-1.5 font-semibold text-xs h-9 self-start sm:self-auto"
        >
          <Icon icon={Plus} size={16} />
          <span>Add Activity</span>
        </Button>
      </div>

      {/* KPI / Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACTIVITY_METRICS.map((metric) => {
          const IconComp = metric.icon;
          return (
            <Card
              key={metric.id}
              className={cn(
                "p-5 flex flex-col justify-between rounded-xl relative overflow-hidden border-border-subtle bg-canvas-surface shadow-xs",
                metric.highlight && "bg-[#FEF6E0] dark:bg-amber-950/20 border-l-4 border-l-gold-400"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  {metric.label}
                </span>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    metric.highlight
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  )}
                >
                  <Icon icon={IconComp} size={18} />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {metric.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {metric.unit}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground truncate">
                {metric.subtext}
              </p>

              {metric.progressPercent !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-teal-600 dark:bg-teal-500"
                    style={{ width: `${metric.progressPercent}%` }}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Filter & Controls Toolbar */}
      <Card className="p-3 border-border-subtle bg-canvas-surface shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1 p-1 bg-canvas-bg/60 rounded-lg overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all outline-none",
              activeFilter === "all"
                ? "bg-navy-500 text-white dark:bg-foreground dark:text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-canvas-surface"
            )}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-white/20">
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
                : "text-muted-foreground hover:text-foreground hover:bg-canvas-surface"
            )}
          >
            <span>Project Activities</span>
            <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-muted">
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
                : "text-muted-foreground hover:text-foreground hover:bg-canvas-surface"
            )}
          >
            <span>Non-Project Activities</span>
            <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-muted">
              {counts.nonProject}
            </span>
          </button>
        </div>

        {/* Search Input & Month Info */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-canvas-bg/60 rounded-md px-3 py-1.5 text-xs text-muted-foreground border border-border-subtle">
            <Icon icon={CalendarIcon} size={14} className="mr-2 opacity-70" />
            <span>Current month</span>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Icon
              icon={Search}
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search activity, client, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-canvas-surface border-border-subtle"
            />
          </div>
        </div>
      </Card>

      {/* Chronological Timeline Feed */}
      <div className="space-y-8">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border-subtle rounded-xl text-center bg-canvas-surface/40">
            <Icon icon={Timeline} size={24} className="text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-foreground">No activities found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Try adjusting your search query or switching filters.
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-4">
              {/* Group Section Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    {group.groupTitle}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-mono">
                    {group.dateLabel}
                  </span>
                </div>
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-xs text-muted-foreground font-medium">
                  {group.items.length} logged {group.items.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {/* Connected Line Container */}
              <div className="relative space-y-4 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border-subtle">
                {group.items.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Pagination Status */}
      <div className="p-3 bg-canvas-surface border border-border-subtle rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Icon icon={Info} size={15} className="text-teal-600 dark:text-teal-400" />
          <span>Showing {allItems.length} of 38 activities for the selected billing cycle.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="h-7 text-xs">
            Previous
          </Button>
          <span className="font-mono text-xs text-foreground px-2">Page 1 / 5</span>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Next
          </Button>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <AddActivityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddNewActivity}
      />
    </div>
  );
}   