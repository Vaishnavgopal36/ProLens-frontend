// Shared badge color mappings for task priority, reused by the board (kanban
// cards) and the feature detail dialog so the same priority always renders
// with the same color across the app instead of drifting between hand-rolled
// copies of the same lookup.
export const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  High: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  Low: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};
