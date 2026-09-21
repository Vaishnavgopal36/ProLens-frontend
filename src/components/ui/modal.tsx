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
/**
 * Side-sheet width per phone tier. The sheet always keeps a tappable strip of
 * backdrop on the left, and stops growing at 480px so it reads as a panel on
 * large phones and small tablets.
 *
 *   XS   320–374px  small phones          94vw  (~19–22px strip)
 *   S    375–424px  most phones           92vw
 *   M    425–599px  large phones          88vw
 *   L    600–767px  small tablets / wide  480px fixed panel
 */
const SHEET_WIDTH =
  "w-[94vw] min-[375px]:w-[92vw] min-[425px]:w-[88vw] min-[600px]:w-[480px] max-w-[480px] sm:max-w-[480px]";

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
        // minmax(0,1fr) lets children shrink to the sheet instead of
        // widening it; content-start packs rows at the top of the tall panel.
        "grid grid-cols-[minmax(0,1fr)] content-start gap-4 text-foreground",
        // Padding by tier; bottom/right also respect notches and home bars.
        "p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))]",
        "min-[375px]:p-5 min-[375px]:pb-[max(1.25rem,env(safe-area-inset-bottom))] min-[375px]:pr-[max(1.25rem,env(safe-area-inset-right))]",
        "min-[600px]:p-6 min-[600px]:pb-[max(1.5rem,env(safe-area-inset-bottom))] min-[600px]:pr-[max(1.5rem,env(safe-area-inset-right))]",
        className,
        // Width by tier (see SHEET_TIERS). Always leaves a strip of backdrop
        // to tap-to-dismiss, and never exceeds 480px.
        SHEET_WIDTH,
        "overflow-y-auto overflow-x-hidden",
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
