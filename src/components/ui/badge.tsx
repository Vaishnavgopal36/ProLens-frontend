import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-x-1.5 whitespace-nowrap rounded-full py-1.5 px-3 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        surface:
          "bg-surface text-surface-foreground dark:bg-canvas-surface dark:text-foreground",
        muted:
          "bg-muted text-muted-foreground-1 dark:bg-muted dark:text-muted-foreground",
        teal: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400",
        primary:
          "bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-400",
        red: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
        yellow:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
        plain:
          "bg-plain/10 text-foreground-inverse dark:bg-white/10 dark:text-white",

        // Codebase backwards-compatibility variants mapped to the new soft pastel pill styles
        default:
          "bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-400",
        secondary:
          "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400",
        destructive:
          "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
        success:
          "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400",
        warning:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
        neutral:
          "bg-surface text-surface-foreground dark:bg-canvas-surface dark:text-foreground",
        accent:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
        outline:
          "border border-border-subtle bg-transparent text-foreground dark:border-border-strong",
      },
      size: {
        default: "py-1.5 px-3 text-xs",
        sm: "py-1 px-2.5 text-2xs",
        xs: "py-0.5 px-2 text-3xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
