import * as React from "react";
import { LayoutGrid, List, Rows2, Rows3 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ViewLayout = "cards" | "list";

/**
 * Remembers a screen's Cards/List choice in this browser. Storage can be
 * blocked or empty, so every access is guarded and defaults to cards.
 */
export function useViewLayout(storageKey: string) {
  const [layout, setLayout] = React.useState<ViewLayout>(() => {
    try {
      return localStorage.getItem(`prolens:view:${storageKey}`) === "list"
        ? "list"
        : "cards";
    } catch {
      return "cards";
    }
  });

  const update = React.useCallback(
    (next: ViewLayout) => {
      setLayout(next);
      try {
        localStorage.setItem(`prolens:view:${storageKey}`, next);
      } catch {
        /* storage unavailable: the choice lasts until reload */
      }
    },
    [storageKey],
  );

  return [layout, update] as const;
}

const OPTIONS: { value: ViewLayout; label: string; icon: typeof List }[] = [
  { value: "cards", label: "Card view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

/** Segmented Cards/List switch for screens that show a grid of cards. */
export function ViewToggle({
  value,
  onChange,
  className,
}: {
  value: ViewLayout;
  onChange: (value: ViewLayout) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Layout"
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-lg bg-muted p-0.5",
        className,
      )}
    >
      {OPTIONS.map((o) => (
        <Tooltip key={o.value}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={o.label}
              aria-pressed={value === o.value}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                value === o.value
                  ? "bg-canvas-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon icon={o.icon} size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{o.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export type CardDensity = "compact" | "expanded";

/** Remembers a screen's Compact/Expanded card density (see useViewLayout). */
export function useCardDensity(storageKey: string) {
  const [density, setDensity] = React.useState<CardDensity>(() => {
    try {
      return localStorage.getItem(`prolens:density:${storageKey}`) === "compact"
        ? "compact"
        : "expanded";
    } catch {
      return "expanded";
    }
  });

  const update = React.useCallback(
    (next: CardDensity) => {
      setDensity(next);
      try {
        localStorage.setItem(`prolens:density:${storageKey}`, next);
      } catch {
        /* storage unavailable: the choice lasts until reload */
      }
    },
    [storageKey],
  );

  return [density, update] as const;
}

const DENSITY_OPTIONS: {
  value: CardDensity;
  label: string;
  icon: typeof List;
}[] = [
  { value: "compact", label: "Compact cards", icon: Rows3 },
  { value: "expanded", label: "Expanded cards", icon: Rows2 },
];

/** Segmented Compact/Expanded switch for how much each card shows. */
export function DensityToggle({
  value,
  onChange,
  className,
}: {
  value: CardDensity;
  onChange: (value: CardDensity) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Card density"
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-lg bg-muted p-0.5",
        className,
      )}
    >
      {DENSITY_OPTIONS.map((o) => (
        <Tooltip key={o.value}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={o.label}
              aria-pressed={value === o.value}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                value === o.value
                  ? "bg-canvas-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon icon={o.icon} size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{o.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
