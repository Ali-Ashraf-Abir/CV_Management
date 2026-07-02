"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarClock, ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";
import { PositionSummaryDto } from "@/types/position";

export function CandidatePositionsPage() {
  const [positions, setPositions] = useState<PositionSummaryDto[] | null>(null);

  useEffect(() => {
    positionsApi
      .list("Published")
      .then(setPositions)
      .catch((err) => {
        toast.error(extractErrorMessage(err, "Couldn't load open positions"));
        setPositions([]);
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Open positions</h1>
      <p className="text-sm text-muted-foreground">
        Browse roles and get your profile ready before applications open.
      </p>

      <div className="mt-6 grid gap-3">
        {positions === null &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}

        {positions?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <ClipboardList className="size-8 text-muted-foreground" />
              <p className="font-medium">No open positions right now</p>
              <p className="text-sm text-muted-foreground">Check back soon for new roles.</p>
            </CardContent>
          </Card>
        )}

        {positions?.map((position) => (
          <Link key={position.id} href={`/positions/${position.id}`}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <h2 className="truncate font-medium">{position.title}</h2>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">
                      {position.requirementsCount} requirement
                      {position.requirementsCount === 1 ? "" : "s"}
                    </Badge>
                    {position.deadline && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="size-3.5" />
                        Apply by {new Date(position.deadline).toLocaleDateString()}
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
