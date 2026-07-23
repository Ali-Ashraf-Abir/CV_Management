"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";

import { RequirementFormDialog } from "./requirement-form-dialog";

import { extractErrorMessage } from "@/lib/api";
import { formatRequirementRule } from "@/lib/utils/requirement-format";
import { CATEGORY_LABEL } from "@/lib/constants/attribute-category";
import { PositionRequirementDto } from "@/types/position";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";

export function RequirementList({
  positionId,
  requirements,
  onChange,
  readOnly,
}: {
  positionId: string;
  requirements: PositionRequirementDto[];
  onChange: (requirements: PositionRequirementDto[]) => void;
  readOnly?: boolean;
}) {
  const t = useTranslations("positions");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">{t("requirementsHeading")}</h2>
        {!readOnly && (
          <RequirementFormDialog
            mode="add"
            hasRequirement={false}
            positionId={positionId}
            existingAttributeIds={requirements.map((r) => r.attributeId)}
            onSaved={(created) => onChange([...requirements, created])}
          />
        )}
      </div>

      {requirements.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <ListChecks className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("noRequirementsMessage")}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2">
        {requirements.map((requirement) => (
          <RequirementRow
            key={requirement.id}
            positionId={positionId}
            requirement={requirement}
            readOnly={readOnly}
            onUpdated={(updated) =>
              onChange(requirements.map((r) => (r.id === updated.id ? updated : r)))
            }
            onDeleted={() => onChange(requirements.filter((r) => r.id !== requirement.id))}
          />
        ))}
      </div>
    </div>
  );
}

function RequirementRow({
  positionId,
  requirement,
  readOnly,
  onUpdated,
  onDeleted,
}: {
  positionId: string;
  requirement: PositionRequirementDto;
  readOnly?: boolean;
  onUpdated: (r: PositionRequirementDto) => void;
  onDeleted: () => void;
}) {
  const t = useTranslations("positions");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await positionRequirementsApi.remove(positionId, requirement.id);
      toast.success(t("requirementRemoved"));
      onDeleted();
    } catch (err) {
      toast.error(extractErrorMessage(err, t("requirementRemoveError")));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-3">
         <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{requirement.attributeTitle}</span>
            <Badge variant="secondary" className="font-normal">
              {CATEGORY_LABEL[requirement.attributeCategory]}
            </Badge>
          </div>
          {requirement.hasRequirement ? (
            <p className="text-sm text-muted-foreground">{formatRequirementRule(requirement)}</p>
          ) : (
            <div className="text-accent-foreground">{t("noRequirementValue")}</div>
          )}
        </div>

        {!readOnly && (
          <div className="flex shrink-0 items-center">
            <RequirementFormDialog
              hasRequirement={requirement.hasRequirement}
              mode="edit"
              positionId={positionId}
              requirement={requirement}
              onSaved={onUpdated}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                  <span className="sr-only">{t("removeRequirementSr")}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("removeRequirementTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("removeRequirementDescription", { title: requirement.attributeTitle })}
                  </AlertDialogDescription>
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
                    {t("remove")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}