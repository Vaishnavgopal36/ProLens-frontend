import * as React from "react";
import { ArrowDown, AlertCircle, RotateCw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { DiscussionMessageView } from "../hooks/use-discussion";
import { GROUP_WINDOW_MS, formatFull, formatRelative } from "../lib/format";

// How close to an edge (px) counts as "at" that edge.
const TOP_THRESHOLD = 80;
const BOTTOM_THRESHOLD = 80;

interface MessageListProps {
  messages: DiscussionMessageView[];
  currentUserId: string | undefined;
  loading: boolean;
  loadError: boolean;
  hasMore: boolean;
  loadingOlder: boolean;
  olderError: boolean;
  onLoadOlder: () => void;
  onRetryInitial: () => void;
  onRetrySend: (id: string) => void;
}

/** Re-renders every minute so relative timestamps stay fresh. */
function useNow(): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function MessageList({
  messages,
  currentUserId,
  loading,
  loadError,
  hasMore,
  loadingOlder,
  olderError,
  onLoadOlder,
  onRetryInitial,
  onRetrySend,
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showNewPill, setShowNewPill] = React.useState(false);
  const now = useNow();

  // Snapshot of the last render, used to tell prepends from appends.
  const prev = React.useRef<{
    first: string | null;
    last: string | null;
    height: number;
  }>({ first: null, last: null, height: 0 });

  const scrollToBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Keep the viewport steady: stick to the bottom on first paint and on your
  // own sends, hold position when older messages are prepended, and offer a
  // pill instead of yanking the user down while they read history.
  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const first = messages[0]?.id ?? null;
    const last = messages[messages.length - 1]?.id ?? null;
    const snap = prev.current;

    if (snap.first === null) {
      if (last !== null) scrollToBottom();
    } else if (first !== snap.first && last === snap.last) {
      // Older page prepended: preserve the visual position.
      el.scrollTop += el.scrollHeight - snap.height;
    } else if (last !== snap.last) {
      const newest = messages[messages.length - 1];
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const mine = newest?.author.id === currentUserId;
      if (mine || distance <= BOTTOM_THRESHOLD + 120) scrollToBottom();
      else setShowNewPill(true);
    }

    prev.current = { first, last, height: el.scrollHeight };
  }, [messages, currentUserId, scrollToBottom]);

  // If the loaded content does not fill the viewport (or the user is already
  // at the top), keep pulling older pages.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el || !hasMore || loadingOlder || olderError || messages.length === 0)
      return;
    if (el.scrollTop <= TOP_THRESHOLD) onLoadOlder();
  }, [messages, hasMore, loadingOlder, olderError, onLoadOlder]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (
      hasMore &&
      !loadingOlder &&
      !olderError &&
      el.scrollTop <= TOP_THRESHOLD
    )
      onLoadOlder();
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD)
      setShowNewPill(false);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Discussion messages"
        className="h-full overflow-y-auto overscroll-contain px-3 py-2"
      >
        {/* Fixed height so showing/hiding it never shifts the scroll anchor. */}
        <div className="flex h-6 items-center justify-center text-3xs text-muted-foreground">
          {loadingOlder ? (
            "Loading earlier messages…"
          ) : olderError ? (
            <button
              type="button"
              onClick={onLoadOlder}
              className="underline underline-offset-2"
            >
              Couldn&apos;t load earlier messages. Retry
            </button>
          ) : !hasMore && messages.length > 0 ? (
            "Start of the discussion"
          ) : null}
        </div>

        {loading && messages.length === 0 && (
          <p className="py-8 text-center text-2xs text-muted-foreground">
            Loading messages…
          </p>
        )}
        {loadError && messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-2xs text-muted-foreground">
            <span>Couldn&apos;t load the discussion.</span>
            <Button size="sm" variant="outline" onClick={onRetryInitial}>
              Try again
            </Button>
          </div>
        )}
        {!loading && !loadError && messages.length === 0 && (
          <p className="py-8 text-center text-2xs text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        )}

        <ul className="m-0 list-none p-0">
          {messages.map((message, index) => {
            const before = messages[index - 1];
            const grouped =
              !!before &&
              before.author.id === message.author.id &&
              new Date(message.created_at).getTime() -
                new Date(before.created_at).getTime() <
                GROUP_WINDOW_MS;
            return (
              <MessageRow
                key={message.id}
                message={message}
                mine={message.author.id === currentUserId}
                grouped={grouped}
                now={now}
                onRetry={onRetrySend}
              />
            );
          })}
        </ul>
      </div>

      {showNewPill && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom();
            setShowNewPill(false);
          }}
          className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-navy-500 px-3 py-1 text-2xs font-medium text-white shadow-md dark:bg-foreground dark:text-background"
        >
          New messages
          <Icon icon={ArrowDown} size={12} />
        </button>
      )}
    </div>
  );
}

interface MessageRowProps {
  message: DiscussionMessageView;
  mine: boolean;
  grouped: boolean;
  now: number;
  onRetry: (id: string) => void;
}

const MessageRow = React.memo(function MessageRow({
  message,
  mine,
  grouped,
  now,
  onRetry,
}: MessageRowProps) {
  const failed = message.status === "failed";
  const sending = message.status === "sending";

  return (
    <li
      className={cn(
        "flex gap-2",
        grouped ? "mt-0.5" : "mt-3",
        mine && "flex-row-reverse",
      )}
    >
      {/* Avatar column keeps grouped bubbles aligned. */}
      <div className="w-7 shrink-0">
        {!grouped && (
          <Avatar className="h-7 w-7">
            <AvatarFallback
              className={cn(
                "text-3xs font-bold",
                mine
                  ? "bg-teal-500 text-white"
                  : "bg-navy-500 text-white dark:bg-foreground dark:text-background",
              )}
            >
              {message.author.initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div
        className={cn(
          "flex min-w-0 max-w-[80%] flex-col",
          mine ? "items-end" : "items-start",
        )}
      >
        {!grouped && (
          <div
            className={cn(
              "mb-0.5 flex items-baseline gap-1.5 text-3xs text-muted-foreground",
              mine && "flex-row-reverse",
            )}
          >
            <span className="font-semibold text-foreground">
              {mine ? "You" : message.author.name}
            </span>
            <time
              dateTime={message.created_at}
              title={formatFull(message.created_at)}
              className="tabular-nums"
            >
              {formatRelative(message.created_at, now)}
            </time>
          </div>
        )}
        <div
          title={formatFull(message.created_at)}
          className={cn(
            "whitespace-pre-wrap break-words rounded-lg px-2.5 py-1.5 text-xs leading-4 [overflow-wrap:anywhere]",
            mine
              ? "bg-teal-500 text-white"
              : "border border-border-subtle bg-canvas-bg text-foreground",
            sending && "opacity-60",
            failed && "ring-1 ring-destructive",
          )}
        >
          {message.content}
          {message.edited && (
            <span className="ml-1.5 text-3xs opacity-70">(edited)</span>
          )}
        </div>
        {sending && (
          <span className="mt-0.5 text-3xs text-muted-foreground">
            Sending…
          </span>
        )}
        {failed && (
          <button
            type="button"
            onClick={() => onRetry(message.id)}
            className="mt-0.5 flex items-center gap-1 text-3xs text-destructive"
          >
            <Icon icon={AlertCircle} size={11} />
            Not sent. Retry
            <Icon icon={RotateCw} size={11} />
          </button>
        )}
      </div>
    </li>
  );
});
