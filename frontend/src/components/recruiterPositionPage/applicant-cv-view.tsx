"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, Mail } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/api";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";
import { applicationsApi } from "@/lib/api/application";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/constants/attribute-category";
import { AttributeCategory, PositionRequirementDto } from "@/types/position";
import { CVDto } from "@/types/CV";
import { ApplicantDto, ApplicationStatus } from "@/types/application";
import { countFilled, isRequirementFilled } from "../candidate/requirement-progress";
import { STATUS_DOT_STYLES, STATUS_OPTIONS, STATUS_TRIGGER_STYLES } from "./application-status";


export function ApplicantCvView({
  positionId,
  applicant,
  onStatusChange,
}: {
  positionId: string;
  applicant: ApplicantDto;
  onStatusChange: (status: ApplicationStatus) => void;
}) {
  const t = useTranslations("positions");
  const format = useFormatter();

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
        const message = extractErrorMessage(err, t("applicantCvLoadError"));
        setError(message);
        toast.error(message);
      });
  }, [positionId, applicant.applicationId, t]);

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

  const liveValues = useMemo(() => {
    if (!requirements) return undefined;
    return Object.fromEntries(
      requirements.map((r) => [r.id, valueByAttributeId.get(r.attributeId) ?? ""])
    );
  }, [requirements, valueByAttributeId]);

  const totalCount = requirements?.length ?? 0;
  const filledCount = requirements ? countFilled(requirements, liveValues) : 0;

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
      <div className="border-b border-border/80 bg-gradient-to-b from-muted/40 to-background px-6 py-7 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-semibold text-primary shadow-sm ring-1 ring-border/60">
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
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {applicant.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" />
                  {t("appliedOn", {
                    date: format.dateTime(new Date(applicant.appliedAt), { dateStyle: "medium" }),
                  })}
                </span>
              </div>
              {totalCount > 0 && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  {t("answeredOfTotal", { filled: filledCount, total: totalCount })}
                </div>
              )}
            </div>
          </div>

          <Select
            value={applicant.status}
            onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
            disabled={updatingStatus}
          >
            <SelectTrigger className={cn("w-40 font-medium", STATUS_TRIGGER_STYLES[applicant.status])}>
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_STYLES[applicant.status])} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  <span className="flex items-center gap-2">
                    <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_STYLES[status])} />
                    {t(`applicantStatus.${status}`)}
                  </span>
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
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        )}

        {!error && requirements && cv && grouped.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">{t("noRequirementsToReview")}</p>
          </div>
        )}

        {!error && requirements && cv && grouped.length > 0 && (
          <div className="space-y-5">
            {grouped.map(({ category, requirements: categoryRequirements }) => {
              const Icon = CATEGORY_ICON[category];
              const filled = countFilled(categoryRequirements, liveValues);
              const total = categoryRequirements.length;
              return (
                <Card key={category} className="border-border/80 shadow-sm">
                  <CardContent className="py-6">
                    <div className="mb-5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <h3 className="font-medium">{CATEGORY_LABEL[category]}</h3>
                      </div>
                      <Badge variant="outline" className="font-normal text-muted-foreground">
                        {filled}/{total}
                      </Badge>
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
                  </CardContent>
                </Card>
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
  const t = useTranslations("positions");
  const filled = isRequirementFilled(value);

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {requirement.attributeTitle}
      </p>
      {!filled ? (
        <p className="text-sm italic text-muted-foreground/70">{t("notProvided")}</p>
      ) : requirement.attributeType === "Image" ? (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-border/80 bg-muted">
          <Image src={value!} alt={requirement.attributeTitle} fill className="object-cover" unoptimized />
        </div>
      ) : requirement.attributeType === "Boolean" ? (
        <Badge
          variant="secondary"
          className={cn(
            "font-normal",
            value === "true" && "bg-primary/10 text-primary hover:bg-primary/10"
          )}
        >
          {value === "true" ? t("yesValue") : t("noValue")}
        </Badge>
      ) : (
        <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-[15px] leading-relaxed whitespace-pre-wrap">
          {value}
        </p>
      )}
    </div>
  );
}