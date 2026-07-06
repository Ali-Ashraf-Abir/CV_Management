import { AttributeCategory, AttributeType } from "@/types/position";

export type CVAttributeDto = {
  id: string;
  attributeId: string;
  attributeTitle: string;
  attributeType: AttributeType;
  attributeCategory: AttributeCategory;
  attributeValue: string | null;
  attributeValueId: string | null;
  version: number;
};

export type CVDto = {
  id: string;
  userId: string;
  attributes: CVAttributeDto[];
};

export type UpsertCVAttributeDto = {
  attributeId: string;
  attributeValue: string | null;
  attributeValueId: string | null;
  version?: number;
};