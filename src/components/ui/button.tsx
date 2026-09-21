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
        default:
          "bg-navy-500 text-white dark:bg-foreground dark:text-background",
        secondary:
          "border border-teal-500 text-teal-600 bg-transparent dark:border-teal-400 dark:text-teal-300",
        accent:
          "bg-gold-500 text-navy-900 font-semibold dark:bg-teal-500 dark:text-white",
        outline: "border border-border-subtle bg-transparent",
        // Teal outline that fills teal (white text) on hover. For standalone
        // secondary actions such as "Add Feature"; not for dense lists.
        sweep:
          SWEEP_BASE +
          " border border-teal-600 bg-transparent text-teal-700 before:bg-teal-600 active:before:bg-teal-700 [@media(hover:hover)]:hover:text-white dark:border-teal-400 dark:text-teal-300 dark:before:bg-teal-500 dark:active:before:bg-teal-600",
        // Neutral outline with a soft teal wash (solid tint: Tailwind can't apply
        // /opacity to our var()-based teal tokens); keeps text and coloured
        // logos legible (used for the Microsoft / Google sign-in buttons).
        "sweep-soft":
          SWEEP_BASE +
          " border border-border-subtle bg-transparent text-foreground before:bg-teal-100 dark:before:bg-white/10 [@media(hover:hover)]:hover:border-teal-400",
        ghost:
          "hover:bg-canvas-surface hover:text-foreground dark:hover:bg-canvas-surface",
        link: "text-teal-600 underline-offset-4 hover:underline dark:text-teal-400",
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
          " before:bg-teal-600 active:before:bg-teal-700 dark:before:bg-teal-500 dark:active:before:bg-teal-600 [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "accent",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-navy-500 active:before:bg-navy-600 dark:before:bg-teal-700 dark:active:before:bg-teal-800 [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "secondary",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-teal-600 active:before:bg-teal-700 dark:before:bg-teal-500 dark:active:before:bg-teal-600 [@media(hover:hover)]:hover:text-white",
      },
      {
        variant: "outline",
        fx: "on",
        className:
          SWEEP_BASE +
          " before:bg-teal-600 active:before:bg-teal-700 dark:before:bg-teal-500 dark:active:before:bg-teal-600 [@media(hover:hover)]:hover:border-teal-600 [@media(hover:hover)]:hover:text-white",
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
        className: "hover:bg-navy-600 dark:hover:bg-foreground/90",
      },
      {
        variant: "secondary",
        fx: "off",
        className: "hover:bg-teal-50 dark:hover:bg-teal-950/40",
      },
      {
        variant: "accent",
        fx: "off",
        className: "hover:bg-gold-600 dark:hover:bg-teal-600",
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
