"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Users, ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PositionStatusBadge } from "@/components/positions/position-status-badge";

import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";
import { PositionSummaryDto } from "@/types/position";

export function RecruiterPositionsPage() {
  const [positions, setPositions] = useState<PositionSummaryDto[] | null>(null);

  useEffect(() => {
    positionsApi
      .myList()
      .then(setPositions)
      .catch((err) => {
        toast.error(extractErrorMessage(err, "Couldn't load your positions"));
        setPositions([]);
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your positions</h1>
      <p className="text-sm text-muted-foreground">
        Manage postings and review who applied.
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
              <p className="font-medium">No positions yet</p>
              <p className="text-sm text-muted-foreground">Create a position to start receiving applicants.</p>
            </CardContent>
          </Card>
        )}

        {positions?.map((position) => (
          <Link key={position.id} href={`/recruiter/positions/${position.id}/applicants`}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-medium">{position.title}</h2>
                    <PositionStatusBadge status={position.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">
                      {position.requirementsCount} requirement
                      {position.requirementsCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  View applicants
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}