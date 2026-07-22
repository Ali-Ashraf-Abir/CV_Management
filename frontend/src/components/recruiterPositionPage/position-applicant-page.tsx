"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, User as UserIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { positionsApi } from "@/lib/api/position";
import { applicationsApi } from "@/lib/api/application";
import { extractErrorMessage } from "@/lib/api";
import { PositionDto } from "@/types/position";
import { ApplicantDto, ApplicationStatus } from "@/types/application";
import { ApplicantCvView } from "./applicant-cv-view";

const STATUS_OPTIONS: ApplicationStatus[] = ["Pending", "Accepted", "Rejected"];

export function PositionApplicantsPage({ positionId }: { positionId: string }) {
  const [position, setPosition] = useState<PositionDto | null>(null);
  const [applicants, setApplicants] = useState<ApplicantDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewingApplicantId, setViewingApplicantId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [positionData, applicantsData] = await Promise.all([
          positionsApi.getById(positionId),
          applicationsApi.getApplicants(positionId),
        ]);
        setPosition(positionData);
        setApplicants(applicantsData);
      } catch (err) {
        const message = extractErrorMessage(err, "Couldn't load applicants");
        setLoadError(message);
        toast.error(message);
      }
    })();
  }, [positionId]);

  const viewingApplicant = useMemo(
    () => applicants?.find((a) => a.applicationId === viewingApplicantId) ?? null,
    [applicants, viewingApplicantId]
  );

  async function handleStatusChange(applicationId: string, status: ApplicationStatus) {
    setUpdatingId(applicationId);
    try {
      const updated = await applicationsApi.updateStatus(applicationId, { status });
      setApplicants((prev) =>
        prev ? prev.map((a) => (a.applicationId === applicationId ? updated : a)) : prev
      );
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update status"));
    } finally {
      setUpdatingId(null);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/recruiter/positions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to your positions
      </Link>

      {!position ? (
        <Skeleton className="h-8 w-64" />
      ) : (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{position.title}</h1>
          <p className="text-sm text-muted-foreground">
            {applicants?.length ?? 0} applicant{applicants?.length === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {applicants === null &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}

        {applicants?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <UserIcon className="size-8 text-muted-foreground" />
              <p className="font-medium">No applicants yet</p>
            </CardContent>
          </Card>
        )}

        {applicants?.map((applicant) => (
          <Card key={applicant.applicationId}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <button
                type="button"
                onClick={() => setViewingApplicantId(applicant.applicationId)}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {applicant.photoUrl ? (
                    <Image src={applicant.photoUrl} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <span>
                      {applicant.firstName[0]}
                      {applicant.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {applicant.firstName} {applicant.lastName}
                  </p>
                  <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                    <Mail className="size-3.5" />
                    {applicant.email}
                  </p>
                </div>
              </button>

              <Select
                value={applicant.status}
                onValueChange={(v) => handleStatusChange(applicant.applicationId, v as ApplicationStatus)}
                disabled={updatingId === applicant.applicationId}
              >
                <SelectTrigger className="w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!viewingApplicant} onOpenChange={(open) => !open && setViewingApplicantId(null)}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto p-0">
          {viewingApplicant && (
            <ApplicantCvView
              positionId={positionId}
              applicant={viewingApplicant}
              onStatusChange={(status) => handleStatusChange(viewingApplicant.applicationId, status)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}