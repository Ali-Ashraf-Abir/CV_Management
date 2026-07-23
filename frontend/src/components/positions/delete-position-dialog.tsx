"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";

export function DeletePositionDialog({
  positionId,
  positionTitle,
  onDeleted,
}: {
  positionId: string;
  positionTitle: string;
  onDeleted: () => void;
}) {
  const t = useTranslations("positions");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await positionsApi.remove(positionId);
      toast.success(t("positionDeleted"));
      onDeleted();
    } catch (err) {
      toast.error(extractErrorMessage(err, t("positionDeleteError")));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="size-4" />
          <span className="sr-only">{t("deletePositionSr")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deletePositionTitle", { title: positionTitle })}</AlertDialogTitle>
          <AlertDialogDescription>{t("deletePositionDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}