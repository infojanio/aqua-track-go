import { LEAK_STATUS_LABEL, LEAK_TYPE_COLOR, LEAK_TYPE_LABEL, type LeakStatus, type LeakType } from "@/types/leak";
import { cn } from "@/lib/utils";

export function TypeBadge({ type, className }: { type: LeakType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
        className,
      )}
      style={{ backgroundColor: LEAK_TYPE_COLOR[type] }}
    >
      <span className="size-1.5 rounded-full bg-white/90" />
      {LEAK_TYPE_LABEL[type]}
    </span>
  );
}

const STATUS_BG: Record<LeakStatus, string> = {
  open: "bg-[var(--status-open)]/15 text-[var(--status-open)] border-[var(--status-open)]/30",
  in_progress:
    "bg-[var(--status-progress)]/15 text-[var(--status-progress)] border-[var(--status-progress)]/30",
  done: "bg-[var(--status-done)]/15 text-[var(--status-done)] border-[var(--status-done)]/30",
};

export function StatusBadge({ status, className }: { status: LeakStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_BG[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {LEAK_STATUS_LABEL[status]}
    </span>
  );
}
