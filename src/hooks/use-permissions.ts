import * as React from "react";
import { useAuth, type UserRole } from "@/app/providers";

// Ordered lowest to highest privilege. Drives hasMinimumRole() range checks.
const ROLE_RANK: Record<UserRole, number> = {
  employee: 0,
  manager: 1,
  admin: 2,
  super_admin: 3,
};

// Capability matrix — the single source of truth for "who can do X".
// Add new capabilities here rather than inlining role checks at call sites.
const PERMISSIONS = {
  manage_organizations: ["super_admin"],
  view_org_insights: ["manager", "admin", "super_admin"],
  manage_org_users: ["admin", "super_admin"],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export interface Permissions {
  role: UserRole;
  isEmployee: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  /** True when the current role's rank is >= the given role's rank. */
  hasMinimumRole: (role: UserRole) => boolean;
  /** True when the current role is granted the given capability. */
  can: (permission: Permission) => boolean;
}

export function usePermissions(): Permissions {
  const { user } = useAuth();
  const role: UserRole = user?.role ?? "employee";

  return React.useMemo(
    () => ({
      role,
      isEmployee: role === "employee",
      isManager: role === "manager",
      isAdmin: role === "admin",
      isSuperAdmin: role === "super_admin",
      hasMinimumRole: (minRole) => ROLE_RANK[role] >= ROLE_RANK[minRole],
      can: (permission) =>
        (PERMISSIONS[permission] as readonly UserRole[]).includes(role),
    }),
    [role],
  );
}
