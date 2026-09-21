import * as React from "react";
import { useAuth } from "@/app/providers";
import { fetchUnread } from "../api/discussion-api";
import type { DiscussionRealtime } from "./use-discussion-socket";

const POLL_MS = 30_000;

/**
 * Unread count for the launcher badge. Push events bump it instantly while
 * `paused` is false (window closed). Polling every 30s is a fallback used only
 * while the socket is not open; each (re)connect does one catch-up fetch.
 */
export function useUnread(
  projectId: string,
  paused: boolean,
  realtime: DiscussionRealtime,
) {
  const { user } = useAuth();
  const userId = user?.id;
  const { status, subscribe } = realtime;
  const [unread, setUnread] = React.useState(0);
  /** Ids already counted from push, so duplicates never double count. */
  const counted = React.useRef(new Set<string>());

  React.useEffect(() => {
    counted.current = new Set();
  }, [projectId]);

  React.useEffect(() => {
    if (paused) return;
    let cancelled = false;

    const refresh = (force: boolean) => {
      if (document.hidden && !force) return;
      fetchUnread(projectId)
        .then((state) => {
          if (!cancelled) setUnread(state.unread_count);
        })
        .catch(() => {
          /* keep the last known count; the next tick retries */
        });
    };

    // Runs on open/close, project change and every socket status change, so a
    // reconnect always reconciles anything missed.
    refresh(true);
    if (status === "open") {
      return () => {
        cancelled = true;
      };
    }
    const onVisible = () => refresh(false);
    const timer = window.setInterval(() => refresh(false), POLL_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [projectId, paused, status]);

  React.useEffect(() => {
    if (paused) return;
    return subscribe({
      onEvent: (event) => {
        if (event.type === "message.created") {
          if (event.data.author.id === userId) return;
          if (counted.current.has(event.data.id)) return;
          counted.current.add(event.data.id);
          setUnread((n) => n + 1);
        } else if (event.type === "message.deleted") {
          if (!counted.current.delete(event.data.id)) return;
          setUnread((n) => Math.max(0, n - 1));
        }
      },
    });
  }, [subscribe, paused, userId]);

  const clear = React.useCallback(() => setUnread(0), []);

  return { unread, clear };
}
