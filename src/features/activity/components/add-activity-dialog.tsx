import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { ActivityCategory, ActivityItem } from "@/types/activity";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: ActivityItem) => void;
}

export function AddActivityDialog({
  open,
  onOpenChange,
  onAdd,
}: AddActivityDialogProps) {
  const [category, setCategory] = React.useState<ActivityCategory>("project");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [projectName, setProjectName] = React.useState("Apex Analytics Platform");
  const [hours, setHours] = React.useState("1.0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an activity title.");
      return;
    }

    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      category,
      categoryLabel: category === "project" ? "Project Task Completed" : "Team Meeting",
      projectName: category === "project" ? projectName : undefined,
      title: title.trim(),
      description: description.trim() || "Activity logged via workspace.",
      timestamp: "Today, Just now",
      durationHours: `${hours} hr`,
      statusBadge: { label: "Completed", variant: "success" },
      pinColor: category === "project" ? "teal" : "navy",
      loggedBy: "Alex Morgan",
    };

    onAdd(newItem);
    toast.success("Activity recorded successfully.");
    onOpenChange(false);
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-5 border-border-subtle bg-canvas-surface">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="text-base font-semibold text-foreground">
            Log New Activity
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record client milestones, unscheduled tasks, or professional events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 text-xs">
          <div>
            <Label className="block font-medium text-foreground mb-1 text-xs">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as ActivityCategory)}
            >
              <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project Activity</SelectItem>
                <SelectItem value="non-project">Non-Project Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {category === "project" && (
            <div>
              <Label className="block font-medium text-foreground mb-1 text-xs">
                Project
              </Label>
              <Select value={projectName} onValueChange={setProjectName}>
                <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apex Analytics Platform">Apex Analytics Platform</SelectItem>
                  <SelectItem value="Nova Mobile Dev">Nova Mobile Dev</SelectItem>
                  <SelectItem value="Internal Project">Internal Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="block font-medium text-foreground mb-1 text-xs">
              Activity Title *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture Sprint Demo"
              className="h-9 text-xs border-border-subtle bg-canvas-surface"
              required
            />
          </div>

          <div>
            <Label className="block font-medium text-foreground mb-1 text-xs">
              Description
            </Label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of notes, outcomes, or agenda..."
              className="w-full p-2.5 rounded-md border border-input bg-canvas-surface text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <Label className="block font-medium text-foreground mb-1 text-xs">
              Duration (hours)
            </Label>
            <Input
              type="number"
              step={0.25}
              min={0.25}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="h-9 text-xs border-border-subtle bg-canvas-surface"
              required
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border-subtle flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="text-xs h-9 font-semibold"
            >
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}