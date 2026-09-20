import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/types/project";
import { KanbanColumn } from "./kanban-column";
import { AddTaskDialog, type TaskFormValues } from "../add-task-dialog";
import {
  BOARD_ASSIGNEES,
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
  selectedMemberId?: string | null;
}

const ALL_VALUE = "all";

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function BoardTab({
  project,
  selectedMemberId: _selectedMemberId,
}: BoardTabProps) {
  const [tasks, setTasks] = useState<BoardTask[]>(MOCK_BOARD_TASKS);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [featureFilter, setFeatureFilter] = useState(ALL_VALUE);
  const [assigneeFilter, setAssigneeFilter] = useState(ALL_VALUE);
  const [priorityFilter, setPriorityFilter] = useState(ALL_VALUE);
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

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task: BoardTask) => {
      const matchesSearch =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        task.code.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query);

      const matchesFeature =
        featureFilter === ALL_VALUE || task.feature === featureFilter;

      const matchesAssignee =
        assigneeFilter === ALL_VALUE || task.assigneeName === assigneeFilter;

      const matchesPriority =
        priorityFilter === ALL_VALUE || task.priority === priorityFilter;

      return (
        matchesSearch && matchesFeature && matchesAssignee && matchesPriority
      );
    });
  }, [tasks, search, featureFilter, assigneeFilter, priorityFilter]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    featureFilter !== ALL_VALUE ||
    assigneeFilter !== ALL_VALUE ||
    priorityFilter !== ALL_VALUE;

  const clearFilters = () => {
    setSearch("");
    setFeatureFilter(ALL_VALUE);
    setAssigneeFilter(ALL_VALUE);
    setPriorityFilter(ALL_VALUE);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas-surface p-3 rounded-xl border border-border-subtle shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Icon
              icon={Search}
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search cards, tasks in ${project.name}...`}
              className="h-8 pl-8 pr-3 w-56 text-xs"
            />
          </div>

          <Select value={featureFilter} onValueChange={setFeatureFilter}>
            <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
              <SelectValue placeholder="All Features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Features</SelectItem>
              {BOARD_FEATURES.map((feature) => (
                <SelectItem key={feature} value={feature}>
                  {feature}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Assignees</SelectItem>
              {BOARD_ASSIGNEES.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-border-subtle bg-canvas-surface px-2 py-1 text-2xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-canvas-overlay"
            >
              <span>Clear filters</span>
              <Icon icon={X} size={11} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Drag cards across columns</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {BOARD_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={filteredTasks.filter((task) => task.column === column.id)}
            draggedTaskId={draggedTaskId}
            onDragStart={setDraggedTaskId}
            onDragEnd={() => setDraggedTaskId(null)}
            onDropTask={handleDropTask}
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
