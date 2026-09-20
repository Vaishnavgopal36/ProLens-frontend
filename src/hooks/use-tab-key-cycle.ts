import * as React from "react";

const EDITABLE =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="combobox"], [role="textbox"]';
const OVERLAYS = '[role="dialog"], [role="menu"], [role="listbox"]';

/**
 * Tab / Shift+Tab switch between the tabs of the current page (wrapping
 * around), wherever focus is on the page.
 *
 * Tab keeps its normal job when it matters: inside text fields and combobox
 * controls, and whenever a dialog, menu or listbox is open.
 */
export function useTabKeyCycle(
  values: string[],
  active: string,
  onChange: (value: string) => void,
) {
  const latest = React.useRef({ values, active, onChange });
  latest.current = { values, active, onChange };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest(EDITABLE)) return;
      if (document.querySelector(OVERLAYS)) return;

      const { values, active, onChange } = latest.current;
      if (values.length < 2) return;

      e.preventDefault();
      const index = Math.max(values.indexOf(active), 0);
      const step = e.shiftKey ? -1 : 1;
      onChange(values[(index + step + values.length) % values.length]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
