import * as React from "react";
import {
  FolderPlus,
  Calendar as CalendarIcon,
  ChevronDown,
  Building2,
  FileText,
  Clock,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { HotkeyHint } from "@/components/ui/hotkey-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/app/providers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateForwardQuarterOptions } from "@/lib/quarters";
import {
  AttachmentUploadField,
  type AttachmentEntry,
} from "@/features/projects/components/attachment-upload-field";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: Project) => void;
}

interface FormErrors {
  name?: string;
  client?: string;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
}: CreateProjectDialogProps) {
  const { user } = useAuth();

  const [name, setName] = React.useState("");
  const [client, setClient] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus>("ongoing");
  const [estimatedHours, setEstimatedHours] = React.useState("200");
  const [errors, setErrors] = React.useState<FormErrors>({});

  const [dateMode, setDateMode] = React.useState<"exact" | "quarter">("exact");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    () => new Date(2026, 11, 31),
  );
  const [quarterValue, setQuarterValue] = React.useState("Q1 2027");
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [attachments, setAttachments] = React.useState<AttachmentEntry[]>([]);

  const availableQuarters = React.useMemo(
    () => generateForwardQuarterOptions(12),
    [],
  );

  const calendarBounds = React.useMemo(() => {
    const now = new Date();
    return {
      startMonth: new Date(now.getFullYear(), now.getMonth()),
      endMonth: new Date(now.getFullYear() + 3, 11),
    };
  }, []);

  const formattedDueDate = React.useMemo(() => {
    if (dateMode === "quarter") return quarterValue;
    if (!selectedDate) return "Pick target date";
    return selectedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [dateMode, selectedDate, quarterValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!name.trim()) {
      newErrors.name = "Project title is required";
    }
    if (!client.trim()) {
      newErrors.client = "Client name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      return;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      client: client.trim(),
      description:
        description.trim() ||
        "Next-generation enterprise workspace initiative.",
      status,
      lead: user?.name ?? "Lead Architect",
      activeSprint: "Sprint 1: Planning",
      dateRange: `Sep 2026 – ${formattedDueDate}`,
      dueDate: formattedDueDate,
      completionPercentage: 0,
      estimatedHours: Number(estimatedHours) || 160,
      loggedHours: 0,
      tasksCount: 0,
      coreFeaturesCount: 0,
      pendingInvites: [],
      members: [
        {
          id: user?.id ?? "usr-lead",
          name: user?.name ?? "Vaishnav Gopal",
          email: user?.email ?? "vaishnav@tarento.com",
          initials: user?.initials ?? "VG",
          role: user?.role ?? "manager",
          designation: "Project Lead",
          assignedTasksCount: 0,
          assignedFeaturesCount: 0,
          hoursLogged: 0,
          status: "active",
        },
      ],
    };

    onCreateProject(newProject);
    toast.success(`Project "${newProject.name}" created successfully.`);

    // Reset form
    setName("");
    setClient("");
    setDescription("");
    setStatus("ongoing");
    setAttachments([]);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[540px] max-h-none overflow-visible p-5">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Icon icon={FolderPlus} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Create New Project
              </ModalTitle>
              <ModalDescription className="text-xs">
                Initiate a project workspace, set client ownership, and define
                deliverables.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {/* noValidate stops the browser's default black popup */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3 pt-1">
          {/* General Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label
                htmlFor="proj-name"
                className={cn(
                  "text-xs font-medium",
                  errors.name && "text-destructive",
                )}
              >
                Project Title *
              </Label>
              <Input
                id="proj-name"
                placeholder="e.g. Mobile App v3.0"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={cn(
                  "h-8 text-xs bg-canvas-surface transition-colors",
                  errors.name &&
                    "border-destructive focus-visible:ring-destructive/30",
                )}
              />
              {errors.name && (
                <p className="text-2xs font-medium text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="proj-client"
                className={cn(
                  "text-xs font-medium",
                  errors.client && "text-destructive",
                )}
              >
                Client / Organization *
              </Label>
              <div className="relative">
                <Icon
                  icon={Building2}
                  size={13}
                  className={cn(
                    "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
                    errors.client && "text-destructive",
                  )}
                />
                <Input
                  id="proj-client"
                  placeholder="e.g. Acme Corp"
                  value={client}
                  onChange={(e) => {
                    setClient(e.target.value);
                    if (errors.client)
                      setErrors((prev) => ({ ...prev, client: undefined }));
                  }}
                  className={cn(
                    "h-8 pl-8 text-xs bg-canvas-surface transition-colors",
                    errors.client &&
                      "border-destructive focus-visible:ring-destructive/30",
                  )}
                />
              </div>
              {errors.client && (
                <p className="text-2xs font-medium text-destructive">
                  {errors.client}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="proj-desc" className="text-xs font-medium">
              Scope Description
            </Label>
            <div className="relative">
              <Icon
                icon={FileText}
                size={13}
                className="absolute left-2.5 top-2 text-muted-foreground"
              />
              <Textarea
                id="proj-desc"
                rows={2}
                placeholder="Briefly describe objectives, integrations, or compliance requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-canvas-surface px-2.5 py-1.5 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Delivery Timeline & Deadlines */}
          <div className="space-y-2.5 rounded-lg border border-border-subtle bg-canvas-bg/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Icon icon={CalendarIcon} size={13} />
                <span>Delivery Deadlines</span>
              </div>

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
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Due Date Input */}
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
                  <Select value={quarterValue} onValueChange={setQuarterValue}>
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

              {/* Estimated Hours */}
              <div className="space-y-1">
                <Label htmlFor="proj-hours" className="text-xs">
                  Estimated Total Hours
                </Label>
                <div className="relative">
                  <Icon
                    icon={Clock}
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="proj-hours"
                    type="number"
                    min="1"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="h-8 pl-8 text-xs bg-canvas-surface"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Initial Status */}
          <div className="space-y-1">
            <Label htmlFor="proj-status" className="text-xs">
              Initial Lifecycle Stage
            </Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as ProjectStatus)}
            >
              <SelectTrigger
                id="proj-status"
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

          <AttachmentUploadField
            attachments={attachments}
            onAdd={(entries) => setAttachments((prev) => [...prev, ...entries])}
            onRemove={(id) =>
              setAttachments((prev) => prev.filter((a) => a.id !== id))
            }
          />

          <ModalFooter className="pt-1.5">
            <HotkeyHint className="mr-auto" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm">
              Create Project
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
