import * as React from "react";
import { connectDiscussionSocket } from "../api/discussion-socket";
import type { DiscussionEvent, DiscussionSocketStatus } from "../api/types";

export interface RealtimeListener {
  /** Every (re)connect; use it for a catch-up fetch. */
  onOpen?: () => void;
  onEvent?: (event: DiscussionEvent) => void;
}

export interface DiscussionRealtime {
  status: DiscussionSocketStatus;
  subscribe: (listener: RealtimeListener) => () => void;
}

/**
 * Owns the project's push socket for as long as the widget is mounted (window
 * open or not). Consumers attach with `subscribe`, so the socket never depends
 * on their state and each event fans out to every listener.
 */
export function useDiscussionSocket(projectId: string): DiscussionRealtime {
  const [status, setStatus] =
    React.useState<DiscussionSocketStatus>("connecting");
  const listeners = React.useRef(new Set<RealtimeListener>());

  React.useEffect(() => {
    setStatus("connecting");
    const connection = connectDiscussionSocket(projectId, {
      onOpen: () => {
        setStatus("open");
        listeners.current.forEach((l) => l.onOpen?.());
      },
      onEvent: (event) => {
        if (event.data.project_id !== projectId) return;
        listeners.current.forEach((l) => l.onEvent?.(event));
      },
      onClose: () => setStatus("closed"),
    });
    // close() guarantees no handler runs afterwards, so no setState after unmount.
    return () => connection.close();
  }, [projectId]);

  const subscribe = React.useCallback((listener: RealtimeListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return React.useMemo(() => ({ status, subscribe }), [status, subscribe]);
}
