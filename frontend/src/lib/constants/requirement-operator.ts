import { RequirementOperator } from "@/types/position";

export const OPERATOR_LABEL: Record<RequirementOperator, string> = {
  Equals: "Equals",
  NotEquals: "Does not equal",
  Contains: "Contains",
  StartsWith: "Starts with",
  EndsWith: "Ends with",
  In: "Is one of",
  GreaterThan: "Greater than",
  GreaterThanOrEqual: "At least",
  LessThan: "Less than",
  LessThanOrEqual: "At most",
  Between: "Between",
};

export const OPERATOR_SYMBOL: Record<RequirementOperator, string> = {
  Equals: "=",
  NotEquals: "≠",
  Contains: "contains",
  StartsWith: "starts with",
  EndsWith: "ends with",
  In: "in",
  GreaterThan: ">",
  GreaterThanOrEqual: "≥",
  LessThan: "<",
  LessThanOrEqual: "≤",
  Between: "between",
};

export const OPERATOR_NEEDS_SECOND_VALUE: RequirementOperator[] = ["Between"];
export const OPERATOR_IS_MULTI_VALUE: RequirementOperator[] = ["In"];
