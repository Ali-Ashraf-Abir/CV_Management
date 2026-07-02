
export type PositionStatus = "Draft" | "Published" | "Closed" | "Archived";

export const POSITION_STATUSES: PositionStatus[] = [
  "Draft",
  "Published",
  "Closed",
  "Archived",
];

export const POSITION_STATUS_TRANSITIONS: Record<PositionStatus, PositionStatus[]> = {
  Draft: ["Published", "Archived"],
  Published: ["Closed", "Archived"],
  Closed: ["Published", "Archived"],
  Archived: [],
};


export type AttributeCategory =
  | "Personal"
  | "Contact"
  | "Education"
  | "Experience"
  | "Skills"
  | "Technologies"
  | "Projects"
  | "Languages"
  | "Certifications"
  | "SoftSkills"
  | "Preferences"
  | "Availability"
  | "Custom";


export type AttributeType =
  | "String"
  | "Text"
  | "Image"
  | "Numeric"
  | "Date"
  | "Period"
  | "Boolean"
  | "Dropdown";

export type RequirementOperator =
  | "Equals"
  | "NotEquals"
  | "Contains"
  | "StartsWith"
  | "EndsWith"
  | "In"
  | "GreaterThan"
  | "GreaterThanOrEqual"
  | "LessThan"
  | "LessThanOrEqual"
  | "Between";

export const ALLOWED_OPERATORS_BY_TYPE: Record<AttributeType, RequirementOperator[]> = {
  String: ["Equals", "NotEquals", "Contains", "StartsWith", "EndsWith", "In"],
  Text: ["Equals", "NotEquals", "Contains", "StartsWith", "EndsWith"],
  Numeric: [
    "Equals",
    "NotEquals",
    "GreaterThan",
    "GreaterThanOrEqual",
    "LessThan",
    "LessThanOrEqual",
    "Between",
  ],
  Date: [
    "Equals",
    "NotEquals",
    "GreaterThan",
    "GreaterThanOrEqual",
    "LessThan",
    "LessThanOrEqual",
    "Between",
  ],
  Period: ["GreaterThan", "GreaterThanOrEqual", "LessThan", "LessThanOrEqual", "Between"],
  Boolean: ["Equals", "NotEquals"],
  Dropdown: ["Equals", "NotEquals", "In"],
  Image: [],
};

export interface PositionRequirementDto {
  id: string;
  attributeId: string;
  attributeTitle: string;
  attributeCategory: AttributeCategory;
  attributeType: AttributeType;
  operator: RequirementOperator;
  value: string | null;
  secondValue: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionRequirementDto {
  attributeId: string;
  operator: RequirementOperator;
  value?: string | null;
  secondValue?: string | null;
}

export interface UpdatePositionRequirementDto {
  operator: RequirementOperator;
  value?: string | null;
  secondValue?: string | null;
  version: number;
}

export interface PositionDto {
  id: string;
  title: string;
  description: string;
  createdById: string;
  createdByName: string;
  status: PositionStatus;
  deadline: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  requirementsCount: number;
  requirements: PositionRequirementDto[];
}

export interface PositionSummaryDto {
  id: string;
  title: string;
  status: PositionStatus;
  isPublished: boolean;
  deadline: string | null;
  createdAt: string;
  version: number;
  requirementsCount: number;
}

export interface CreatePositionDto {
  title: string;
  description: string;
  deadline?: string | null;
}

export interface UpdatePositionDto {
  title: string;
  description: string;
  deadline?: string | null;
  version: number;
}

export interface ChangePositionStatusDto {
  status: PositionStatus;
}