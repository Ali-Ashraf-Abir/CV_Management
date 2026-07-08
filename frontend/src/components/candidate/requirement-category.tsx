import { Control } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_ICON, CATEGORY_LABEL } from "@/lib/constants/attribute-category";
import { AttributeCategory, PositionRequirementDto } from "@/types/position";
import { AttributeDto } from "@/types/attribute";
import { AttributeValueField } from "./attribute-value-field";
import { CandidateProfileValues } from "./candidate-position-cv";
import { categoryAnchor, countFilled } from "./requirement-progress";


export function RequirementCategorySection({
  category,
  requirements,
  liveValues,
  control,
  cvPrefillByAttributeId,
  cvStaleByAttributeId,
  dropdownAttributes,
}: {
  category: AttributeCategory;
  requirements: PositionRequirementDto[];
  liveValues: Record<string, string> | undefined;
  control: Control<CandidateProfileValues>;
  cvPrefillByAttributeId: Map<string, string>;
  cvStaleByAttributeId: Map<string, string>;
  dropdownAttributes: Record<string, AttributeDto>;
}) {
  const Icon = CATEGORY_ICON[category];
  const filled = countFilled(requirements, liveValues);
  const total = requirements.length;

  return (
    <Card id={categoryAnchor(category)} className="scroll-mt-8 border-border/80 shadow-sm">
      <CardContent className="py-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <h3 className="font-medium">{CATEGORY_LABEL[category]}</h3>
          </div>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {filled}/{total}
          </Badge>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {requirements.map((requirement) => (
            <AttributeValueField
              key={requirement.id}
              control={control}
              requirement={requirement}
              isPrefilled={cvPrefillByAttributeId.has(requirement.attributeId)}
              staleValue={cvStaleByAttributeId.get(requirement.attributeId)}
              dropdownAttribute={dropdownAttributes[requirement.attributeId]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}