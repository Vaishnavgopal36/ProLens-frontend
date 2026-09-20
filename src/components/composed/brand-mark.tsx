import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  /**
   * Which background the mark sits on. "on-dark" (default) draws the top
   * planes white, for the navy sidebar. "on-light" draws them navy, for light
   * pages such as sign-in, matching the brand's light-background logo.
   */
  tone?: "on-dark" | "on-light";
}

export function BrandMark({
  size = 24,
  tone = "on-dark",
  className,
  ...props
}: BrandMarkProps) {
  const planeFill = tone === "on-light" ? "#17283c" : "#ffffff";
  return (
    <svg
      viewBox="85 88 145 150"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      {/* Outer Teal Isometric Box Structure — fixed brand color, not tied
          to the theme's --teal-500 token (which shifts per light/dark). */}
      <path
        d="M225.99 116.35l-68.89 47.01-69.11-46.66v84.64l69.34 46.66 68.66-47.01v-84.64zm-123.98 26.72l55.13 37.22 54.82-37.42v16.97s-55.28 37.7-55.28 37.7l-54.68-36.85v-17.62zm55.25 88l-55.25-37.17v-16.19l54.68 36.76 55.27-37.79v16.93s-54.7 37.46-54.7 37.46z"
        fill="#1e8f8e"
      />
      {/* Top Floating Diamond Planes */}
      <polygon
        points="143.47 137.61 157.06 146.79 201.57 116.42 187.96 107.23 143.47 137.61"
        fill={planeFill}
      />
      <polygon
        points="128.59 127.56 114.98 118.38 159.5 88 173.08 97.18 128.59 127.56"
        fill={planeFill}
      />
    </svg>
  );
}
