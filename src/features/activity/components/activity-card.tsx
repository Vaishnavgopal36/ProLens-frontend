import { Clock, User, Folder, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/activity";

interface ActivityCardProps {
  item: ActivityItem;
}

export function ActivityCard({ item }: ActivityCardProps) {
  const pinBg =
    item.pinColor === "teal"
      ? "bg-teal-600"
      : item.pinColor === "gold"
      ? "bg-gold-500"
      : item.pinColor === "secondary"
      ? "bg-teal-700"
      : "bg-navy-500 dark:bg-slate-500";

  return (
    <div className="group relative ml-12">
      {/* Timeline Node Pin */}
      <div className="absolute -left-12 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-canvas-surface shadow-xs ring-4 ring-canvas-bg">
        <span className={cn("h-2.5 w-2.5 rounded-full", pinBg)} />
      </div>

      <Card className="flex flex-col justify-between gap-3 border-border-subtle bg-canvas-surface p-5 transition-all hover:border-border-strong hover:shadow-sm md:flex-row md:items-start">
        <div className="flex-1 space-y-2">
          {/* Badge Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-[10px] uppercase font-bold px-2 py-0.5">
              {item.categoryLabel}
            </Badge>

            <Badge variant="outline" className="text-[10px] text-muted-foreground px-2 py-0.5">
              {item.category === "project" ? "Project Activity" : "Non-Project Activity"}
            </Badge>

            {item.projectName && (
              <Badge variant="secondary" className="gap-1 text-[10px] px-2 py-0.5">
                <Icon icon={Folder} size={11} />
                <span>{item.projectName}</span>
              </Badge>
            )}

            <Badge variant={item.statusBadge.variant} className="text-[10px] font-semibold px-2 py-0.5">
              {item.statusBadge.label}
            </Badge>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.description}
            </p>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Icon icon={Clock} size={13} className="text-muted-foreground" />
              <span>{item.timestamp}</span>
            </div>

            {item.loggedBy && (
              <div className="flex items-center gap-1.5">
                <Icon icon={User} size={13} />
                <span>
                  Logged by <strong className="text-foreground">{item.loggedBy}</strong>
                </span>
              </div>
            )}

            {item.assignees && (
              <div className="flex items-center gap-1.5">
                <Icon icon={User} size={13} />
                <span>
                  Assignees: <strong className="text-foreground">{item.assignees}</strong>
                </span>
              </div>
            )}

            {item.metaNote && (
              <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                <Icon icon={item.metaNote.icon} size={13} />
                <span>{item.metaNote.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Duration & Actions Menu */}
        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-start gap-2 shrink-0 self-end md:self-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-canvas-overlay transition-colors"
                aria-label="Activity options"
              >
                <Icon icon={MoreHorizontal} size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem className="text-xs cursor-pointer">View details</DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer">Copy link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {item.durationHours}
          </span>
        </div>
      </Card>
    </div>
  );
}