import { subscribeMockDiscussion } from "./discussion-api";
import type {
  DiscussionEvent,
  DiscussionMessage,
  DiscussionSocketCloseInfo,
} from "./types";

export interface DiscussionSocketHandlers {
  /** The server said "ready" (or the mock is up). Fires again after every reconnect. */
  onOpen: () => void;
  onEvent: (event: DiscussionEvent) => void;
  /** The socket went away. Reconnects are automatic until `close()`. */
  onClose: (info: DiscussionSocketCloseInfo) => void;
}

export interface DiscussionSocketConnection {
  /** Stops everything; no handler is called afterwards. */
  close: () => void;
}

/**
 * Opens the discussion push channel. Uses a real WebSocket when
 * VITE_API_WS_BASE is set, otherwise the in-memory MOCK transport.
 */
export function connectDiscussionSocket(
  projectId: string,
  handlers: DiscussionSocketHandlers,
): DiscussionSocketConnection {
  const base = import.meta.env.VITE_API_WS_BASE;
  return base
    ? connectReal(base, projectId, handlers)
    : connectMock(projectId, handlers);
}

// ---------------------------------------------------------------------------
// Real transport
// ---------------------------------------------------------------------------

const PING_MS = 25_000;
const PONG_TIMEOUT_MS = 10_000;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
const LONG_BACKOFF_MS = 60_000;
/** Consecutive handshakes that never opened before we treat the server as unavailable. */
const HANDSHAKE_FAILURES_BEFORE_LONG = 3;

const CLOSE_TOO_MANY_CONNECTIONS = 4409;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMessage(value: unknown): value is DiscussionMessage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.project_id === "string" &&
    typeof value.content === "string" &&
    isRecord(value.author)
  );
}

/** Parses one server frame; returns "ready", "pong", an event, or null to ignore. */
function parseFrame(raw: unknown): "ready" | "pong" | DiscussionEvent | null {
  if (typeof raw !== "string") return null;
  let frame: unknown;
  try {
    frame = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(frame) || typeof frame.type !== "string") return null;
  switch (frame.type) {
    case "ready":
    case "pong":
      return frame.type;
    case "message.created":
    case "message.updated":
      return isMessage(frame.data)
        ? { type: frame.type, data: frame.data }
        : null;
    case "message.deleted": {
      const d = frame.data;
      return isRecord(d) &&
        typeof d.id === "string" &&
        typeof d.project_id === "string"
        ? {
            type: "message.deleted",
            data: { id: d.id, project_id: d.project_id },
          }
        : null;
    }
    default:
      return null;
  }
}

function jitter(ms: number) {
  // Half fixed, half random, so a fleet of clients does not reconnect in step.
  return Math.round(ms / 2 + Math.random() * (ms / 2));
}

