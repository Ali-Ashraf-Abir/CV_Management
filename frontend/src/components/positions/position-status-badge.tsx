import { Badge } from "@/components/ui/badge";
import { PositionStatus } from "@/types/position";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<PositionStatus, string> = {
  Draft: "bg-muted text-muted-foreground border-transparent",
  Published: "bg-primary text-primary-foreground border-transparent",
  Closed: "bg-secondary text-secondary-foreground border-border",
  Archived: "bg-transparent text-muted-foreground border-border",
};

export function PositionStatusBadge({ status }: { status: PositionStatus }) {
  return (
    <Badge className={cn("font-medium", STATUS_STYLES[status])} variant="outline">
      {status}
    </Badge>
  );
}
