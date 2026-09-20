import * as React from "react";
import { useUI } from "@/app/providers";

/**
 * Renders the current screen in light mode regardless of the saved theme,
 * then re-applies the saved theme when it unmounts.
 *
 * The theme provider may re-apply its class after this screen mounts (initial
 * load, system-theme changes), so the lock watches <html> and strips "dark"
 * whenever it reappears.
 */
export function useForcedLightTheme() {
  const { theme } = useUI();
  const themeRef = React.useRef(theme);
  themeRef.current = theme;

  React.useLayoutEffect(() => {
    const root = document.documentElement;

    const enforce = () => {
      if (
        root.classList.contains("dark") ||
        !root.classList.contains("light")
      ) {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    };
    enforce();

    const observer = new MutationObserver(enforce);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      // Hand the page back to the user's saved theme.
      const mode = themeRef.current;
      const dark =
        mode === "dark" ||
        (mode === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.remove("light", "dark");
      root.classList.add(dark ? "dark" : "light");
    };
  }, []);
}
