import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/app-shell";
import { RequireAuth, RequirePermission } from "@/app/require-auth";
import { LoginPage } from "@/features/auth";
import { ProjectsListPage, ProjectDetailPage } from "@/features/projects";
import { DashboardPage } from "@/features/dashboard";
import { OrgInsightsPage, MyInsightsPage } from "@/features/org-insights";
import { TimesheetPage } from "@/features/timesheets";
import { CalendarPage } from "@/features/calendar";
import { ActivityPage } from "@/features/activity";
import { ProfileSettingsPage } from "@/features/settings";
import { UserDirectoryPage } from "@/features/users";
import { OrganizationsDirectoryPage } from "@/features/super-admin";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "calendar",
            element: <CalendarPage />,
          },
          {
            path: "timesheets",
            element: <TimesheetPage />,
          },
          {
            path: "activity",
            element: <ActivityPage />,
          },
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
            element: <RequirePermission permission="view_org_insights" />,
            children: [{ path: "org-insights", element: <OrgInsightsPage /> }],
          },
          {
            path: "profile",
            element: <ProfileSettingsPage />,
          },
          {
            path: "my-insights",
            element: <MyInsightsPage />,
          },
          {
            element: <RequirePermission permission="manage_org_users" />,
            children: [{ path: "users", element: <UserDirectoryPage /> }],
          },
          {
            element: <RequirePermission permission="manage_organizations" />,
            children: [
              {
                path: "organizations",
                element: <OrganizationsDirectoryPage />,
              },
            ],
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
    ],
  },
]);
