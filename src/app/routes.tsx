import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/app/app-shell";
import { ProjectsListPage, ProjectDetailPage } from "@/features/projects";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/projects" replace />,
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
