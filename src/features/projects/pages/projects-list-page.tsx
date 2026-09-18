import * as React from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Project, ProjectFilterTab } from "@/types/project";
import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  ProjectCardGridSkeleton,
} from "@/components/composed/skeletons";

export function ProjectsListPage() {
  const { user } = useAuth();
  const isLoading = useSimulatedLoading();
  const [activeFilter, setActiveFilter] =
    React.useState<ProjectFilterTab>("all");
  const [projects, setProjects] = React.useState<Project[]>(MOCK_PROJECTS);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const canCreateProject =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  const counts = React.useMemo(() => {
    return {
      all: projects.length,
      ongoing: projects.filter((p) => p.status === "ongoing").length,
      pending: projects.filter((p) => p.status === "pending").length,
      completed: projects.filter((p) => p.status === "completed").length,
    };
  }, [projects]);

  const filteredProjects = React.useMemo(() => {
    if (activeFilter === "all") return projects;
    return projects.filter((p) => p.status === activeFilter);
  }, [activeFilter, projects]);

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((item) => item.id !== projectId));
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Projects</span>
            <span>&gt;</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Enterprise Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage portfolio allocations, delivery pipelines, and sprint
            velocities.
          </p>
        </div>

        {/* Actions & Filters Header Bar */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ProjectFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />

          {canCreateProject && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Icon icon={Plus} size={15} />
              <span>New Project</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3-Column Portfolio Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
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
