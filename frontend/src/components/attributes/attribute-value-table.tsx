"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { attributeValuesApi } from "@/lib/api/attribute-values";
import { extractErrorMessage } from "@/lib/api";
import { AttributeValueDialog } from "./attribute-value-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { toast } from "sonner";
import { AttributeValueDto } from "@/types/attribute";

interface AttributeValueTableProps {
  attributeId: string;
  values: AttributeValueDto[];
  version:number;
  onChange: (values: AttributeValueDto[]) => void;
}

export function AttributeValueTable({ attributeId, values, onChange }: AttributeValueTableProps) {
  const t = useTranslations("attributes.valueTable");
  const [dialogValue, setDialogValue] = useState<AttributeValueDto | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<AttributeValueDto | null>(null);

  const sorted = [...values].sort((a, b) => a.sortOrder - b.sortOrder);
  const nextSortOrder = sorted.length ? sorted[sorted.length - 1].sortOrder + 1 : 0;

  async function handleSubmit(input: { value: string; sortOrder: number,version:number }) {
    try {
      if (dialogValue) {
        const updated = await attributeValuesApi.update(attributeId, dialogValue.id, input);
        onChange(values.map((v) => (v.id === updated.id ? updated : v)));
        toast.success(t("updateSuccess"));
      } else {
        const created = await attributeValuesApi.create(attributeId, {
          attributeId,
          ...input,
        });
        onChange([...values, created]);
        toast.success(t("addSuccess"));
      }
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }

  async function handleDelete(value: AttributeValueDto) {
    await attributeValuesApi.remove(attributeId, value.id);
    onChange(values.filter((v) => v.id !== value.id));
    toast.success(t("deleteSuccess"));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setDialogValue(null)}>
          <Plus className="size-4" />
          {t("addValue")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead>{t("columns.value")}</TableHead>
              <TableHead className="w-20">{t("columns.order")}</TableHead>
              <TableHead className="w-20 text-right">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
            {sorted.map((value) => (
              <TableRow key={value.id}>
                <TableCell>
                  <GripVertical className="size-4 text-muted-foreground/50" />
                </TableCell>
                <TableCell className="font-medium">{value.value}</TableCell>
                <TableCell className="text-muted-foreground">{value.sortOrder}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      onClick={() => setDialogValue(value)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(value)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AttributeValueDialog
        open={dialogValue !== undefined}
        onOpenChange={(open) => !open && setDialogValue(undefined)}
        existingValue={dialogValue}
        nextSortOrder={nextSortOrder}
        onSubmit={handleSubmit}
      />

      {deleteTarget && (
        <ConfirmDeleteDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={t("deleteTitle", { value: deleteTarget.value })}
          description={t("deleteDescription")}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  );
}
