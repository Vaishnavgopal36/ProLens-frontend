import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Folder, MoreVertical, Settings, Trash2 } from "lucide-react";
import type { Project } from "@/types/project";
import { useAuth } from "@/app/providers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ProjectSettingsDialog } from "./project-settings-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onUpdateProject?: (updated: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  onUpdateProject,
  onDeleteProject,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const isManager =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  const isOngoing = project.status === "ongoing";

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDeleteProject?.(project.id);
    toast.success(`Project "${project.name}" has been deleted.`);
  };

  return (
    <>
      <Card
        onClick={() => navigate(`/projects/${project.id}`)}
        className="group relative flex flex-col justify-between overflow-hidden cursor-pointer border-border-subtle bg-canvas-surface p-5 transition-all duration-150 hover:border-border-strong hover:shadow-md min-w-0"
      >
        <div>
          {/* Top Row: Status Badge & 3-Dot Action Menu */}
          <div className="flex items-center justify-between gap-2">
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

            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground/60 hover:text-foreground p-1 rounded-md transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Project actions"
                  >
                    <Icon icon={MoreVertical} size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Icon icon={Settings} size={14} />
                    <span>Project Settings</span>
                  </DropdownMenuItem>

                  {isManager && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                      >
                        <Icon icon={Trash2} size={14} />
                        <span>Delete Project</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Project Title: Clamped to 2 lines max with break-words */}
          <div className="mt-3 space-y-1 min-w-0">
            <h3
              title={project.name}
              className="text-base font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 break-all leading-snug"
            >
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <Icon
                icon={Folder}
                size={13}
                className="shrink-0 text-muted-foreground/70"
              />
              <span className="truncate max-w-[130px]" title={project.client}>
                {project.client}
              </span>
              <span className="shrink-0">•</span>
              <span className="shrink-0">Due {project.dueDate}</span>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Total Completion
              </span>
              <span className="font-semibold text-foreground">
                {project.completionPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isOngoing ? "bg-teal-500" : "bg-gold-500",
                )}
                style={{ width: `${project.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Hours & Task Metrics Box */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-border-subtle rounded-lg border border-border-subtle bg-canvas-bg/50 py-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">
                Estimated
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {project.estimatedHours}h
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">
                Logged
              </p>
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                {project.loggedHours}h
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">
                Tasks
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {project.tasksCount} Tasks
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Row: Core Features Count & Member Avatar Stack */}
        <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
          <span className="text-xs font-medium text-muted-foreground">
            {project.coreFeaturesCount} Core Features
          </span>

          <div className="flex -space-x-1.5 overflow-hidden">
            {project.members.slice(0, 3).map((member) => (
              <Avatar
                key={member.id}
                className="h-6 w-6 border-2 border-canvas-surface ring-1 ring-border-subtle"
              >
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="text-[9px] font-bold bg-navy-500 text-white dark:bg-foreground dark:text-background">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-canvas-surface bg-muted text-[9px] font-bold text-muted-foreground">
                +{project.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Project & Sprint Settings Modal */}
      <ProjectSettingsDialog
        project={project}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onUpdateProject={onUpdateProject}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[420px]"
          onClick={(e) => e.stopPropagation()}
        >
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
    </>
  );
}
