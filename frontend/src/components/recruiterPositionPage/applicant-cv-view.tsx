"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CalendarClock, Mail } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { extractErrorMessage } from "@/lib/api";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";
import { applicationsApi } from "@/lib/api/application";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/constants/attribute-category";
import { AttributeCategory, PositionRequirementDto } from "@/types/position";
import { CVDto } from "@/types/CV";
import { ApplicantDto, ApplicationStatus } from "@/types/application";

const STATUS_OPTIONS: ApplicationStatus[] = ["Pending", "Accepted", "Rejected"];

export function ApplicantCvView({
  positionId,
  applicant,
  onStatusChange,
}: {
  positionId: string;
  applicant: ApplicantDto;
  onStatusChange: (status: ApplicationStatus) => void;
}) {
  const [requirements, setRequirements] = useState<PositionRequirementDto[] | null>(null);
  const [cv, setCv] = useState<CVDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setRequirements(null);
    setCv(null);
    setError(null);

    Promise.all([
      positionRequirementsApi.list(positionId),
      applicationsApi.getApplicantCv(applicant.applicationId),
    ])
      .then(([requirementsData, cvData]) => {
        setRequirements(requirementsData);
        setCv(cvData);
      })
      .catch((err) => {
        const message = extractErrorMessage(err, "Couldn't load this applicant's CV");
        setError(message);
        toast.error(message);
      });
  }, [positionId, applicant.applicationId]);

  const valueByAttributeId = useMemo(() => {
    const map = new Map<string, string>();
    cv?.attributes.forEach((a) => map.set(a.attributeId, a.attributeValue ?? ""));
    return map;
  }, [cv]);

  const grouped = useMemo(() => {
    if (!requirements) return [];
    const byCategory = new Map<AttributeCategory, PositionRequirementDto[]>();
    for (const r of requirements) {
      const list = byCategory.get(r.attributeCategory) ?? [];
      list.push(r);
      byCategory.set(r.attributeCategory, list);
    }
    return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
      category,
      requirements: byCategory.get(category)!,
    }));
  }, [requirements]);

  async function handleStatusChange(status: ApplicationStatus) {
    setUpdatingStatus(true);
    try {
      onStatusChange(status);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div>
      {/* Header banner */}
      <div className="border-b border-border/80 bg-gradient-to-b from-muted/40 to-background px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-muted text-xl font-semibold text-muted-foreground">
              {applicant.photoUrl ? (
                <Image src={applicant.photoUrl} alt="" fill className="object-cover" unoptimized />
              ) : (
                <span>
                  {applicant.firstName[0]}
                  {applicant.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {applicant.firstName} {applicant.lastName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" />
                  {applicant.email}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3.5" />
                  Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <Select
            value={applicant.status}
            onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-36">
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
        </div>
      </div>

      {/* CV body */}
      <div className="px-6 py-6 sm:px-8">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!error && (!requirements || !cv) && (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        )}

        {!error && requirements && cv && grouped.length === 0 && (
          <p className="text-sm text-muted-foreground">This position has no requirements to review.</p>
        )}

        {!error && requirements && cv && grouped.length > 0 && (
          <div className="space-y-8">
            {grouped.map(({ category, requirements: categoryRequirements }) => {
              const Icon = CATEGORY_ICON[category];
              return (
                <section key={category}>
                  <div className="mb-4 flex items-center gap-2.5 border-b border-border/60 pb-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="font-medium">{CATEGORY_LABEL[category]}</h3>
                  </div>
                  <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {categoryRequirements.map((requirement) => (
                      <RequirementAnswer
                        key={requirement.id}
                        requirement={requirement}
                        value={valueByAttributeId.get(requirement.attributeId)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RequirementAnswer({
  requirement,
  value,
}: {
  requirement: PositionRequirementDto;
  value: string | undefined;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {requirement.attributeTitle}
      </p>
      {!value ? (
        <p className="text-sm italic text-muted-foreground">Not provided</p>
      ) : requirement.attributeType === "Image" ? (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-border/80 bg-muted">
          <Image src={value} alt={requirement.attributeTitle} fill className="object-cover" unoptimized />
        </div>
      ) : requirement.attributeType === "Boolean" ? (
        <Badge variant="secondary" className="font-normal">
          {value === "true" ? "Yes" : "No"}
        </Badge>
      ) : (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{value}</p>
      )}
    </div>
  );
}