function connectReal(
  base: string,
  projectId: string,
  handlers: DiscussionSocketHandlers,
): DiscussionSocketConnection {
  const url = `${base.replace(/\/+$/, "")}/ws/projects/${encodeURIComponent(
    projectId,
  )}/discussion`;

  let closed = false;
  let socket: WebSocket | null = null;
  let attempt = 0; // consecutive failed connections
  let handshakeFailures = 0; // consecutive sockets that never opened
  let lastCode = 0;
  let retryTimer: number | undefined;
  let pingTimer: number | undefined;
  let pongTimer: number | undefined;

  const clearHeartbeat = () => {
    window.clearInterval(pingTimer);
    window.clearTimeout(pongTimer);
    pingTimer = undefined;
    pongTimer = undefined;
  };

  const sendPing = (sock: WebSocket) => {
    if (sock.readyState !== WebSocket.OPEN) return;
    try {
      sock.send(JSON.stringify({ type: "ping" }));
    } catch {
      return;
    }
    if (pongTimer === undefined) {
      pongTimer = window.setTimeout(() => {
        pongTimer = undefined;
        // Nothing came back: the socket is dead, do not wait for the TCP close.
        drop(sock, 4000);
      }, PONG_TIMEOUT_MS);
    }
  };

  /** Detaches a socket, closes it, and runs the shared close handling once. */
  function drop(sock: WebSocket, code: number, opened = true) {
    if (socket !== sock) return;
    sock.onopen = sock.onmessage = sock.onclose = sock.onerror = null;
    try {
      sock.close();
    } catch {
      /* already closed */
    }
    handleClose(code, opened);
  }

  function handleClose(code: number, everOpened: boolean) {
    socket = null;
    clearHeartbeat();
    if (closed) return;
    lastCode = code;
    handshakeFailures = everOpened ? 0 : handshakeFailures + 1;
    const unavailable =
      code === CLOSE_TOO_MANY_CONNECTIONS ||
      handshakeFailures >= HANDSHAKE_FAILURES_BEFORE_LONG;
    const base = unavailable
      ? LONG_BACKOFF_MS
      : Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** attempt);
    const delay = jitter(base);
    attempt += 1;
    handlers.onClose({ code, unavailable, retryInMs: delay });
    retryTimer = window.setTimeout(open, delay);
  }

  function open() {
    if (closed || socket) return;
    window.clearTimeout(retryTimer);
    retryTimer = undefined;
    let sock: WebSocket;
    try {
      sock = new WebSocket(url);
    } catch {
      // e.g. malformed URL: back off like any other failure.
      socket = null;
      handshakeFailures += 1;
      const delay = jitter(LONG_BACKOFF_MS);
      handlers.onClose({ code: 1006, unavailable: true, retryInMs: delay });
      retryTimer = window.setTimeout(open, delay);
      return;
    }
    socket = sock;
    let everOpened = false;

    sock.onopen = () => {
      if (socket !== sock) return;
      everOpened = true;
      // Ready is signalled by the server's first frame.
    };
    sock.onmessage = (e: MessageEvent) => {
      if (socket !== sock || closed) return;
      window.clearTimeout(pongTimer); // any frame proves the link is alive
      pongTimer = undefined;
      const frame = parseFrame(e.data);
      if (frame === null || frame === "pong") return;
      if (frame === "ready") {
        attempt = 0;
        handshakeFailures = 0;
        lastCode = 0;
        clearHeartbeat();
        pingTimer = window.setInterval(() => sendPing(sock), PING_MS);
        handlers.onOpen();
        return;
      }
      handlers.onEvent(frame);
    };
    sock.onerror = () => {
      /* onclose always follows */
    };
    sock.onclose = (e: CloseEvent) => {
      if (socket !== sock) return;
      sock.onopen = sock.onmessage = sock.onclose = sock.onerror = null;
      handleClose(e.code, everOpened);
    };
  }

  /** Reconnect now (tab visible / back online), unless the server told us to back off. */
  const wake = () => {
    if (closed) return;
    if (socket) {
      // Possibly a zombie after sleep/offline: probe it right away.
      sendPing(socket);
      return;
    }
    if (lastCode === CLOSE_TOO_MANY_CONNECTIONS) return;
    window.clearTimeout(retryTimer);
    retryTimer = undefined;
    open();
  };
  const onVisibility = () => {
    if (!document.hidden) wake();
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("online", wake);

  open();

  return {
    close() {
      if (closed) return;
      closed = true;
      window.clearTimeout(retryTimer);
      clearHeartbeat();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", wake);
      const sock = socket;
      socket = null;
      if (sock) {
        sock.onopen = sock.onmessage = sock.onclose = sock.onerror = null;
        try {
          sock.close(1000);
        } catch {
          /* already closed */
        }
      }
    },
  };
}

// ---------------------------------------------------------------------------
// MOCK ONLY: in-memory transport wired to discussion-api's store. Delete this
// section (and the `connectMock` branch above) with the real backend.
// ---------------------------------------------------------------------------

const MOCK_OPEN_MS = 30;
const MOCK_DELIVERY_MS = 15;

function connectMock(
  projectId: string,
  handlers: DiscussionSocketHandlers,
): DiscussionSocketConnection {
  let closed = false;
  const timers = new Set<number>();
  let unsubscribe: (() => void) | null = null;

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!closed) fn();
    }, ms);
    timers.add(id);
  };

  // Like the real socket: connected first, "ready" a beat later.
  later(() => {
    unsubscribe = subscribeMockDiscussion(projectId, (event) =>
      later(() => handlers.onEvent(event), MOCK_DELIVERY_MS),
    );
    handlers.onOpen();
  }, MOCK_OPEN_MS);

  return {
    close() {
      closed = true;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      unsubscribe?.();
      unsubscribe = null;
    },
  };
}
