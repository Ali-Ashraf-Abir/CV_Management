"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  DynamicAttributeField,
  DynamicAttributeValue,
} from "./dynamic-attribute-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributeTypeBadge } from "./type-badge";
import { AttributeDto } from "@/types/attribute";

export function AttributePreview({ attribute }: { attribute: AttributeDto }) {
  const t = useTranslations("attributes.preview");
  const [value, setValue] = useState<DynamicAttributeValue>(
    attribute.type === "Boolean" ? false : attribute.type === "Period" ? { from: "", to: "" } : null
  );

  function formatPreviewValue(): string {
    if (value === null || value === undefined || value === "") return t("emptyValue");

    switch (attribute.type) {
      case "Boolean":
        return value ? "Yes" : "No";
      case "Period": {
        const p = value as { from: string; to: string };
        if (!p.from && !p.to) return t("emptyValue");
        return `${p.from || "…"} – ${p.to || t("periodTo")}`;
      }
      default:
        return String(value);
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t("title")}</CardTitle>
        <AttributeTypeBadge type={attribute.type} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fill">
          <TabsList className="mb-4">
            <TabsTrigger value="fill">{t("fillTab")}</TabsTrigger>
            <TabsTrigger value="display">{t("displayTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="fill" className="space-y-2">
            <p className="text-sm font-medium">
              {attribute.title}
              {attribute.isFilterable && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {t("searchableTag")}
                </span>
              )}
            </p>
            {attribute.description && (
              <p className="text-xs text-muted-foreground">{attribute.description}</p>
            )}
            <DynamicAttributeField attribute={attribute} value={value} onChange={setValue} />
          </TabsContent>

          <TabsContent value="display">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {attribute.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{formatPreviewValue()}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("displayNote")}</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
