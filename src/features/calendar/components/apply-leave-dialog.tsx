import * as React from "react";
import { toast } from "sonner";
import { CalendarOff } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/app/providers";
import { CATEGORY_COLOR_MAP } from "../api/mock-data";
import type { CalendarEvent } from "@/types/calendar";

type DayPortion = "full" | "half";
type HalfSlot = "first" | "second";

interface DayEntry {
  iso: string;
  portion: DayPortion;
  half: HalfSlot | "";
}

interface ApplyLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  onApplyLeave: (events: CalendarEvent[]) => void;
}

/** Mock balances (days) per leave type until the leave API is wired up. */
const LEAVE_TYPES: { value: string; label: string; balance: number }[] = [
  { value: "earned", label: "Earned Leave", balance: 1.5 },
  { value: "casual", label: "Casual Leave", balance: 6 },
  { value: "sick", label: "Sick Leave", balance: 4 },
  { value: "vacation", label: "Vacation", balance: 10 },
];

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const isValidISO = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const fmtRow = (iso: string) =>
  parseISO(iso)
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/,/g, "")
    .replace(/ (\w{3}) /, "-$1-");
const fmtDays = (n: number) => String(Math.round(n * 100) / 100);

/** Working days (Mon–Fri) between two ISO dates, inclusive. */
function workingDays(from: string, to: string): string[] {
  if (!isValidISO(from) || !isValidISO(to) || to < from) return [];
  const out: string[] = [];
  const end = parseISO(to);
  for (let d = parseISO(from); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(toISO(d));
  }
  return out;
}

const fieldClass = "h-8 text-xs bg-canvas-surface";

export function ApplyLeaveDialog({
  open,
  onOpenChange,
  defaultDate = "2026-09-12",
  onApplyLeave,
}: ApplyLeaveDialogProps) {
  const { user } = useAuth();
  const [leaveType, setLeaveType] = React.useState(LEAVE_TYPES[0].value);
  const [from, setFrom] = React.useState(defaultDate);
  const [to, setTo] = React.useState(defaultDate);
  const [overrides, setOverrides] = React.useState<
    Record<string, Pick<DayEntry, "portion" | "half">>
  >({});
  const [reason, setReason] = React.useState("");
  const [errors, setErrors] = React.useState<{
    date?: string;
    days?: string;
  }>({});

  React.useEffect(() => {
    if (!open) return;
    setFrom(defaultDate);
    setTo(defaultDate);
    setOverrides({});
    setErrors({});
  }, [open, defaultDate]);

  const days: DayEntry[] = React.useMemo(
    () =>
      workingDays(from, to).map((iso) => ({
        iso,
        portion: overrides[iso]?.portion ?? "full",
        half: overrides[iso]?.half ?? "",
      })),
    [from, to, overrides],
  );

  const total = days.reduce((n, d) => n + (d.portion === "half" ? 0.5 : 1), 0);
  const type = LEAVE_TYPES.find((t) => t.value === leaveType) ?? LEAVE_TYPES[0];
  const after = type.balance - total;

  const updateDay = (iso: string, patch: Partial<DayEntry>) =>
    setOverrides((prev) => {
      const cur = days.find((d) => d.iso === iso);
      const portion = patch.portion ?? cur?.portion ?? "full";
      const half = portion === "full" ? "" : (patch.half ?? cur?.half ?? "");
      return { ...prev, [iso]: { portion, half } };
    });

  const onFromChange = (value: string) => {
    setFrom(value);
    // Keep the range valid: pushing "from" past "to" drags "to" along.
    if (isValidISO(value) && (!isValidISO(to) || to < value)) setTo(value);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isValidISO(from) || !isValidISO(to))
      next.date = "Choose a valid date range.";
    else if (to < from)
      next.date = "To date must be on or after the from date.";
    else if (days.length === 0)
      next.days = "The selected range has no working days.";
    else if (days.some((d) => d.portion === "half" && !d.half))
      next.days = "Choose 1st Half or 2nd Half for each half day.";
    else if (after < 0) next.days = "Insufficient leave balance.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const styling = CATEGORY_COLOR_MAP.Leave;
    const events: CalendarEvent[] = days.map((d) => {
      const date = parseISO(d.iso);
      const half = d.portion === "half";
      return {
        id: `leave-${d.iso}-${Date.now()}`,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        title: `${user?.name ?? "Me"} – ${type.label}${half ? (d.half === "first" ? " (1st Half)" : " (2nd Half)") : ""}`,
        startTime: !half ? "00:00" : d.half === "first" ? "09:00" : "13:00",
        endTime: !half ? "23:59" : d.half === "first" ? "13:00" : "18:00",
        category: "Leave",
        desc: reason,
        colorBg: styling.bg,
        colorText: styling.text,
        colorBorder: styling.border,
        overflowCount: 0,
      };
    });

    onApplyLeave(events);
    toast.success(`Applied for ${fmtDays(total)} day(s) of ${type.label}.`);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="p-5 sm:max-w-[560px]">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon icon={CalendarOff} size={16} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Apply Leave
              </ModalTitle>
              <ModalDescription className="text-xs">
                Pick the leave type and dates you'll be away.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-center sm:gap-4">
            <Label className="text-xs font-medium">
              Leave type <span className="text-destructive">*</span>
            </Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-4">
            <Label className="pt-2 text-xs font-medium">
              Date <span className="text-destructive">*</span>
            </Label>
            <div className="min-w-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  aria-label="From date"
                  type="date"
                  value={from}
                  onChange={(e) => onFromChange(e.target.value)}
                  aria-invalid={!!errors.date}
                  className={fieldClass}
                />
                <Input
                  aria-label="To date"
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setErrors({});
                  }}
                  aria-invalid={!!errors.date}
                  className={fieldClass}
                />
              </div>
              <FieldError message={errors.date} />

              <div className="overflow-hidden rounded border border-border-subtle">
                {days.length === 0 ? (
                  <p className="px-3 py-3 text-muted-foreground">
                    No working days in the selected range.
                  </p>
                ) : (
                  days.map((d) => (
                    <div
                      key={d.iso}
                      className="grid grid-cols-[minmax(0,1fr)_110px_110px] items-center gap-2 border-b border-border-subtle bg-canvas-bg/50 px-3 py-2 last:border-b-0 max-sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-3"
                    >
                      <span className="font-medium max-sm:col-span-2">
                        {fmtRow(d.iso)}
                      </span>
                      <Select
                        value={d.portion}
                        onValueChange={(v) =>
                          updateDay(d.iso, { portion: v as DayPortion })
                        }
                      >
                        <SelectTrigger
                          aria-label={`Day type for ${d.iso}`}
                          className={fieldClass}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Day</SelectItem>
                          <SelectItem value="half">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={d.half}
                        disabled={d.portion !== "half"}
                        onValueChange={(v) =>
                          updateDay(d.iso, { half: v as HalfSlot })
                        }
                      >
                        <SelectTrigger
                          aria-label={`Half for ${d.iso}`}
                          className={fieldClass}
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first">1st Half</SelectItem>
                          <SelectItem value="second">2nd Half</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between bg-muted px-3 py-2 text-muted-foreground">
                  <span>Total</span>
                  <span>{fmtDays(total)} Day(s)</span>
                </div>
              </div>
              <FieldError message={errors.days} />
            </div>
          </div>

          <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-4">
            <Label htmlFor="leave-reason" className="pt-2 text-xs font-medium">
              Reason
            </Label>
            <Input
              id="leave-reason"
              placeholder="Optional"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={fieldClass}
            />
          </div>

          <ModalFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="font-semibold"
            >
              Submit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
