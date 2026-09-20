import * as React from "react";
import { useAuth } from "@/app/providers";
import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import { ACTIVITY_TAXONOMY, PROJECT_TAXONOMY } from "../api/mock-data";

/**
 * What the signed-in user can log time against: the projects they are
 * assigned to, plus the shared list of non-project activities.
 */
export function useWorkOptions() {
  const { user } = useAuth();
  return React.useMemo(
    () => ({
      projects: MOCK_PROJECTS.filter((project) =>
        project.members.some((member) => member.email === user?.email),
      )
        .map((project) => project.name)
        .filter((name) => name in PROJECT_TAXONOMY),
      activities: Object.keys(ACTIVITY_TAXONOMY),
    }),
    [user?.email],
  );
}
