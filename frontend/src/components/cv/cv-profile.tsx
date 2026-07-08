"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileStack, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { extractErrorMessage } from "@/lib/api";

import { AttributeCategory } from "@/types/position";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/constants/attribute-category";
import { CVDto } from "@/types/CV";
import { cvApi } from "@/lib/api/cv";
import { cvAttributesApi } from "@/lib/api/cvAttribute";

export function CVProfile() {
  const t = useTranslations("cvProfile");
  const [cv, setCv] = useState<CVDto | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    cvApi
      .getMine()
      .then(setCv)
      .catch((err) => toast.error(extractErrorMessage(err, t("loadErrorFallback"))));
  }, [t]);

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
      toast.success(t("removeSuccess"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("removeErrorFallback")));
    } finally {
      setRemovingId(null);
    }
  }

  if (!cv) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {cv.attributes.length > 0 && (
          <Badge
            variant="secondary"
            className="gap-1.5 whitespace-nowrap bg-primary/10 py-1.5 font-normal text-primary hover:bg-primary/10"
          >
            <FileStack className="size-3.5" />
            {t("summary", { count: cv.attributes.length, categories: grouped.length })}
          </Badge>
        )}
      </div>

      {cv.attributes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileStack className="size-5" />
          </div>
          <p className="mt-2 text-sm font-medium">{t("emptyTitle")}</p>
          <p className="max-w-xs text-sm text-muted-foreground">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {grouped.map(({ category, attributes }) => {
            const Icon = CATEGORY_ICON[category];
            return (
              <Card key={category} className="border-border/80 shadow-sm">
                <CardContent className="py-6">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <h3 className="font-medium">{CATEGORY_LABEL[category]}</h3>
                    </div>
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                      {attributes.length}
                    </Badge>
                  </div>
                  <div className="divide-y divide-border/70">
                    {attributes.map((a) => (
                      <div
                        key={a.id}
                        className="group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{a.attributeTitle}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {a.attributeValue ?? a.attributeValueId}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("removeLabel", { title: a.attributeTitle })}
                          disabled={removingId === a.attributeId}
                          onClick={() => handleRemove(a.attributeId)}
                          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}