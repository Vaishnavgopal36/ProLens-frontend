import * as React from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  Users,
  Layers,
  ListFilter,
  Calendar,
  Clock,
  Paperclip,
  BarChart3,
  Timer,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import { WorkspaceHeader } from "@/features/projects/components/workspace-header";
import { TeamsTab } from "@/features/projects/components/teams-tab";
const WORKSPACE_TABS = [
  { value: "summary", label: "Summary", icon: LayoutDashboard },
  { value: "board", label: "Board", icon: Kanban },
  { value: "teams", label: "Teams", icon: Users },
  { value: "features", label: "Features", icon: Layers },
  { value: "list", label: "List", icon: ListFilter },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "timeline", label: "Timeline", icon: Clock },
  { value: "attachments", label: "Attachments", icon: Paperclip },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "time", label: "Time", icon: Timer },
];

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(
    null,
  );

  const project = React.useMemo(() => {
    return MOCK_PROJECTS.find((p) => p.id === projectId);
  }, [projectId]);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Meta Header */}
      <WorkspaceHeader
        project={project}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
      />

      {/* 10 Workspace Tabs - Default opens to "summary" */}
      <Tabs defaultValue="summary" className="w-full space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-9 justify-start bg-canvas-surface p-1 border border-border-subtle w-max sm:w-auto">
            {WORKSPACE_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 px-3 text-xs font-medium data-[state=active]:bg-canvas-bg data-[state=active]:text-foreground"
              >
                <Icon icon={tab.icon} size={14} className="opacity-70" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab 1: Summary (Active first view) */}
        <TabsContent value="summary" className="m-0 focus-visible:outline-none">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-canvas-surface/40 p-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas-overlay text-muted-foreground mb-3">
              <Icon icon={LayoutDashboard} size={20} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Summary View
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Executive overview, project health, and velocity summaries for{" "}
              {project.name}.
            </p>
          </div>
        </TabsContent>

        {/* Tab 3: Teams & Governance */}
        <TabsContent value="teams" className="m-0 focus-visible:outline-none">
          <TeamsTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Remaining Tab Placeholders */}
        {WORKSPACE_TABS.filter(
          (t) => t.value !== "summary" && t.value !== "teams",
        ).map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="m-0 focus-visible:outline-none"
          >
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-canvas-surface/40 p-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas-overlay text-muted-foreground mb-3">
                <Icon icon={tab.icon} size={20} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {tab.label} View
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                This section for {project.name} is ready to connect.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
