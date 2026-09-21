import { useMemo, useState } from "react";
import { FilterBar } from "@/components/composed/filters";
import {
  DensityToggle,
  useCardDensity,
} from "@/components/composed/view-toggle";
import { useFilters } from "@/components/composed/filters";
import type { FilterFieldDef } from "@/components/composed/filters";
import { useProjectViewer } from "../../hooks/use-project-filter-fields";
import type { Project } from "@/types/project";
import { KanbanColumn } from "./kanban-column";
import { AddTaskDialog, type TaskFormValues } from "../add-task-dialog";
import {
  BOARD_COLUMNS,
  BOARD_FEATURES,
  MOCK_BOARD_TASKS,
  type BoardColumnId,
  type BoardTask,
} from "./mock-data";

const STATUS_TO_COLUMN: Record<TaskFormValues["status"], BoardColumnId> = {
  Backlog: "backlog",
  "In Progress": "in_progress",
  Delivered: "delivered",
};

const COLUMN_TO_STATUS: Record<BoardColumnId, TaskFormValues["status"]> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  delivered: "Delivered",
};

function taskToFormValues(task: BoardTask): Partial<TaskFormValues> {
  return {
    title: task.title,
    description: task.description ?? "",
    feature: task.feature,
    status: COLUMN_TO_STATUS[task.column],
    priority: task.priority,
    assignee: task.assigneeName,
    estimatedHours: "16",
    loggedHours: "0",
    labels: [],
    subtasks: Array.from({ length: task.subtasksTotal ?? 0 }, (_, i) => ({
      id: `${task.id}-sub-${i}`,
      title: `Sub-task ${i + 1}`,
      done: i < (task.subtasksDone ?? 0),
    })),
  };
}

interface BoardTabProps {
  project: Project;
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function BoardTab({ project }: BoardTabProps) {
  const [tasks, setTasks] = useState<BoardTask[]>(MOCK_BOARD_TASKS);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [touchHoverColumn, setTouchHoverColumn] =
    useState<BoardColumnId | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

  const editingTask = tasks.find((task) => task.id === editingTaskId);

  const handleCardClick = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsTaskSheetOpen(true);
  };

  const handleSaveTask = (values: TaskFormValues, taskId?: string) => {
    if (!taskId) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextColumn = STATUS_TO_COLUMN[values.status];
        return {
          ...task,
          title: values.title,
          description: values.description || undefined,
          feature: values.feature,
          priority: values.priority,
          assigneeName: values.assignee,
          column: nextColumn,
          completedDate:
            nextColumn === "delivered"
              ? (task.completedDate ?? formatToday())
              : undefined,
          subtasksTotal: values.subtasks.length || undefined,
          subtasksDone:
            values.subtasks.length > 0
              ? values.subtasks.filter((s) => s.done).length
              : undefined,
        };
      }),
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleDropTask = (taskId: string, columnId: BoardColumnId) => {
    setDraggedTaskId(null);
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId || task.column === columnId) return task;
        return {
          ...task,
          column: columnId,
          completedDate:
            columnId === "delivered"
              ? (task.completedDate ?? formatToday())
              : task.completedDate,
        };
      }),
    );
  };

  const viewer = useProjectViewer<BoardTask>(project, (t) => t.assigneeName);
  const scopedTasks = useMemo(() => viewer.scope(tasks), [tasks, viewer]);
  const fields: FilterFieldDef<BoardTask>[] = [
    ...viewer.peopleField,
    {
      key: "feature",
      label: "Feature",
      options: BOARD_FEATURES.map((f) => ({ value: f, label: f })),
      accessor: (t) => t.feature,
    },
    {
      key: "priority",
      label: "Priority",
      options: ["High", "Medium", "Low"].map((p) => ({ value: p, label: p })),
      accessor: (t) => t.priority,
    },
  ];
  const filters = useFilters(scopedTasks, fields, (t) =>
    [t.title, t.code, t.description ?? ""].join(" "),
  );
  const filteredTasks = filters.filtered;
  const [density, setDensity] = useCardDensity("board");

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        filters={filters}
        searchPlaceholder={`Search cards, tasks in ${project.name}...`}
      >
        <span className="hidden text-xs text-muted-foreground lg:inline">
          Drag cards across columns (long-press on touch)
        </span>
        <DensityToggle value={density} onChange={setDensity} />
      </FilterBar>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {BOARD_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            density={density}
            tasks={filteredTasks.filter((task) => task.column === column.id)}
            draggedTaskId={draggedTaskId}
            onDragStart={setDraggedTaskId}
            onDragEnd={() => setDraggedTaskId(null)}
            onDropTask={handleDropTask}
            isTouchTarget={touchHoverColumn === column.id}
            onTouchHover={setTouchHoverColumn}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {editingTask && (
        <AddTaskDialog
          project={project}
          open={isTaskSheetOpen}
          onOpenChange={(next) => {
            setIsTaskSheetOpen(next);
            if (!next) setEditingTaskId(null);
          }}
          taskId={editingTask.id}
          initialValues={taskToFormValues(editingTask)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
