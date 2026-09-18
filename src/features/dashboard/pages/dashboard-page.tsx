import * as React from "react";
import { useAuth, type UserRole } from "@/app/providers";
import { AdminDashboardPage } from "./admin-dashboard-page";
import { ManagerDashboardPage } from "./manager-dashboard-page";
import { EmployeeDashboardPage } from "./employee-dashboard-page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DashboardPage() {
  const { user } = useAuth();

  // Initialize with the logged-in user's role, defaulting to 'employee'
  const [activeRole, setActiveRole] = React.useState<UserRole>(
    user?.role ?? "employee"
  );

  // Sync state if the auth context updates
  React.useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user?.role]);

  return (
    <div className="space-y-4">
      {/* Dev Role Switcher: lets you preview all 3 designs instantly */}
      <div className="flex items-center justify-end gap-2 pb-2 border-b border-border-subtle/50">
        <span className="text-xs text-muted-foreground font-medium">
          Preview Role:
        </span>
        <div className="w-36">
          <Select
            value={activeRole}
            onValueChange={(val) => setActiveRole(val as UserRole)}
          >
            <SelectTrigger className="h-7 text-xs bg-canvas-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conditional view rendering */}
      {activeRole === "admin" || activeRole === "super_admin" ? (
        <AdminDashboardPage />
      ) : activeRole === "manager" ? (
        <ManagerDashboardPage />
      ) : (
        <EmployeeDashboardPage />
      )}
    </div>
  );
}