"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/constants/attribute-category";
import { PositionDto, PositionRequirementDto, AttributeCategory } from "@/types/position";
import { PositionStatusBadge } from "@/components/positions/position-status-badge";
import { AttributeValueField } from "./attribute-value-field";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";
import { buildAttributeValueSchema } from "@/validations/attribute-value.schema";
import { Form } from "../ui/form";
import { CVDto } from "@/types/CV";
import { cvApi } from "@/lib/api/cv";
import { cvAttributesApi } from "@/lib/api/cvAttribute";
import { attributesApi } from "@/lib/api/attributes";
import { AttributeDto } from "@/types/attribute";



export type CandidateProfileValues = { values: Record<string, string> };

export function CandidatePositionCv({ positionId }: { positionId: string }) {
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
        const message = extractErrorMessage(err, "Couldn't load this position");
        setLoadError(message);
        toast.error(message);
      }
    })();
  }, [positionId]);
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
        if (stillValid) map.set(a.attributeId, stillValid.id); // id, so <Select> renders it
        // no match -> leave unset, field starts empty
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
      if (!options) continue; // haven't loaded yet — don't flag prematurely
      const stillValid = options.some((o) => o.value === a.attributeValue);
      if (!stillValid) map.set(a.attributeId, a.attributeValue);
    }
    return map;
  }, [cv, dropdownAttributes]);
  const cvValueByAttributeId = useMemo(() => {
    const map = new Map<string, string>();
    if (!cv) return map;
    for (const a of cv.attributes) {
      const value = a.attributeValueId ?? a.attributeValue;
      if (value) map.set(a.attributeId, value);
    }
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
      toast.success("Your details are saved to your profile", {
        description: "These will be prefilled automatically on other jobs too.",
      });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save your details"));
    }
  }
  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }
  if (!position || !requirements || !cv) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <Card className="overflow-hidden border-border/80">
        <div className="h-1.5 w-full bg-primary" />
        <CardContent className="py-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{position.title}</h1>
            <PositionStatusBadge status={position.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{position.createdByName}</span>
            {position.deadline && (
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5" />
                Apply by {new Date(position.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{position.description}</p>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          This position has no requirements defined yet — check back soon.
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h2 className="font-medium">Your profile for this role</h2>
              <p className="text-sm text-muted-foreground">
                Anything already on your CV is filled in below automatically. Fill in the rest
                and it'll be saved to your CV for next time.
              </p>
            </div>

            {grouped.map(({ category, requirements: categoryRequirements }) => {
              const Icon = CATEGORY_ICON[category];
              return (
                <section key={category} className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Icon className="size-4" />
                    {CATEGORY_LABEL[category]}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {categoryRequirements.map((requirement) => (
                      <AttributeValueField
                        key={requirement.id}
                        control={form.control}
                        requirement={requirement}
                        isPrefilled={cvPrefillByAttributeId.has(requirement.attributeId)}
                        staleValue={cvStaleByAttributeId.get(requirement.attributeId)}
                        dropdownAttribute={dropdownAttributes[requirement.attributeId]}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Save my details
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}