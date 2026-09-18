import * as React from "react";
import { useAuth } from "@/app/providers";
import { AdminDashboardPage } from "./admin-dashboard-page";
import { ManagerDashboardPage } from "./manager-dashboard-page";
import { EmployeeDashboardPage } from "./employee-dashboard-page";

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? "employee";

  if (role === "admin" || role === "super_admin") {
    return <AdminDashboardPage />;
  }

  if (role === "manager") {
    return <ManagerDashboardPage />;
  }

  return <EmployeeDashboardPage />;
}