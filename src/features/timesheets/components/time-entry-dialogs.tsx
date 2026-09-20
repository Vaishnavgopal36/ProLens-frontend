import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { HotkeyHint } from "@/components/ui/hotkey-hint";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UnderlineInput,
  underlineFieldClass,
} from "@/components/ui/underline-input";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import {
  UnderlineCombobox,
  type ComboboxOption,
} from "@/components/composed/underline-combobox";
import { cn } from "@/lib/utils";
import type { TimeEntry, WorkLocation } from "@/types/timesheet";
import { WORK_TAXONOMY } from "../api/mock-data";
import { useWorkOptions } from "../hooks/use-work-options";

const MAX_ACTIVITY_LENGTH = 120;

/** "2026-09-25" → "25 Sep, Friday" (the Kronos modal heading). */
function formatHeading(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${d} ${date.toLocaleDateString("en-US", { month: "short" })}, ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
}

/** Returns an inline error message, or undefined when the duration is valid. */
function validateDuration(hours: number, mins: number): string | undefined {
  if (!Number.isInteger(hours) || !Number.isInteger(mins))
    return "Enter whole numbers for hours and minutes.";
  if (hours < 0 || hours > 23) return "Hours must be between 0 and 23.";
  if (mins < 0 || mins > 59) return "Minutes must be between 0 and 59.";
  if (hours === 0 && mins === 0) return "Duration must be greater than 0.";
  return undefined;
}

const toNumber = (value: string) => (value.trim() === "" ? 0 : Number(value));

// ---------- shared form pieces ----------

function TimeModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="gap-0 overflow-hidden border-border-subtle bg-canvas-surface p-0 sm:max-w-[480px]">
        <div className="px-6 pb-2 pt-8 text-center sm:px-10">
          <ModalTitle className="text-sm font-normal tracking-normal text-foreground">
            {title}
          </ModalTitle>
          <ModalDescription className="sr-only">{description}</ModalDescription>
        </div>
        {children}
      </ModalContent>
    </Modal>
  );
}

function DurationFields({
  hours,
  mins,
  error,
  onHoursChange,
  onMinsChange,
}: {
  hours: string;
  mins: string;
  error?: string;
  onHoursChange: (v: string) => void;
  onMinsChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div className="flex items-end gap-3">
          <label
            htmlFor="entry-hours"
            className="pb-2.5 text-sm text-muted-foreground"
          >
            Hours
          </label>
          <UnderlineInput
            id="entry-hours"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={hours}
            onChange={(e) => onHoursChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "entry-duration-error" : undefined}
            className="text-center font-medium"
          />
        </div>
        <span className="pb-2.5 text-muted-foreground">:</span>
        <div className="flex items-end gap-3">
          <label
            htmlFor="entry-mins"
            className="pb-2.5 text-sm text-muted-foreground"
          >
            Mins
          </label>
          <UnderlineInput
            id="entry-mins"
            type="number"
            inputMode="numeric"
            placeholder="00"
            value={mins}
            onChange={(e) => onMinsChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "entry-duration-error" : undefined}
            className="text-center font-medium"
          />
        </div>
      </div>
      <FieldError
        id="entry-duration-error"
        message={error}
        className="mt-1.5"
      />
    </div>
  );
}

function LocationField({
  value,
  onChange,
}: {
  value: WorkLocation;
  onChange: (value: WorkLocation) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as WorkLocation)}>
      <SelectTrigger
        aria-label="Work location"
        className={cn(underlineFieldClass, "justify-between")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Tarento Office">Tarento Office (Onsite)</SelectItem>
        <SelectItem value="WFH">WFH (Remote)</SelectItem>
        <SelectItem value="Client Site">Client Site</SelectItem>
      </SelectContent>
    </Select>
  );
}

function SaveButton({ children = "Save" }: { children?: React.ReactNode }) {
  return (
    <Button
      type="submit"
      className="h-11 w-full px-10 text-xs font-bold uppercase tracking-wider shadow-md sm:w-auto"
    >
      {children}
    </Button>
  );
}

// ==================== ADD TIME DIALOG ====================
interface AddTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDateStr: string;
  /** Prefill (e.g. when opened from inside a project). Blank by default. */
  defaultProject?: string;
  defaultTask?: string;
  onSave: (entry: TimeEntry) => void;
}

