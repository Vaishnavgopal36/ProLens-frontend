import * as React from "react";
import { cn } from "@/lib/utils";
import { FluidRibbonCanvas } from "./fluid-ribbon-canvas";

/**
 * Animated ribbon backdrop in the style of Stripe's sign-in artwork: a 3D
 * displaced-mesh ribbon rendered on the GPU (see fluid-ribbon-canvas.tsx).
 *
 * Purely decorative: aria-hidden, never intercepts pointer events, shows a
 * single still frame for users who prefer reduced motion, and falls back to a
 * static brand gradient when WebGL2 isn't available.
 */

/**
 * Colour stops of the ribbon, in order across its width. The names are
 * historical; any colours work: `pale` is the feathered leading edge, then
 * blue -> amber -> orange -> coral -> purple.
 */
export interface RibbonPalette {
  pale?: string;
  blue: string;
  amber: string;
  orange: string;
  coral: string;
  purple: string;
}

/**
 * The ribbon in our own brand colours, taken straight from the light-theme
 * scales in src/styles/tokens.css so the login page matches the app. Light
 * and mid steps only (no dark navy), with gold as a single warm band.
 * and mid steps only, with gold as a single warm band.
 *
 *   pale    --teal-100   #d2eceb   feathered leading edge
 *   blue    --teal-300   #71bfc0
 *   amber   --teal-500   #1e8f8e   brand teal, the main body
 *   orange  --navy-300   #8e9fb2   navy tint (the cool "violet" stop)
 *   coral   --gold-300   #f7ce6f   dimmed gold band
 *   purple  --teal-200   #a8dada   closes the ribbon on a cool edge
/**
 * Ribbon palette matching the Brevo theme single source of truth in tokens.css:
 *   pale    --brand-100   #d3f6e9   feathered mint leading edge
 *   blue    --brand-300   #74dcba   vibrant seafoam
 *   amber   --brand-500   #008264   Brevo Green primary anchor
 *   orange  --brand-800   #024637   deep forest band
 *   coral   --lime-300    #b7f59d   Brevo Lime electric accent
 *   purple  --brand-200   #abebd5   soft mint closing edge
 */
export const BRAND_LIGHT_PALETTE: RibbonPalette = {
  pale: "#d3f6e9",
  blue: "#74dcba",
  amber: "#1fad8c",
  orange: "#005944",
  coral: "#2eb897",
  purple: "#abebd5",
};

interface RibbonProps {
  /** Page colour under the artwork. */
  background?: string;
  palette?: RibbonPalette;
  className?: string;
  children: React.ReactNode;
}

/**
 * Full-page wrapper: animated ribbon behind, your content in front (z-10).
 * Children lay out in a flex column, so a page can place its own header,
 * centred card and footer:
 *
 *   <Ribbon>
 *     <header />
 *     <main className="flex flex-1 items-center justify-center" />
 *   </Ribbon>
 */
export function Ribbon({
  background = "#f6f9fc",
  palette = BRAND_LIGHT_PALETTE,
  className,
  children,
}: RibbonProps) {
  const [glFailed, setGlFailed] = React.useState(false);
  const handleUnsupported = React.useCallback(() => setGlFailed(true), []);

  return (
    <div
      className={cn(
        "relative flex min-h-dvh w-full flex-col overflow-hidden",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: background }}
      >
        {glFailed ? (
          <div className="h-full w-full bg-[linear-gradient(115deg,transparent_45%,#abebd5_62%,#008264_80%,#032b22_100%)]" />
        ) : (
          <FluidRibbonCanvas
            background={background}
            palette={palette}
            onUnsupported={handleUnsupported}
          />
        )}
      </div>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
