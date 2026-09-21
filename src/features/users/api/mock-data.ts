import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import type { UserRole } from "@/app/providers";

export type UserStatus = "active" | "inactive";

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  role: UserRole | string;
  designation: string;
  status: UserStatus;
  /** Names of the projects the person is a member of. */
  projects: string[];
}

/**
 * The org's people, built from project membership until the users API
 * exists. Anyone on several projects appears once, with all their projects.
 */
function buildDirectory(): DirectoryUser[] {
  const byEmail = new Map<string, DirectoryUser>();
  for (const project of MOCK_PROJECTS) {
    for (const m of project.members) {
      const existing = byEmail.get(m.email);
      if (existing) {
        existing.projects.push(project.name);
        continue;
      }
      byEmail.set(m.email, {
        id: m.id,
        name: m.name,
        email: m.email,
        initials: m.initials,
        avatarUrl: m.avatarUrl,
        role: m.role,
        designation: m.designation,
        status: m.status,
        projects: [project.name],
      });
    }
  }
  return [
    {
      id: "usr_admin",
      name: "Priya Nair",
      email: "admin@tarento.com",
      initials: "PN",
      role: "admin",
      designation: "Workspace Administrator",
      status: "active",
      projects: [],
    },
    ...byEmail.values(),
  ];
}

export const MOCK_USERS: DirectoryUser[] = buildDirectory();
