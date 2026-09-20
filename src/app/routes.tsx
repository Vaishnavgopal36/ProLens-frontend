import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/app-shell";
import { ProjectsListPage, ProjectDetailPage } from "@/features/projects";
import { DashboardPage } from "@/features/dashboard";
import { OrgInsightsPage, MyInsightsPage } from "@/features/org-insights";
import { TimesheetPage } from "@/features/timesheets";
import { CalendarPage } from "@/features/calendar";
import { OrganizationsDirectoryPage } from "@/features/super-admin";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      // 1. Root route: Defaults to Dashboard
      {
        index: true,
        element: <DashboardPage />,
      },
      // 2. Explicit Dashboard URL
      {
        path: "dashboard",
        element: <DashboardPage />,
      },

      // 3. Calendar Domain
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      // 4. Time Reporting Domain
      {
        path: "timesheets",
        element: <TimesheetPage />,
      },

      // 5. Projects Domain
      {
        path: "projects",
        children: [
          {
            index: true,
            element: <ProjectsListPage />,
          },
          {
            path: ":projectId",
            element: <ProjectDetailPage />,
          },
        ],
      },
      {
        path: "org-insights",
        element: <OrgInsightsPage />,
      },
      {
        path: "my-insights",
        element: <MyInsightsPage />,
      },
      // 6. Super Admin Domain
      {
        path: "organizations",
        element: <OrganizationsDirectoryPage />,
      },
      {
        path: "*",
        element: (
          <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
            Page not found
          </div>
        ),
      },
    ],
  },
]);
