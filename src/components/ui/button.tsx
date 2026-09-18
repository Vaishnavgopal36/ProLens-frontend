import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-navy-500 text-white hover:bg-navy-600 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90",
        secondary:
          "border border-teal-500 text-teal-600 bg-transparent hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-950/40",
        accent:
          "bg-gold-500 text-navy-900 font-semibold hover:bg-gold-600 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-600",
        outline:
          "border border-border-subtle bg-transparent hover:bg-canvas-surface hover:text-foreground dark:border-border-subtle dark:hover:bg-canvas-surface",
        ghost:
          "hover:bg-canvas-surface hover:text-foreground dark:hover:bg-canvas-surface",
        link: "text-teal-600 underline-offset-4 hover:underline dark:text-teal-400",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
