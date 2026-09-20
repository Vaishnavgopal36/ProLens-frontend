import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/composed/app-header";
import { AppSidebar } from "@/components/composed/app-sidebar";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-bg text-foreground font-sans">
      {/* Sidebar: full viewport height, owns brand and nav */}
      <AppSidebar />

      {/* Content column: light top bar + main, to the right of the sidebar only */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
