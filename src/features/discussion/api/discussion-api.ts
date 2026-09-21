import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import type {
  DiscussionAuthor,
  DiscussionMessage,
  DiscussionPage,
  FetchMessagesParams,
  UnreadState,
} from "./types";

// This module is the only seam to the backend. Every export below maps to one
// REST endpoint (noted per function); to go live, replace the bodies with
// fetch calls and delete everything under "MOCK ONLY".

export const DEFAULT_PAGE_SIZE = 30;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * GET /projects/{id}/discussion?limit=&before=
 * Keyset pagination: items are newest-first, `next_cursor` is null when there
 * is nothing older.
 */
export async function fetchMessages(
  projectId: string,
  { limit = DEFAULT_PAGE_SIZE, before = null }: FetchMessagesParams = {},
): Promise<DiscussionPage> {
  await latency();
  const store = getStore(projectId);
  maybeSimulateTeammate(store);

  let start = 0;
  if (before) {
    const anchor = decodeCursor(before);
    const at = store.messages.findIndex((m) => m.id === anchor);
    start = at === -1 ? store.messages.length : at + 1;
  }
  const items = store.messages.slice(start, start + limit);
  const has_more = start + limit < store.messages.length;
  const last = items[items.length - 1];
  return {
    items: items.map(cloneMessage),
    next_cursor: has_more && last ? encodeCursor(last.id) : null,
    has_more,
  };
}

/** POST /projects/{id}/discussion  body: { content } */
export async function sendMessage(
  projectId: string,
  content: string,
): Promise<DiscussionMessage> {
  await latency();
  const store = getStore(projectId);
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message is empty");
  if (trimmed.length > 10_000) throw new Error("Message is too long");
  // MOCK ONLY: occasional failure so the retry state can be exercised. The
  // real server never needs this.
  if (Math.random() < 0.05) throw new Error("Network error");
  const message: DiscussionMessage = {
    id: nextId(store),
    project_id: projectId,
    author: { ...mockIdentity },
    content: trimmed,
    created_at: new Date().toISOString(),
    edited: false,
  };
  store.messages.unshift(message);
  // Your own post implies you have seen everything before it.
  store.lastReadAt = message.created_at;
  return cloneMessage(message);
}

/** GET /projects/{id}/discussion/unread */
export async function fetchUnread(projectId: string): Promise<UnreadState> {
  await latency();
  const store = getStore(projectId);
  maybeSimulateTeammate(store);
  return unreadOf(store);
}

/** POST /projects/{id}/discussion/read */
export async function markRead(
  projectId: string,
): Promise<{ last_read_at: string }> {
  await latency();
  const store = getStore(projectId);
  store.lastReadAt = new Date().toISOString();
  return { last_read_at: store.lastReadAt };
}

// ---------------------------------------------------------------------------
// MOCK ONLY: everything below goes away with the real backend.
// ---------------------------------------------------------------------------

interface Store {
  projectId: string;
  /** Newest first, like the API. */
  messages: DiscussionMessage[];
  lastReadAt: string | null;
  counter: number;
  nextSimulationAt: number;
}

const stores = new Map<string, Store>();
let mockIdentity: DiscussionAuthor = { id: "", name: "You", initials: "YO" };

/** The real API reads the caller from the auth token; the mock is told. */
export function setMockIdentity(author: DiscussionAuthor) {
  mockIdentity = author;
}

const latency = () =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, 250 + Math.random() * 250),
  );

const encodeCursor = (id: string) => btoa(`k:${id}`);
const decodeCursor = (cursor: string) => {
  try {
    return atob(cursor).slice(2);
  } catch {
    return "";
  }
};

const cloneMessage = (m: DiscussionMessage): DiscussionMessage => ({
  ...m,
  author: { ...m.author },
});

function nextId(store: Store) {
  store.counter += 1;
  return `${store.projectId}-msg-${store.counter}`;
}

function unreadOf(store: Store): UnreadState {
  const since = store.lastReadAt;
  const unread = store.messages.filter(
    (m) =>
      m.author.id !== mockIdentity.id &&
      (since === null || m.created_at > since),
  ).length;
  return { unread_count: unread, last_read_at: since };
}

