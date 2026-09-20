import * as React from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { ProjectMember } from "@/types/project";

interface MilestoneTask {
  id: string;
  code: string;
  title: string;
  dueDate: string;
  assignee: string;
  urgencyColor: string;
}

const ALL_TASKS: MilestoneTask[] = [
  {
    id: "t-1",
    code: "PROL-12",
    title: "UI Design & Prototyping",
    dueDate: "Due Sep 20",
    assignee: "Sarah Jenkins",
    urgencyColor: "bg-red-500",
  },
  {
    id: "t-2",
    code: "PROL-15",
    title: "API Integration & Mocks",
    dueDate: "Due Sep 22",
    assignee: "Elena Rostova",
    urgencyColor: "bg-amber-500",
  },
  {
    id: "t-3",
    code: "PROL-18",
    title: "Dashboard Widget Integration",
    dueDate: "Due Sep 25",
    assignee: "Alex Morgan",
    urgencyColor: "bg-teal-500",
  },
  {
    id: "t-4",
    code: "PROL-21",
    title: "Authentication Token Refresh Edge Cases",
    dueDate: "Due Sep 28",
    assignee: "Marcus Chen",
    urgencyColor: "bg-teal-500",
  },
];

interface UpcomingMilestonesCardProps {
  selectedMember: ProjectMember | null;
  activeSprintName?: string;
  onNavigateTab?: (tabValue: string) => void;
}

export function UpcomingMilestonesCard({
  selectedMember,
  activeSprintName = "Sprint 4",
  onNavigateTab,
}: UpcomingMilestonesCardProps) {
  // Filter tasks if an individual contributor is filtered
  const visibleTasks = React.useMemo(() => {
    if (!selectedMember) return ALL_TASKS;
    return ALL_TASKS.filter(
      (t) => t.assignee.toLowerCase() === selectedMember.name.toLowerCase(),
    );
  }, [selectedMember]);

  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={Calendar}
            size={15}
            className="text-teal-600 dark:text-teal-400"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming Tasks &amp; Milestones
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xs font-medium text-muted-foreground">
            Due in {activeSprintName}
          </span>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("list")}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
            >
              <span>View all</span>
              <Icon icon={ArrowRight} size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-border-subtle">
        {visibleTasks.length > 0 ? (
          visibleTasks.map((task) => (
            <div
              key={task.id}
              role={onNavigateTab ? "button" : undefined}
              tabIndex={onNavigateTab ? 0 : undefined}
              onClick={onNavigateTab ? () => onNavigateTab("list") : undefined}
              className={`flex items-center justify-between py-2.5 first:pt-1 last:pb-0 text-xs ${
                onNavigateTab
                  ? "cursor-pointer hover:bg-canvas-bg -mx-2 px-2 rounded-md transition-colors"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${task.urgencyColor}`}
                />
                <p className="font-medium text-foreground truncate">
                  {task.title}{" "}
                  <span className="text-muted-foreground/70 font-normal">
                    ({task.code})
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-2xs font-medium text-red-500 dark:text-red-400">
                  {task.dueDate}
                </span>
                <span className="rounded-md border border-border-subtle bg-canvas-bg px-2 py-0.5 text-3xs font-medium text-muted-foreground">
                  {task.assignee}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No active sprint tasks assigned to {selectedMember?.name}.
          </div>
        )}
      </div>
    </Card>
  );
}
