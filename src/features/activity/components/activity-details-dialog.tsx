import * as React from "react";
import {
  Calendar,
  Clock,
  Briefcase,
  User,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import type { ActivityCategory, ActivityItem } from "@/types/activity";

interface ActivityDetailsDialogProps {
  item: ActivityItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedItem: ActivityItem) => void;
  onDelete: (id: string) => void;
}

export function ActivityDetailsDialog({
  item,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: ActivityDetailsDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ActivityCategory>("project");
  const [categoryLabel, setCategoryLabel] = React.useState("");
  const [projectName, setProjectName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [timeWindow, setTimeWindow] = React.useState("");
  const [durationHours, setDurationHours] = React.useState("");
  const [loggedBy, setLoggedBy] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCategory(item.category);
      setCategoryLabel(item.categoryLabel || "");
      setProjectName(item.projectName || "");
      setDate(item.date || "");
      setTimeWindow(item.timeWindow || "");
      setDurationHours(item.durationHours || "");
      setLoggedBy(item.loggedBy || "");
      setDescription(item.description || "");
      setIsEditing(false);
    }
  }, [item, open]);

  if (!item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    const updated: ActivityItem = {
      ...item,
      title: title.trim(),
      category,
      categoryLabel: categoryLabel.trim() || undefined,
      projectName: category === "project" ? projectName.trim() : undefined,
      date: date.trim(),
      timeWindow: timeWindow.trim(),
      durationHours: durationHours.trim(),
      loggedBy: loggedBy.trim() || undefined,
      description: description.trim() || undefined,
    };

    onSave(updated);
    setIsEditing(false);
    toast.success("Activity details updated");
  };

  const handleCancelEdit = () => {
    setTitle(item.title);
    setCategory(item.category);
    setCategoryLabel(item.categoryLabel || "");
    setProjectName(item.projectName || "");
    setDate(item.date || "");
    setTimeWindow(item.timeWindow || "");
    setDurationHours(item.durationHours || "");
    setLoggedBy(item.loggedBy || "");
    setDescription(item.description || "");
    setIsEditing(false);
  };

  const isProject = category === "project";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2 pr-6">
            <Badge
              variant={isProject ? "secondary" : "neutral"}
              className="text-[10px] px-2 py-0.5 uppercase font-bold"
            >
              {categoryLabel || (isProject ? "Project Activity" : "Non-Project")}
            </Badge>

            {item.statusBadge && (
              <Badge
                variant={item.statusBadge.variant}
                className="text-[10px] px-2 py-0 font-medium"
              >
                {item.statusBadge.label}
              </Badge>
            )}
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {isEditing ? "Edit Activity Details" : item.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Update schedule, project attribution, and notes."
              : "Detailed overview and log summary."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <form id="edit-activity-form" onSubmit={handleSave} className="space-y-3 py-1">
            <div className="space-y-1">
              <Label htmlFor="edit-title" className="text-xs">
                Activity Title *
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-xs bg-canvas-surface border-border-subtle"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-category" className="text-xs">
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ActivityCategory)}
                >
                  <SelectTrigger id="edit-category" className="h-8 text-xs bg-canvas-surface border-border-subtle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project Activity</SelectItem>
                    <SelectItem value="non-project">Non-Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-label" className="text-xs">
                  Badge Label
                </Label>
                <Input
                  id="edit-label"
                  value={categoryLabel}
                  onChange={(e) => setCategoryLabel(e.target.value)}
                  placeholder="e.g. Sprint Review"
                  className="h-8 text-xs bg-canvas-surface border-border-subtle"
                />
              </div>
            </div>

            {isProject && (
              <div className="space-y-1">
                <Label htmlFor="edit-project" className="text-xs">
                  Project Name
                </Label>
                <Input
                  id="edit-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-8 text-xs bg-canvas-surface border-border-subtle"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-date" className="text-xs">
                  Date (YYYY-MM-DD) *
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-8 text-xs bg-canvas-surface border-border-subtle"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-window" className="text-xs">
                  Time Window *
                </Label>
                <Input
                  id="edit-window"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  placeholder="e.g. 2:00 PM – 3:30 PM"
                  className="h-8 text-xs bg-canvas-surface border-border-subtle"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-duration" className="text-xs">
                  Duration
                </Label>
                <Input
                  id="edit-duration"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="e.g. 1 hour 30 minutes"
                  className="h-8 text-xs bg-canvas-surface border-border-subtle"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-loggedBy" className="text-xs">
                  Logged By
                </Label>
                <Input
                  id="edit-loggedBy"
                  value={loggedBy}
                  onChange={(e) => setLoggedBy(e.target.value)}
                  className="h-8 text-xs bg-canvas-surface border-border-subtle"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-desc" className="text-xs">
                Description / Notes
              </Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none text-xs bg-canvas-surface border-border-subtle"
              />
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-border-subtle bg-canvas-bg/50 p-3">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Icon icon={Calendar} size={13} className="text-teal-600 dark:text-teal-400" />
                  <span>Date & Time</span>
                </span>
                <p className="font-semibold text-foreground">
                  {item.date} • {item.timeWindow}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Icon icon={Clock} size={13} className="opacity-70" />
                  <span>Duration</span>
                </span>
                <p className="font-semibold text-foreground">{item.durationHours}</p>
              </div>

              {item.projectName && (
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                    <Icon icon={Briefcase} size={13} className="opacity-70" />
                    <span>Associated Project</span>
                  </span>
                  <p className="font-semibold text-foreground truncate">{item.projectName}</p>
                </div>
              )}

              {item.loggedBy && (
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                    <Icon icon={User} size={13} className="opacity-70" />
                    <span>Logged By</span>
                  </span>
                  <p className="font-semibold text-foreground">{item.loggedBy}</p>
                </div>
              )}
            </div>

            {item.description && (
              <div className="space-y-1 rounded-lg border border-border-subtle bg-canvas-surface p-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes & Summary
                </span>
                <p className="text-foreground leading-relaxed pt-0.5">{item.description}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between pt-2 border-t border-border-subtle">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="text-xs gap-1"
              >
                <Icon icon={X} size={14} />
                <span>Cancel</span>
              </Button>

              <Button
                type="submit"
                form="edit-activity-form"
                variant="default"
                size="sm"
                className="text-xs gap-1.5 font-semibold"
              >
                <Icon icon={Check} size={14} />
                <span>Save Changes</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(item.id);
                  onOpenChange(false);
                }}
                className="text-xs gap-1.5"
              >
                <Icon icon={Trash2} size={14} />
                <span>Delete</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-xs gap-1.5"
                >
                  <Icon icon={Pencil} size={13} />
                  <span>Edit</span>
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}