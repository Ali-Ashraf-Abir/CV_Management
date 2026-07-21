"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Modal } from "./modal";


export function BulkDeleteDialog({
  open,
  count,
  isDeleting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("adminUsers");

  return (
    <Modal open={open} onClose={onClose} title={t("deleteDialog.title")}>
      <p className="text-sm text-muted-foreground">{t("deleteDialog.descriptionBulk", { count })}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
          {t("actions.cancel")}
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("actions.deleting")}
            </>
          ) : (
            t("actions.delete")
          )}
        </Button>
      </div>
    </Modal>
  );
}