import { CalendarDays, CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { BoardTask } from "./mock-data";

const PRIORITY_BADGE_CLASSES: Record<BoardTask["priority"], string> = {
  High:
    "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300",
  Medium:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  Low:
    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

interface KanbanCardProps {
  task: BoardTask;
  isDone: boolean;
}

export function KanbanCard({ task, isDone }: KanbanCardProps) {
  const hasSubtasks =
    typeof task.subtasksDone === "number" &&
    typeof task.subtasksTotal === "number" &&
    task.subtasksTotal > 0;

  const subtaskPercent = hasSubtasks
    ? Math.round((task.subtasksDone! / task.subtasksTotal!) * 100)
    : 0;

  return (
    <div
      draggable
      className="bg-canvas-surface p-3.5 rounded-lg border border-border-subtle shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-canvas-overlay text-muted-foreground">
          {task.feature}
        </span>
        {isDone ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
            Completed
          </span>
        ) : (
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-semibold",
              PRIORITY_BADGE_CLASSES[task.priority],
            )}
          >
            {task.priority}
          </span>
        )}
      </div>

      <h4
        className={cn(
          "font-semibold text-sm mt-2 group-hover:text-teal-600 dark:group-hover:text-teal-400",
          isDone ? "line-through text-muted-foreground" : "text-foreground",
        )}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {isDone ? (
        task.completedDate && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-teal-600 dark:text-teal-400">
            <Icon icon={CheckCircle2} size={13} />
            <span>Completed {task.completedDate}</span>
          </div>
        )
      ) : (
        <>
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1.5 mt-3 text-xs",
                task.isOverdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground",
              )}
            >
              <Icon icon={CalendarDays} size={13} />
              <span>Due {task.dueDate}</span>
            </div>
          )}

          {hasSubtasks && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {task.subtasksDone} / {task.subtasksTotal} Sub-tasks Done
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-canvas-overlay overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${subtaskPercent}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-subtle text-xs">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground/70">
          {task.code}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[11px]">
            {task.assigneeName}
          </span>
          <span className="w-5 h-5 rounded-full bg-navy-500 dark:bg-foreground text-white dark:text-background flex items-center justify-center text-[9px] font-bold shrink-0">
            {task.assigneeInitials}
          </span>
        </div>
      </div>
    </div>
  );
}
