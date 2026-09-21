import * as React from "react";

interface Options {
  /** Called on release with the element under the finger (or null). */
  onDrop: (target: Element | null) => void;
  /** Called while dragging with the element under the finger, and null at the end. */
  onHover?: (target: Element | null) => void;
  /** Hold time before a touch turns into a drag. */
  delay?: number;
  /** Finger movement (px) before the hold is treated as a scroll and cancelled. */
  slop?: number;
}

function findScroller(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    )
      return node;
  }
  return null;
}

/**
 * Touch drag-and-drop by long press. HTML5 drag events don't fire on touch
 * screens, so this fills the gap: press and hold an element, then slide it.
 *
 *  - Moving before the hold completes cancels it, so normal scrolling and
 *    taps still work.
 *  - Once dragging, page scroll is blocked and the container auto-scrolls
 *    near the top and bottom edges.
 *  - A short vibration confirms the pick-up where the device supports it.
 *  - The element follows the finger via `offset`; it should apply it as a
 *    transform and set `pointer-events: none` while `dragging`.
 *  - `wasDragged()` is true briefly after a drop so the trailing click can be
 *    ignored.
 */
export function useLongPressDrag<T extends HTMLElement>({
  onDrop,
  onHover,
  delay = 350,
  slop = 10,
}: Options) {
  const ref = React.useRef<T>(null);
  const [dragging, setDragging] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const justDragged = React.useRef(false);
  const callbacks = React.useRef({ onDrop, onHover });
  callbacks.current = { onDrop, onHover };

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: number | undefined;
    let active = false;
    let raf = 0;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let scroller: HTMLElement | null = null;
    let startScroll = 0;

    const elementUnder = (x: number, y: number) => {
      // The dragged element sits under the finger; look through it.
      const previous = el.style.pointerEvents;
      el.style.pointerEvents = "none";
      const found = document.elementFromPoint(x, y);
      el.style.pointerEvents = previous;
      return found;
    };

    const update = (x: number, y: number) => {
      lastX = x;
      lastY = y;
      const scrolled = scroller ? scroller.scrollTop - startScroll : 0;
      setOffset({ x: x - startX, y: y - startY + scrolled });
      callbacks.current.onHover?.(elementUnder(x, y));
    };

    const autoScroll = () => {
      if (!active) return;
      const edge = 90;
      let step = 0;
      if (lastY < edge) step = -12;
      else if (lastY > window.innerHeight - edge) step = 12;
      if (step && scroller) {
        scroller.scrollTop += step;
        update(lastX, lastY);
      }
      raf = requestAnimationFrame(autoScroll);
    };

    const finish = (dropTarget: Element | null | undefined) => {
      cancelAnimationFrame(raf);
      active = false;
      setDragging(false);
      setOffset({ x: 0, y: 0 });
      callbacks.current.onHover?.(null);
      if (dropTarget !== undefined) {
        justDragged.current = true;
        window.setTimeout(() => (justDragged.current = false), 400);
        callbacks.current.onDrop(dropTarget);
      }
    };

    const cancelTimer = () => {
      window.clearTimeout(timer);
      timer = undefined;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = lastX = t.clientX;
      startY = lastY = t.clientY;
      cancelTimer();
      timer = window.setTimeout(() => {
        timer = undefined;
        scroller = findScroller(el);
        startScroll = scroller?.scrollTop ?? 0;
        active = true;
        navigator.vibrate?.(15);
        setDragging(true);
        update(lastX, lastY);
        raf = requestAnimationFrame(autoScroll);
      }, delay);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!active) {
        lastX = t.clientX;
        lastY = t.clientY;
        if (Math.hypot(t.clientX - startX, t.clientY - startY) > slop)
          cancelTimer();
        return;
      }
      e.preventDefault(); // stop the page scrolling under the drag
      update(t.clientX, t.clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      cancelTimer();
      if (!active) return;
      const t = e.changedTouches[0];
      finish(elementUnder(t.clientX, t.clientY));
    };

    const onTouchCancel = () => {
      cancelTimer();
      if (active) finish(undefined);
    };

    // Android fires a context menu on long press; suppress it around drags.
    const onContextMenu = (e: Event) => {
      if (timer !== undefined || active) e.preventDefault();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    // Not passive: we must be able to preventDefault to block scrolling.
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchCancel);
    el.addEventListener("contextmenu", onContextMenu);
    return () => {
      cancelTimer();
      cancelAnimationFrame(raf);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      el.removeEventListener("contextmenu", onContextMenu);
    };
    // Options are read through refs, so the listeners are attached once.
  }, [delay, slop]);

  return { ref, dragging, offset, wasDragged: () => justDragged.current };
}
