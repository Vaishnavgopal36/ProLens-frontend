import { BarChart3, ChevronUp, Equal, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { MOCK_LIST_TASKS, type TaskPriority } from "@/features/projects/components/list/mock-data";
import { cn } from "@/lib/utils";

interface PriorityBreakdownCardProps {
  onNavigateTab: (tabValue: string) => void;
}

const PRIORITY_ORDER: TaskPriority[] = ["High", "Medium", "Low"];

const PRIORITY_META: Record<
  TaskPriority,
  { icon: typeof ChevronUp; textClass: string }
> = {
  High: { icon: ChevronUp, textClass: "text-red-500 dark:text-red-400" },
  Medium: { icon: Equal, textClass: "text-amber-500 dark:text-amber-400" },
  Low: { icon: ChevronDown, textClass: "text-blue-500 dark:text-blue-400" },
};

export function PriorityBreakdownCard({
  onNavigateTab,
}: PriorityBreakdownCardProps) {
  const counts = PRIORITY_ORDER.map((priority) => ({
    priority,
    count: MOCK_LIST_TASKS.filter((t) => t.priority === priority).length,
  }));

  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={BarChart3}
            size={15}
            className="text-teal-600 dark:text-teal-400"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Priority Breakdown
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab("list")}
          className="text-2xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
        >
          View list
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 h-20 px-1 pt-2">
        {counts.map(({ priority, count }) => {
          const heightPercent = (count / maxCount) * 100;
          return (
            <button
              key={priority}
              type="button"
              onClick={() => onNavigateTab("list")}
              className="flex flex-1 flex-col items-center justify-end h-full group"
              title={`${priority}: ${count} task${count === 1 ? "" : "s"}`}
            >
              <span className="text-2xs font-semibold text-foreground mb-1">
                {count}
              </span>
              <div
                className="w-full max-w-8 rounded-t-sm bg-foreground/25 transition-colors group-hover:bg-teal-500/70"
                style={{ height: `${Math.max(4, heightPercent)}%` }}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        {counts.map(({ priority }) => {
          const meta = PRIORITY_META[priority];
          return (
            <div
              key={priority}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 text-2xs font-medium",
                meta.textClass,
              )}
            >
              <Icon icon={meta.icon} size={12} />
              <span>{priority}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
