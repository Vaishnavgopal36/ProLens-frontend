import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-navy-500 text-white shadow hover:bg-navy-600 dark:bg-foreground dark:text-background",
        secondary:
          "border-transparent bg-teal-500 text-white hover:bg-teal-600",
        accent:
          "border-transparent bg-gold-500 text-navy-900 font-bold hover:bg-gold-600 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-600",
        outline:
          "text-foreground border-border-subtle dark:border-border-strong",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        success:
          "border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
        warning:
          "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        neutral:
          "border-transparent bg-navy-50 text-navy-700 dark:bg-navy-900 dark:text-navy-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
