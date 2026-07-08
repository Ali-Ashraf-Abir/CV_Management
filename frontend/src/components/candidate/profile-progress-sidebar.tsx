import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CATEGORY_ICON, CATEGORY_LABEL } from "@/lib/constants/attribute-category";
import { AttributeCategory, PositionRequirementDto } from "@/types/position";
import { categoryAnchor, countFilled } from "./requirement-progress";


export function ProfileProgressSidebar({
  grouped,
  liveValues,
  filledCount,
  totalCount,
}: {
  grouped: { category: AttributeCategory; requirements: PositionRequirementDto[] }[];
  liveValues: Record<string, string> | undefined;
  filledCount: number;
  totalCount: number;
}) {
  const t = useTranslations("cv");
  const progressPct = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4 lg:sticky lg:top-18">
      <div>
        <h2 className="font-medium">{t("profileTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("profileDescription")}</p>
      </div>

      <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">{filledCount}</span>
          <span className="text-muted-foreground">{t("answeredCount", { total: totalCount })}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <nav className="hidden space-y-0.5 lg:block">
        {grouped.map(({ category, requirements }) => {
          const Icon = CATEGORY_ICON[category];
          const filled = countFilled(requirements, liveValues);
          const total = requirements.length;
          const complete = filled === total;
          return (
            <a
              key={category}
              href={`#${categoryAnchor(category)}`}
              className="flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Icon className="size-3.5" />
                {CATEGORY_LABEL[category]}
              </span>
              {complete ? (
                <CheckCircle2 className="size-3.5 text-primary" />
              ) : (
                <span className="text-xs tabular-nums">
                  {filled}/{total}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
}