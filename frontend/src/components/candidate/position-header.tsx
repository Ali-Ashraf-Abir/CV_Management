import { CalendarClock } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { PositionStatusBadge } from "@/components/positions/position-status-badge";
import { PositionDto } from "@/types/position";

export function PositionHeader({ position }: { position: PositionDto }) {
  const t = useTranslations("cv");
  const format = useFormatter();

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <div className="h-1.5 w-full bg-primary" />
      <CardContent className="py-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight">{position.title}</h1>
          <PositionStatusBadge status={position.status} />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span>{position.createdByName}</span>
          {position.deadline && (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3.5" />
              {t("applyBy", {
                date: format.dateTime(new Date(position.deadline), { dateStyle: "medium" }),
              })}
            </span>
          )}
        </div>
        {position.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {position.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}