import * as React from "react";
import { useAuth } from "@/app/providers";
import {
  DEFAULT_PAGE_SIZE,
  fetchMessages,
  markRead,
  sendMessage,
  setMockIdentity,
} from "../api/discussion-api";
import type { DiscussionMessage } from "../api/types";
import { MAX_MESSAGE_LENGTH } from "../lib/format";
import type { DiscussionRealtime } from "./use-discussion-socket";

const REFRESH_MS = 10_000;

/** A message you sent that the server has not confirmed yet. */
export interface PendingMessage extends DiscussionMessage {
  status: "sending" | "failed";
}

export type DiscussionMessageView = DiscussionMessage & {
  status?: PendingMessage["status"];
};

type LoadState = "idle" | "loading" | "ready" | "error";

/**
 * Page state for one project's discussion. Only active while `enabled` (the
 * window is open): the newest page loads on first open, older pages prepend
 * on demand. Teammates' posts arrive by push (once the list has loaded, even
 * while closed); re-polling the newest page is a fallback used only while the
 * socket is not open, and each (re)connect does one catch-up fetch.
 */
export function useDiscussion(
  projectId: string,
  enabled: boolean,
  realtime: DiscussionRealtime,
) {
  const { user } = useAuth();
  const [server, setServer] = React.useState<DiscussionMessage[]>([]); // oldest first
  const [pending, setPending] = React.useState<PendingMessage[]>([]);
  const [state, setState] = React.useState<LoadState>("idle");
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingOlder, setLoadingOlder] = React.useState(false);
  const [olderError, setOlderError] = React.useState(false);

  const [attempt, setAttempt] = React.useState(0);
  const readyRef = React.useRef(false);
  const cursorRef = React.useRef<string | null>(null);
  const loadingOlderRef = React.useRef(false);
  const sendingRef = React.useRef(0);
  const localCounter = React.useRef(0);
  const mountedRef = React.useRef(true);
  const projectRef = React.useRef(projectId);
  projectRef.current = projectId;
  const enabledRef = React.useRef(enabled);
  enabledRef.current = enabled;
  const userIdRef = React.useRef(user?.id);
  userIdRef.current = user?.id;
  const { status: socketStatus, subscribe } = realtime;

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (user) {
      setMockIdentity({
        id: user.id,
        name: user.name,
        initials: user.initials,
      });
    }
  }, [user]);

  // Reset when the project changes.
  React.useEffect(() => {
    setServer([]);
    setPending([]);
    setState("idle");
    setHasMore(true);
    setOlderError(false);
    readyRef.current = false;
    cursorRef.current = null;
    loadingOlderRef.current = false;
    setLoadingOlder(false);
  }, [projectId]);

  const markReadSafe = React.useCallback(() => {
    markRead(projectRef.current).catch(() => {
      /* the next poll reconciles */
    });
  }, []);

  // Initial page, on first open (and on retry). The ref keeps re-opens from
  // refetching once loaded; the effect cleanup only cancels the in-flight one.
  React.useEffect(() => {
    if (!enabled || readyRef.current) return;
    let cancelled = false;
    setState("loading");
    fetchMessages(projectId, { limit: DEFAULT_PAGE_SIZE })
      .then((page) => {
        if (cancelled) return;
        readyRef.current = true;
        setServer([...page.items].reverse());
        cursorRef.current = page.next_cursor;
        setHasMore(page.has_more);
        setState("ready");
        markReadSafe();
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, attempt, projectId, markReadSafe]);

  // Newest-page refresh: one immediate catch-up on open / (re)connect, then a
  // 10s poll only while the socket is not open.
  React.useEffect(() => {
    if (!enabled || state !== "ready") return;
    let cancelled = false;

    const refresh = (force: boolean) => {
      if ((document.hidden && !force) || sendingRef.current > 0) return;
      fetchMessages(projectId, { limit: DEFAULT_PAGE_SIZE })
        .then((page) => {
          if (cancelled || sendingRef.current > 0) return;
          setServer((prev) => {
            const known = new Set(prev.map((m) => m.id));
            const fresh = page.items.filter((m) => !known.has(m.id));
            if (fresh.length === 0) return prev;
            return [...prev, ...[...fresh].reverse()];
          });
          markReadSafe();
        })
        .catch(() => {
          /* try again next tick */
        });
    };

    refresh(true);
    if (socketStatus === "open") {
      return () => {
        cancelled = true;
      };
    }
    const timer = window.setInterval(() => refresh(false), REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, state, projectId, socketStatus, markReadSafe]);

  // Push events. Applied whenever the list has loaded, even while the window
  // is closed, so re-opening never shows a gap.
  React.useEffect(() => {
    return subscribe({
      onEvent: (event) => {
        if (!readyRef.current) return;
        if (event.type === "message.created") {
          const message = event.data;
          const mine = message.author.id === userIdRef.current;
          if (mine) {
            // Our own post pushed back: swap out the matching in-flight bubble.
            setPending((prev) => {
              const at = prev.findIndex(
                (p) => p.status === "sending" && p.content === message.content,
              );
              return at === -1 ? prev : prev.filter((_, i) => i !== at);
            });
          }
          setServer((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message],
          );
          if (enabledRef.current && !mine) markReadSafe();
        } else if (event.type === "message.updated") {
          const updated = event.data;
          setServer((prev) => {
            const at = prev.findIndex((m) => m.id === updated.id);
            if (at === -1) return prev;
            const next = [...prev];
            next[at] = {
              ...prev[at],
              content: updated.content,
              edited: updated.edited,
            };
            return next;
          });
        } else {
          const { id } = event.data;
          setServer((prev) =>
            prev.some((m) => m.id === id)
              ? prev.filter((m) => m.id !== id)
              : prev,
          );
        }
      },
    });
  }, [subscribe, markReadSafe]);

  const retryInitial = React.useCallback(() => setAttempt((n) => n + 1), []);

  const loadOlder = React.useCallback(() => {
    const cursor = cursorRef.current;
    if (!cursor || loadingOlderRef.current) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    setOlderError(false);
    const forProject = projectId;
    fetchMessages(projectId, { limit: DEFAULT_PAGE_SIZE, before: cursor })
      .then((page) => {
        if (!mountedRef.current || projectRef.current !== forProject) return;
        cursorRef.current = page.next_cursor;
        setHasMore(page.has_more);
        setServer((prev) => {
          const known = new Set(prev.map((m) => m.id));
          const older = [...page.items]
            .reverse()
            .filter((m) => !known.has(m.id));
          return [...older, ...prev];
        });
      })
      .catch(() => {
        if (mountedRef.current) setOlderError(true);
      })
      .finally(() => {
        loadingOlderRef.current = false;
        if (mountedRef.current) setLoadingOlder(false);
      });
  }, [projectId]);

  const deliver = React.useCallback(
    (localId: string, content: string) => {
      sendingRef.current += 1;
      sendMessage(projectId, content)
        .then((message) => {
          if (!mountedRef.current || projectRef.current !== projectId) return;
          setPending((prev) => prev.filter((p) => p.id !== localId));
          setServer((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message],
          );
        })
        .catch(() => {
          if (!mountedRef.current) return;
          setPending((prev) =>
            prev.map((p) =>
              p.id === localId ? { ...p, status: "failed" } : p,
            ),
          );
        })
        .finally(() => {
          sendingRef.current -= 1;
        });
    },
    [projectId],
  );

  const send = React.useCallback(
    (raw: string) => {
      const content = raw.trim();
      if (!user || !content || content.length > MAX_MESSAGE_LENGTH) return;
      localCounter.current += 1;
      const localId = `local-${localCounter.current}`;
      setPending((prev) => [
        ...prev,
        {
          id: localId,
          project_id: projectId,
          author: { id: user.id, name: user.name, initials: user.initials },
          content,
          created_at: new Date().toISOString(),
          edited: false,
          status: "sending",
        },
      ]);
      deliver(localId, content);
    },
    [user, projectId, deliver],
  );

  const retry = React.useCallback(
    (localId: string) => {
      const target = pending.find((p) => p.id === localId);
      if (!target || target.status !== "failed") return;
      setPending((prev) =>
        prev.map((p) => (p.id === localId ? { ...p, status: "sending" } : p)),
      );
      deliver(localId, target.content);
    },
    [pending, deliver],
  );

  const messages = React.useMemo<DiscussionMessageView[]>(
    () => [...server, ...pending],
    [server, pending],
  );

  return {
    messages,
    state,
    hasMore,
    loadingOlder,
    olderError,
    loadOlder,
    retryInitial,
    send,
    retry,
  };
}
