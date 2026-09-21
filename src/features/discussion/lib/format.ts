/** Consecutive messages by one author within this window share a header. */
export const GROUP_WINDOW_MS = 5 * 60_000;

export const MAX_MESSAGE_LENGTH = 10_000;

/** "just now", "2m ago", "3h ago", "4d ago", then a short date. */
export function formatRelative(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatFull(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** "99+" cap for the launcher badge. */
export function formatBadge(count: number): string {
  return count > 99 ? "99+" : String(count);
}
