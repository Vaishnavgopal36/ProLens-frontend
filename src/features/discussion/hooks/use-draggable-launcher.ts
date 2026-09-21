import * as React from "react";

/** Diameter of the launcher, matches `.pl-discuss` (2.75rem). */
export const LAUNCHER_SIZE = 44;
const MARGIN = 8;
const DRAG_THRESHOLD = 4;
const KEY_STEP = 16;
const STORAGE_KEY = "prolens:discussion:launcher";

export interface LauncherPosition {
  /** Distance from the right / bottom viewport edges, in px. */
  right: number;
  bottom: number;
}

const getSideMargin = (): number => (window.innerWidth >= 768 ? 32 : 20);

const defaultPosition = (): LauncherPosition => ({
  right: getSideMargin(),
  bottom: window.innerWidth >= 768 ? 48 : 40,
});

const clamp = (p: LauncherPosition): LauncherPosition => ({
  right: Math.min(
    Math.max(p.right, MARGIN),
    Math.max(MARGIN, window.innerWidth - LAUNCHER_SIZE - MARGIN),
  ),
  bottom: Math.min(
    Math.max(p.bottom, MARGIN),
    Math.max(MARGIN, window.innerHeight - LAUNCHER_SIZE - MARGIN),
  ),
});

/**
 * Snaps horizontal position to the nearest side (left or right)
 * while preserving the exact height (bottom position) where it was dragged.
 */
export const snapToSide = (p: LauncherPosition): LauncherPosition => {
  const sideMargin = getSideMargin();
  const minRight = sideMargin;
  const maxRight = Math.max(
    sideMargin,
    window.innerWidth - LAUNCHER_SIZE - sideMargin,
  );
  const midpoint = (minRight + maxRight) / 2;

  return {
    right: p.right < midpoint ? minRight : maxRight,
    bottom: Math.min(
      Math.max(p.bottom, MARGIN),
      Math.max(MARGIN, window.innerHeight - LAUNCHER_SIZE - MARGIN),
    ),
  };
};

function readStored(): LauncherPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<LauncherPosition>;
    return typeof p.right === "number" && typeof p.bottom === "number"
      ? { right: p.right, bottom: p.bottom }
      : null;
  } catch {
    return null;
  }
}

/**
 * Lets the floating launcher be dragged anywhere (mouse, touch or pen) and
 * nudged with Shift + arrow keys. The position is kept as distance from the
 * bottom-right corner so it survives window resizes, is clamped on-screen, and
 * is remembered across visits. A drag never counts as a click.
 */
export function useDraggableLauncher() {
  const [pos, setPos] = React.useState<LauncherPosition>(() =>
    snapToSide(readStored() ?? defaultPosition()),
  );
  const [dragging, setDragging] = React.useState(false);
  const [viewport, setViewport] = React.useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const drag = React.useRef<{
    startX: number;
    startY: number;
    start: LauncherPosition;
    moved: boolean;
  } | null>(null);
  const suppressClick = React.useRef(false);

  const persist = React.useCallback((p: LauncherPosition) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* storage unavailable: the position lasts until reload */
    }
  }, []);

  // Keep it on-screen and docked to the side when the window is resized or rotated.
  React.useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setPos((p) => snapToSide(p));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      start: pos,
      moved: false,
    };
    // No pointer capture yet: capturing on press would retarget a plain click
    // away from the button. It starts once the pointer really drags.
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setPos(clamp({ right: d.start.right - dx, bottom: d.start.bottom - dy }));
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (d?.moved) {
      // The click that follows a drag must not toggle the window.
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 0);
      setDragging(false);
      setPos((p) => {
        const snapped = snapToSide(p);
        persist(snapped);
        return snapped;
      });
    }
  };

  const onClickCapture = (e: React.MouseEvent<HTMLElement>) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!e.shiftKey) return;
    const sideMargin = getSideMargin();
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => {
        const next = {
          right: Math.max(
            sideMargin,
            window.innerWidth - LAUNCHER_SIZE - sideMargin,
          ),
          bottom: p.bottom,
        };
        persist(next);
        return next;
      });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => {
        const next = {
          right: sideMargin,
          bottom: p.bottom,
        };
        persist(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPos((p) => {
        const next = clamp({ right: p.right, bottom: p.bottom + KEY_STEP });
        persist(next);
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setPos((p) => {
        const next = clamp({ right: p.right, bottom: p.bottom - KEY_STEP });
        persist(next);
        return next;
      });
    }
  };

  // Which side of the launcher has room for its tooltip and the chat window.
  const top = viewport.height - pos.bottom - LAUNCHER_SIZE;
  const left = viewport.width - pos.right - LAUNCHER_SIZE;
  const placement = {
    /** Launcher is in the lower half, so open upwards. */
    above: top >= viewport.height / 2,
    /** Launcher hugs the left edge, so the tooltip opens to the right. */
    tooltipLeft: left < 230,
  };

  return {
    pos,
    viewport,
    dragging,
    placement,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
      onKeyDown,
    },
  };
}
