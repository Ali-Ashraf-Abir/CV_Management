import { cn } from "@/lib/utils";
import { Roles } from "@/types/users";


const STYLES: Record<Roles, string> = {
  [Roles.Administrator]: "bg-foreground text-background",
  [Roles.Recruiter]: "bg-accent text-accent-foreground",
  [Roles.Candidate]: "bg-secondary text-secondary-foreground",
};

export function RoleBadge({ role, label }: { role: Roles; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[role]
      )}
    >
      {label}
    </span>
  );
}