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
import { Form } from "@/components/ui/form";

import { positionsApi } from "@/lib/api/position";

import { extractErrorMessage } from "@/lib/api";

import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/constants/attribute-category";
import { PositionDto, PositionRequirementDto, AttributeCategory } from "@/types/position";
import { PositionStatusBadge } from "@/components/positions/position-status-badge";
import { AttributeValueField } from "./attribute-value-field";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";
import { buildAttributeValueSchema } from "@/validations/attribute-value.schema";

export type CandidateProfileValues = { values: Record<string, string> };

export function CandidatePositionCv({ positionId }: { positionId: string }) {
  const [position, setPosition] = useState<PositionDto | null>(null);
  const [requirements, setRequirements] = useState<PositionRequirementDto[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [positionData, requirementsData] = await Promise.all([
          positionsApi.getById(positionId),
          positionRequirementsApi.list(positionId),
        ]);
        setPosition(positionData);
        setRequirements(requirementsData);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load this position"));
      }
    })();
  }, [positionId]);

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

  const schema = useMemo(() => {
    if (!requirements) return z.object({ values: z.object({}) });
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const r of requirements) {
      shape[r.id] = buildAttributeValueSchema(r.attributeType);
    }
    return z.object({ values: z.object(shape) });
  }, [requirements]);

  const form = useForm<CandidateProfileValues>({
    // The schema shape is built dynamically per-requirement, so its exact
    // Zod type can't be statically inferred to match CandidateProfileValues.
    resolver: zodResolver(schema) as never,
    // TODO: once profile fetching is wired up, prefill any attribute the
    // candidate already has on file here instead of empty strings.
    values: requirements
      ? { values: Object.fromEntries(requirements.map((r) => [r.id, ""])) }
      : undefined,
  });

  async function onSubmit(values: CandidateProfileValues) {
    // Applying isn't wired up yet — this simulates a save so the flow feels complete.
    await new Promise((res) => setTimeout(res, 400));
    toast.success("Your details are saved for this application", {
      description: "You'll be able to submit once applications open.",
    });
    console.log("Candidate attribute values (not yet persisted):", values);
  }

  if (!position || !requirements) {
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
        href="/positions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to positions
      </Link>

      {/* CV header */}
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
                Fill in the details below. Anything already on your profile will be filled in
                automatically once that's connected.
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
