import * as React from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/providers";
import { usePermissions } from "@/hooks/use-permissions";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Project, ProjectFilterTab } from "@/types/project";
import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { ViewToggle, useViewLayout } from "@/components/composed/view-toggle";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import {
  PageHeaderSkeleton,
  ProjectCardGridSkeleton,
} from "@/components/composed/skeletons";

import { api } from "@/lib/api";
import { mapBackendProjectToProject } from "@/lib/mappers";
import { toast } from "sonner";

export function ProjectsListPage() {
  const { user } = useAuth();
  const { isEmployee, can } = usePermissions();
  const [activeFilter, setActiveFilter] =
    React.useState<ProjectFilterTab>("all");
  const [projects, setProjects] = React.useState<Project[]>(MOCK_PROJECTS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [layout, setLayout] = useViewLayout("projects");

  const loadProjects = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const backendProjects = await api.projects.list({
        include_insights: true,
      });
      if (backendProjects.length > 0) {
        const loaded = await Promise.all(
          backendProjects.map(async (bp) => {
            try {
              const members = await api.projects.listMembers(bp.id);
              return mapBackendProjectToProject(bp, members);
            } catch {
              return mapBackendProjectToProject(bp, []);
            }
          }),
        );
        setProjects(loaded);
      } else {
        setProjects(MOCK_PROJECTS);
      }
    } catch (err) {
      console.warn("Could not load backend projects, using sample:", err);
      setProjects(MOCK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Creating/deleting projects is portfolio-lifecycle ownership — reserved
  // for admins, not managers (who run day-to-day delivery on projects
  // someone else provisioned).
  const canManageProjects = can("create_projects");

  // Ctrl/⌘ + K toggles "new project" for roles that can create one.
  useModalHotkey({
    open: createDialogOpen,
    onOpen: () => setCreateDialogOpen(true),
    onClose: () => setCreateDialogOpen(false),
    disabled: !canManageProjects,
  });

  // Employees are individual contributors, not portfolio owners — they only
  // see projects they're actually staffed on. Managers/admins keep full
  // visibility across the portfolio.
  const visibleProjects = React.useMemo(() => {
    if (!isEmployee) return projects;
    return projects.filter((project) =>
      project.members.some((member) => member.email === user?.email),
    );
  }, [projects, isEmployee, user?.email]);

  const counts = React.useMemo(() => {
    return {
      all: visibleProjects.length,
      ongoing: visibleProjects.filter((p) => p.status === "ongoing").length,
      pending: visibleProjects.filter((p) => p.status === "pending").length,
      completed: visibleProjects.filter((p) => p.status === "completed").length,
    };
  }, [visibleProjects]);

  const filteredProjects = React.useMemo(() => {
    if (activeFilter === "all") return visibleProjects;
    return visibleProjects.filter((p) => p.status === activeFilter);
  }, [activeFilter, visibleProjects]);

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.projects.delete(projectId);
      setProjects((prev) => prev.filter((item) => item.id !== projectId));
      toast.success("Project deleted successfully");
    } catch {
      // If it's a mock project or backend returns error, remove locally
      setProjects((prev) => prev.filter((item) => item.id !== projectId));
      toast.success("Project removed");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton withAction />
        <ProjectCardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb Context */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
            <span>Projects</span>
            <Icon icon={ChevronRight} size={12} className="opacity-50" />
            <span className="text-foreground font-semibold">Portfolio</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Enterprise Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage portfolio allocations, delivery pipelines, and sprint
            velocities.
          </p>
        </div>

        {/* Actions & Filters Header Bar */}
        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
          <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
            <ProjectFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={counts}
            />
          </div>

          <ViewToggle value={layout} onChange={setLayout} />

          {canManageProjects && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-1.5 font-semibold shrink-0 self-start sm:self-auto"
            >
              <Icon icon={Plus} size={15} />
              <span>New Project</span>
            </Button>
          )}
        </div>
      </div>

      {/* Portfolio: card grid or compact list */}
      <div
        className={
          layout === "cards"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            : "flex flex-col gap-2"
        }
      >
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            layout={layout === "cards" ? "card" : "row"}
            project={project}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        ))}
      </div>

      {/* Create Project Modal */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
