"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";
import { CATEGORY_ORDER } from "@/lib/constants/attribute-category";
import { PositionDto, PositionRequirementDto, AttributeCategory } from "@/types/position";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";
import { buildAttributeValueSchema } from "@/validations/attribute-value.schema";
import { Form } from "../ui/form";
import { CVDto } from "@/types/CV";
import { cvApi } from "@/lib/api/cv";
import { cvAttributesApi } from "@/lib/api/cvAttribute";
import { attributesApi } from "@/lib/api/attributes";
import { AttributeDto } from "@/types/attribute";
import { PositionHeader } from "./position-header";
import { ProfileProgressSidebar } from "./profile-progress-sidebar";
import { countFilled } from "./requirement-progress";
import { RequirementCategorySection } from "./requirement-category";
import { SaveBar } from "./savebar";

export type CandidateProfileValues = { values: Record<string, string> };

export function CandidatePositionCv({ positionId }: { positionId: string }) {
  const t = useTranslations("cv");
  const [position, setPosition] = useState<PositionDto | null>(null);
  const [requirements, setRequirements] = useState<PositionRequirementDto[] | null>(null);
  const [cv, setCv] = useState<CVDto | null>(null);
  const [dropdownAttributes, setDropdownAttributes] = useState<Record<string, AttributeDto>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [positionData, requirementsData, cvData] = await Promise.all([
          positionsApi.getById(positionId),
          positionRequirementsApi.list(positionId),
          cvApi.getMine(),
        ]);
        setPosition(positionData);
        setRequirements(requirementsData);
        setCv(cvData);
      } catch (err) {
        const message = extractErrorMessage(err, t("loadErrorFallback"));
        setLoadError(message);
        toast.error(message);
      }
    })();
  }, [positionId, t]);

  useEffect(() => {
    if (!requirements) return;
    const dropdownReqs = requirements.filter((r) => r.attributeType === "Dropdown");
    if (dropdownReqs.length === 0) return;

    Promise.allSettled(
      dropdownReqs.map((r) =>
        attributesApi.getById(r.attributeId).then((attr) => [r.attributeId, attr] as const)
      )
    ).then((results) => {
      const succeeded = results
        .filter((r): r is PromiseFulfilledResult<readonly [string, AttributeDto]> => r.status === "fulfilled")
        .map((r) => r.value);

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.error("Failed to load some dropdown attributes:", failed);
        toast.error(`Couldn't load ${failed.length} dropdown field(s)`);
      }

      setDropdownAttributes((prev) => ({ ...prev, ...Object.fromEntries(succeeded) }));
    });
  }, [requirements]);

  const cvPrefillByAttributeId = useMemo(() => {
    const map = new Map<string, string>();
    if (!cv) return map;
    for (const a of cv.attributes) {
      if (a.attributeType === "Dropdown") {
        const options = dropdownAttributes[a.attributeId]?.values;
        const stillValid = options?.find((o) => o.value === a.attributeValue);
        if (stillValid) map.set(a.attributeId, stillValid.id);
      } else if (a.attributeValue) {
        map.set(a.attributeId, a.attributeValue);
      }
    }
    return map;
  }, [cv, dropdownAttributes]);

  const cvStaleByAttributeId = useMemo(() => {
    const map = new Map<string, string>();
    if (!cv) return map;
    for (const a of cv.attributes) {
      if (a.attributeType !== "Dropdown" || !a.attributeValue) continue;
      const options = dropdownAttributes[a.attributeId]?.values;
      if (!options) continue;
      const stillValid = options.some((o) => o.value === a.attributeValue);
      if (!stillValid) map.set(a.attributeId, a.attributeValue);
    }
    return map;
  }, [cv, dropdownAttributes]);

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

  function resolveDropdownLabel(attributeId: string) {
    const options = dropdownAttributes[attributeId]?.values ?? [];
    return (id: string) => options.find((o) => o.id === id)?.value;
  }

  const schema = useMemo(() => {
    if (!requirements) return z.object({ values: z.object({}) });
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const r of requirements) {
      shape[r.id] =
        r.attributeType === "Dropdown"
          ? buildAttributeValueSchema(r, resolveDropdownLabel(r.attributeId))
          : buildAttributeValueSchema(r);
    }
    return z.object({ values: z.object(shape) });
  }, [requirements, dropdownAttributes]);

  const form = useForm<CandidateProfileValues>({
    resolver: zodResolver(schema) as never,
    values:
      requirements && cv
        ? {
          values: Object.fromEntries(
            requirements.map((r) => [r.id, cvPrefillByAttributeId.get(r.attributeId) ?? ""])
          ),
        }
        : undefined,
  });

  const liveValues = form.watch("values");
  const filledCount = useMemo(
    () => (requirements ? countFilled(requirements, liveValues) : 0),
    [requirements, liveValues]
  );
  const totalCount = requirements?.length ?? 0;

  async function onSubmit(values: CandidateProfileValues) {
    if (!requirements) return;

    const upserts = requirements
      .map((r) => ({ requirement: r, value: values.values[r.id] }))
      .filter(({ value }) => value !== "" && value != null)
      .map(({ requirement, value }) => {
        if (requirement.attributeType === "Dropdown") {
          const label = dropdownAttributes[requirement.attributeId]?.values.find(
            (o) => o.id === value
          )?.value;

          return cvAttributesApi.upsert({
            attributeId: requirement.attributeId,
            attributeValue: label ?? null,
            attributeValueId: value,
          });
        }

        return cvAttributesApi.upsert({
          attributeId: requirement.attributeId,
          attributeValue: value,
          attributeValueId: null,
        });
      });

    try {
      await Promise.all(upserts);
      toast.success(t("saveSuccessTitle"), {
        description: t("saveSuccessDescription"),
      });
    } catch (err) {
      toast.error(extractErrorMessage(err, t("saveErrorFallback")));
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

  if (!position || !requirements || !cv) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToJobs")}
      </Link>

      <PositionHeader position={position} />

      {grouped.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">{t("noRequirements")}</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
              <ProfileProgressSidebar
                grouped={grouped}
                liveValues={liveValues}
                filledCount={filledCount}
                totalCount={totalCount}
              />

              <div className="space-y-6">
                {grouped.map(({ category, requirements: categoryRequirements }) => (
                  <RequirementCategorySection
                    key={category}
                    category={category}
                    requirements={categoryRequirements}
                    liveValues={liveValues}
                    control={form.control}
                    cvPrefillByAttributeId={cvPrefillByAttributeId}
                    cvStaleByAttributeId={cvStaleByAttributeId}
                    dropdownAttributes={dropdownAttributes}
                  />
                ))}
              </div>
            </div>

            <SaveBar
              filledCount={filledCount}
              totalCount={totalCount}
              isSubmitting={form.formState.isSubmitting}
            />
          </form>
        </Form>
      )}
    </div>
  );
}