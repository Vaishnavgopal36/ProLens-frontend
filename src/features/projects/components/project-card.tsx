import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Folder, MoreVertical, Settings, Timer, Trash2 } from "lucide-react";
import type { Project } from "@/types/project";
import { usePermissions } from "@/hooks/use-permissions";
import { Card } from "@/components/ui/card";
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
import { ProjectSettingsDialog } from "./project-settings-dialog";
import { SprintSettingsDialog } from "./sprint-settings-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  /** "row" is the compact list layout; default is the full card. */
  layout?: "card" | "row";
  onUpdateProject?: (updated: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  layout = "card",
  onUpdateProject,
  onDeleteProject,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const { hasMinimumRole } = usePermissions();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sprintOpen, setSprintOpen] = React.useState(false);

  // Deleting a project is portfolio-lifecycle ownership — admin+ only.
  const canDeleteProject = hasMinimumRole("admin");

  const isOngoing = project.status === "ongoing";

  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDeleteProject?.(project.id);
    toast.success(`Project "${project.name}" has been deleted.`);
  };

  const actionsMenu = (
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
          <DropdownMenuItem
            onClick={() => setSprintOpen(true)}
            className="gap-2 cursor-pointer text-xs"
          >
            <Icon icon={Timer} size={14} />
            <span>Sprint Settings</span>
          </DropdownMenuItem>

          {canDeleteProject && (
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
  );

  const dialogs = (
    <>
      {/* Project & Sprint Settings Modal */}
      <ProjectSettingsDialog
        project={project}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onUpdateProject={onUpdateProject}
      />

      <div className="contents" onClick={(e) => e.stopPropagation()}>
        <SprintSettingsDialog
          project={project}
          open={sprintOpen}
          onOpenChange={setSprintOpen}
          onUpdateProject={onUpdateProject}
        />
        <DeleteProjectDialog
          project={project}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    </>
  );

  if (layout === "row") {
    return (
      <>
        <ProjectRow
          project={project}
          isOngoing={isOngoing}
          actionsMenu={actionsMenu}
          onOpen={() => navigate(`/projects/${project.id}`)}
        />
        {dialogs}
      </>
    );
  }

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
                "text-3xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0",
                isOngoing
                  ? "border-teal-500/40 text-teal-600 bg-teal-500/10 dark:text-teal-400"
                  : "border-gold-500/40 text-gold-600 bg-gold-500/10 dark:text-gold-400",
              )}
            >
              {project.status}
            </Badge>

            {actionsMenu}
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
              <p className="text-3xs text-muted-foreground font-medium">
                Estimated
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {project.estimatedHours}h
              </p>
            </div>
            <div>
              <p className="text-3xs text-muted-foreground font-medium">
                Logged
              </p>
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                {project.loggedHours}h
              </p>
            </div>
            <div>
              <p className="text-3xs text-muted-foreground font-medium">
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
                <AvatarFallback className="text-4xs font-bold bg-navy-500 text-white dark:bg-foreground dark:text-background">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-canvas-surface bg-muted text-4xs font-bold text-muted-foreground">
                +{project.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </Card>

      {dialogs}
    </>
  );
}

interface ProjectRowProps {
  project: Project;
  isOngoing: boolean;
  actionsMenu: React.ReactNode;
  onOpen: () => void;
}

/** One project as a compact row for the list layout. */
function ProjectRow({
  project,
  isOngoing,
  actionsMenu,
  onOpen,
}: ProjectRowProps) {
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) onOpen();
      }}
      className="group grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-lg border border-border-subtle bg-canvas-surface px-4 py-3 transition-all duration-150 hover:border-border-strong hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-[minmax(0,2.2fr)_88px_minmax(120px,1.2fr)_minmax(0,1.6fr)_96px_auto]"
    >
      <div className="min-w-0">
        <h3
          title={project.name}
          className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400"
        >
          {project.name}
        </h3>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Icon
            icon={Folder}
            size={12}
            className="shrink-0 text-muted-foreground/70"
          />
          <span className="truncate">{project.client}</span>
          <span className="shrink-0">•</span>
          <span className="shrink-0">Due {project.dueDate}</span>
        </div>
      </div>

      <div className="order-last col-span-2 flex items-center justify-between gap-3 lg:order-none lg:contents">
        <Badge
          variant="outline"
          className={cn(
            "w-fit shrink-0 rounded-full border px-2 py-0.5 text-3xs font-bold uppercase tracking-wider",
            isOngoing
              ? "border-teal-500/40 bg-teal-500/10 text-teal-600 dark:text-teal-400"
              : "border-gold-500/40 bg-gold-500/10 text-gold-600 dark:text-gold-400",
          )}
        >
          {project.status}
        </Badge>

        <div className="hidden min-w-0 space-y-1 lg:block">
          <div className="flex justify-between text-2xs">
            <span className="font-medium text-muted-foreground">
              Completion
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {project.completionPercentage}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                isOngoing ? "bg-teal-500" : "bg-gold-500",
              )}
              style={{ width: `${project.completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-4 text-xs tabular-nums text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">
              {project.estimatedHours}h
            </span>{" "}
            est
          </span>
          <span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              {project.loggedHours}h
            </span>{" "}
            logged
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {project.tasksCount}
            </span>{" "}
            tasks
          </span>
        </div>

        <div className="flex -space-x-1.5 overflow-hidden">
          {project.members.slice(0, 3).map((member) => (
            <Avatar
              key={member.id}
              className="h-6 w-6 border-2 border-canvas-surface ring-1 ring-border-subtle"
            >
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="bg-navy-500 text-4xs font-bold text-white dark:bg-foreground dark:text-background">
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          {project.members.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-canvas-surface bg-muted text-4xs font-bold text-muted-foreground">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </div>

      <div className="row-start-1 col-start-2 lg:row-auto lg:col-auto">
        {actionsMenu}
      </div>
    </div>
  );
}
