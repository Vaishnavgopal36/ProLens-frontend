import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * The one overlay primitive for forms, details and confirmations.
 *
 *   tablet / laptop (≥ 768px)  → centred modal dialog
 *   mobile          (< 768px)  → side sheet sliding in from the right, with
 *                                a close (X) button
 *
 * Use these instead of importing Dialog or Sheet directly, so every overlay
 * in every role behaves the same way. The only sanctioned direct Sheet is the
 * mobile navigation drawer in the app sidebar.
 */
const Modal = DialogPrimitive.Root;
const ModalHeader = DialogHeader;
const ModalFooter = DialogFooter;
const ModalTitle = DialogTitle;
const ModalDescription = DialogDescription;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <DialogContent ref={ref} className={className} {...props}>
        {children}
      </DialogContent>
    );
  }

  return (
    <SheetContent
      ref={ref}
      side="right"
      className={cn(
        // content-start: keep rows packed at the top of the full-height panel.
        "grid content-start gap-4 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-foreground",
        className,
        // Desktop width caps make no sense here; the sheet is nearly full
        // width so a sliver of backdrop stays tappable to dismiss.
        "w-[92vw] max-w-[440px] sm:max-w-[440px] overflow-y-auto",
      )}
      {...props}
    >
      {children}
    </SheetContent>
  );
});
ModalContent.displayName = "ModalContent";

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
};
