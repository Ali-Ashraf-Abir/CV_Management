"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { getAttributeTypeMeta } from "./type-badge";
import { ATTRIBUTE_CATEGORY_VALUES, ATTRIBUTE_TYPE_VALUES, AttributeCategory, AttributeDto, AttributeType } from "@/types/attribute";


export interface AttributeFormValues {
  title: string;
  category: AttributeCategory;
  type: AttributeType;
  description: string;
  isFilterable: boolean;
}

interface AttributeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute?: AttributeDto | null;
  onSubmit: (values: AttributeFormValues) => Promise<void>;
}

const EMPTY: AttributeFormValues = {
  title: "",
  category: "Personal",
  type: "String",
  description: "",
  isFilterable: false,
};

export function AttributeFormDialog({
  open,
  onOpenChange,
  attribute,
  onSubmit,
}: AttributeFormDialogProps) {
  const t = useTranslations("attributes.form");
  const tTypes = useTranslations("attributes.types");
  const tCategories = useTranslations("attributes.categories");

  const [values, setValues] = useState<AttributeFormValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(attribute);

  useEffect(() => {
    if (open) {
      setError(null);
      setValues(
        attribute
          ? {
              title: attribute.title,
              category: attribute.category,
              type: attribute.type,
              description: attribute.description ?? "",
              isFilterable: attribute.isFilterable,
            }
          : EMPTY
      );
    }
  }, [open, attribute]);

  const canSubmit = values.title.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">{t("categoryLabel")}</Label>
              <Select
                value={values.category}
                onValueChange={(category) =>
                  setValues((v) => ({ ...v, category: category as AttributeCategory }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_CATEGORY_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {tCategories(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">{t("typeLabel")}</Label>
              <Select
                value={values.type}
                onValueChange={(type) => setValues((v) => ({ ...v, type: type as AttributeType }))}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_TYPE_VALUES.map((value) => {
                    const meta = getAttributeTypeMeta(value);
                    const Icon = meta.icon;
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          {tTypes(`${value}.label`)}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            {tTypes(`${values.type}.hint`)}
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="description">{t("descriptionLabel")}</Label>
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">{t("filterableLabel")}</p>
              <p className="text-xs text-muted-foreground">{t("filterableHint")}</p>
            </div>
            <Switch
              checked={values.isFilterable}
              onCheckedChange={(checked) => setValues((v) => ({ ...v, isFilterable: checked }))}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
