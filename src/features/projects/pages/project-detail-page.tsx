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
import { useTabKeyCycle } from "@/hooks/use-tab-key-cycle";
import { useModalHotkey } from "@/hooks/use-hotkey";
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
import { usePermissions } from "@/hooks/use-permissions";
import {
  WorkspaceHeaderSkeleton,
  MetricCardGridSkeleton,
  CardListSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";

// Teams (governance/roles) and Reports (portfolio-level reporting) are
// manager-facing concerns — employees only see the tabs relevant to doing
// their own contributor work on the project.
const WORKSPACE_TABS = [
  {
    value: "summary",
    label: "Summary",
    icon: LayoutDashboard,
    managerOnly: false,
  },
  { value: "board", label: "Board", icon: Kanban, managerOnly: false },
  { value: "teams", label: "Teams", icon: Users, managerOnly: true },
  { value: "features", label: "Features", icon: Layers, managerOnly: false },
  { value: "list", label: "List", icon: ListFilter, managerOnly: false },
  { value: "calendar", label: "Calendar", icon: Calendar, managerOnly: false },
  { value: "timeline", label: "Timeline", icon: Clock, managerOnly: false },
  {
    value: "attachments",
    label: "Attachments",
    icon: Paperclip,
    managerOnly: false,
  },
  { value: "reports", label: "Reports", icon: BarChart3, managerOnly: true },
  { value: "time", label: "Time", icon: Timer, managerOnly: false },
];

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { hasMinimumRole } = usePermissions();
  const isLoading = useSimulatedLoading();
  // 1. Declare activeTab and setActiveTab state
  const [activeTab, setActiveTab] = React.useState("summary");

  const visibleTabs = WORKSPACE_TABS.filter(
    (tab) => !tab.managerOnly || hasMinimumRole("manager"),
  );
  // Tab / Shift+Tab cycle through the workspace tabs from anywhere on the page.
  useTabKeyCycle(
    visibleTabs.map((tab) => tab.value),
    activeTab,
    setActiveTab,
  );
  const [addTaskOpen, setAddTaskOpen] = React.useState(false);
  const [addFeatureOpen, setAddFeatureOpen] = React.useState(false);

  // Ctrl/⌘ + K toggles the most relevant "add" modal for the current tab:
  // Features → new feature, everything else → new task. Tabs that own their
  // modal (Time, Teams) register their own shortcut.
  const ownsHotkey = ["time", "teams", "reports", "attachments"].includes(
    activeTab,
  );
  const addingFeature = activeTab === "features";
  useModalHotkey({
    open: addingFeature ? addFeatureOpen : addTaskOpen,
    onOpen: () =>
      addingFeature ? setAddFeatureOpen(true) : setAddTaskOpen(true),
    onClose: () =>
      addingFeature ? setAddFeatureOpen(false) : setAddTaskOpen(false),
    disabled: !hasMinimumRole("manager") || ownsHotkey,
  });

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
            {visibleTabs.map((tab) => (
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

            onNavigateTab={setActiveTab}
          />
        </TabsContent>

        {/* Tab 2: Board */}
        <TabsContent value="board" className="m-0 focus-visible:outline-none">
          <BoardTab project={project} />
        </TabsContent>

        {/* Tab 3: Teams & Governance */}
        <TabsContent value="teams" className="m-0 focus-visible:outline-none">
          <TeamsTab project={project} />
        </TabsContent>

        {/* Tab 4: Features */}
        <TabsContent
          value="features"
          className="m-0 focus-visible:outline-none"
        >
          <FeaturesTab project={project} />
        </TabsContent>

        {/* Tab 5: List */}
        <TabsContent value="list" className="m-0 focus-visible:outline-none">
          <ListTab project={project} />
        </TabsContent>

        {/* Tab 6: Calendar */}
        <TabsContent
          value="calendar"
          className="m-0 focus-visible:outline-none"
        >
          <CalendarTab project={project} />
        </TabsContent>

        {/* Tab 7: Timeline */}
        <TabsContent
          value="timeline"
          className="m-0 focus-visible:outline-none"
        >
          <TimelineTab project={project} />
        </TabsContent>

        {/* Tab 8: Attachments */}
        <TabsContent
          value="attachments"
          className="m-0 focus-visible:outline-none"
        >
          <AttachmentsTab project={project} />
        </TabsContent>

        {/* Tab 9: Reports */}
        <TabsContent value="reports" className="m-0 focus-visible:outline-none">
          <ReportsTab project={project} />
        </TabsContent>

        {/* Tab 10: Time */}
        <TabsContent value="time" className="m-0 focus-visible:outline-none">
          <TimeTab project={project} />
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
