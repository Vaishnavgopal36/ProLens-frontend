import * as React from "react";
import {
  LayoutGrid,
  Calendar,
  FolderKanban,
  Clock,
  TrendingUp,
  Activity,
  Building2,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUI, useAuth } from "@/app/providers";
import { usePermissions } from "@/hooks/use-permissions";
import type { UserRole } from "@/app/providers";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/composed/brand-mark";
import { SWEEP_BASE } from "@/components/ui/sweep";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentProps<typeof Icon>["icon"];
}

const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  employee: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "Calendar", href: "/calendar", icon: Calendar },
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Activity", href: "/activity", icon: Activity },
    { title: "Time Reporting", href: "/timesheets", icon: Clock },
    { title: "My Insights", href: "/my-insights", icon: TrendingUp },
  ],
  manager: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "Calendar", href: "/calendar", icon: Calendar },
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Activity", href: "/activity", icon: Activity },
    { title: "Time Reporting", href: "/timesheets", icon: Clock },
    { title: "Org Insights", href: "/org-insights", icon: TrendingUp },
  ],
  admin: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "Calendar", href: "/calendar", icon: Calendar },
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Activity", href: "/activity", icon: Activity },
    { title: "Org Insights", href: "/org-insights", icon: TrendingUp },
    { title: "Users", href: "/users", icon: Users },
  ],
  super_admin: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "Organizations", href: "/organizations", icon: Building2 },
  ],
};

export function AppSidebar() {
  const { isSidebarOpen, setSidebarOpen } = useUI();
  const { logout } = useAuth();
  const { role } = usePermissions();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeHash, setActiveHash] = React.useState("#dashboard");
  const [isLogoHovered, setIsLogoHovered] = React.useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const items = ROLE_NAV_ITEMS[role] ?? ROLE_NAV_ITEMS.employee;

  // Once any routed item matches the current URL, hash-based placeholder
  // items (no page built yet) must never show as active alongside it.
  // An item is active on its own page and on every page nested under it
  // (e.g. Projects stays lit on /projects/proj-1).
  const matchesRoute = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);
  const isOnKnownRoute = items.some(
    (i) => i.href.startsWith("/") && matchesRoute(i.href),
  );

  const renderNavList = (collapsed: boolean) => (
    <nav className="flex flex-col gap-1 px-2.5 py-2">
      {items.map((item) => {
        const isRoute = item.href.startsWith("/");
        const isActive = isRoute
          ? matchesRoute(item.href)
          : !isOnKnownRoute && activeHash === item.href;

        const navLink = (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              if (isRoute) {
                navigate(item.href);
              } else {
                setActiveHash(item.href);
              }
              setSidebarOpen(false);
            }}
            className={cn(
              SWEEP_BASE,
              "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors",
              isActive
                ? "bg-navy-700/60 dark:bg-canvas-overlay text-white font-semibold"
                : "text-slate-400 before:bg-white/10 hover:text-white",
              collapsed && "justify-center px-0",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gold-500" />
            )}

            <Icon
              icon={item.icon}
              size={18}
              className={cn(
                isActive
                  ? "text-white"
                  : "text-slate-400 group-hover:text-white",
              )}
            />

            {!collapsed && <span className="truncate">{item.title}</span>}
          </a>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href} delayDuration={150}>
              <TooltipTrigger asChild>{navLink}</TooltipTrigger>
              <TooltipContent side="right">{item.title}</TooltipContent>
            </Tooltip>
          );
        }

        return navLink;
      })}
    </nav>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={() => setLogoutConfirmOpen(true)}
      className={cn(
        "group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors outline-none",
        isCollapsed && "justify-center px-0",
      )}
      aria-label="Log out"
    >
      <Icon
        icon={LogOut}
        size={18}
        className="text-destructive/80 group-hover:text-destructive transition-colors"
      />
      {!isCollapsed && <span className="truncate font-semibold">Logout</span>}
    </button>
  );

  return (
    <>
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="flex flex-col justify-between w-64 p-0 bg-navy-500 dark:bg-canvas-bg border-r border-border-subtle text-white"
        >
          <div>
            <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
              <BrandMark size={22} />
              <span className="text-base font-semibold tracking-tight text-white truncate">
                ProLens
              </span>
            </div>
            {renderNavList(false)}
          </div>

          <div className="p-3 border-t border-border-subtle">
            {logoutButton}
          </div>
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "hidden md:flex flex-col bg-navy-500 dark:bg-canvas-bg border-r border-border-subtle text-slate-300 transition-[width] duration-200 ease-in-out shrink-0 select-none",
          isCollapsed ? "w-16" : "w-56",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-3.5">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5">
                <BrandMark size={22} />
                <span className="text-base font-semibold tracking-tight text-white truncate">
                  ProLens
                </span>
              </div>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(true)}
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 dark:hover:bg-canvas-surface"
                    aria-label="Collapse sidebar"
                  >
                    <Icon icon={PanelLeftClose} size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse sidebar</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div
              className="flex w-full justify-center"
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
            >
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCollapsed(false);
                      setIsLogoHovered(false);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-canvas-surface transition-colors"
                    aria-label="Open sidebar"
                  >
                    {isLogoHovered ? (
                      <Icon
                        icon={PanelLeftOpen}
                        size={19}
                        className="text-white"
                      />
                    ) : (
                      <BrandMark size={22} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Open sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderNavList(isCollapsed)}
        </div>

        <div className="p-2.5 shrink-0">
          {isCollapsed ? (
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>{logoutButton}</TooltipTrigger>
              <TooltipContent
                side="right"
                className="text-destructive font-semibold"
              >
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            logoutButton
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Log Out"
        description="Are you sure you want to log out of ProLens?"
        confirmLabel="Log Out"
        onConfirm={() => {
          logout();
          setSidebarOpen(false);
        }}
      />
    </>
  );
}
