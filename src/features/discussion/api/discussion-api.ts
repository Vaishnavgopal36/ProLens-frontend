import { apiClient } from "@/lib/api/client";
import type {
  DiscussionAuthor,
  DiscussionEvent,
  DiscussionMessage,
  DiscussionPage,
  FetchMessagesParams,
  UnreadState,
} from "./types";

export const DEFAULT_PAGE_SIZE = 30;

/**
 * GET /projects/{id}/discussion?limit=&before=
 * Keyset pagination: items are newest-first, `next_cursor` is null when there
 * is nothing older.
 */
export async function fetchMessages(
  projectId: string,
  { limit = DEFAULT_PAGE_SIZE, before = null }: FetchMessagesParams = {},
): Promise<DiscussionPage> {
  const query = new URLSearchParams();
  query.append("limit", String(limit));
  if (before) query.append("before", before);
  return apiClient.get<DiscussionPage>(`/projects/${projectId}/discussion?${query.toString()}`);
}

/** POST /projects/{id}/discussion  body: { content } */
export async function sendMessage(
  projectId: string,
  content: string,
): Promise<DiscussionMessage> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message is empty");
  if (trimmed.length > 10_000) throw new Error("Message is too long");

  return apiClient.post<DiscussionMessage>(`/projects/${projectId}/discussion`, {
    content: trimmed,
  });
}

/** GET /projects/{id}/discussion/unread */
export async function fetchUnread(projectId: string): Promise<UnreadState> {
  return apiClient.get<UnreadState>(`/projects/${projectId}/discussion/unread`);
}

/** POST /projects/{id}/discussion/read */
export async function markRead(
  projectId: string,
): Promise<{ last_read_at: string }> {
  return apiClient.post<{ last_read_at: string }>(`/projects/${projectId}/discussion/read`, {});
}

// No-op for mock identity compatibility
export function setMockIdentity(_identity: DiscussionAuthor) {
  // Real backend uses authenticated caller identity from session cookie
}

export function subscribeMockDiscussion(
  _projectId: string,
  _listener: (event: DiscussionEvent) => void,
): () => void {
  return () => {};
}
