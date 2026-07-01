import { AttributeValueDto, CreateAttributeValueDto, UpdateAttributeValueDto } from "@/types/attribute";
import { api } from "../api";


export const attributeValuesApi = {
  list: async (attributeId: string): Promise<AttributeValueDto[]> => {
    const { data } = await api.get<AttributeValueDto[]>(
      `/attribute/${attributeId}/values`
    );
    return data;
  },
  create: async (
    attributeId: string,
    dto: CreateAttributeValueDto
  ): Promise<AttributeValueDto> => {
    const { data } = await api.post<AttributeValueDto>(
      `/attribute/${attributeId}/values`,
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
      `/attribute/${attributeId}/values/${id}`,
      dto
    );
    return data;
  },
  remove: async (attributeId: string, id: string): Promise<void> => {
    await api.delete(`/attribute/${attributeId}/values/${id}`);
  },
};
