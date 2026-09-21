// Wire types for the project discussion. These mirror the backend contract
// exactly (snake_case included) so the mock can be swapped for real fetch
// calls without touching any consumer.

export interface DiscussionAuthor {
  id: string;
  name: string;
  initials: string;
}

export interface DiscussionMessage {
  id: string;
  project_id: string;
  author: DiscussionAuthor;
  content: string;
  /** ISO 8601 timestamp. */
  created_at: string;
  edited: boolean;
}

export interface DiscussionPage {
  /** NEWEST FIRST. */
  items: DiscussionMessage[];
  /** Opaque keyset cursor for the next-older page; null when none remain. */
  next_cursor: string | null;
  has_more: boolean;
}

export interface UnreadState {
  unread_count: number;
  last_read_at: string | null;
}

export interface FetchMessagesParams {
  /** Page size, default 30. */
  limit?: number;
  /** Cursor from a previous page's `next_cursor`; omit for the newest page. */
  before?: string | null;
}

/** Push events from the discussion WebSocket (server -> client). */
export type DiscussionEvent =
  | { type: "message.created"; data: DiscussionMessage }
  | { type: "message.updated"; data: DiscussionMessage }
  | { type: "message.deleted"; data: { id: string; project_id: string } };

export type DiscussionSocketStatus = "connecting" | "open" | "closed";

export interface DiscussionSocketCloseInfo {
  /** WebSocket close code (1006 when the handshake failed or dropped). */
  code: number;
  /** True when the server looks unavailable to us (refused handshake / 4409). */
  unavailable: boolean;
  /** Delay before the next automatic attempt, or null if none is scheduled. */
  retryInMs: number | null;
}
