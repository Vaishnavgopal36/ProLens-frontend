import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, Laptop, User, LogOut } from "lucide-react";
import { useUI, useAuth, type ThemeMode } from "@/app/providers";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";

export function AppHeader() {
  const { toggleSidebar, theme, cycleTheme } = useUI();
  const { user, logout } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const navigate = useNavigate();

  const getThemeIcon = (mode: ThemeMode) => {
    if (mode === "light") return Sun;
    if (mode === "dark") return Moon;
    return Laptop;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-border-subtle bg-canvas-surface/80 px-4 md:px-6 backdrop-blur-md transition-colors">
      {/* Mobile Drawer Hamburger */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden text-foreground hover:bg-canvas-overlay"
          aria-label="Toggle navigation menu"
        >
          <Icon icon={Menu} size={18} />
        </Button>
      </div>

      {/* Profile Avatar Dropdown Trigger */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open user menu"
            >
              <Avatar className="h-8 w-8 border border-border-subtle cursor-pointer transition-transform hover:scale-105">
                <AvatarImage src={user?.avatarUrl} alt={user?.name ?? "User"} />
                <AvatarFallback className="bg-navy-500 text-2xs font-bold text-white dark:bg-foreground dark:text-background">
                  {user?.initials ?? "VG"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 mt-1.5">
            {/* User Details */}
            <DropdownMenuLabel className="font-normal px-2.5 py-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 border border-border-subtle">
                  <AvatarImage
                    src={user?.avatarUrl}
                    alt={user?.name ?? "User"}
                  />
                  <AvatarFallback className="bg-navy-500 text-2xs font-bold text-white dark:bg-foreground dark:text-background">
                    {user?.initials ?? "VG"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-2xs text-muted-foreground truncate">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Switch Theme Option */}
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                cycleTheme();
              }}
              className="gap-2.5 cursor-pointer justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon icon={getThemeIcon(theme)} size={16} />
                <span>
                  Theme:{" "}
                  <strong className="capitalize font-semibold">{theme}</strong>
                </span>
              </div>
              <span className="text-3xs text-muted-foreground uppercase font-semibold">
                Switch
              </span>
            </DropdownMenuItem>

            {/* Profile Settings */}
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="gap-2.5 cursor-pointer"
            >
              <Icon icon={User} size={16} />
              <span>Profile Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Log Out */}
            <DropdownMenuItem
              onClick={() => setLogoutConfirmOpen(true)}
              className="gap-2.5 cursor-pointer text-destructive focus:text-destructive"
            >
              <Icon icon={LogOut} size={16} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Log Out"
        description="Are you sure you want to log out of ProLens?"
        confirmLabel="Log Out"
        onConfirm={logout}
      />
    </header>
  );
}
