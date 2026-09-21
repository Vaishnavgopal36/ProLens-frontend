import * as React from "react";
import { fetchUnread } from "../api/discussion-api";

const POLL_MS = 30_000;

/**
 * Unread count for the launcher badge. Polls every 30s while `paused` is
 * false (window closed) and the tab is visible; refreshes as soon as the tab
 * becomes visible again.
 */
export function useUnread(projectId: string, paused: boolean) {
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    if (paused) return;
    let cancelled = false;

    const refresh = () => {
      if (document.hidden) return;
      fetchUnread(projectId)
        .then((state) => {
          if (!cancelled) setUnread(state.unread_count);
        })
        .catch(() => {
          /* keep the last known count; the next tick retries */
        });
    };

    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [projectId, paused]);

  const clear = React.useCallback(() => setUnread(0), []);

  return { unread, clear };
}
