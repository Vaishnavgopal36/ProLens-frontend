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
import { SummaryTab } from "@/features/projects/components/summary/summary-tab";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  WorkspaceHeaderSkeleton,
  MetricCardGridSkeleton,
  CardListSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";

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
  const isLoading = useSimulatedLoading();
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(
    null,
  );
  // 1. Declare activeTab and setActiveTab state
  const [activeTab, setActiveTab] = React.useState("summary");

  const project = React.useMemo(() => {
    return MOCK_PROJECTS.find((p) => p.id === projectId);
  }, [projectId]);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeaderSkeleton />
        <div className="space-y-4">
          <MetricCardGridSkeleton count={6} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-5">
              <CardListSkeleton rows={3} />
              <CardListSkeleton rows={3} />
            </div>
            <div className="lg:col-span-5 space-y-5">
              <CardListSkeleton rows={3} />
              <TableSkeleton columns={3} rows={4} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Meta Header */}
      <WorkspaceHeader
        project={project}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
      />

      {/* 2. Bind value and onValueChange to controlled state */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-4"
      >
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

        {/* Tab 1: Summary */}
        <TabsContent value="summary" className="m-0 focus-visible:outline-none">
          <SummaryTab
            project={project}
            selectedMemberId={selectedMemberId}
            onNavigateTab={setActiveTab}
          />
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
