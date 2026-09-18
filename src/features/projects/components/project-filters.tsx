import * as React from "react";
import type { ProjectFilterTab } from "@/types/project";
import { cn } from "@/lib/utils";

interface FilterOption {
  key: ProjectFilterTab;
  label: string;
  count: number;
}

interface ProjectFiltersProps {
  activeFilter: ProjectFilterTab;
  onFilterChange: (filter: ProjectFilterTab) => void;
  counts: Record<ProjectFilterTab, number>;
}

export function ProjectFilters({
  activeFilter,
  onFilterChange,
  counts,
}: ProjectFiltersProps) {
  const options: FilterOption[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "ongoing", label: "Ongoing", count: counts.ongoing },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-canvas-surface p-1">
      {options.map((option) => {
        const isActive = activeFilter === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onFilterChange(option.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors outline-none",
              isActive
                ? "bg-canvas-bg text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-canvas-overlay hover:text-foreground",
            )}
          >
            <span>{option.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                isActive
                  ? "bg-muted text-foreground font-bold"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
