import * as React from "react";
import Lenis, { type ScrollToOptions } from "lenis";

export interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: ScrollToOptions,
  ) => void;
}

const SmoothScrollContext = React.createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export function useSmoothScroll(): SmoothScrollContextValue {
  return React.useContext(SmoothScrollContext);
}

export interface SmoothScrollProviderProps {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function SmoothScrollProvider({
  children,
  containerRef,
}: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = React.useState<Lenis | null>(null);
  const fallbackRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = containerRef?.current ?? fallbackRef.current;
    if (!container) return;

    // Standard inertia damping: ~1.1s duration, exponential ease-out curve
    const lenis = new Lenis({
      wrapper: container,
      content: (container.firstElementChild as HTMLElement) || container,
      eventsTarget: container,
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      autoResize: true,
      autoRaf: false,
      respectReducedMotion: true,
    });

    setLenisInstance(lenis);

    // RAF render loop with cleanup
    let rafId: number;
    function onRaf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(onRaf);
    }
    rafId = requestAnimationFrame(onRaf);

    // Dynamic resize handling for nested views and dynamic content
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(container);
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    const mutationObserver = new MutationObserver(() => {
      lenis.resize();
      if (container.firstElementChild) {
        try {
          resizeObserver.observe(container.firstElementChild);
        } catch {
          // Ignored if already observed or detached
        }
      }
    });
    mutationObserver.observe(container, { childList: true, subtree: false });

    // Keyboard navigation (PageUp/Down, Home/End, arrow keys, Space)
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          target.closest(
            "input, textarea, select, [contenteditable='true'], [role='dialog'], [role='menu'], [role='listbox'], [role='combobox']",
          ))
      ) {
        return;
      }

      const scrollAmount = 80;
      const pageAmount = container.clientHeight * 0.85;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          lenis.scrollTo(lenis.scroll + scrollAmount, { duration: 0.3 });
          break;
        case "ArrowUp":
          event.preventDefault();
          lenis.scrollTo(lenis.scroll - scrollAmount, { duration: 0.3 });
          break;
        case "PageDown":
          event.preventDefault();
          lenis.scrollTo(lenis.scroll + pageAmount, { duration: 0.6 });
          break;
        case "PageUp":
          event.preventDefault();
          lenis.scrollTo(lenis.scroll - pageAmount, { duration: 0.6 });
          break;
        case " ":
          if (!event.shiftKey) {
            event.preventDefault();
            lenis.scrollTo(lenis.scroll + pageAmount, { duration: 0.6 });
          } else {
            event.preventDefault();
            lenis.scrollTo(lenis.scroll - pageAmount, { duration: 0.6 });
          }
          break;
        case "Home":
          event.preventDefault();
          lenis.scrollTo(0, { duration: 0.8 });
          break;
        case "End":
          event.preventDefault();
          lenis.scrollTo(lenis.limit, { duration: 0.8 });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKeyDown);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [containerRef]);

  const scrollTo = React.useCallback(
    (target: number | string | HTMLElement, options?: ScrollToOptions) => {
      if (lenisInstance) {
        lenisInstance.scrollTo(target, options);
      }
    },
    [lenisInstance],
  );

  const contextValue = React.useMemo<SmoothScrollContextValue>(
    () => ({
      lenis: lenisInstance,
      scrollTo,
    }),
    [lenisInstance, scrollTo],
  );

  if (!containerRef) {
    return (
      <SmoothScrollContext.Provider value={contextValue}>
        <div
          ref={fallbackRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto overflow-x-hidden outline-none"
        >
          {children}
        </div>
      </SmoothScrollContext.Provider>
    );
  }

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
