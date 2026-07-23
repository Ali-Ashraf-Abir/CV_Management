"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarClock, ClipboardList } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";
import { PositionSummaryDto } from "@/types/position";

export function CandidatePositionsPage() {
  const t = useTranslations("cv");
  const format = useFormatter();
  const [positions, setPositions] = useState<PositionSummaryDto[] | null>(null);

  useEffect(() => {
    positionsApi
      .list("Published")
      .then(setPositions)
      .catch((err) => {
        toast.error(extractErrorMessage(err, t("loadPositionsErrorFallback")));
        setPositions([]);
      });
  }, [t]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("openPositionsTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("openPositionsDescription")}</p>

      <div className="mt-6 grid gap-3">
        {positions === null &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}

        {positions?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <ClipboardList className="size-8 text-muted-foreground" />
              <p className="font-medium">{t("noOpenPositionsTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("noOpenPositionsDescription")}</p>
            </CardContent>
          </Card>
        )}

        {positions?.map((position) => (
          <Link key={position.id} href={`/jobs/${position.id}`}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <h2 className="truncate font-medium">{position.title}</h2>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">
                      {t("requirementCount", { count: position.requirementsCount })}
                    </Badge>
                    {position.deadline && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="size-3.5" />
                        {t("applyByDeadline", {
                          date: format.dateTime(new Date(position.deadline), {
                            dateStyle: "medium",
                          }),
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}