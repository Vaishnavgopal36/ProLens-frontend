import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { SWEEP_BASE } from "@/components/ui/sweep";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground font-semibold shadow-xs",
        secondary:
          "border border-primary text-foreground bg-transparent font-semibold shadow-xs",
        accent: "bg-primary text-primary-foreground font-semibold shadow-xs",
        outline: "border border-border-subtle bg-transparent",
        // Primary outline that fills on hover.
        sweep:
          SWEEP_BASE +
          " border border-primary bg-transparent text-foreground before:bg-secondary active:before:bg-brand-600 [@media(hover:hover)]:hover:text-white dark:border-brand-400 dark:text-brand-300",
        // Neutral outline with a soft wash
        "sweep-soft":
          SWEEP_BASE +
          " border border-border-subtle bg-transparent text-foreground before:bg-brand-100 dark:before:bg-white/10 [@media(hover:hover)]:hover:border-primary",
        ghost:
          "hover:bg-canvas-surface hover:text-foreground dark:hover:bg-canvas-surface",
        link: "text-primary underline-offset-4 hover:underline dark:text-brand-300",
        destructive: "bg-destructive text-destructive-foreground",
      },
      // Corner-sweep hover (the house style). Pass fx="off" for the plain
      // colour-swap hover; the login screen does this.
      fx: { on: "", off: "" },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-secondary active:before:bg-brand-600 dark:before:bg-secondary dark:active:before:bg-brand-600 [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "accent",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-secondary active:before:bg-brand-600 dark:before:bg-secondary dark:active:before:bg-brand-600 [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "secondary",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-secondary active:before:bg-brand-600 dark:before:bg-secondary dark:active:before:bg-brand-600 [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "outline",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-secondary active:before:bg-brand-600 dark:before:bg-secondary dark:active:before:bg-brand-600 [@media(hover:hover)]:hover:border-secondary [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "destructive",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-red-700 active:before:bg-red-800 [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "default",
        fx: "off",
        className: "hover:bg-secondary text-primary-foreground",
      },
      {
        variant: "secondary",
        fx: "off",
        className: "hover:bg-secondary/15 dark:hover:bg-secondary/25",
      },
      {
        variant: "accent",
        fx: "off",
        className: "hover:bg-secondary text-primary-foreground",
      },
      {
        variant: "outline",
        fx: "off",
        className:
          "hover:bg-canvas-surface hover:text-foreground dark:hover:bg-canvas-surface",
      },
      {
        variant: "destructive",
        fx: "off",
        className: "hover:bg-destructive/90",
      },
    ],
    defaultVariants: {
      fx: "on",
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
  ({ className, variant, size, fx, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fx, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
