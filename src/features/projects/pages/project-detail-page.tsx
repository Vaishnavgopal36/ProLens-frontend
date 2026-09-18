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
import { BoardTab } from "@/features/projects/components/board/board-tab";
import { FeaturesTab } from "@/features/projects/components/features/features-tab";
import { ListTab } from "@/features/projects/components/list/list-tab";
import { CalendarTab } from "@/features/projects/components/calendar/calendar-tab";
import { TimelineTab } from "@/features/projects/components/timeline/timeline-tab";
import { AttachmentsTab } from "@/features/projects/components/attachments/attachments-tab";
import { ReportsTab } from "@/features/projects/components/reports/reports-tab";
import { TimeTab } from "@/features/projects/components/time/time-tab";
import { AddTaskDialog } from "@/features/projects/components/add-task-dialog";
import { AddFeatureDialog } from "@/features/projects/components/add-feature-dialog";
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
  const [addTaskOpen, setAddTaskOpen] = React.useState(false);
  const [addFeatureOpen, setAddFeatureOpen] = React.useState(false);

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
        onAddFeature={() => setAddFeatureOpen(true)}
        onAddTask={() => setAddTaskOpen(true)}
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

        {/* Tab 2: Board */}
        <TabsContent value="board" className="m-0 focus-visible:outline-none">
          <BoardTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Tab 3: Teams & Governance */}
        <TabsContent value="teams" className="m-0 focus-visible:outline-none">
          <TeamsTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Tab 4: Features */}
        <TabsContent
          value="features"
          className="m-0 focus-visible:outline-none"
        >
          <FeaturesTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Tab 5: List */}
        <TabsContent value="list" className="m-0 focus-visible:outline-none">
          <ListTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Tab 6: Calendar */}
        <TabsContent
          value="calendar"
          className="m-0 focus-visible:outline-none"
        >
          <CalendarTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Tab 7: Timeline */}
        <TabsContent
          value="timeline"
          className="m-0 focus-visible:outline-none"
        >
          <TimelineTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Tab 8: Attachments */}
        <TabsContent
          value="attachments"
          className="m-0 focus-visible:outline-none"
        >
          <AttachmentsTab
            project={project}
            selectedMemberId={selectedMemberId}
          />
        </TabsContent>

        {/* Tab 9: Reports */}
        <TabsContent value="reports" className="m-0 focus-visible:outline-none">
          <ReportsTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>

        {/* Tab 10: Time */}
        <TabsContent value="time" className="m-0 focus-visible:outline-none">
          <TimeTab project={project} selectedMemberId={selectedMemberId} />
        </TabsContent>
      </Tabs>

      {/* Global Add Task / Add Feature Modals */}
      <AddTaskDialog
        project={project}
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
      />
      <AddFeatureDialog
        project={project}
        open={addFeatureOpen}
        onOpenChange={setAddFeatureOpen}
      />
    </div>
  );
}
