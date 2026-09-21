import * as React from "react";
import { X } from "lucide-react";
import { BrandMark } from "@/components/composed/brand-mark";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { DiscussionSocketStatus } from "../api/types";
import type { useDiscussion } from "../hooks/use-discussion";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";

interface DiscussionWindowProps {
  projectName: string;
  memberCount: number;
  currentUserId: string | undefined;
  discussion: ReturnType<typeof useDiscussion>;
  connection: DiscussionSocketStatus;
  isMobile: boolean;
  /** Desktop position/size, computed from where the launcher was dropped. */
  style?: React.CSSProperties;
  onClose: () => void;
}

export function DiscussionWindow({
  projectName,
  memberCount,
  currentUserId,
  discussion,
  connection,
  isMobile,
  style,
  onClose,
}: DiscussionWindowProps) {
  const composerRef = React.useRef<HTMLTextAreaElement>(null);

  // Focus the composer when the window opens.
  React.useEffect(() => {
    composerRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-label={`${projectName} discussion`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      className={cn(
        "fixed z-40 flex flex-col overflow-hidden border border-border-subtle bg-canvas-surface text-foreground shadow-xl",
        isMobile
          ? "inset-x-0 bottom-0 h-[75dvh] rounded-t-xl pb-[env(safe-area-inset-bottom)]"
          : "w-[22.5rem] rounded-xl",
      )}
      style={isMobile ? undefined : style}
    >
      <header className="flex shrink-0 items-center gap-2.5 bg-navy-500 px-3 py-2.5 text-white dark:bg-navy-900">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
          <BrandMark size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xs font-semibold">
            {projectName} discussion
          </h2>
          {(memberCount > 0 || connection !== "open") && (
            <p className="text-3xs tabular-nums text-white/70">
              {memberCount > 0 &&
                `${memberCount} member${memberCount === 1 ? "" : "s"}`}
              {connection !== "open" && (
                <span role="status" className={cn(memberCount > 0 && "ml-1.5")}>
                  Reconnecting…
                </span>
              )}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close discussion"
          onClick={onClose}
          className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white dark:hover:bg-white/10"
        >
          <Icon icon={X} size={16} />
        </Button>
      </header>

      <MessageList
        messages={discussion.messages}
        currentUserId={currentUserId}
        loading={discussion.state === "loading" || discussion.state === "idle"}
        loadError={discussion.state === "error"}
        hasMore={discussion.hasMore}
        loadingOlder={discussion.loadingOlder}
        olderError={discussion.olderError}
        onLoadOlder={discussion.loadOlder}
        onRetryInitial={discussion.retryInitial}
        onRetrySend={discussion.retry}
      />

      <MessageComposer ref={composerRef} onSend={discussion.send} />
    </div>
  );
}
