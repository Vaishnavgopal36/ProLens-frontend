import * as React from "react";
import { Folder, MoreVertical, Eye, Pencil, Trash2, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActivityCardItem } from "@/types/activity";

interface ActivityCardProps {
  item: ActivityCardItem;
  onView: (item: ActivityCardItem) => void;
  onEdit: (item: ActivityCardItem) => void;
  onDelete: (id: string) => void;
}

export function ActivityCard({ item, onView, onEdit, onDelete }: ActivityCardProps) {
  const isProject = item.type === "project";

  return (
    <Card className="border-border-subtle bg-canvas-surface hover:border-border-strong hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Top Badges & 3-Dot Action */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="outline"
            className={
              isProject
                ? "border-teal-500/40 text-teal-600 bg-teal-500/10 dark:text-teal-400 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                : "border-border-subtle text-muted-foreground bg-canvas-bg/80 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
            }
          >
            {isProject ? "Project Activity" : "Non-Project Activity"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground/60 hover:text-foreground p-1 rounded-md transition-colors"
                aria-label="Activity options"
              >
                <Icon icon={MoreVertical} size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onView(item)} className="gap-2 text-xs cursor-pointer">
                <Icon icon={Eye} size={14} />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2 text-xs cursor-pointer">
                <Icon icon={Pencil} size={14} />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
              >
                <Icon icon={Trash2} size={14} />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3
          onClick={() => onView(item)}
          className="text-base font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors"
        >
          {item.title}
        </h3>

        {/* Metadata sub-row */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-2.5">
          <Icon
            icon={isProject ? Folder : Layers}
            size={13}
            className={isProject ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"}
          />
          <span className="font-medium text-foreground">
            {isProject ? item.projectName : item.streamName}
          </span>
          <span>•</span>
          <span>{item.date}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div>
        {/* 3-Cell Metrics Box */}
        <div className="grid grid-cols-3 divide-x divide-border-subtle rounded-lg border border-border-subtle bg-canvas-bg/50 py-2.5 text-center mb-4">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">
              Duration
            </p>
            <p className="text-xs font-semibold text-foreground mt-0.5 font-mono">
              {item.duration}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">
              Logged
            </p>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5 font-mono">
              {item.loggedHours}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">
              {isProject ? "Tasks" : "Scope"}
            </p>
            <p className="text-xs font-semibold text-foreground mt-0.5">
              {isProject ? `${item.tasksCount} Tasks` : item.scope}
            </p>
          </div>
        </div>

        {/* Bottom Row: Pill tag + Avatar stack */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-3">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {isProject && item.tasksCount ? (
              <span className="text-xs font-semibold text-foreground">
                {item.tasksCount} Tasks
              </span>
            ) : null}

            {item.taskTag ? (
              <span className="text-[11px] bg-canvas-bg border border-border-subtle text-muted-foreground px-2 py-0.5 rounded-md truncate max-w-[140px]">
                {item.taskTag}
              </span>
            ) : null}
          </div>

          {/* Overlapping member avatars */}
          <div className="flex -space-x-1.5 overflow-hidden shrink-0">
            {item.members.map((initial, i) => (
              <div
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-white dark:bg-foreground dark:text-background text-[9px] font-bold ring-2 ring-canvas-surface"
              >
                {initial}
              </div>
            ))}
            {item.moreMembersCount ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-canvas-surface">
                +{item.moreMembersCount}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}