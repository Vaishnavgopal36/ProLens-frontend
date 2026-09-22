import * as React from "react";
import {
  ArrowLeft,
  ChevronRight,
  FolderOpen,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  MoreVertical,
  TrendingUp,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Minus,
  FileDown,
  Trash2,
  Copy,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  ActivityCardItem,
  ActivityDetailTask,
  ActivitySubtask,
} from "@/types/activity";

interface ActivityDetailPageProps {
  activity: ActivityCardItem;
  onBack: () => void;
  onUpdate: (updated: ActivityCardItem) => void;
  onDelete: (id: string) => void;
}

export function ActivityDetailPage({
  activity: initialActivity,
  onBack,
  onUpdate,
  onDelete,
}: ActivityDetailPageProps) {
  const [activity, setActivity] = React.useState<ActivityCardItem>(initialActivity);
  const [expandedTasks, setExpandedTasks] = React.useState<Record<string, boolean>>({
    [initialActivity.tasks?.[0]?.id || "task-1"]: true,
  });

  // Modal Dialogs
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Edit Form State
  const [editTitle, setEditTitle] = React.useState(activity.title);
  const [editDate, setEditDate] = React.useState(activity.date);
  const [editDuration, setEditDuration] = React.useState(activity.duration);
  const [editDesc, setEditDesc] = React.useState(activity.description);

  // Tasks list (local reactive copy)
  const tasks: ActivityDetailTask[] = activity.tasks || [];

  // Toggle Accordion Collapse
  const toggleAccordion = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Progress Calculations
  const stats = React.useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    tasks.forEach((t) => {
      if (t.completed) {
        completed++;
      } else {
        const hasSubChecked = t.subtasks?.some((st) => st.completed);
        if (hasSubChecked) {
          inProgress++;
        } else {
          pending++;
        }
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, percent };
  }, [tasks]);

  // Master Task Toggle
  const handleToggleTask = (taskId: string) => {
    const nextTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          subtasks: task.subtasks?.map((st) => ({
            ...st,
            completed: nextCompleted,
          })),
        };
      }
      return task;
    });

    const updated = { ...activity, tasks: nextTasks };
    setActivity(updated);
    onUpdate(updated);
  };

  // Subtask Toggle
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const nextTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const nextSubtasks = task.subtasks?.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allDone = nextSubtasks?.every((st) => st.completed) ?? false;
        return {
          ...task,
          completed: allDone,
          subtasks: nextSubtasks,
        };
      }
      return task;
    });

    const updated = { ...activity, tasks: nextTasks };
    setActivity(updated);
    onUpdate(updated);
  };

  // Quick Add Task
  const handleQuickAddTask = () => {
    const taskName = prompt("Enter new task deliverable name:");
    if (!taskName?.trim()) return;

    const newTask: ActivityDetailTask = {
      id: `task-${Date.now()}`,
      title: taskName.trim(),
      duration: "—",
      scope: "New task item created for this review milestone.",
      completed: false,
      subtasks: [
        { id: `st-${Date.now()}-1`, title: "Initial requirement setup", completed: false },
      ],
    };

    const nextTasks = [...tasks, newTask];
    const updated = { ...activity, tasks: nextTasks, tasksCount: nextTasks.length };
    setActivity(updated);
    onUpdate(updated);
    setExpandedTasks((prev) => ({ ...prev, [newTask.id]: true }));
    toast.success("Task added to activity.");
  };

  // Save Edit Details
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ActivityCardItem = {
      ...activity,
      title: editTitle.trim(),
      date: editDate.trim(),
      duration: editDuration.trim(),
      loggedHours: editDuration.trim(),
      description: editDesc.trim(),
    };
    setActivity(updated);
    onUpdate(updated);
    setEditOpen(false);
    toast.success("Activity details updated.");
  };

  const isCompleted = stats.percent === 100;
  const circumference = 263.89; // 2 * Math.PI * 42
  const strokeDashoffset = circumference - (stats.percent / 100) * circumference;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="w-full rounded-xl border border-border-subtle bg-canvas-surface p-6 shadow-xs">
        <div className="flex flex-col gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline transition-all group"
            >
              <Icon
                icon={ArrowLeft}
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span>Back to My Activity</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span onClick={onBack} className="hover:text-foreground cursor-pointer">
                Activity
              </span>
              <Icon icon={ChevronRight} size={13} />
              <span className="text-foreground font-semibold truncate max-w-[200px]">
                {activity.title}
              </span>
            </div>
          </div>

          {/* Activity Title + Status + Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {activity.title}
                </h1>
                <Badge
                  variant={isCompleted ? "success" : "warning"}
                  className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
                >
                  {isCompleted ? "Completed" : "In Progress"}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    activity.type === "project"
                      ? "border-teal-500/40 text-teal-600 bg-teal-500/10 dark:text-teal-400 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5"
                      : "border-border-subtle text-muted-foreground bg-canvas-bg text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5"
                  }
                >
                  {activity.type === "project" ? "Project Activity" : "Non-Project Activity"}
                </Badge>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Icon icon={FolderOpen} size={14} className="text-teal-600 dark:text-teal-400" />
                  <span>{activity.projectName || activity.streamName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Icon icon={CalendarIcon} size={13} />
                  <span>{activity.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Icon icon={Clock} size={13} />
                  <span>{activity.scheduledTime || "10:00 AM – 12:00 PM"}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-1.5 text-xs font-semibold h-9"
              >
                <Icon icon={Edit} size={14} />
                <span>Edit Activity</span>
              </Button>

              <Button
  variant="outline"
  size="icon"
  onClick={() => setDeleteOpen(true)}
  className="h-9 w-9 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
  title="Delete Activity"
>
  <Icon icon={Trash2} size={15} />
</Button>

            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid: Left Column (70%) + Right Column (30%) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* 1. Activity Overview Card */}
          <Card className="p-6 border-border-subtle bg-canvas-surface space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                <h2 className="text-base font-bold text-foreground">Activity Overview</h2>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                {activity.referenceCode || "REF-REV-2026-09"}
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-border-subtle bg-canvas-bg/50 p-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Activity Name
                </p>
                <p className="font-semibold text-foreground mt-0.5">{activity.title}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Project</p>
                <p className="font-semibold text-teal-600 dark:text-teal-400 mt-0.5 flex items-center gap-1">
                  <Icon icon={FolderOpen} size={13} />
                  <span>{activity.projectName || activity.streamName}</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground mt-0.5">{activity.date}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Scheduled Time
                </p>
                <p className="font-semibold text-foreground mt-0.5 font-mono">
                  {activity.scheduledTime || "10:00 AM – 12:00 PM"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Logged Duration
                </p>
                <p className="font-semibold text-foreground mt-0.5 font-mono">
                  {activity.duration}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Assigned Lead
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-5 w-5 rounded-full bg-teal-700 text-white font-bold text-[9px] flex items-center justify-center">
                    {activity.assignedLead?.initials || "LK"}
                  </div>
                  <span className="font-semibold text-foreground">
                    {activity.assignedLead?.name || "Lakshitha"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Scope */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Session Scope &amp; Brief
              </span>
              <p className="text-muted-foreground leading-relaxed rounded-lg border border-border-subtle bg-canvas-bg/30 p-3.5">
                {activity.description}
              </p>
            </div>
          </Card>

          {/* 2. Tasks & Deliverables Section */}
          <Card className="p-6 border-border-subtle bg-canvas-surface space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Tasks &amp; Deliverables</h2>
                <p className="text-xs text-muted-foreground">
                  Track the work completed as part of this activity session.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickAddTask}
                className="gap-1.5 text-xs text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/10 font-semibold self-start sm:self-auto"
              >
                <Icon icon={Plus} size={14} />
                <span>New Task</span>
              </Button>
            </div>

            {/* Overall Task Progress Linear Bar */}
            <div className="rounded-xl border border-border-subtle bg-canvas-bg/50 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Icon
                    icon={TrendingUp}
                    size={16}
                    className="text-teal-600 dark:text-teal-400"
                  />
                  <span className="font-bold text-foreground">Overall Completion Rate</span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {stats.completed} of {stats.total} tasks completed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px] font-semibold">
                    Completed: {stats.completed}
                  </Badge>
                  <Badge variant="warning" className="text-[10px] font-semibold">
                    In Progress: {stats.inProgress}
                  </Badge>
                  <Badge variant="neutral" className="text-[10px] font-semibold">
                    Pending: {stats.pending}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar Fill */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-500 rounded-full"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
            </div>

            {/* Interactive Accordion Task List */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const isExpanded = !!expandedTasks[task.id];
                const subCount = task.subtasks?.length || 0;
                const subDone = task.subtasks?.filter((s) => s.completed).length || 0;
                const subPercent = subCount > 0 ? Math.round((subDone / subCount) * 100) : 0;

                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-border-subtle bg-canvas-bg/40 overflow-hidden transition-all"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleAccordion(task.id)}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-canvas-bg/80 select-none transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id);
                          }}
                          className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                        />
                        <div className="flex flex-col min-w-0">
                          <span
                            className={cn(
                              "text-xs font-bold truncate",
                              task.completed ? "line-through text-muted-foreground" : "text-foreground"
                            )}
                          >
                            {task.title}
                          </span>
                          {task.duration && (
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Icon icon={Clock} size={11} />
                              <span>{task.duration}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant={
                            task.completed
                              ? "success"
                              : subDone > 0
                              ? "warning"
                              : "neutral"
                          }
                          className="text-[10px] font-semibold"
                        >
                          {task.completed
                            ? "Completed"
                            : subDone > 0
                            ? "In Progress"
                            : "Pending"}
                        </Badge>
                        <Icon
                          icon={ChevronDown}
                          size={16}
                          className={cn(
                            "text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="p-4 pt-1 space-y-4 border-t border-border-subtle/60 text-xs">
                        {/* Scope */}
                        {task.scope && (
                          <div className="rounded-lg border border-border-subtle bg-canvas-surface p-3 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Scope
                            </span>
                            <p className="text-foreground leading-relaxed">{task.scope}</p>
                          </div>
                        )}

                        {/* Subtasks Progress */}
                        {subCount > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                                Subtasks Checklist
                              </span>
                              <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">
                                {subDone} / {subCount} completed ({subPercent}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                                style={{ width: `${subPercent}%` }}
                              />
                            </div>

                            {/* Subtask items */}
                            <div className="space-y-1.5 pt-1">
                              {task.subtasks?.map((subtask: ActivitySubtask) => (
                                <label
                                  key={subtask.id}
                                  className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-canvas-surface transition-colors cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => handleToggleSubtask(task.id, subtask.id)}
                                    className="h-3.5 w-3.5 rounded accent-teal-600 cursor-pointer"
                                  />
                                  <span
                                    className={cn(
                                      "text-xs leading-none",
                                      subtask.completed
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground"
                                    )}
                                  >
                                    {subtask.title}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Modules Specs (if any) */}
                        {task.modules && task.modules.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                              Modules &amp; Component Specs
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {task.modules.map((mod) => (
                                <div
                                  key={mod.id}
                                  className="rounded-lg border border-border-subtle bg-canvas-surface p-3 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-foreground">{mod.title}</span>
                                    {mod.status === "verified" ? (
                                      <Icon
                                        icon={CheckCircle2}
                                        size={14}
                                        className="text-emerald-500"
                                      />
                                    ) : mod.status === "pending" ? (
                                      <Icon
                                        icon={Clock3}
                                        size={14}
                                        className="text-amber-500"
                                      />
                                    ) : (
                                      <Icon
                                        icon={Minus}
                                        size={14}
                                        className="text-muted-foreground"
                                      />
                                    )}
                                  </div>
                                  <div className="space-y-0.5 text-[11px] text-muted-foreground pl-1">
                                    {mod.specs.map((sp, idx) => (
                                      <p key={idx}>• {sp}</p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Quick Summary Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card className="p-6 border-border-subtle bg-canvas-surface space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-foreground">Quick Summary</h3>
              <Badge
                variant={isCompleted ? "success" : "warning"}
                className="text-[10px] uppercase font-bold"
              >
                {isCompleted ? "Completed" : "In Progress"}
              </Badge>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border-subtle bg-canvas-bg/50">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/40 fill-none"
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-teal-600 dark:text-teal-400 fill-none transition-all duration-500"
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground font-mono">
                    {stats.percent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">Completed</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                {stats.completed} of {stats.total} Deliverables finished
              </p>
            </div>

            {/* Properties List */}
            <div className="divide-y divide-border-subtle/80 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Icon icon={FolderOpen} size={14} />
                  <span>Project</span>
                </span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {activity.projectName || activity.streamName}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Assigned To</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-teal-700 text-white font-bold text-[9px] flex items-center justify-center">
                    {activity.assignedLead?.initials || "LK"}
                  </div>
                  <span className="font-semibold text-foreground">
                    {activity.assignedLead?.name || "Lakshitha"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Priority</span>
                <Badge variant="destructive" className="text-[10px] font-bold">
                  {activity.priority || "High"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-semibold text-foreground">{activity.date}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Logged Time</span>
                <span className="font-mono font-semibold text-foreground">
                  {activity.duration}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Signoff Status</span>
                <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  Pending Lead Approval
                </span>
              </div>
            </div>

            {/* Export Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Activity report exported as PDF")}
              className="w-full gap-2 text-xs font-semibold h-9"
            >
              <Icon icon={FileDown} size={15} />
              <span>Export Activity Report</span>
            </Button>
          </Card>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Activity Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update scope, duration, and session specifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label htmlFor="edit-title">Activity Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" className="font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete activity?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>"{activity.title}"</strong>? This will permanently
              remove all associated tasks and logged hours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(activity.id);
                setDeleteOpen(false);
                onBack();
              }}
            >
              Delete Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}