/** Small deterministic PRNG (mulberry32) seeded from a string. */
function seededRng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SNIPPETS = [
  "Pushed the latest changes to the feature branch, please take a look when you get a moment.",
  "Can we sync on the acceptance criteria for this sprint?",
  "Looks good to me. Merging after the checks pass.",
  "Heads up: the staging environment will be down briefly for a deploy.",
  "I updated the estimates on the board, a couple of tasks grew.",
  "Client feedback came in overnight. Nothing blocking, mostly copy tweaks.",
  "Thanks, that fixes it on my side.",
  "Blocked on design tokens for the dark theme. Anyone have the latest export?",
  "Standup notes are in the attachments tab.",
  "Reviewed the PR and left a few comments, mostly naming.",
  "Demo is moved to Thursday afternoon.",
  "Can someone pick up the flaky test on the reports page?",
  "Done. Moving it to review.",
  "Good catch, I'll add a regression test.",
  "Quick question about the timeline: is the freeze date still the 28th?",
];

const MULTILINE = [
  "Plan for today:\n- finish the API wiring\n- write the tests\n- update the docs",
  "Three things before release:\n1. Smoke test on staging\n2. Confirm rollback plan\n3. Notify the client",
  "Notes from the call:\nThey want the export in CSV.\nDeadline stays the same.",
];

const LONG_MESSAGE =
  "Writing this up so it does not get lost in the shuffle. After the last review we agreed to split the migration into three phases: first the read-only paths behind a flag, then the write paths once the shadow traffic looks clean for a full week, and finally the cleanup of the legacy tables. Each phase gets its own checklist on the board, its own owner, and its own rollback plan. Please flag any dependency I have missed, especially anything touching reporting exports, because those have bitten us before. Supercalifragilisticexpialidocious_long_identifier_that_should_wrap_properly_in_the_bubble.";

function getStore(projectId: string): Store {
  const existing = stores.get(projectId);
  if (existing) return existing;

  const rng = seededRng(projectId);
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  const authors: DiscussionAuthor[] = (project?.members ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    initials: m.initials,
  }));
  if (authors.length === 0)
    authors.push({ id: "mock-1", name: "Team", initials: "TM" });

  const store: Store = {
    projectId,
    messages: [],
    lastReadAt: null,
    counter: 0,
    nextSimulationAt: Date.now() + 45_000 + Math.random() * 15_000,
  };

  const total = 80;
  const span = 10 * 24 * 3600_000;
  const now = Date.now();
  // Walk backwards in time so ids grow with recency.
  const times: number[] = [];
  for (let i = 0; i < total; i++) times.push(now - rng() * span);
  times.sort((a, b) => a - b);
  times.forEach((t, i) => {
    const author = authors[Math.floor(rng() * authors.length)];
    const isLong = i === 17;
    const content = isLong
      ? LONG_MESSAGE
      : i % 13 === 5
        ? MULTILINE[Math.floor(rng() * MULTILINE.length)]
        : SNIPPETS[Math.floor(rng() * SNIPPETS.length)];
    store.counter += 1;
    store.messages.unshift({
      id: `${projectId}-msg-${store.counter}`,
      project_id: projectId,
      author,
      content,
      created_at: new Date(t).toISOString(),
      edited: rng() < 0.06,
    });
  });

  // Leave the last few teammate messages unread so the badge is visible.
  const pivot = store.messages[Math.min(2, store.messages.length - 1)];
  store.lastReadAt = pivot ? pivot.created_at : null;

  stores.set(projectId, store);
  return store;
}

/**
 * Pretends a teammate posted, at most about once a minute and only while
 * fewer than 5 messages are unread.
 */
function maybeSimulateTeammate(store: Store) {
  if (Date.now() < store.nextSimulationAt) return;
  store.nextSimulationAt = Date.now() + 45_000 + Math.random() * 15_000;
  if (unreadOf(store).unread_count >= 5) return;
  const others = store.messages
    .map((m) => m.author)
    .filter((a) => a.id !== mockIdentity.id);
  const author = others[Math.floor(Math.random() * others.length)];
  if (!author) return;
  store.messages.unshift({
    id: nextId(store),
    project_id: store.projectId,
    author,
    content: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
    created_at: new Date().toISOString(),
    edited: false,
  });
}
