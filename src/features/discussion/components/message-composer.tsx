import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { MAX_MESSAGE_LENGTH } from "../lib/format";

// Roughly four lines of text-xs (line-height 1rem) plus padding.
const MAX_HEIGHT_PX = 88;

interface MessageComposerProps {
  onSend: (content: string) => void;
}

export const MessageComposer = React.forwardRef<
  HTMLTextAreaElement,
  MessageComposerProps
>(({ onSend }, forwardedRef) => {
  const [value, setValue] = React.useState("");
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  // Auto-grow up to ~4 lines, then scroll inside the textarea.
  React.useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const trimmed = value.trim();
  const tooLong = value.length > MAX_MESSAGE_LENGTH;
  const canSend = trimmed.length > 0 && !tooLong;

  const submit = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="border-t border-border-subtle p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={setRefs}
          value={value}
          rows={1}
          placeholder="Write a message..."
          aria-label="Message"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              submit();
            }
          }}
          className="min-h-9 flex-1 resize-none rounded-md border border-border-subtle bg-canvas-bg px-3 py-2 text-xs leading-4 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button
          type="button"
          size="icon"
          aria-label="Send message"
          disabled={!canSend}
          onClick={submit}
          className="shrink-0 bg-navy-500 text-white dark:bg-navy-500 dark:text-white"
        >
          <Icon icon={Send} size={16} />
        </Button>
      </div>
      {value.length > MAX_MESSAGE_LENGTH - 1000 && (
        <p
          className={cn(
            "mt-1 text-right text-3xs tabular-nums",
            tooLong ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {value.length.toLocaleString()} /{" "}
          {MAX_MESSAGE_LENGTH.toLocaleString()}
        </p>
      )}
    </div>
  );
});
MessageComposer.displayName = "MessageComposer";