interface AddErrors {
  activity?: string;
  project?: string;
  task?: string;
  duration?: string;
}

export function AddTimeDialog({
  open,
  onOpenChange,
  defaultDateStr,
  defaultProject = "",
  defaultTask = "",
  onSave,
}: AddTimeDialogProps) {
  const { projects, activities } = useWorkOptions();
  const [activity, setActivity] = React.useState("");
  const [project, setProject] = React.useState("");
  const [task, setTask] = React.useState("");
  const [hours, setHours] = React.useState("");
  const [mins, setMins] = React.useState("");
  const [location, setLocation] =
    React.useState<WorkLocation>("Tarento Office");
  const [errors, setErrors] = React.useState<AddErrors>({});
  const clearError = (key: keyof AddErrors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  // One combined list, like Kronos: assigned projects first, then activities.
  const workOptions = React.useMemo<ComboboxOption[]>(
    () => [
      ...projects.map((name) => ({
        value: name,
        label: name,
        group: "Assigned projects",
      })),
      ...activities.map((name) => ({
        value: name,
        label: `[${WORK_TAXONOMY[name]?.code}] ${name}`,
        group: "Activities",
      })),
    ],
    [projects, activities],
  );
  const taskOptions = React.useMemo<ComboboxOption[]>(
    () =>
      (WORK_TAXONOMY[project]?.tasks ?? []).map((t) => ({
        value: t,
        label: t,
      })),
    [project],
  );

  // Every time the dialog opens: fresh form, with any requested prefill that
  // the user is actually allowed to use.
  React.useEffect(() => {
    if (!open) return;
    const allowed = [...projects, ...activities].includes(defaultProject);
    setActivity("");
    setProject(allowed ? defaultProject : "");
    setTask(
      allowed && WORK_TAXONOMY[defaultProject]?.tasks.includes(defaultTask)
        ? defaultTask
        : "",
    );
    setHours("");
    setMins("");
    setLocation("Tarento Office");
    setErrors({});
  }, [open, defaultProject, defaultTask, projects, activities]);

  const handleProjectChange = (value: string) => {
    setProject(value);
    setTask("");
    clearError("project");
    clearError("task");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: AddErrors = {};
    if (activity.trim().length > MAX_ACTIVITY_LENGTH)
      next.activity = `Keep the activity under ${MAX_ACTIVITY_LENGTH} characters.`;
    if (!project)
      next.project =
        projects.length === 0
          ? "You aren't assigned to any projects yet. Pick an activity instead."
          : "Select a project or activity.";
    else if (!task) next.task = "Select a task.";
    next.duration = validateDuration(toNumber(hours), toNumber(mins));
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    onSave({
      id: `TE-${Math.floor(200 + Math.random() * 800)}`,
      dateStr: defaultDateStr,
      project,
      task,
      activity: activity.trim() || undefined,
      hours: toNumber(hours),
      mins: toNumber(mins),
      location,
    });
    toast.success("Time entry added to timesheet.");
    onOpenChange(false);
  };

  return (
    <TimeModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={formatHeading(defaultDateStr)}
      description="Add a time entry against a project or activity."
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 px-6 pb-8 pt-4 sm:px-10"
      >
        <div>
          <UnderlineInput
            id="entry-activity"
            aria-label="Activity"
            placeholder="Activity"
            value={activity}
            onChange={(e) => {
              setActivity(e.target.value);
              clearError("activity");
            }}
            aria-invalid={!!errors.activity}
            aria-describedby={
              errors.activity ? "entry-activity-error" : undefined
            }
          />
          <FieldError
            id="entry-activity-error"
            message={errors.activity}
            className="mt-1.5"
          />
        </div>

        <div>
          <UnderlineCombobox
            id="entry-project"
            options={workOptions}
            value={project}
            onChange={handleProjectChange}
            placeholder="Select a Project"
            searchPlaceholder="Search projects & activities…"
            invalid={!!errors.project}
            describedBy={errors.project ? "entry-project-error" : undefined}
            clearable
          />
          <FieldError
            id="entry-project-error"
            message={errors.project}
            className="mt-1.5"
          />
        </div>

        <div>
          <UnderlineCombobox
            id="entry-task"
            options={taskOptions}
            value={task}
            onChange={(v) => {
              setTask(v);
              clearError("task");
            }}
            placeholder="Select a Task"
            searchPlaceholder="Search tasks…"
            disabled={!project}
            invalid={!!errors.task}
            describedBy={errors.task ? "entry-task-error" : undefined}
          />
          <FieldError
            id="entry-task-error"
            message={errors.task}
            className="mt-1.5"
          />
        </div>

        <DurationFields
          hours={hours}
          mins={mins}
          error={errors.duration}
          onHoursChange={(v) => {
            setHours(v);
            clearError("duration");
          }}
          onMinsChange={(v) => {
            setMins(v);
            clearError("duration");
          }}
        />

        <LocationField value={location} onChange={setLocation} />

        <div className="flex items-center justify-between gap-4 pt-4">
          <HotkeyHint />
          <SaveButton />
        </div>
      </form>
    </TimeModalShell>
  );
}

// ==================== EDIT & DELETE DIALOG ====================
interface EditTimeDialogProps {
  entry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updated: TimeEntry) => void;
  onDelete: (id: string) => void;
}

