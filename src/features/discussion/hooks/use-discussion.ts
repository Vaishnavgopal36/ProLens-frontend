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
 * on demand, and the newest page is re-polled so teammates' posts show up and
 * are marked read straight away.
 */
export function useDiscussion(projectId: string, enabled: boolean) {
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

  // Pull in newer messages while open (and once on every re-open).
  React.useEffect(() => {
    if (!enabled || state !== "ready") return;
    let cancelled = false;

    const refresh = () => {
      if (document.hidden || sendingRef.current > 0) return;
      fetchMessages(projectId, { limit: DEFAULT_PAGE_SIZE })
        .then((page) => {
          if (cancelled || sendingRef.current > 0) return;
          setServer((prev) => {
            const known = new Set(prev.map((m) => m.id));
            const fresh = page.items.filter((m) => !known.has(m.id));
            if (fresh.length === 0) return prev;
            markReadSafe();
            return [...prev, ...[...fresh].reverse()];
          });
        })
        .catch(() => {
          /* try again next tick */
        });
    };

    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, state, projectId, markReadSafe]);

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
