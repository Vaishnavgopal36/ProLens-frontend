import * as React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface KpiAlertLinkProps {
  /**
   * Where the problem is. "#some-id" scrolls to that element on this page;
   * "/path" or "/path#some-id" navigates there and then scrolls.
   */
  to: string;
  children: React.ReactNode;
  className?: string;
}

function scrollToId(id: string) {
  // The target page may still be mounting after a navigation, so retry for
  // a short while before giving up.
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus?.({ preventScroll: true });
    } else if (tries++ < 30) requestAnimationFrame(attempt);
  };
  attempt();
}

/**
 * The "take me to the problem" link every alert KPI must carry. Only render
 * it while the KPI is actually in an alert state.
 */
export function KpiAlertLink({ to, children, className }: KpiAlertLinkProps) {
  const navigate = useNavigate();

  const go = (e: React.MouseEvent) => {
    e.preventDefault();
    const [path, hash] = to.split("#");
    if (path) navigate(path);
    if (hash) scrollToId(hash);
  };

  return (
    <a
      href={to}
      onClick={go}
      className={cn(
        "mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {children}
      <Icon icon={ArrowRight} size={12} />
    </a>
  );
}
