import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Material-style field used by the Kronos-style time entry form: no box, just
 * a bottom rule that turns teal on focus and red when invalid.
 */
export const underlineFieldClass =
  "h-10 w-full rounded-none border-0 border-b border-border bg-transparent px-0 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus-visible:border-teal-500 focus-visible:outline-none focus-visible:ring-0 aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

export const UnderlineInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(underlineFieldClass, className)} {...props} />
));
UnderlineInput.displayName = "UnderlineInput";
