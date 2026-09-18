import * as React from "react";
import { Toaster as Sonner } from "sonner";
import {
  CircleCheck,
  Info,
  TriangleAlert,
  CircleX,
  LoaderCircle,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // Toasts intentionally always use the dark, saturated palette
      // regardless of the app's own light/dark theme (same call Slack/Linear/
      // GitHub make for notification surfaces) — Sonner's light-mode
      // richColors tints are pale pastels that wash out against a light page.
      theme="dark"
      className="toaster group"
      richColors
      icons={{
        success: (
          <Icon icon={CircleCheck} size={18} className="text-green-400" />
        ),
        info: <Icon icon={Info} size={18} className="text-teal-400" />,
        warning: (
          <Icon icon={TriangleAlert} size={18} className="text-amber-400" />
        ),
        error: <Icon icon={CircleX} size={18} className="text-red-400" />,
        loading: (
          <Icon
            icon={LoaderCircle}
            size={18}
            className="animate-spin text-white/50"
          />
        ),
      }}
      toastOptions={{
        // Sonner reads background/border/text off its own --normal-bg /
        // --normal-border / --normal-text custom properties (and separate
        // --success-bg / --warning-bg / --error-bg / --info-bg ones for
        // richColors, driven by theme="dark" above). Overriding the
        // *resolved* CSS properties (background, color, ...) via inline
        // style would win the cascade unconditionally and flatten
        // richColors' per-type tints; overriding the custom properties
        // instead only re-themes the neutral/default toast, using our own
        // warm-charcoal surface instead of Sonner's pure black, and leaves
        // richColors' typed backgrounds alone. Fixed values, not
        // canvas-overlay, since this surface deliberately doesn't follow
        // the page's light/dark state.
        style: {
          "--normal-bg": "#2b2a27",
          "--normal-border": "#42403b",
          "--normal-text": "#f2f1ee",
        } as React.CSSProperties,
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-white/60",
          actionButton:
            "group-[.toast]:bg-teal-500 group-[.toast]:text-white font-medium",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white/70 font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
