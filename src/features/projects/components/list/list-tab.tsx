import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  selectedMemberId?: string | null;
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

const ALL_VALUE = "all";
const LIST_FEATURES = ["Design System", "Authentication", "Reporting"];
const LIST_ASSIGNEES = ["Sarah Jenkins", "John Doe", "Mike Ross"];

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

export function ListTab({
  project,
  selectedMemberId: _selectedMemberId,
}: ListTabProps) {
  const [tasks, setTasks] = useState<ListTask[]>(MOCK_LIST_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [featureFilter, setFeatureFilter] = useState(ALL_VALUE);
  const [assigneeFilter, setAssigneeFilter] = useState(ALL_VALUE);
  const [priorityFilter, setPriorityFilter] = useState(ALL_VALUE);
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

  const editingTask = tasks.find((task) => task.id === editingTaskId);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        task.code.toLowerCase().includes(query);

      const matchesFeature =
        featureFilter === ALL_VALUE || task.feature === featureFilter;

      const matchesAssignee =
        assigneeFilter === ALL_VALUE || task.assignee === assigneeFilter;

      const matchesPriority =
        priorityFilter === ALL_VALUE || task.priority === priorityFilter;

      const matchesStatus =
        statusFilter === ALL_VALUE || task.status === statusFilter;

      return (
        matchesSearch &&
        matchesFeature &&
        matchesAssignee &&
        matchesPriority &&
        matchesStatus
      );
    });
  }, [
    tasks,
    searchQuery,
    featureFilter,
    assigneeFilter,
    priorityFilter,
    statusFilter,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    featureFilter !== ALL_VALUE ||
    assigneeFilter !== ALL_VALUE ||
    priorityFilter !== ALL_VALUE ||
    statusFilter !== ALL_VALUE;

  const clearFilters = () => {
    setSearchQuery("");
    setFeatureFilter(ALL_VALUE);
    setAssigneeFilter(ALL_VALUE);
    setPriorityFilter(ALL_VALUE);
    setStatusFilter(ALL_VALUE);
  };

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

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Icon
                icon={Search}
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 bg-canvas-surface pl-8 text-xs"
              />
            </div>

            <Select value={featureFilter} onValueChange={setFeatureFilter}>
              <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
                <SelectValue placeholder="All Features" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Features</SelectItem>
                {LIST_FEATURES.map((feature) => (
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
                {LIST_ASSIGNEES.map((assignee) => (
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-auto px-2 text-xs gap-1">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Statuses</SelectItem>
                <SelectItem value="Backlog">Backlog</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
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
