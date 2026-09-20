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
