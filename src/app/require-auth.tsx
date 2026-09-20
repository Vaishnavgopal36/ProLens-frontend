import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { usePermissions, type Permission } from "@/hooks/use-permissions";

/** Redirects signed-out visitors to /login, remembering where they were headed. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <Outlet />;
}

/** Sends signed-in users without the capability back to the dashboard. */
export function RequirePermission({ permission }: { permission: Permission }) {
  const { can } = usePermissions();
  return can(permission) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
