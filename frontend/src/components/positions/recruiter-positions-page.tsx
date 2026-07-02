"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClipboardList, ListFilter, Users2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PositionStatusBadge } from "./position-status-badge";
import { PositionFormDialog } from "./position-form-dialog";
import { DeletePositionDialog } from "./delete-position-dialog";
import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";
import { PositionStatus, PositionSummaryDto } from "@/types/position";

const STATUS_FILTERS: Array<PositionStatus | "All"> = [
  "All",
  "Draft",
  "Published",
  "Closed",
  "Archived",
];

export function RecruiterPositionsPage() {
  const [positions, setPositions] = useState<PositionSummaryDto[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<PositionStatus | "All">("All");

  async function load() {
    try {
      const data = await positionsApi.list(statusFilter === "All" ? undefined : statusFilter);
      setPositions(data);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't load positions"));
      setPositions([]);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  const isEmpty = positions !== null && positions.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Positions</h1>
          <p className="text-sm text-muted-foreground">
            Create roles, define requirements, and manage their lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-36">
              <ListFilter className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PositionFormDialog
            onSaved={(created) => setPositions((prev) => [created, ...(prev ?? [])])}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {positions === null &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}

        {isEmpty && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <ClipboardList className="size-8 text-muted-foreground" />
              <p className="font-medium">No positions yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first position to start defining requirements.
              </p>
            </CardContent>
          </Card>
        )}

        {positions?.map((position) => (
          <Card key={position.id} className="transition-colors hover:border-foreground/20">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <Link href={`/positions/${position.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-medium">{position.title}</h2>
                  <PositionStatusBadge status={position.status} />
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users2 className="size-3.5" />
                    {position.requirementsCount} requirement
                    {position.requirementsCount === 1 ? "" : "s"}
                  </span>
                  {position.deadline && (
                    <span>
                      Deadline {new Date(position.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
              <DeletePositionDialog
                positionId={position.id}
                positionTitle={position.title}
                onDeleted={() =>
                  setPositions((prev) => prev?.filter((p) => p.id !== position.id) ?? null)
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
