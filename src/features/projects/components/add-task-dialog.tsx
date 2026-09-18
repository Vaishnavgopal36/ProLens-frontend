import * as React from "react";
import {
  ListTodo,
  Clock,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";
import { useAuth } from "@/app/providers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AttachmentUploadField,
  type AttachmentEntry,
} from "@/features/projects/components/attachment-upload-field";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";

const FEATURE_OPTIONS = [
  "Design System",
  "Authentication",
  "Reporting",
  "QA & Hardening",
];

const ASSIGNEE_OPTIONS = ["Sarah Jenkins", "John Doe", "Mike Ross"];

export type TaskFormStatus = "Backlog" | "In Progress" | "Delivered";
export type TaskFormPriority = "High" | "Medium" | "Low";

export interface TaskFormSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskFormValues {
  title: string;
  description: string;
  feature: string;
  status: TaskFormStatus;
  priority: TaskFormPriority;
  assignee: string;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours: string;
  loggedHours: string;
  labels: string[];
  subtasks: TaskFormSubtask[];
  attachments: AttachmentEntry[];
}

interface AddTaskDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presence signals edit mode; undefined/omitted means create mode. */
  taskId?: string;
  /** Prefill values when editing an existing task. */
  initialValues?: Partial<TaskFormValues>;
  onSave?: (values: TaskFormValues, taskId?: string) => void;
  onDelete?: (taskId: string) => void;
}

const DEFAULT_VALUES: TaskFormValues = {
  title: "",
  description: "",
  feature: FEATURE_OPTIONS[0],
  status: "Backlog",
  priority: "Medium",
  assignee: ASSIGNEE_OPTIONS[0],
  startDate: undefined,
  dueDate: undefined,
  estimatedHours: "16",
  loggedHours: "0",
  labels: [],
  subtasks: [],
  attachments: [],
};

