import * as React from "react";

/** Tracks a CSS media query. Reads synchronously on first render (no flash). */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tailwind `md` (768px) is the tablet floor: below it the app is "mobile". */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}
