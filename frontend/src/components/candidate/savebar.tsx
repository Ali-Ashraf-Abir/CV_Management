import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function SaveBar({
  filledCount,
  totalCount,
  isSubmitting,
}: {
  filledCount: number;
  totalCount: number;
  isSubmitting: boolean;
}) {
  const t = useTranslations("cv");
  const remaining = totalCount - filledCount;

  return (
    <div className="sticky bottom-0 z-10 mt-8 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <p className="hidden text-sm text-muted-foreground sm:block">
          {remaining === 0 ? t("allSet") : t("fieldsLeft", { count: remaining })}
        </p>
        <Button type="submit" disabled={isSubmitting} className="ml-auto gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {t("saveButton")}
        </Button>
      </div>
    </div>
  );
}