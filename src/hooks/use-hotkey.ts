import * as React from "react";

interface HotkeyOptions {
  /** Skip the shortcut (e.g. while a modal is already open). */
  disabled?: boolean;
}

/**
 * Registers a Ctrl/⌘ + <key> shortcut for as long as the component is mounted.
 * preventDefault stops the browser's own binding (Ctrl+K focuses Firefox's
 * search bar). The latest handler is always used, so callers needn't memoise.
 */
function useModHotkey(
  key: string,
  handler: () => void,
  { disabled = false }: HotkeyOptions = {},
) {
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      e.preventDefault();
      handlerRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, disabled]);
}

/** Ctrl/⌘ + E: collapse or expand the sidebar (Firefox binds it to search). */
export function useSidebarHotkey(handler: () => void) {
  useModHotkey("e", handler);
}

const isTypingTarget = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return (
    !!el &&
    (el.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
  );
};

/**
 * Shift + F toggles a page's filter panel. Ignored while typing (so capital F
 * in a search box works) and while another dialog is open, unless the filter
 * panel itself is the open thing.
 */
export function useFilterHotkey({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const ref = React.useRef({ open, onToggle });
  ref.current = { open, onToggle };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() !== "f" || e.repeat) return;
      if (isTypingTarget(e.target)) return;
      // A popover counts as a dialog for Radix; only block real modals.
      if (
        !ref.current.open &&
        document.querySelector('[role="dialog"][data-state="open"]')
      )
        return;
      e.preventDefault();
      ref.current.onToggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

interface ModalHotkeyOptions {
  open: boolean;
  /** Called when the shortcut should open the modal (prefill lives here). */
  onOpen: () => void;
  onClose: () => void;
  disabled?: boolean;
}

/**
 * Ctrl/⌘ + K toggles a page's primary modal: open → close → open…
 * It never opens on top of a *different* modal that is already showing.
 */
export function useModalHotkey({
  open,
  onOpen,
  onClose,
  disabled,
}: ModalHotkeyOptions) {
  useModHotkey(
    "k",
    () => {
      if (open) onClose();
      else if (!document.querySelector('[role="dialog"]')) onOpen();
    },
    { disabled },
  );
}
