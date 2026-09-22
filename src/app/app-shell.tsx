import { useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/composed/app-header";
import { AppSidebar } from "@/components/composed/app-sidebar";
import {
  SmoothScrollProvider,
  useSmoothScroll,
} from "@/components/composed/smooth-scroll-provider";

/**
 * Resets viewport scroll to top upon route transitions,
 * preventing previous scroll offsets from slicing off page headers.
 */
function ScrollResetWatcher({
  mainRef,
}: {
  mainRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollTo } = useSmoothScroll();
  const location = useLocation();

  useEffect(() => {
    scrollTo(0, { immediate: true });
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname, scrollTo, mainRef]);

  return null;
}

export function AppShell() {
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-bg text-foreground font-sans">
      {/* Sidebar: full viewport height, owns brand and nav */}
      <AppSidebar />

      {/* Content column: light top bar + main, to the right of the sidebar only */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <AppHeader />
        <SmoothScrollProvider containerRef={mainRef}>
          <ScrollResetWatcher mainRef={mainRef} />
          <main
            ref={mainRef}
            tabIndex={-1}
            className="flex-1 overflow-y-auto overflow-x-hidden pt-8 pb-12 px-6 sm:px-8 outline-none"
          >
            <Outlet />
          </main>
        </SmoothScrollProvider>
      </div>
    </div>
  );
}