export function EditTimeDialog({
  entry,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: EditTimeDialogProps) {
  const [activity, setActivity] = React.useState("");
  const [hours, setHours] = React.useState("");
  const [mins, setMins] = React.useState("");
  const [location, setLocation] =
    React.useState<WorkLocation>("Tarento Office");
  const [errors, setErrors] = React.useState<AddErrors>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!entry) return;
    setActivity(entry.activity ?? "");
    setHours(String(entry.hours));
    setMins(String(entry.mins));
    setLocation(entry.location);
    setErrors({});
  }, [entry]);

  if (!entry) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const next: AddErrors = {};
    if (activity.trim().length > MAX_ACTIVITY_LENGTH)
      next.activity = `Keep the activity under ${MAX_ACTIVITY_LENGTH} characters.`;
    next.duration = validateDuration(toNumber(hours), toNumber(mins));
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    onUpdate({
      ...entry,
      activity: activity.trim() || undefined,
      hours: toNumber(hours),
      mins: toNumber(mins),
      location,
    });
    toast.success("Time entry updated successfully.");
    onOpenChange(false);
  };

  const handleExecuteDelete = () => {
    onDelete(entry.id);
    setConfirmDeleteOpen(false);
    onOpenChange(false);
    toast.success("Time entry deleted.");
  };

  return (
    <>
      <TimeModalShell
        open={open}
        onOpenChange={onOpenChange}
        title={formatHeading(entry.dateStr)}
        description="Edit or delete this time entry."
      >
        <form
          onSubmit={handleUpdate}
          noValidate
          className="space-y-5 px-6 pb-8 pt-4 sm:px-10"
        >
          <div>
            <UnderlineInput
              aria-label="Activity"
              placeholder="Activity"
              value={activity}
              onChange={(e) => {
                setActivity(e.target.value);
                setErrors((prev) => ({ ...prev, activity: undefined }));
              }}
              aria-invalid={!!errors.activity}
            />
            <FieldError message={errors.activity} className="mt-1.5" />
          </div>

          {/* Project and task identify the entry, so they're fixed here. */}
          <UnderlineInput
            aria-label="Project"
            value={entry.project}
            readOnly
            disabled
          />
          <UnderlineInput
            aria-label="Task"
            value={entry.task}
            readOnly
            disabled
          />

          <DurationFields
            hours={hours}
            mins={mins}
            error={errors.duration}
            onHoursChange={(v) => {
              setHours(v);
              setErrors((prev) => ({ ...prev, duration: undefined }));
            }}
            onMinsChange={(v) => {
              setMins(v);
              setErrors((prev) => ({ ...prev, duration: undefined }));
            }}
          />

          <LocationField value={location} onChange={setLocation} />

          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              className="h-10 gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              <Icon icon={Trash2} size={15} />
              Delete
            </Button>
            <SaveButton />
          </div>
        </form>
      </TimeModalShell>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Time Entry"
        description="Are you sure you want to delete this time entry? This will permanently remove it and recalculate your weekly timesheet."
        confirmLabel="Delete"
        onConfirm={handleExecuteDelete}
      />
    </>
  );
}
