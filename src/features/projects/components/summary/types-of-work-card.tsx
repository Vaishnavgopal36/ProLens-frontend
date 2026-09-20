import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { MOCK_LIST_TASKS } from "@/features/projects/components/list/mock-data";
import { cn } from "@/lib/utils";

interface WorkTypeSlice {
  label: string;
  count: number;
  colorClass: string;
  tabValue: string;
}

interface TypesOfWorkCardProps {
  coreFeaturesCount: number;
  onNavigateTab: (tabValue: string) => void;
}

export function TypesOfWorkCard({
  coreFeaturesCount,
  onNavigateTab,
}: TypesOfWorkCardProps) {
  const tasksCount = MOCK_LIST_TASKS.length;
  const subtasksCount = MOCK_LIST_TASKS.reduce(
    (sum, task) => sum + task.subtasksTotal,
    0,
  );

  const slices: WorkTypeSlice[] = [
    {
      label: "Features",
      count: coreFeaturesCount,
      colorClass: "bg-teal-600 dark:bg-teal-400",
      tabValue: "features",
    },
    {
      label: "Tasks",
      count: tasksCount,
      colorClass: "bg-teal-400/70 dark:bg-teal-400/50",
      tabValue: "list",
    },
    {
      label: "Sub-tasks",
      count: subtasksCount,
      colorClass: "bg-foreground/20",
      tabValue: "list",
    },
  ];

  const total = Math.max(
    1,
    slices.reduce((sum, slice) => sum + slice.count, 0),
  );

  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={PieChart}
            size={15}
            className="text-teal-600 dark:text-teal-400"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Types of Work
          </h3>
        </div>
        <span className="text-2xs font-medium text-muted-foreground">
          {tasksCount + subtasksCount + coreFeaturesCount} items
        </span>
      </div>

      {/* Stacked proportion bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {slices.map((slice) => (
          <button
            key={slice.label}
            type="button"
            onClick={() => onNavigateTab(slice.tabValue)}
            title={`${slice.label}: ${slice.count}`}
            className={cn(
              slice.colorClass,
              "h-full transition-opacity hover:opacity-80",
            )}
            style={{ width: `${(slice.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-1">
        {slices.map((slice) => (
          <button
            key={slice.label}
            type="button"
            onClick={() => onNavigateTab(slice.tabValue)}
            className="flex w-full items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  slice.colorClass,
                )}
              />
              <span className="font-medium text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {slice.label}
              </span>
            </div>
            <span className="font-semibold text-foreground">{slice.count}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
