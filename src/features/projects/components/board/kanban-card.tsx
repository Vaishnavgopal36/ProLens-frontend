import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ArrowLeftRight,
  Check,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLongPressDrag } from "@/hooks/use-long-press-drag";
import { BOARD_COLUMNS, type BoardColumnId, type BoardTask } from "./mock-data";
import { PRIORITY_BADGE_CLASSES } from "@/features/projects/lib/badge-styles";

interface KanbanCardProps {
  task: BoardTask;
  isDelivered: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onClick: (taskId: string) => void;
  onMoveTask: (taskId: string, columnId: BoardColumnId) => void;
  /** Column currently under a touch drag (null when not dragging). */
  onTouchHover: (columnId: BoardColumnId | null) => void;
}

export function KanbanCard({
  task,
  isDelivered,
  onDragStart,
  onDragEnd,
  onClick,
  onMoveTask,
  onTouchHover,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const columnAt = (target: Element | null) =>
    (target?.closest("[data-kanban-column]") as HTMLElement | null)?.dataset
      .kanbanColumn as BoardColumnId | undefined;

  // Touch screens can't use HTML5 drag-and-drop: press and hold, then slide.
  const touchDrag = useLongPressDrag<HTMLDivElement>({
    onHover: (target) => onTouchHover(columnAt(target) ?? null),
    onDrop: (target) => {
      const columnId = columnAt(target);
      if (columnId) onMoveTask(task.id, columnId);
    },
  });

  const hasSubtasks =
    typeof task.subtasksDone === "number" &&
    typeof task.subtasksTotal === "number" &&
    task.subtasksTotal > 0;

  const subtaskPercent = hasSubtasks
    ? Math.round((task.subtasksDone! / task.subtasksTotal!) * 100)
    : 0;

  return (
    <div
      ref={touchDrag.ref}
      draggable
      onDragStart={(event) => {
        // A long press can also start a native drag on some browsers; the
        // touch drag owns that gesture.
        if (touchDrag.dragging) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData("text/plain", task.id);
        event.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
        onDragStart(task.id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd();
      }}
      onClick={() => {
        // The release of a touch drag also fires a click; ignore that one.
        if (!touchDrag.wasDragged()) onClick(task.id);
      }}
      style={
        touchDrag.dragging
          ? {
              transform: `translate3d(${touchDrag.offset.x}px, ${touchDrag.offset.y}px, 0) scale(1.03)`,
            }
          : undefined
      }
      className={cn(
        "bg-canvas-surface p-3.5 rounded-lg border border-border-subtle shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition group [-webkit-touch-callout:none]",
        isDragging && "opacity-40",
        // Lifted while a finger is dragging it: above siblings, no hit-testing
        // (so the column beneath can be found), and no transition lag.
        touchDrag.dragging &&
          "pointer-events-none relative z-50 rotate-1 cursor-grabbing shadow-xl transition-none",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-canvas-overlay text-muted-foreground">
          {task.feature}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isDelivered ? (
            <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
              Completed
            </span>
          ) : (
            <span
              className={cn(
                "px-2 py-0.5 rounded text-3xs font-semibold",
                PRIORITY_BADGE_CLASSES[task.priority],
              )}
            >
              {task.priority}
            </span>
          )}

          {/* Touch-friendly move control — native HTML5 drag-and-drop
              (used below) has no touch support on mobile browsers. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                aria-label="Move card to another column"
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-canvas-overlay hover:text-foreground transition-colors"
              >
                <Icon icon={ArrowLeftRight} size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40"
              onClick={(event) => event.stopPropagation()}
            >
              {BOARD_COLUMNS.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  className="gap-2 cursor-pointer text-xs justify-between"
                  onClick={() => onMoveTask(task.id, col.id)}
                >
                  <span>{col.title}</span>
                  {col.id === task.column && <Icon icon={Check} size={13} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h4
        className={cn(
          "font-semibold text-sm mt-2 group-hover:text-teal-600 dark:group-hover:text-teal-400",
          isDelivered
            ? "line-through text-muted-foreground"
            : "text-foreground",
        )}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {isDelivered ? (
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
              <div className="flex items-center justify-between text-2xs text-muted-foreground">
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
        <span className="tabular-nums text-2xs font-semibold text-muted-foreground/70">
          {task.code}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-2xs">
            {task.assigneeName}
          </span>
          <span className="w-5 h-5 rounded-full bg-navy-500 dark:bg-foreground text-white dark:text-background flex items-center justify-center text-4xs font-bold shrink-0">
            {task.assigneeInitials}
          </span>
        </div>
      </div>
    </div>
  );
}
