import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/app/app-shell";
import { ProjectsListPage, ProjectDetailPage } from "@/features/projects";
import { DashboardPage } from "@/features/dashboard";

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
      // 3. Projects Domain
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
