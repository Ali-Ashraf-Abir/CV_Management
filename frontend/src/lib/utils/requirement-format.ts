import { AttributeType, PositionRequirementDto, RequirementOperator } from "@/types/position";
import { OPERATOR_SYMBOL } from "../constants/requirement-operator";

function formatSingleValue(type: AttributeType, value: string): string {
  if (type === "Boolean") return value.toLowerCase() === "true" ? "Yes" : "No";
  if (type === "Date" || type === "Period") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }
  }
  return value;
}

/** e.g. "≥ 3", "between Jan 2020 and Jan 2023", "one of: Remote, Hybrid" */
export function formatRequirementRule(requirement: PositionRequirementDto): string {
  const { operator, value, secondValue, attributeType } = requirement;
  if (!value) return "—";

  if (operator === "In") {
    const options = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    return `one of: ${options.join(", ")}`;
  }

  if (operator === "Between") {
    return `between ${formatSingleValue(attributeType, value)} and ${formatSingleValue(
      attributeType,
      secondValue ?? ""
    )}`;
  }

  const symbol = OPERATOR_SYMBOL[operator as RequirementOperator];
  return `${symbol} ${formatSingleValue(attributeType, value)}`;
}
