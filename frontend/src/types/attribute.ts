// Mirrors backend.Enums.AttributeType
export const AttributeType = {
  String: "String",
  Text: "Text",
  Image: "Image",
  Numeric: "Numeric",
  Date: "Date",
  Period: "Period",
  Boolean: "Boolean",
  Dropdown: "Dropdown",
} as const;

export type AttributeType = (typeof AttributeType)[keyof typeof AttributeType];

export const ATTRIBUTE_TYPE_VALUES: AttributeType[] = [
  "String",
  "Text",
  "Image",
  "Numeric",
  "Date",
  "Period",
  "Boolean",
  "Dropdown",
];

// Mirrors backend.Enums.AttributeCategory
export const AttributeCategory = {
  Personal: "Personal",
  Contact: "Contact",
  Education: "Education",
  Experience: "Experience",
  Skills: "Skills",
  Technologies: "Technologies",
  Projects: "Projects",
  Languages: "Languages",
  Certifications: "Certifications",
  SoftSkills: "SoftSkills",
  Preferences: "Preferences",
  Availability: "Availability",
  Custom: "Custom",
} as const;

export type AttributeCategory = (typeof AttributeCategory)[keyof typeof AttributeCategory];

export const ATTRIBUTE_CATEGORY_VALUES: AttributeCategory[] = [
  "Personal",
  "Contact",
  "Education",
  "Experience",
  "Skills",
  "Technologies",
  "Projects",
  "Languages",
  "Certifications",
  "SoftSkills",
  "Preferences",
  "Availability",
  "Custom",
];

export interface AttributeValueDto {
  id: string;
  attributeId?: string;
  value: string;
  sortOrder: number;
  version:number;
}

export interface AttributeListDto {
  id: string;
  title: string;
  category: AttributeCategory;
  type: AttributeType;
}

export interface AttributeDto {
  id: string;
  title: string;
  category: AttributeCategory;
  type: AttributeType;
  description?: string | null;
  isFilterable: boolean;
  version: number;
  values: AttributeValueDto[];
}

export interface CreateAttributeDto {
  title: string;
  category: AttributeCategory;
  type: AttributeType;
  description?: string | null;
  isFilterable: boolean;
}

export interface UpdateAttributeDto extends CreateAttributeDto {
  version: number;
}

export interface CreateAttributeValueDto {
  attributeId: string;
  value: string;
  sortOrder: number;
}

export interface UpdateAttributeValueDto {
  value: string;
  sortOrder: number;
}

// Types that need a value list to make sense
export const VALUE_LIST_TYPES: AttributeType[] = ["Dropdown"];

// Helper: does this attribute type require predefined values
export function requiresValues(type: AttributeType) {
  return VALUE_LIST_TYPES.includes(type);
}
export interface AttributeSummaryDto {
  id: string;
  title: string;
  category: AttributeCategory;
  type: AttributeType;
  isFilterable: boolean;
  values: AttributeValueDto[];
}