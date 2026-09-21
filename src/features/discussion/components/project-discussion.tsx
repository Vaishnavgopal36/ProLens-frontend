import * as React from "react";
import { useAuth } from "@/app/providers";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media-query";
import type { Project } from "@/types/project";
import { useDiscussion } from "../hooks/use-discussion";
import { useUnread } from "../hooks/use-unread";
import {
  LAUNCHER_SIZE,
  useDraggableLauncher,
} from "../hooks/use-draggable-launcher";
import { DiscussionLauncher } from "./discussion-launcher";
import { DiscussionWindow } from "./discussion-window";

interface ProjectDiscussionProps {
  project: Project;
}

/**
 * Floating, project-scoped discussion. The launcher starts bottom-right (toasts
 * render top-right, so the corner is free) and can be dragged anywhere; the
 * window opens on the roomier side of it, or as a full-width bottom sheet on
 * phones.
 */
export function ProjectDiscussion({ project }: ProjectDiscussionProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const launcherRef = React.useRef<HTMLButtonElement>(null);
  const wasOpen = React.useRef(false);
  const launcher = useDraggableLauncher();

  const discussion = useDiscussion(project.id, open);
  const { unread, clear } = useUnread(project.id, open);

  // Reading happens implicitly while the window is open (the hook marks it).
  React.useEffect(() => {
    if (open) clear();
  }, [open, clear]);

  // Return focus to the launcher after closing.
  React.useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const close = React.useCallback(() => setOpen(false), []);

  // The window opens on whichever side of the launcher has more room.
  const { pos, viewport, placement } = launcher;
  const WINDOW_WIDTH = 360;
  const GAP = 12;
  const launcherTop = viewport.height - pos.bottom - LAUNCHER_SIZE;
  const windowStyle: React.CSSProperties = {
    right: Math.min(
      Math.max(pos.right, 8),
      Math.max(8, viewport.width - WINDOW_WIDTH - 8),
    ),
    ...(placement.above
      ? {
          bottom: pos.bottom + LAUNCHER_SIZE + GAP,
          height: Math.min(512, Math.max(280, launcherTop - GAP - 8)),
        }
      : {
          top: launcherTop + LAUNCHER_SIZE + GAP,
          height: Math.min(
            512,
            Math.max(
              280,
              viewport.height - launcherTop - LAUNCHER_SIZE - GAP - 8,
            ),
          ),
        }),
  };

  return (
    <>
      {open && (
        <DiscussionWindow
          projectName={project.name}
          memberCount={project.members.length}
          currentUserId={user?.id}
          discussion={discussion}
          isMobile={isMobile}
          style={windowStyle}
          onClose={close}
        />
      )}
      <DiscussionLauncher
        ref={launcherRef}
        projectName={project.name}
        unread={open ? 0 : unread}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        dragging={launcher.dragging}
        tooltipBelow={!placement.above}
        tooltipLeft={placement.tooltipLeft}
        {...launcher.dragProps}
        style={{
          right: pos.right,
          bottom: `max(${pos.bottom}px, calc(env(safe-area-inset-bottom) + 8px))`,
        }}
        // The mobile sheet covers the launcher, so it hides while open there.
        className={cn("fixed z-40", open && isMobile && "invisible")}
      />
    </>
  );
}
