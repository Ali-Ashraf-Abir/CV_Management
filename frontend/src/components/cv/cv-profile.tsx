"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { extractErrorMessage } from "@/lib/api";

import { AttributeCategory } from "@/types/position";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/constants/attribute-category";
import { CVDto } from "@/types/CV";
import { cvApi } from "@/lib/api/cv";
import { cvAttributesApi } from "@/lib/api/cvAttribute";


export function CVProfile() {
  const [cv, setCv] = useState<CVDto | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    cvApi
      .getMine()
      .then(setCv)
      .catch((err) => toast.error(extractErrorMessage(err, "Couldn't load your CV")));
  }, []);

  const grouped = useMemo(() => {
    if (!cv) return [];
    const byCategory = new Map<AttributeCategory, CVDto["attributes"]>();
    for (const a of cv.attributes) {
      const list = byCategory.get(a.attributeCategory) ?? [];
      list.push(a);
      byCategory.set(a.attributeCategory, list);
    }
    return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
      category,
      attributes: byCategory.get(category)!,
    }));
  }, [cv]);

  async function handleRemove(attributeId: string) {
    setRemovingId(attributeId);
    try {
      await cvAttributesApi.remove(attributeId);
      setCv((prev) =>
        prev ? { ...prev, attributes: prev.attributes.filter((a) => a.attributeId !== attributeId) } : prev
      );
      toast.success("Removed from your CV");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't remove this"));
    } finally {
      setRemovingId(null);
    }
  }

  if (!cv) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your CV</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        These values are shared across every job you apply to — fill them in once here or the
        first time a job asks for them.
      </p>

      {cv.attributes.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          You haven't added anything yet. Apply to a job or fill in your profile to get started.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {grouped.map(({ category, attributes }) => {
            const Icon = CATEGORY_ICON[category];
            return (
              <section key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Icon className="size-4" />
                  {CATEGORY_LABEL[category]}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {attributes.map((a) => (
                    <Card key={a.id} className="border-border/80">
                      <CardContent className="flex items-start justify-between gap-3 py-4">
                        <div>
                          <p className="text-sm font-medium">{a.attributeTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {a.attributeValue ?? a.attributeValueId}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={removingId === a.attributeId}
                          onClick={() => handleRemove(a.attributeId)}
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}