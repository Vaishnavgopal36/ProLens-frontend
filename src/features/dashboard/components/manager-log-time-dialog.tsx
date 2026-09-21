import * as React from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
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

interface ManagerLogTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROJECT_OPTIONS = [
  { id: "proj-1", name: "Apex Analytics Platform" },
  { id: "proj-2", name: "Nova Mobile Dev" },
  { id: "proj-3", name: "Cloud Migration Phase 2" },
  { id: "proj-4", name: "SupplySync Portal" },
];

export function ManagerLogTimeDialog({
  open,
  onOpenChange,
}: ManagerLogTimeDialogProps) {
  const [projectId, setProjectId] = React.useState("proj-1");
  const [hours, setHours] = React.useState("1");
  const [minutes, setMinutes] = React.useState("30");
  const [date, setDate] = React.useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [note, setNote] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;

    if (h === 0 && m === 0) {
      toast.error("Please enter hours or minutes worked.");
      return;
    }

    const selectedProj = PROJECT_OPTIONS.find((p) => p.id === projectId);

    toast.success(
      `Logged ${h}h ${m}m on ${selectedProj?.name ?? "Project"}`,
    );
    onOpenChange(false);
    setNote("");
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[460px] p-6 bg-canvas-surface border-border-subtle">
        <ModalHeader>
          <ModalTitle className="text-lg font-bold text-foreground">
            Log time &amp; effort
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          {/* 1. Project Dropdown */}
          <div className="space-y-1.5">
            <Label
              htmlFor="mgr-project-select"
              className="text-xs font-semibold text-foreground"
            >
              Project
            </Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger
                id="mgr-project-select"
                className="h-9 text-xs bg-canvas-surface border-border-subtle"
              >
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_OPTIONS.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id} className="text-xs">
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Date & Duration (Two-Column Row) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="mgr-work-date"
                className="text-xs font-semibold text-foreground"
              >
                Date
              </Label>
              <Input
                id="mgr-work-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs bg-canvas-surface border-border-subtle"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Duration
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger className="h-9 text-xs bg-canvas-surface border-border-subtle">
                    <SelectValue placeholder="Hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 13 }, (_, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {i} {i === 1 ? "hr" : "hrs"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={minutes} onValueChange={setMinutes}>
                  <SelectTrigger className="h-9 text-xs bg-canvas-surface border-border-subtle">
                    <SelectValue placeholder="Mins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" className="text-xs">0m</SelectItem>
                    <SelectItem value="15" className="text-xs">15m</SelectItem>
                    <SelectItem value="30" className="text-xs">30m</SelectItem>
                    <SelectItem value="45" className="text-xs">45m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 3. Work Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="mgr-work-note"
              className="text-xs font-semibold text-foreground"
            >
              Work description
            </Label>
            <textarea
              id="mgr-work-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Sprint review, architecture sync, deliverable planning..."
              className="w-full rounded-md border border-input bg-canvas-surface p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none border-border-subtle"
            />
          </div>

          {/* 4. Footer Buttons */}
          <ModalFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              className="text-xs font-semibold h-8"
            >
              Save entry
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}