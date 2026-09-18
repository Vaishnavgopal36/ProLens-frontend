import { KanbanCard } from "./kanban-card";
import type { BoardColumnMeta, BoardTask } from "./mock-data";

interface KanbanColumnProps {
  column: BoardColumnMeta;
  tasks: BoardTask[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  return (
    <div className="bg-canvas-overlay/70 border border-border-subtle rounded-xl p-3 flex flex-col min-h-[520px]">
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
              isDone={column.id === "done"}
            />
          ))
        )}
      </div>
    </div>
  );
}
