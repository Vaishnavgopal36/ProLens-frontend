import { usePermissions } from "@/hooks/use-permissions";
import { SuperAdminOverviewPage } from "@/features/super-admin";
import { AdminDashboardPage } from "./admin-dashboard-page";
import { ManagerDashboardPage } from "./manager-dashboard-page";
import { EmployeeDashboardPage } from "./employee-dashboard-page";

// The one intentional exception to "no role-forked pages": each role's
// dashboard is a structurally different view (different sections, metrics
// and tables), not the same layout with a few fields hidden — so a single
// shared component would need to branch per-section throughout its JSX.
// Everywhere else, role differences are handled via usePermissions().
export function DashboardPage() {
  const { isSuperAdmin, isAdmin, isManager } = usePermissions();

  if (isSuperAdmin) {
    return <SuperAdminOverviewPage />;
  }

  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  if (isManager) {
    return <ManagerDashboardPage />;
  }

  return <EmployeeDashboardPage />;
}
