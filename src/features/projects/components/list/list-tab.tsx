import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/types/project";
import {
  MOCK_LIST_TASKS,
  type TaskPriority,
  type TaskStatus,
} from "./mock-data";

interface ListTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  High: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  Medium:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Low: "bg-muted text-muted-foreground",
};

const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  "In Progress":
    "bg-teal-500/10 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  Done: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  Backlog: "bg-muted text-muted-foreground",
};

export function ListTab({ project, selectedMemberId: _selectedMemberId }: ListTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return MOCK_LIST_TASKS;
    return MOCK_LIST_TASKS.filter((task) =>
      task.title.toLowerCase().includes(query) ||
      task.code.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden p-0 shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              All Tasks ({filteredTasks.length})
            </span>
            <span className="text-xs text-muted-foreground">
              {project.name} Stream
            </span>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="accent" size="sm" className="h-8 gap-1 text-xs">
              <Icon icon={Plus} size={15} />
              Add Task
            </Button>
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
                const isDone = task.status === "Done";
                return (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-canvas-overlay/40"
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {task.code}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isDone
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
                        className="border-transparent bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
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
                        className={`border-transparent px-2 py-0.5 text-[11px] font-semibold ${
                          PRIORITY_BADGE_CLASS[task.priority]
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-transparent px-2 py-0.5 text-[11px] font-semibold ${
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
                          : isDone
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
    </div>
  );
}
