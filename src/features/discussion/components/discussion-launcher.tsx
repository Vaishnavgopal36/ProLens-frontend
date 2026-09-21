import * as React from "react";
import { BrandMark } from "@/components/composed/brand-mark";
import { cn } from "@/lib/utils";
import { formatBadge } from "../lib/format";
import "./discussion-launcher.css";

interface DiscussionLauncherProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onToggle"
> {
  projectName: string;
  /** True while being dragged: hides the tooltip. */
  dragging?: boolean;
  /** Tooltip opens downwards / towards the right when there's no room above / left. */
  tooltipBelow?: boolean;
  tooltipLeft?: boolean;
  unread: number;
  open: boolean;
  onToggle: () => void;
  className?: string;
}

export const DiscussionLauncher = React.forwardRef<
  HTMLButtonElement,
  DiscussionLauncherProps
>(
  (
    {
      projectName,
      unread,
      open,
      onToggle,
      className,
      dragging,
      tooltipBelow,
      tooltipLeft,
      ...rest
    },
    ref,
  ) => {
    const status =
      unread > 0
        ? `${unread} unread message${unread === 1 ? "" : "s"}`
        : "No new messages";

    return (
      <div
        // `relative` is a default that a passed-in `fixed` overrides (the stylesheet
        // must not set position, or it would beat Tailwind's utilities).
        className={cn("pl-discuss relative", className)}
        data-open={open ? "true" : "false"}
        data-dragging={dragging ? "true" : "false"}
        data-below={tooltipBelow ? "true" : "false"}
        data-left={tooltipLeft ? "true" : "false"}
        {...rest}
      >
        <div className="pl-discuss__tooltip" aria-hidden="true">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-canvas-bg">
              <BrandMark size={22} tone="on-light" className="dark:hidden" />
              <BrandMark size={22} className="hidden dark:block" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-foreground">
                {projectName} discussion
              </div>
              <div
                className={cn(
                  "text-2xs tabular-nums",
                  unread > 0
                    ? "font-medium text-teal-600 dark:text-teal-300"
                    : "text-muted-foreground",
                )}
              >
                {status}
              </div>
            </div>
          </div>
        </div>

        <button
          ref={ref}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={
            unread > 0
              ? `Project discussion, ${unread} unread message${unread === 1 ? "" : "s"}`
              : "Project discussion"
          }
          className="pl-discuss__btn"
        >
          <span className="pl-discuss__layer" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span>
              <BrandMark
                tone="on-light"
                className="pl-discuss__mark dark:hidden"
              />
              <BrandMark className="pl-discuss__mark hidden dark:block" />
            </span>
          </span>
          <span className="pl-discuss__label" aria-hidden="true">
            Discuss
          </span>
        </button>

        {unread > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-1.5 -top-1.5 z-10 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-gold-500 px-1 text-3xs font-semibold tabular-nums text-navy-900 ring-2 ring-canvas-bg"
          >
            {formatBadge(unread)}
          </span>
        )}
      </div>
    );
  },
);
DiscussionLauncher.displayName = "DiscussionLauncher";
