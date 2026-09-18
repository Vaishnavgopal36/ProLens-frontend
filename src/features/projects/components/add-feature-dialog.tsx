import * as React from "react";
import {
  Layers,
  Clock,
  FileText,
  Calendar as CalendarIcon,
  ChevronDown,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Project } from "@/types/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AttachmentUploadField,
  type AttachmentEntry,
} from "@/features/projects/components/attachment-upload-field";

type FeatureStatus = "ACTIVE" | "COMPLETED";

const OWNER_OPTIONS = ["Sarah Jenkins", "John Doe", "Mike Ross"];

interface AddFeatureDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(date: Date | undefined, placeholder: string) {
  if (!date) return placeholder;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AddFeatureDialog({
  project,
  open,
  onOpenChange,
}: AddFeatureDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<FeatureStatus>("ACTIVE");
  const [owner, setOwner] = React.useState<string>(OWNER_OPTIONS[0]);
  const [estimatedHours, setEstimatedHours] = React.useState("40");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = React.useState(false);
  const [isDueCalendarOpen, setIsDueCalendarOpen] = React.useState(false);
  const [attachments, setAttachments] = React.useState<AttachmentEntry[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("ACTIVE");
    setOwner(OWNER_OPTIONS[0]);
    setEstimatedHours("40");
    setStartDate(undefined);
    setDueDate(undefined);
    setAttachments([]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Feature name is required.");
      return;
    }

    toast.success(
      `Feature stream "${trimmedName}" created in ${project.name}.`,
    );
    resetForm();
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <SheetContent className="sm:max-w-lg p-5 overflow-y-auto">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
              <Icon icon={Layers} size={17} />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold">
                Create Feature Stream
              </SheetTitle>
              <SheetDescription className="text-xs">
                Define a new milestone stream within {project.name}.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5 pt-4">
          <div className="space-y-1">
            <Label
              htmlFor="feature-name"
              className={cn("text-xs font-medium", error && "text-destructive")}
            >
              Feature Name *
            </Label>
            <Input
              id="feature-name"
              placeholder="e.g. Micro-frontend Shell"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className={cn(
                "h-8 text-xs bg-canvas-surface transition-colors",
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

          <div className="space-y-1">
            <Label htmlFor="feature-desc" className="text-xs font-medium">
              Description
            </Label>
            <div className="relative">
              <Icon
                icon={FileText}
                size={13}
                className="absolute left-2.5 top-2 text-muted-foreground"
              />
              <textarea
                id="feature-desc"
                rows={4}
                placeholder="Summary of scope and deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-canvas-surface px-2.5 py-1.5 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="feature-status" className="text-xs font-medium">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as FeatureStatus)}
              >
                <SelectTrigger
                  id="feature-status"
                  className="h-8 text-xs bg-canvas-surface"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="feature-owner" className="text-xs font-medium">
                Owner / Lead
              </Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger
                  id="feature-owner"
                  className="h-8 text-xs bg-canvas-surface"
                >
                  <Icon
                    icon={User}
                    size={13}
                    className="mr-1 text-muted-foreground"
                  />
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {OWNER_OPTIONS.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      <span>{formatDate(startDate, "Optional")}</span>
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
              <Label className="text-xs font-medium">Target / Due Date</Label>
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
                      <span>{formatDate(dueDate, "Optional")}</span>
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
                    disabled={startDate ? { before: startDate } : undefined}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="feature-hours" className="text-xs font-medium">
              Estimated Hours
            </Label>
            <div className="relative">
              <Icon
                icon={Clock}
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="feature-hours"
                type="number"
                min="1"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="h-8 pl-8 text-xs bg-canvas-surface"
              />
            </div>
          </div>

          <AttachmentUploadField
            attachments={attachments}
            onAdd={(entries) => setAttachments((prev) => [...prev, ...entries])}
            onRemove={(id) =>
              setAttachments((prev) => prev.filter((a) => a.id !== id))
            }
          />

          <SheetFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="font-semibold"
            >
              Save Feature
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
