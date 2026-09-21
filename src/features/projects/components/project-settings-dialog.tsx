import * as React from "react";
import {
  Calendar as CalendarIcon,
  Sliders,
  ChevronDown,
  Building2,
  FileText,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
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
import type { Project, ProjectStatus } from "@/types/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateForwardQuarterOptions } from "@/lib/quarters";

interface ProjectSettingsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject?: (updated: Project) => void;
}

export function ProjectSettingsDialog({
  project,
  open,
  onOpenChange,
  onUpdateProject,
}: ProjectSettingsDialogProps) {
  const { hasMinimumRole } = usePermissions();
  const isManager = hasMinimumRole("manager");

  // Editable Form States
  const [name, setName] = React.useState(project.name);
  const [client, setClient] = React.useState(project.client);
  const [description, setDescription] = React.useState(project.description);
  const [status, setStatus] = React.useState<ProjectStatus>(project.status);

  const [dateMode, setDateMode] = React.useState<"exact" | "quarter">(() =>
    project.dueDate.toLowerCase().startsWith("q") ? "quarter" : "exact",
  );

  const availableQuarters = React.useMemo(() => {
    const dynamicQuarters = generateForwardQuarterOptions(12);
    if (
      project.dueDate.toLowerCase().startsWith("q") &&
      !dynamicQuarters.includes(project.dueDate)
    ) {
      return [project.dueDate, ...dynamicQuarters];
    }
    return dynamicQuarters;
  }, [project.dueDate]);

  const calendarBounds = React.useMemo(() => {
    const now = new Date();
    return {
      startMonth: new Date(now.getFullYear(), now.getMonth()),
      endMonth: new Date(now.getFullYear() + 3, 11),
    };
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    () => {
      const parsed = Date.parse(project.dueDate);
      return isNaN(parsed) ? new Date() : new Date(parsed);
    },
  );

  const [quarterValue, setQuarterValue] = React.useState<string>(() =>
    project.dueDate.toLowerCase().startsWith("q")
      ? project.dueDate
      : (availableQuarters[0] ?? "Q1 2027"),
  );

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [estimatedHours, setEstimatedHours] = React.useState(
    project.estimatedHours.toString(),
  );
  const [errors, setErrors] = React.useState<{
    name?: string;
    client?: string;
    estimatedHours?: string;
  }>({});
  const clearError = (key: keyof typeof errors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  // Sync state if external project reference changes
  React.useEffect(() => {
    setName(project.name);
    setClient(project.client);
    setDescription(project.description);
    setStatus(project.status);
    setEstimatedHours(project.estimatedHours.toString());
    setErrors({});
  }, [project]);

  const formattedDueDate = React.useMemo(() => {
    if (dateMode === "quarter") return quarterValue;
    if (!selectedDate) return "Pick a date";
    return selectedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [dateMode, selectedDate, quarterValue]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const next: typeof errors = {};
    if (!name.trim()) next.name = "Project title is required.";
    if (!client.trim()) next.client = "Client name is required.";
    const hours = Number(estimatedHours);
    if (estimatedHours.trim() === "" || Number.isNaN(hours))
      next.estimatedHours = "Enter the estimated hours as a number.";
    else if (hours <= 0)
      next.estimatedHours = "Estimated hours must be above 0.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const updatedProject: Project = {
      ...project,
      name: name.trim(),
      client: client.trim(),
      description: description.trim(),
      status,
      dueDate: formattedDueDate,
      estimatedHours: Number(estimatedHours),
    };

    onUpdateProject?.(updatedProject);
    toast.success(`Updated settings for "${updatedProject.name}"`);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Pinned Header */}
        <ModalHeader className="p-5 pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
              <Icon icon={Sliders} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Project Settings
              </ModalTitle>
              <ModalDescription className="text-xs">
                Update core project identity and delivery commitments.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSave}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* General Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-xs font-medium">
                  Project Title *
                </Label>
                <Input
                  autoFocus
                  id="edit-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  disabled={!isManager}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "edit-name-error" : undefined}
                  className="h-8 text-xs bg-canvas-surface"
                />
                <FieldError id="edit-name-error" message={errors.name} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-client" className="text-xs font-medium">
                  Client / Organization *
                </Label>
                <div className="relative">
                  <Icon
                    icon={Building2}
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="edit-client"
                    value={client}
                    onChange={(e) => {
                      setClient(e.target.value);
                      clearError("client");
                    }}
                    disabled={!isManager}
                    aria-invalid={!!errors.client}
                    aria-describedby={
                      errors.client ? "edit-client-error" : undefined
                    }
                    className="h-8 pl-8 text-xs bg-canvas-surface"
                  />
                </div>
                <FieldError id="edit-client-error" message={errors.client} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-desc" className="text-xs font-medium">
                Scope Description
              </Label>
              <div className="relative">
                <Icon
                  icon={FileText}
                  size={13}
                  className="absolute left-2.5 top-2 text-muted-foreground"
                />
                <Textarea
                  id="edit-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isManager}
                  className="w-full rounded-md border border-input bg-canvas-surface px-2.5 py-1.5 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Timeline & Delivery Deadlines */}
            <div className="space-y-2.5 rounded-lg border border-border-subtle bg-canvas-bg/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Icon icon={CalendarIcon} size={13} />
                  <span>Project Deadlines</span>
                </div>

                {isManager && (
                  <div className="flex items-center rounded-md border border-border-subtle bg-canvas-surface p-0.5 text-3xs">
                    <button
                      type="button"
                      onClick={() => setDateMode("exact")}
                      className={cn(
                        "rounded px-2 py-0.5 font-medium transition-colors",
                        dateMode === "exact"
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateMode("quarter")}
                      className={cn(
                        "rounded px-2 py-0.5 font-medium transition-colors",
                        dateMode === "quarter"
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Quarter
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Target Due Date</Label>
                  {dateMode === "exact" ? (
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!isManager}
                          className={cn(
                            "h-8 w-full justify-between px-2.5 text-xs font-normal bg-canvas-surface border-input",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon
                              icon={CalendarIcon}
                              size={13}
                              className="text-muted-foreground"
                            />
                            <span>{formattedDueDate}</span>
                          </div>
                          <Icon
                            icon={ChevronDown}
                            size={13}
                            className="opacity-50"
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              setIsCalendarOpen(false);
                            }
                          }}
                          disabled={{ before: new Date() }}
                          captionLayout="dropdown"
                          startMonth={calendarBounds.startMonth}
                          endMonth={calendarBounds.endMonth}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Select
                      value={quarterValue}
                      onValueChange={setQuarterValue}
                      disabled={!isManager}
                    >
                      <SelectTrigger className="h-8 text-xs bg-canvas-surface">
                        <SelectValue placeholder="Select target quarter" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[180px] overflow-y-auto">
                        {availableQuarters.map((quarter) => (
                          <SelectItem key={quarter} value={quarter}>
                            {quarter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="estHours" className="text-xs">
                    Estimated Total Hours
                  </Label>
                  <Input
                    id="estHours"
                    type="number"
                    inputMode="numeric"
                    value={estimatedHours}
                    onChange={(e) => {
                      setEstimatedHours(e.target.value);
                      clearError("estimatedHours");
                    }}
                    disabled={!isManager}
                    aria-invalid={!!errors.estimatedHours}
                    aria-describedby={
                      errors.estimatedHours ? "estHours-error" : undefined
                    }
                    className="h-8 text-xs bg-canvas-surface"
                  />
                  <FieldError
                    id="estHours-error"
                    message={errors.estimatedHours}
                  />
                </div>
              </div>
            </div>

            {/* Lifecycle Stage */}
            <div className="space-y-1">
              <Label htmlFor="edit-status" className="text-xs">
                Project Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as ProjectStatus)}
                disabled={!isManager}
              >
                <SelectTrigger
                  id="edit-status"
                  className="h-8 text-xs bg-canvas-surface"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">
                    Ongoing (Active Development)
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending (Kickoff / Backlog)
                  </SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pinned Footer */}
          <ModalFooter className="p-4 border-t border-border-subtle bg-canvas-bg/30 shrink-0 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {isManager && (
              <Button type="submit" variant="default" size="sm">
                Save Changes
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
