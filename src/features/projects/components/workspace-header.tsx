import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Briefcase,
  ChevronRight,
  MoreHorizontal,
  Archive,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const isManager =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  const isOngoing = project.status === "ongoing";

  const handleArchive = () => {
    toast.success(`"${project.name}" has been archived.`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    toast.success(`Project "${project.name}" has been deleted.`);
    navigate("/projects");
  };

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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
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

        {/* Right: Clean Avatar Filter & Action Button Stack */}
        <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              Filter by:
            </span>
            <div className="flex items-center -space-x-1.5 overflow-visible py-1 px-1">
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
                      "relative rounded-full transition-all focus:outline-none shrink-0",
                      isSelected
                        ? "z-20 scale-110 ring-2 ring-gold-500 ring-offset-2 ring-offset-canvas-bg shadow-sm"
                        : "z-0 hover:z-10 hover:scale-105 opacity-85 hover:opacity-100",
                    )}
                    title={`Filter by ${member.name}`}
                  >
                    <Avatar className="h-7 w-7 border-2 border-canvas-bg">
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

          {/* Manager Action Buttons */}
          {isManager && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddFeature}
                className="h-8 gap-1.5 text-xs font-semibold bg-canvas-surface hover:bg-canvas-overlay"
              >
                <Icon icon={Plus} size={14} />
                <span>Add Feature</span>
              </Button>

              <Button
                variant="accent"
                size="sm"
                onClick={onAddTask}
                className="h-8 gap-1.5 text-xs font-semibold bg-gold-500 hover:bg-gold-600 text-navy-900 dark:text-navy-950"
              >
                <Icon icon={Plus} size={14} />
                <span>Add Task</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 bg-canvas-surface hover:bg-canvas-overlay"
                    aria-label="More project actions"
                  >
                    <Icon icon={MoreHorizontal} size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={handleArchive}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Icon icon={Archive} size={14} />
                    <span>Archive Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                  >
                    <Icon icon={Trash2} size={14} />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground font-semibold break-all">
                {project.name}
              </strong>
              ? This action cannot be undone and will remove all associated
              sprints, tasks, and logged hours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5"
            >
              <Icon icon={Trash2} size={15} />
              <span>Delete Project</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
