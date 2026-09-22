import * as React from "react";
import { LogOut } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onLogout: () => void;
  isCollapsed?: boolean;
}

export function LogoutButton({
  onLogout,
  isCollapsed = false,
  className,
  ...props
}: LogoutButtonProps) {
  const button = (
    <button
      type="button"
      onClick={onLogout}
      className={cn(
        "group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none",
        "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10",
        isCollapsed && "justify-center px-0",
        className,
      )}
      aria-label="Log out"
      {...props}
    >
      <Icon
        icon={LogOut}
        size={18}
        className="shrink-0 text-slate-400 transition-colors group-hover:text-rose-400"
      />
      {!isCollapsed && <span className="truncate">Logout</span>}
    </button>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="text-rose-400 font-medium">
          Logout
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
