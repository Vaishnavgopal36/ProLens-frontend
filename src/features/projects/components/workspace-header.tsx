import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Briefcase,
  ChevronRight,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WorkspaceHeaderProps {
  project: Project;
  onAddFeature?: () => void;
  onAddTask?: () => void;
}

export function WorkspaceHeader({
  project,
  onAddFeature,
  onAddTask,
}: WorkspaceHeaderProps) {
  const { hasMinimumRole } = usePermissions();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Day-to-day work (features/tasks) is a manager-level capability; deleting
  // the project itself is portfolio-lifecycle ownership, reserved for admins.
  const canManageWork = hasMinimumRole("manager");
  const canDeleteProject = hasMinimumRole("admin");

  const isOngoing = project.status === "ongoing";

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
                  "text-3xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0",
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
                  className="text-3xs font-medium px-2 py-0.5 rounded-full border-border-subtle bg-canvas-surface text-muted-foreground shrink-0"
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

        {/* Right: action buttons */}
        <div className="flex w-full min-w-0 flex-col items-start gap-2.5 sm:w-auto sm:items-end sm:shrink-0">
          {/* Manager Action Buttons */}
          {(canManageWork || canDeleteProject) && (
            <div className="flex flex-wrap items-center gap-2">
              {canManageWork && (
                <>
                  <Button
                    variant="sweep"
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
                    className="h-8 gap-1.5 text-xs font-semibold bg-gold-500 hover:bg-gold-600 text-navy-900 dark:text-navy-950"
                  >
                    <Icon icon={Plus} size={14} />
                    <span>Add Task</span>
                  </Button>
                </>
              )}

              {canDeleteProject && (
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
                      onClick={() => setDeleteDialogOpen(true)}
                      className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                    >
                      <Icon icon={Trash2} size={14} />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteProjectDialog
        project={project}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}
