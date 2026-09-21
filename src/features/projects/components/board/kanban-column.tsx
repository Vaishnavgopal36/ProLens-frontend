import { useState } from "react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import type { BoardColumnId, BoardColumnMeta, BoardTask } from "./mock-data";

interface KanbanColumnProps {
  column: BoardColumnMeta;
  tasks: BoardTask[];
  density?: "compact" | "expanded";
  draggedTaskId: string | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDropTask: (taskId: string, columnId: BoardColumnId) => void;
  onCardClick: (taskId: string) => void;
  /** True while a finger dragging a card is over this column. */
  isTouchTarget: boolean;
  onTouchHover: (columnId: BoardColumnId | null) => void;
}

export function KanbanColumn({
  column,
  tasks,
  density,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  onDropTask,
  onCardClick,
  isTouchTarget,
  onTouchHover,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      data-kanban-column={column.id}
      onDragOver={(event) => {
        if (!draggedTaskId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        const taskId = event.dataTransfer.getData("text/plain");
        if (taskId) onDropTask(taskId, column.id);
      }}
      className={cn(
        "bg-canvas-overlay/70 border border-border-subtle rounded-xl p-3 flex flex-col min-h-[520px] transition-colors",
        (isDragOver || isTouchTarget) && "border-teal-500 bg-teal-500/5",
      )}
    >
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.dotClassName}`} />
          <h3 className="font-bold text-sm text-foreground">{column.title}</h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${column.countBadgeClassName}`}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 p-1">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-8">
            No matching cards
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              isDelivered={column.id === "delivered"}
              density={density}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onCardClick}
              onMoveTask={onDropTask}
              onTouchHover={onTouchHover}
            />
          ))
        )}
      </div>
    </div>
  );
}
