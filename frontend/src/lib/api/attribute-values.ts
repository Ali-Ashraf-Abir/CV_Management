import { AttributeValueDto, CreateAttributeValueDto, UpdateAttributeValueDto } from "@/types/attribute";
import { api } from "../api";


export const attributeValuesApi = {
  list: async (attributeId: string): Promise<AttributeValueDto[]> => {
    const { data } = await api.get<AttributeValueDto[]>(
      `/attributes/${attributeId}/values`
    );
    return data;
  },
  create: async (
    attributeId: string,
    dto: CreateAttributeValueDto
  ): Promise<AttributeValueDto> => {
    const { data } = await api.post<AttributeValueDto>(
      `/attributes/${attributeId}/values`,
      dto
    );
    return data;
  },
  update: async (
    attributeId: string,
    id: string,
    dto: UpdateAttributeValueDto
  ): Promise<AttributeValueDto> => {
    const { data } = await api.put<AttributeValueDto>(
      `/attributes/${attributeId}/values/${id}`,
      dto
    );
    return data;
  },
  remove: async (attributeId: string, id: string): Promise<void> => {
    await api.delete(`/attributes/${attributeId}/values/${id}`);
  },
};
