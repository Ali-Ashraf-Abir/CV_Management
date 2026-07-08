import { PositionRequirementDto } from "@/types/position";

export function isRequirementFilled(value: string | undefined | null) {
  return value !== "" && value != null;
}

export function countFilled(
  requirements: PositionRequirementDto[],
  liveValues: Record<string, string> | undefined
) {
  return requirements.filter((r) => isRequirementFilled(liveValues?.[r.id])).length;
}

export function categoryAnchor(category: string) {
  return `section-${category}`;
}