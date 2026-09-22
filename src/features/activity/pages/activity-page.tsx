import * as React from "react";
import {
  Plus,
  Search,
  Calendar,
  FolderOpen,
  LayoutGrid,
  LayoutList,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useModalHotkey } from "@/hooks/use-hotkey";

import { ActivityCard } from "../components/activity-card";
import { ActivityDetailPage } from "./activity-detail-page";
import { AddActivityDialog } from "../components/add-activity-dialog";
import { MOCK_ACTIVITY_ITEMS } from "../api/mock-data";
import type { ActivityCardItem, ActivityType } from "@/types/activity";

export function ActivityPage() {
  const [items, setItems] = React.useState<ActivityCardItem[]>(MOCK_ACTIVITY_ITEMS);
  const [filterType, setFilterType] = React.useState<"all" | ActivityType>("all");
  const [selectedProject, setSelectedProject] = React.useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<string>("Sep 2026");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Detailed view selection state
  const [selectedActivity, setSelectedActivity] = React.useState<ActivityCardItem | null>(null);

  // Add modal state
  const [addOpen, setAddOpen] = React.useState(false);

  useModalHotkey({
    open: addOpen,
    onOpen: () => setAddOpen(true),
    onClose: () => setAddOpen(false),
  });

  // Filter calculations
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesProject =
        selectedProject === "all" ||
        (item.projectName && item.projectName === selectedProject) ||
        (selectedProject === "Internal" && !item.projectName);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.projectName && item.projectName.toLowerCase().includes(q)) ||
        (item.streamName && item.streamName.toLowerCase().includes(q));

      return matchesType && matchesProject && matchesSearch;
    });
  }, [items, filterType, selectedProject, searchQuery]);

  const counts = React.useMemo(() => {
    return {
      all: items.length,
      project: items.filter((i) => i.type === "project").length,
      nonProject: items.filter((i) => i.type === "non-project").length,
    };
  }, [items]);

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Activity deleted successfully.");
  };

  const handleUpdate = (updated: ActivityCardItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleAddNew = (newItem: any) => {
    const cardItem: ActivityCardItem = {
      id: newItem.id || `act-${Date.now()}`,
      type: newItem.category === "project" ? "project" : "non-project",
      title: newItem.title,
      projectName: newItem.category === "project" ? newItem.projectName : undefined,
      streamName: newItem.category !== "project" ? "Operations" : undefined,
      date: "Sep 22, 2026",
      description: newItem.description || "Activity recorded in workspace.",
      duration: newItem.durationHours || "1h 00m",
      loggedHours: newItem.durationHours || "1h 00m",
      tasksCount: newItem.tasks?.length || 1,
      taskTag: newItem.categoryLabel || "Sprint Activity",
      members: ["LK"],
      tasks: newItem.tasks || [],
    };
    setItems((prev) => [cardItem, ...prev]);
  };

  // IF AN ACTIVITY IS SELECTED -> RENDER DETAIL VIEW
  if (selectedActivity) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6">
        <ActivityDetailPage
          activity={selectedActivity}
          onBack={() => setSelectedActivity(null)}
          onUpdate={(updated) => {
            handleUpdate(updated);
            setSelectedActivity(updated);
          }}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedActivity(null);
          }}
        />
      </div>
    );
  }

  // DEFAULT -> RENDER ACTIVITY DIRECTORY (CARDS / LIST)
  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <span className="hover:text-foreground transition-colors cursor-pointer"></span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Activity
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track, categorize, and report your project allocations and internal operations.
          </p>
        </div>

        {/* Top Right: Logged metric badge + Add button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button
            variant="default"
            size="sm"
            onClick={() => setAddOpen(true)}
            className="gap-1.5 font-semibold bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 h-9"
          >
            <Icon icon={Plus} size={16} />
            <span>Add Activity</span>
          </Button>
        </div>
      </div>

      {/* Control Bar: Filter Tabs on left, Search & Dropdowns on right */}
      <div className="rounded-xl border border-border-subtle bg-canvas-surface p-2 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 select-none">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors outline-none",
              filterType === "all"
                ? "bg-canvas-bg text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-canvas-overlay hover:text-foreground"
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                filterType === "all"
                  ? "bg-muted text-foreground font-bold"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("project")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors outline-none",
              filterType === "project"
                ? "bg-canvas-bg text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-canvas-overlay hover:text-foreground"
            )}
          >
            <span>Project Activities</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                filterType === "project"
                  ? "bg-muted text-foreground font-bold"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              {counts.project}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("non-project")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors outline-none",
              filterType === "non-project"
                ? "bg-canvas-bg text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:bg-canvas-overlay hover:text-foreground"
            )}
          >
            <span>Non-Project Activities</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                filterType === "non-project"
                  ? "bg-muted text-foreground font-bold"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              {counts.nonProject}
            </span>
          </button>
        </div>

        {/* Search, Dropdowns, and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[190px] flex-1 sm:flex-initial">
            <Icon
              icon={Search}
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search activities or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-canvas-bg border-border-subtle"
            />
          </div>

          {/* Date Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border-subtle bg-canvas-bg hover:bg-canvas-overlay text-xs text-foreground font-medium transition-colors"
              >
                <Icon icon={Calendar} size={14} className="text-muted-foreground" />
                <span>{selectedDateFilter}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setSelectedDateFilter("Sep 2026")}>
                Sep 2026 (Current)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDateFilter("Aug 2026")}>
                Aug 2026
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDateFilter("All Time")}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Project Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border-subtle bg-canvas-bg hover:bg-canvas-overlay text-xs text-foreground font-medium transition-colors"
              >
                <Icon icon={FolderOpen} size={14} className="text-muted-foreground" />
                <span>{selectedProject === "all" ? "All Projects" : selectedProject}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setSelectedProject("all")}>
                All Projects &amp; Ops
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedProject("Website Redesign")}>
                Website Redesign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedProject("Mobile App v2.0")}>
                Mobile App v2.0
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedProject("Internal")}>
                Internal Operations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Switcher */}
          <div className="flex items-center rounded-md border border-border-subtle bg-canvas-bg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1 rounded transition-colors",
                viewMode === "grid"
                  ? "bg-canvas-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <Icon icon={LayoutGrid} size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1 rounded transition-colors",
                viewMode === "list"
                  ? "bg-canvas-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <Icon icon={LayoutList} size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 border border-dashed border-border-subtle rounded-xl text-center bg-canvas-surface/40">
          <Icon icon={FolderOpen} size={28} className="text-muted-foreground/60 mb-2" />
          <h3 className="text-sm font-semibold text-foreground">No matching activities found</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            Try adjusting your active filter or search keywords.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterType("all");
              setSelectedProject("all");
              setSearchQuery("");
            }}
            className="mt-3 text-xs"
          >
            Clear all filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* 3-COLUMN CARD GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              onView={(it) => setSelectedActivity(it)}
              onEdit={(it) => setSelectedActivity(it)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Project / Stream</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Duration</TableHead>
              <TableHead className="text-center">Logged</TableHead>
              <TableHead>Associated Scope</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => setSelectedActivity(item)}
                className="cursor-pointer hover:bg-canvas-bg/60"
              >
                <TableCell className="font-semibold text-xs text-foreground">
                  {item.title}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.type === "project" ? "secondary" : "neutral"}
                    className="text-[10px] uppercase font-bold"
                  >
                    {item.type === "project" ? "Project" : "Non-Project"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.projectName || item.streamName || "—"}
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {item.date}
                </TableCell>
                <TableCell className="text-center text-xs font-mono">
                  {item.duration}
                </TableCell>
                <TableCell className="text-center text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
                  {item.loggedHours}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.taskTag || item.scope || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                    View &rarr;
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Activity Modal */}
      <AddActivityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddNew}
      />
    </div>
  );
}