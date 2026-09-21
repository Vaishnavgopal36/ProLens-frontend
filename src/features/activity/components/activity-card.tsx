import * as React from "react";
import { Trash2, Pencil, Clock, Calendar, Briefcase, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/activity";

interface ActivityCardProps {
  item: ActivityItem;
  viewMode: "compact" | "expanded";
  onSelect: (item: ActivityItem) => void;
  onEdit: (item: ActivityItem) => void;
  onDelete: (id: string) => void;
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityCard({
  item,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const isProject = item.category === "project";

  const handleDeleteConfirm = () => {
    onDelete(item.id);
    setDeleteOpen(false);
  };

  const formattedDate = formatDisplayDate(item.date);

  return (
    <>
      <Card
        onClick={() => onSelect(item)}
        className={cn(
          "group relative cursor-pointer border-border-subtle bg-canvas-surface transition-all duration-150 hover:border-border-strong hover:shadow-xs",
          viewMode === "compact" ? "p-3.5" : "p-5"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={isProject ? "secondary" : "neutral"}
              className="text-3xs px-2 py-0.5 uppercase tracking-wider font-bold"
            >
              {item.categoryLabel ||
                (isProject ? "Project Activity" : "Non-Project")}
            </Badge>

            {item.projectName && (
              <span className="flex items-center gap-1 text-2xs font-medium text-muted-foreground">
                <Icon icon={Briefcase} size={12} className="opacity-70" />
                <span>{item.projectName}</span>
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {item.statusBadge && (
              <Badge
                variant={item.statusBadge.variant}
                className="text-[10px] px-2 py-0 font-medium mr-1"
              >
                {item.statusBadge.label}
              </Badge>
            )}

            {/* Edit Pen Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-canvas-bg transition-colors"
              title="Edit activity"
            >
              <Icon icon={Pencil} size={13} />
            </Button>

            {/* Delete Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setDeleteOpen(true)}
              className="h-7 w-7 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete activity"
            >
              <Icon icon={Trash2} size={13} />
            </Button>
          </div>
        </div>

        <h3
          className={cn(
            "font-semibold text-foreground mt-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors",
            viewMode === "compact" ? "text-xs" : "text-sm",
          )}
        >
          {item.title}
        </h3>

        {viewMode === "expanded" && item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Formatted Date Display */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle/60 text-2xs text-muted-foreground",
            viewMode === "compact" ? "mt-2.5 pt-2" : "mt-3.5 pt-2.5",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Icon icon={Calendar} size={12} className="text-teal-600 dark:text-teal-400" />
              <span>{formattedDate} • {item.timeWindow}</span>
            </span>

            <span className="flex items-center gap-1">
              <Icon icon={Clock} size={12} className="opacity-70" />
              <span className="font-semibold text-foreground">
                {item.durationHours}
              </span>
            </span>
          </div>

          {item.loggedBy && viewMode === "expanded" && (
            <span className="flex items-center gap-1 text-3xs">
              <Icon icon={User} size={11} className="opacity-70" />
              <span>{item.loggedBy}</span>
            </span>
          )}
        </div>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{item.title}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              className="text-xs gap-1.5"
            >
              <Icon icon={Trash2} size={14} />
              <span>Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
