import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  BOARD_ASSIGNEES,
  BOARD_COLUMNS,
  BOARD_FEATURES,
  MOCK_BOARD_TASKS,
  type BoardTask,
} from "./mock-data";

interface BoardTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

const ALL_VALUE = "all";

export function BoardTab({ project, selectedMemberId: _selectedMemberId }: BoardTabProps) {
  const [search, setSearch] = useState("");
  const [featureFilter, setFeatureFilter] = useState(ALL_VALUE);
  const [assigneeFilter, setAssigneeFilter] = useState(ALL_VALUE);
  const [priorityFilter, setPriorityFilter] = useState(ALL_VALUE);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return MOCK_BOARD_TASKS.filter((task: BoardTask) => {
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
  }, [search, featureFilter, assigneeFilter, priorityFilter]);

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
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Drag cards across columns</span>
          <Button
            variant="accent"
            size="sm"
            className="h-8 gap-1 text-xs font-bold bg-gold-500 hover:bg-gold-600 text-navy-900 dark:text-navy-950"
          >
            <Icon icon={Plus} size={15} />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {BOARD_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={filteredTasks.filter((task) => task.column === column.id)}
          />
        ))}
      </div>
    </div>
  );
}
