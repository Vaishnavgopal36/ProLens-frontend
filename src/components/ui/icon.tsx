import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconProps extends Omit<
  React.SVGAttributes<SVGSVGElement>,
  "ref"
> {
  icon: LucideIcon;
  size?: number;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    { icon: IconComponent, size = 20, strokeWidth = 1.5, className, ...props },
    ref,
  ) => {
    return (
      <IconComponent
        ref={ref}
        size={size}
        strokeWidth={strokeWidth}
        className={cn("shrink-0", className)}
        {...props}
      />
    );
  },
);
Icon.displayName = "Icon";
