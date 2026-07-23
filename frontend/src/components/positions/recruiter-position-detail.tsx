"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { PositionStatusBadge } from "./position-status-badge";
import { PositionFormDialog } from "./position-form-dialog";
import { ChangeStatusMenu } from "./change-status-menu";
import { DeletePositionDialog } from "./delete-position-dialog";
import { RequirementList } from "./requirement-list";

import { positionsApi } from "@/lib/api/position";

import { extractErrorMessage } from "@/lib/api";
import { PositionDto, PositionRequirementDto } from "@/types/position";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";

export function RecruiterPositionDetail({ positionId }: { positionId: string }) {
  const t = useTranslations("positions");
  const format = useFormatter();
  const router = useRouter();
  const [position, setPosition] = useState<PositionDto | null>(null);
  const [requirements, setRequirements] = useState<PositionRequirementDto[] | null>(null);

  async function load() {
    try {
      const [positionData, requirementsData] = await Promise.all([
        positionsApi.getById(positionId),
        positionRequirementsApi.list(positionId),
      ]);
      setPosition(positionData);
      setRequirements(requirementsData);
    } catch (err) {
      toast.error(extractErrorMessage(err, t("loadPositionError")));
    }
  }

  useEffect(() => {
    load();
  }, [positionId]);

  if (!position || !requirements) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/my-positions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToPositions")}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{position.title}</h1>
            <PositionStatusBadge status={position.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("createdBy", { name: position.createdByName || "—" })}
          </p>
          {position.deadline && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarClock className="size-3.5" />
              {t("deadlineDetail", {
                date: format.dateTime(new Date(position.deadline), { dateStyle: "medium" }),
              })}
            </p>
          )}
         
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ChangeStatusMenu position={position} onChanged={setPosition} />
          <PositionFormDialog
            position={position}
            onSaved={setPosition}
            trigger={<Button variant="outline">{t("editButton")}</Button>}
          />
          <DeletePositionDialog
            positionId={position.id}
            positionTitle={position.title}
            onDeleted={() => router.push("/positions")}
          />
        </div>
      </div>

      <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">{position.description}</p>

      <Separator className="my-8" />

      <RequirementList
        positionId={position.id}
        requirements={requirements}
        onChange={setRequirements}
      />
    </div>
  );
}