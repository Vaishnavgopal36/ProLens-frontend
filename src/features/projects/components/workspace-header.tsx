import * as React from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";

interface WorkspaceHeaderProps {
  project: Project;
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onAddFeature?: () => void;
  onAddTask?: () => void;
}

export function WorkspaceHeader({
  project,
  selectedMemberId,
  onSelectMember,
  onAddFeature,
  onAddTask,
}: WorkspaceHeaderProps) {
  const { user } = useAuth();

  const isManager =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  const isOngoing = project.status === "ongoing";

  return (
    <div className="space-y-4 pb-2">
      {/* Top Breadcrumb & Metadata Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Link
            to="/projects"
            className="hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <Icon icon={ChevronRight} size={13} className="opacity-50" />
          <span className="text-foreground font-semibold">{project.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-muted-foreground/70">Client: </span>
            <span className="font-medium text-foreground">
              {project.client}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground/70">Lead: </span>
            <span className="font-medium text-foreground">{project.lead}</span>
          </div>
          <div>
            <span className="text-muted-foreground/70">Timeline: </span>
            <span className="font-medium text-foreground">
              {project.dateRange}
            </span>
          </div>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex items-start justify-between gap-6">
        {/* Left: Project Icon, Title & Tags */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            <Icon icon={Briefcase} size={22} />
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {project.name}
              </h1>

              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0",
                  isOngoing
                    ? "border-teal-500/40 text-teal-600 bg-teal-500/10 dark:text-teal-400"
                    : "border-gold-500/40 text-gold-600 bg-gold-500/10 dark:text-gold-400",
                )}
              >
                {project.status}
              </Badge>

              {project.activeSprint && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full border-border-subtle bg-canvas-surface text-muted-foreground shrink-0"
                >
                  {project.activeSprint}
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {/* Right: Avatar Quick-Filters & Fixed Actions Column */}
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          {/* Member Quick Filter Stack */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              Filter by:
            </span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {project.members.map((member) => {
                const isSelected = selectedMemberId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() =>
                      onSelectMember(isSelected ? null : member.id)
                    }
                    className={cn(
                      "rounded-full transition-transform focus:outline-none",
                      isSelected
                        ? "ring-2 ring-gold-500 scale-110 z-10"
                        : "hover:scale-105",
                    )}
                    title={`Filter by ${member.name}`}
                  >
                    <Avatar className="h-7 w-7 border-2 border-canvas-surface">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback className="text-[10px] font-bold bg-navy-500 text-white dark:bg-foreground dark:text-background">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manager / Admin Exclusive Actions */}
          {isManager && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddFeature}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <Icon icon={Plus} size={14} />
                <span>Add Feature</span>
              </Button>

              <Button
                variant="accent"
                size="sm"
                onClick={onAddTask}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <Icon icon={Plus} size={14} />
                <span>Add Task</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