function formatDate(date: Date | undefined, placeholder: string) {
  if (!date) return placeholder;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AddTaskDialog({
  project,
  open,
  onOpenChange,
  taskId,
  initialValues,
  onSave,
  onDelete,
}: AddTaskDialogProps) {
  const { user } = useAuth();
  const isEditMode = !!taskId;

  // "view" is a read-only overview (only reachable in edit mode); "edit" is
  // the editable form, used directly for creation and toggled into for edits.
  const [mode, setMode] = React.useState<"view" | "edit">(
    isEditMode ? "view" : "edit",
  );
  const editSnapshotRef = React.useRef<TaskFormValues>(DEFAULT_VALUES);

  const [title, setTitle] = React.useState(DEFAULT_VALUES.title);
  const [description, setDescription] = React.useState(
    DEFAULT_VALUES.description,
  );
  const [feature, setFeature] = React.useState(DEFAULT_VALUES.feature);
  const [status, setStatus] = React.useState<TaskFormStatus>(
    DEFAULT_VALUES.status,
  );
  const [priority, setPriority] = React.useState<TaskFormPriority>(
    DEFAULT_VALUES.priority,
  );
  const [assignee, setAssignee] = React.useState(DEFAULT_VALUES.assignee);
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    DEFAULT_VALUES.startDate,
  );
  const [dueDate, setDueDate] = React.useState<Date | undefined>(
    DEFAULT_VALUES.dueDate,
  );
  const [estimatedHours, setEstimatedHours] = React.useState(
    DEFAULT_VALUES.estimatedHours,
  );
  const [loggedHours, setLoggedHours] = React.useState(
    DEFAULT_VALUES.loggedHours,
  );
  const [labels, setLabels] = React.useState<string[]>(DEFAULT_VALUES.labels);
  const [labelInput, setLabelInput] = React.useState("");
  const [subtasks, setSubtasks] = React.useState<TaskFormSubtask[]>(
    DEFAULT_VALUES.subtasks,
  );
  const [attachments, setAttachments] = React.useState<AttachmentEntry[]>(
    DEFAULT_VALUES.attachments,
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = React.useState(false);
  const [isDueCalendarOpen, setIsDueCalendarOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const applyValues = (values: TaskFormValues) => {
    setTitle(values.title);
    setDescription(values.description);
    setFeature(values.feature);
    setStatus(values.status);
    setPriority(values.priority);
    setAssignee(values.assignee);
    setStartDate(values.startDate);
    setDueDate(values.dueDate);
    setEstimatedHours(values.estimatedHours);
    setLoggedHours(values.loggedHours);
    setLabels(values.labels);
    setSubtasks(values.subtasks);
    setAttachments(values.attachments);
  };

  // Sync form state whenever the sheet opens, seeding from initialValues in
  // edit mode or resetting to defaults in create mode.
  React.useEffect(() => {
    if (!open) return;

    const values = { ...DEFAULT_VALUES, ...initialValues };
    applyValues(values);
    editSnapshotRef.current = values;
    setMode(isEditMode ? "view" : "edit");
    setLabelInput("");
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  const resetForm = () => {
    applyValues(DEFAULT_VALUES);
    setLabelInput("");
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
    setError(null);
  };

  const buildValues = (
    overrides: Partial<TaskFormValues> = {},
  ): TaskFormValues => ({
    title: title.trim(),
    description: description.trim(),
    feature,
    status,
    priority,
    assignee,
    startDate,
    dueDate,
    estimatedHours,
    loggedHours,
    labels,
    subtasks,
    attachments,
    ...overrides,
  });

  // Subtasks and attachments are quick, additive actions — when browsing
  // the read-only overview they save immediately instead of requiring Edit.
  const maybeAutoSave = (overrides: Partial<TaskFormValues>) => {
    if (mode === "view" && isEditMode) {
      onSave?.(buildValues(overrides), taskId);
    }
  };

  const commitLabelInput = () => {
    const parts = labelInput
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setLabels((prev) => Array.from(new Set([...prev, ...parts])));
    setLabelInput("");
  };

  const removeLabel = (label: string) => {
    setLabels((prev) => prev.filter((item) => item !== label));
  };

  const addSubtask = () => {
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;
    setSubtasks((prev) => {
      const next = [
        ...prev,
        { id: `sub-${Date.now()}-${prev.length}`, title: trimmed, done: false },
      ];
      maybeAutoSave({ subtasks: next });
      return next;
    });
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) => {
      const next = prev.map((sub) =>
        sub.id === id ? { ...sub, done: !sub.done } : sub,
      );
      maybeAutoSave({ subtasks: next });
      return next;
    });
  };

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => {
      const next = prev.filter((sub) => sub.id !== id);
      maybeAutoSave({ subtasks: next });
      return next;
    });
  };

  const handleAddAttachments = (entries: AttachmentEntry[]) => {
    setAttachments((prev) => {
      const next = [...prev, ...entries];
      maybeAutoSave({ attachments: next });
      return next;
    });
    toast.success(
      `Attached ${entries.length} file${entries.length === 1 ? "" : "s"}.`,
    );
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      maybeAutoSave({ attachments: next });
      return next;
    });
  };

  const enterEditMode = () => {
    editSnapshotRef.current = buildValues();
    setMode("edit");
  };

  const cancelEdit = () => {
    applyValues(editSnapshotRef.current);
    setError(null);
    setMode("view");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Task title is required.");
      return;
    }

    const values = buildValues({ title: trimmedTitle });
    onSave?.(values, taskId);
    toast.success(
      isEditMode
        ? `Task "${trimmedTitle}" updated.`
        : `Task "${trimmedTitle}" added to ${project.name}'s Backlog.`,
    );

    if (isEditMode) {
      editSnapshotRef.current = values;
      setMode("view");
    } else {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (!taskId) return;
    onDelete?.(taskId);
    toast.success(`Task "${title.trim() || "Untitled"}" deleted.`);
    resetForm();
    onOpenChange(false);
  };

  const subtasksSection = (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Sub-tasks</Label>
        {subtasks.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {subtasks.filter((s) => s.done).length} / {subtasks.length} done
          </span>
        )}
      </div>

      <div className="space-y-1 rounded-md border border-border-subtle bg-canvas-bg/40 p-2">
        {subtasks.length === 0 && !isAddingSubtask && (
          <p className="px-1 py-1 text-[11px] text-muted-foreground">
            No sub-tasks yet.
          </p>
        )}

        {subtasks.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-2 rounded px-1 py-1 hover:bg-canvas-surface group"
          >
            <input
              type="checkbox"
              checked={sub.done}
              onChange={() => toggleSubtask(sub.id)}
              className="h-3.5 w-3.5 accent-teal-500 shrink-0 cursor-pointer"
            />
            <span
              className={cn(
                "flex-1 text-xs",
                sub.done ? "line-through text-muted-foreground" : "text-foreground",
              )}
            >
              {sub.title}
            </span>
            <button
              type="button"
              onClick={() => removeSubtask(sub.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              aria-label={`Remove sub-task ${sub.title}`}
            >
              <Icon icon={Trash2} size={13} />
            </button>
          </div>
        ))}

        {isAddingSubtask ? (
          <div className="flex items-center gap-1.5 pt-1">
            <Input
              autoFocus
              placeholder="Sub-task title"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubtask();
                } else if (e.key === "Escape") {
                  setIsAddingSubtask(false);
                  setNewSubtaskTitle("");
                }
              }}
              className="h-7 text-xs bg-canvas-surface"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={addSubtask}
            >
              Add
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingSubtask(true)}
            className="flex items-center gap-1 px-1 py-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
          >
            <Icon icon={Plus} size={12} />
            Add sub-task
          </button>
        )}
      </div>
    </div>
  );

  const attachmentsSection = (
    <AttachmentUploadField
      attachments={attachments}
      onAdd={handleAddAttachments}
      onRemove={handleRemoveAttachment}
    />
  );

  const isViewing = isEditMode && mode === "view";

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) resetForm();
          onOpenChange(next);
        }}
      >
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-5">
        <SheetHeader className="space-y-1 pr-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
                <Icon icon={ListTodo} size={17} />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base font-semibold">
                  {isViewing
                    ? "Task Overview"
                    : isEditMode
                      ? "Edit Task"
                      : "Add Task to Workspace"}
                </SheetTitle>
                <SheetDescription className="text-xs truncate">
                  {isViewing
                    ? `Viewing details for this task in ${project.name}.`
                    : isEditMode
                      ? `Update details for this task in ${project.name}.`
                      : `Create and assign a new task within ${project.name}.`}
                </SheetDescription>
              </div>
            </div>

            {isViewing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={enterEditMode}
                className="h-8 gap-1.5 text-xs font-semibold shrink-0"
              >
                <Icon icon={Pencil} size={13} />
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        {isViewing ? (
          <div className="space-y-4 pt-4">
            <div>
              <h3 className="text-base font-bold text-foreground break-words">
                {title || "Untitled task"}
              </h3>
              {description && (
                <p className="mt-1.5 text-xs text-muted-foreground whitespace-pre-wrap">
                  {description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs rounded-md border border-border-subtle bg-canvas-bg/40 p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Feature / Epic
                </p>
                <p className="font-medium text-foreground mt-0.5">{feature}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Status
                </p>
                <Badge variant="outline" className="mt-0.5 text-[10px] font-semibold">
                  {status}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Priority
                </p>
                <p className="font-medium text-foreground mt-0.5">{priority}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Assignee
                </p>
                <p className="font-medium text-foreground mt-0.5">{assignee}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Start Date
                </p>
                <p className="font-medium text-foreground mt-0.5">
                  {formatDate(startDate, "—")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Due Date
                </p>
                <p className="font-medium text-foreground mt-0.5">
                  {formatDate(dueDate, "—")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Estimated Hours
                </p>
                <p className="font-medium text-foreground mt-0.5">{estimatedHours}h</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Logged Hours
                </p>
                <p className="font-medium text-foreground mt-0.5">{loggedHours}h</p>
              </div>
            </div>

            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="border-border-subtle bg-canvas-bg/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            )}

            {subtasksSection}
            {attachmentsSection}

            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="gap-1.5"
              >
                <Icon icon={Trash2} size={13} />
                Delete Task
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-3">
            {/* Title */}
            <div className="space-y-1">
              <Label
                htmlFor="task-title"
                className={cn("text-xs font-medium", error && "text-destructive")}
              >
                Task Title *
              </Label>
              <Input
                id="task-title"
                placeholder="e.g. Implement Webhook Dispatcher"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                className={cn(
                  "h-10 text-sm font-medium bg-canvas-surface transition-colors",
                  error && "border-destructive focus-visible:ring-destructive/30",
                )}
                autoFocus
              />
              {error && (
                <p className="text-[11px] font-medium text-destructive">
                  {error}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="task-description" className="text-xs font-medium">
                Description
              </Label>
              <textarea
                id="task-description"
                rows={3}
                placeholder="Add scope, notes, or acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-canvas-surface px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Feature / Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="task-feature" className="text-xs font-medium">
                  Feature / Epic
                </Label>
                <Select value={feature} onValueChange={setFeature}>
                  <SelectTrigger
                    id="task-feature"
                    className="h-8 text-xs bg-canvas-surface"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="task-status" className="text-xs font-medium">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as TaskFormStatus)}
                >
                  <SelectTrigger
                    id="task-status"
                    className="h-8 text-xs bg-canvas-surface"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Backlog">Backlog</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority / Assignee */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="task-priority" className="text-xs font-medium">
                  Priority
                </Label>
                <Select
                  value={priority}
                  onValueChange={(val) => setPriority(val as TaskFormPriority)}
                >
                  <SelectTrigger
                    id="task-priority"
                    className="h-8 text-xs bg-canvas-surface"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="task-assignee" className="text-xs font-medium">
                  Assignee
                </Label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger
                    id="task-assignee"
                    className="h-8 text-xs bg-canvas-surface"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reporter (read-only) */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Reporter</Label>
              <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-canvas-bg/50 px-2.5 py-1.5">
                <span className="w-5 h-5 rounded-full bg-navy-500 dark:bg-foreground text-white dark:text-background flex items-center justify-center text-[9px] font-bold shrink-0">
                  {user?.initials ?? "?"}
                </span>
                <span className="text-xs text-foreground">
                  {user?.name ?? "Unknown User"}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  Created this task
                </span>
              </div>
            </div>

            {/* Start / Due Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Start Date</Label>
                <Popover
                  open={isStartCalendarOpen}
                  onOpenChange={setIsStartCalendarOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-8 w-full justify-between px-2.5 text-xs font-normal bg-canvas-surface border-input",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon
                          icon={CalendarIcon}
                          size={13}
                          className="text-muted-foreground"
                        />
                        <span>{formatDate(startDate, "Pick start date")}</span>
                      </div>
                      <Icon icon={ChevronDown} size={13} className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setIsStartCalendarOpen(false);
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Due Date</Label>
                <Popover
                  open={isDueCalendarOpen}
                  onOpenChange={setIsDueCalendarOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-8 w-full justify-between px-2.5 text-xs font-normal bg-canvas-surface border-input",
                        !dueDate && "text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon
                          icon={CalendarIcon}
                          size={13}
                          className="text-muted-foreground"
                        />
                        <span>{formatDate(dueDate, "Pick due date")}</span>
                      </div>
                      <Icon icon={ChevronDown} size={13} className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                        setIsDueCalendarOpen(false);
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="task-hours" className="text-xs font-medium">
                  Estimated Hours
                </Label>
                <div className="relative">
                  <Icon
                    icon={Clock}
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="task-hours"
                    type="number"
                    min="0"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="h-8 pl-8 text-xs bg-canvas-surface"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="task-logged-hours"
                  className="text-xs font-medium"
                >
                  Logged Hours
                </Label>
                <div className="relative">
                  <Icon
                    icon={Clock}
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="task-logged-hours"
                    type="number"
                    min="0"
                    value={loggedHours}
                    onChange={(e) => setLoggedHours(e.target.value)}
                    className="h-8 pl-8 text-xs bg-canvas-surface"
                  />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-1">
              <Label htmlFor="task-labels" className="text-xs font-medium">
                Labels
              </Label>
              <Input
                id="task-labels"
                placeholder="Type labels separated by commas, press Enter to add"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    commitLabelInput();
                  }
                }}
                onBlur={commitLabelInput}
                className="h-8 text-xs bg-canvas-surface"
              />
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {labels.map((label) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className="gap-1 border-border-subtle bg-canvas-bg/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="ml-0.5 rounded-full hover:text-destructive"
                        aria-label={`Remove label ${label}`}
                      >
                        <Icon icon={X} size={10} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {subtasksSection}
            {attachmentsSection}

            <div
              className={cn(
                "flex items-center pt-3 border-t border-border-subtle",
                isEditMode ? "justify-between" : "justify-end gap-2",
              )}
            >
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="gap-1.5"
                >
                  <Icon icon={Trash2} size={13} />
                  Delete Task
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isEditMode ? cancelEdit : () => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="font-semibold"
                >
                  {isEditMode ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Task"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-foreground font-semibold break-all">
              {title.trim() || "this task"}
            </strong>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete Task"
        onConfirm={handleDelete}
      />
    </>
  );
}
