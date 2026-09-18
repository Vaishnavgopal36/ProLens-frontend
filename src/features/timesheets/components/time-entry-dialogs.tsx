import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
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
import { Icon } from "@/components/ui/icon";
import { PROJECT_TAXONOMY } from "../api/mock-data";
import type { TimeEntry, WorkLocation } from "@/types/timesheet";

// ==================== ADD TIME DIALOG ====================
interface AddTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDateStr: string;
  defaultProject?: string;
  defaultTask?: string;
  onSave: (entry: TimeEntry) => void;
}

export function AddTimeDialog({
  open,
  onOpenChange,
  defaultDateStr,
  defaultProject = "Website Design",
  defaultTask,
  onSave,
}: AddTimeDialogProps) {
  const [project, setProject] = React.useState(defaultProject);
  const [task, setTask] = React.useState(
    defaultTask || PROJECT_TAXONOMY[defaultProject]?.tasks[0] || ""
  );
  const [hours, setHours] = React.useState(2);
  const [mins, setMins] = React.useState(30);
  const [location, setLocation] = React.useState<WorkLocation>("Tarento Office");

  React.useEffect(() => {
    if (defaultProject) {
      setProject(defaultProject);
      setTask(defaultTask || PROJECT_TAXONOMY[defaultProject]?.tasks[0] || "");
    }
  }, [defaultProject, defaultTask]);

  const handleProjectChange = (newProj: string) => {
    setProject(newProj);
    const available = PROJECT_TAXONOMY[newProj]?.tasks || [];
    setTask(available[0] || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours === 0 && mins === 0) {
      toast.error("Please enter a duration greater than 0 minutes");
      return;
    }

    const newEntry: TimeEntry = {
      id: `TE-${Math.floor(200 + Math.random() * 800)}`,
      dateStr: defaultDateStr,
      project,
      task,
      hours: Number(hours),
      mins: Number(mins),
      location,
    };

    onSave(newEntry);
    toast.success("Time entry added to timesheet.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-5 border-border-subtle bg-canvas-surface">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="text-base font-semibold text-foreground">
            Add Time Entry
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record billable task effort for this timesheet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 text-xs">
          <div>
            <Label className="block font-medium text-foreground mb-1">Date</Label>
            <Input
              value={defaultDateStr}
              readOnly
              className="h-9 text-xs bg-canvas-bg/50 border-border-subtle cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="block font-medium text-foreground mb-1">Project *</Label>
            <Select value={project} onValueChange={handleProjectChange}>
              <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PROJECT_TAXONOMY).map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block font-medium text-foreground mb-1">Task *</Label>
            <Select value={task} onValueChange={setTask}>
              <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(PROJECT_TAXONOMY[project]?.tasks || []).map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block font-medium text-foreground mb-1">Duration *</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-canvas-bg/50 border border-border-subtle rounded-md px-3">
                <span className="text-muted-foreground text-[11px]">Hours</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-9 bg-transparent text-center font-bold text-foreground border-0 focus:ring-0 p-0 text-sm outline-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2 bg-canvas-bg/50 border border-border-subtle rounded-md px-3">
                <span className="text-muted-foreground text-[11px]">Mins</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={15}
                  value={mins}
                  onChange={(e) => setMins(Number(e.target.value))}
                  className="w-full h-9 bg-transparent text-center font-bold text-foreground border-0 focus:ring-0 p-0 text-sm outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="block font-medium text-foreground mb-1">Work Location</Label>
            <Select
              value={location}
              onValueChange={(val) => setLocation(val as WorkLocation)}
            >
              <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tarento Office">Tarento Office (Onsite)</SelectItem>
                <SelectItem value="WFH">WFH (Remote)</SelectItem>
                <SelectItem value="Client Site">Client Site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm" className="text-xs font-semibold">
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const [hours, setHours] = React.useState(0);
  const [mins, setMins] = React.useState(0);
  const [location, setLocation] = React.useState<WorkLocation>("Tarento Office");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (entry) {
      setHours(entry.hours);
      setMins(entry.mins);
      setLocation(entry.location);
    }
  }, [entry]);

  if (!entry) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...entry,
      hours: Number(hours),
      mins: Number(mins),
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[440px] p-5 border-border-subtle bg-canvas-surface">
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className="text-base font-semibold text-foreground">
              Edit Time Entry
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update logged hours or work location.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3.5 pt-1 text-xs">
            <div>
              <Label className="block font-medium text-foreground mb-1">Date</Label>
              <Input
                value={entry.dateStr}
                readOnly
                className="h-9 text-xs bg-canvas-bg/50 border-border-subtle cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block font-medium text-foreground mb-1">Project</Label>
                <Input
                  value={entry.project}
                  readOnly
                  className="h-9 text-xs bg-canvas-bg/50 border-border-subtle cursor-not-allowed"
                />
              </div>
              <div>
                <Label className="block font-medium text-foreground mb-1">Task</Label>
                <Input
                  value={entry.task}
                  readOnly
                  className="h-9 text-xs bg-canvas-bg/50 border-border-subtle cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <Label className="block font-medium text-foreground mb-1">Duration</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-canvas-bg/50 border border-border-subtle rounded-md px-3">
                  <span className="text-muted-foreground text-[11px]">Hours</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full h-9 bg-transparent text-center font-bold text-foreground border-0 focus:ring-0 p-0 text-sm outline-none"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 bg-canvas-bg/50 border border-border-subtle rounded-md px-3">
                  <span className="text-muted-foreground text-[11px]">Mins</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    step={15}
                    value={mins}
                    onChange={(e) => setMins(Number(e.target.value))}
                    className="w-full h-9 bg-transparent text-center font-bold text-foreground border-0 focus:ring-0 p-0 text-sm outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="block font-medium text-foreground mb-1">Work Location</Label>
              <Select
                value={location}
                onValueChange={(val) => setLocation(val as WorkLocation)}
              >
                <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tarento Office">Tarento Office (Onsite)</SelectItem>
                  <SelectItem value="WFH">WFH (Remote)</SelectItem>
                  <SelectItem value="Client Site">Client Site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
                className="h-9 text-destructive hover:bg-destructive/10 text-xs font-semibold gap-1.5"
              >
                <Icon icon={Trash2} size={15} />
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
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm" className="text-xs font-semibold">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Sub-Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[380px] p-5 border-border-subtle bg-canvas-surface space-y-3">
          <div className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Icon icon={AlertTriangle} size={20} />
          </div>
          <div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Delete Time Entry
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to delete this time entry? This will permanently remove it and recalculate your weekly timesheet.
            </DialogDescription>
          </div>
          <DialogFooter className="pt-2 border-t border-border-subtle gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleExecuteDelete}
              className="text-xs"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}