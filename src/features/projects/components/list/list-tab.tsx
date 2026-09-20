import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/composed/filters";
import { useFilters } from "@/components/composed/filters";
import type { FilterFieldDef } from "@/components/composed/filters";
import { useProjectViewer } from "../../hooks/use-project-filter-fields";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/types/project";
import { AddTaskDialog, type TaskFormValues } from "../add-task-dialog";
import {
  MOCK_LIST_TASKS,
  type ListTask,
  type TaskPriority,
  type TaskStatus,
} from "./mock-data";

interface ListTabProps {
  project: Project;
}

const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  High: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Low: "bg-muted text-muted-foreground",
};

const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  "In Progress":
    "bg-teal-500/10 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  Delivered: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  Backlog: "bg-muted text-muted-foreground",
};

const LIST_FEATURES = ["Design System", "Authentication", "Reporting"];

function taskToFormValues(task: ListTask): Partial<TaskFormValues> {
  return {
    title: task.title,
    description: "",
    feature: task.feature,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    estimatedHours: String(task.estimatedHours),
    loggedHours: String(task.loggedHours),
    labels: [],
    subtasks: Array.from({ length: task.subtasksTotal }, (_, i) => ({
      id: `${task.id}-sub-${i}`,
      title: `Sub-task ${i + 1}`,
      done: i < task.subtasksCompleted,
    })),
  };
}

export function ListTab({ project }: ListTabProps) {
  const [tasks, setTasks] = useState<ListTask[]>(MOCK_LIST_TASKS);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

  const editingTask = tasks.find((task) => task.id === editingTaskId);

  const viewer = useProjectViewer<ListTask>(project, (t) => t.assignee);
  const scopedTasks = useMemo(() => viewer.scope(tasks), [tasks, viewer]);
  const fields: FilterFieldDef<ListTask>[] = [
    ...viewer.peopleField,
    {
      key: "feature",
      label: "Feature",
      options: LIST_FEATURES.map((f) => ({ value: f, label: f })),
      accessor: (t) => t.feature,
    },
    {
      key: "priority",
      label: "Priority",
      options: ["High", "Medium", "Low"].map((p) => ({ value: p, label: p })),
      accessor: (t) => t.priority,
    },
    {
      key: "status",
      label: "Status",
      options: ["Backlog", "In Progress", "Delivered"].map((s) => ({
        value: s,
        label: s,
      })),
      accessor: (t) => t.status,
    },
  ];
  const filters = useFilters(scopedTasks, fields, (t) =>
    [t.title, t.code].join(" "),
  );
  const filteredTasks = filters.filtered;

  const handleRowClick = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsTaskSheetOpen(true);
  };

  const handleSaveTask = (values: TaskFormValues, taskId?: string) => {
    if (!taskId) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          title: values.title,
          feature: values.feature,
          assignee: values.assignee,
          priority: values.priority,
          status: values.status,
          subtasksTotal: values.subtasks.length,
          subtasksCompleted: values.subtasks.filter((s) => s.done).length,
          loggedHours: Number(values.loggedHours) || 0,
          estimatedHours: Number(values.estimatedHours) || 0,
        };
      }),
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden p-0 shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">
                All Tasks ({filteredTasks.length})
              </span>
              <span className="text-xs text-muted-foreground">
                {project.name} Stream
              </span>
            </div>
          </div>

          <FilterBar filters={filters} searchPlaceholder="Search tasks..." />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Task</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Sub-tasks</TableHead>
                <TableHead className="pr-4">Effort</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const isDelivered = task.status === "Delivered";
                return (
                  <TableRow
                    key={task.id}
                    onClick={() => handleRowClick(task.id)}
                    className="cursor-pointer hover:bg-canvas-overlay/40"
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-2xs text-muted-foreground">
                          {task.code}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isDelivered
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-transparent bg-muted px-2 py-0.5 text-2xs font-medium text-muted-foreground"
                      >
                        {task.feature}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">
                      {task.assignee}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-transparent px-2 py-0.5 text-2xs font-semibold ${
                          PRIORITY_BADGE_CLASS[task.priority]
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-transparent px-2 py-0.5 text-2xs font-semibold ${
                          STATUS_BADGE_CLASS[task.status]
                        }`}
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-xs font-medium ${
                        task.isOverdue
                          ? "text-rose-600 dark:text-rose-400"
                          : isDelivered
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {task.dueDate}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {task.subtasksCompleted}/{task.subtasksTotal} Completed
                    </TableCell>
                    <TableCell className="pr-4 font-mono text-xs text-foreground">
                      {task.loggedHours}h / {task.estimatedHours}h
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    No tasks match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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
