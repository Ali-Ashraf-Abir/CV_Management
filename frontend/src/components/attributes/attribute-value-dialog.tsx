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
import { Loader2 } from "lucide-react";
import { AttributeValueDto } from "@/types/attribute";


interface ValueFormValues {
  value: string;
  sortOrder: number;
  version : number;

}

interface AttributeValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingValue?: AttributeValueDto | null;
  nextSortOrder: number;
  onSubmit: (values: ValueFormValues) => Promise<void>;
}

export function AttributeValueDialog({
  open,
  onOpenChange,
  existingValue,
  nextSortOrder,
  onSubmit,
}: AttributeValueDialogProps) {
  const t = useTranslations("attributes.valueForm");
  const [values, setValues] = useState<ValueFormValues>({ value: "", sortOrder: 0,version:0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(existingValue);

  useEffect(() => {
    if (open) {
      setError(null);
      setValues(
        existingValue
          ? { value: existingValue.value, sortOrder: existingValue.sortOrder,version:existingValue.version }
          : { value: "", sortOrder: nextSortOrder,version:0 }
      );
    }
  }, [open, existingValue, nextSortOrder]);

  async function handleSubmit() {
    if (!values.value.trim()) return;
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="value">{t("valueLabel")}</Label>
            <Input
              id="value"
              autoFocus
              placeholder={t("valuePlaceholder")}
              value={values.value}
              onChange={(e) => setValues((v) => ({ ...v, value: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">{t("sortOrderLabel")}</Label>
            <Input
              id="sortOrder"
              type="number"
              value={values.sortOrder}
              onChange={(e) =>
                setValues((v) => ({ ...v, sortOrder: Number(e.target.value) || 0 }))
              }
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
          <Button onClick={handleSubmit} disabled={!values.value.trim() || submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
