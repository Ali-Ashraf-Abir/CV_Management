import { ApplicationStatus } from "@/types/application";

export const STATUS_OPTIONS: ApplicationStatus[] = ["Pending", "Accepted", "Rejected"];

export const STATUS_TRIGGER_STYLES: Record<ApplicationStatus, string> = {
  Pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
  Accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400",
  Rejected:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
};

export const STATUS_DOT_STYLES: Record<ApplicationStatus, string> = {
  Pending: "bg-amber-500",
  Accepted: "bg-emerald-500",
  Rejected: "bg-red-500",
};