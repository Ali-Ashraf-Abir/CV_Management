import { AttributeDto, AttributeListDto, AttributeSummaryDto, CreateAttributeDto, UpdateAttributeDto } from "@/types/attribute";
import { api } from "../api";


export const attributesApi = {
  list: async (): Promise<AttributeListDto[]> => {
    const { data } = await api.get<AttributeListDto[]>("/attribute");
    return data;
  },
  getById: async (id: string): Promise<AttributeDto> => {
    const { data } = await api.get<AttributeDto>(`/attribute/${id}`);
    return data;
  },
  create: async (dto: CreateAttributeDto): Promise<AttributeDto> => {
    const { data } = await api.post<AttributeDto>("/attribute", dto);
    return data;
  },
  update: async (id: string, dto: UpdateAttributeDto): Promise<AttributeDto> => {
    const { data } = await api.put<AttributeDto>(`/attribute/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/attribute/${id}`);
  },
  listFilterable: async (): Promise<AttributeSummaryDto[]> => {
    const { data } = await api.get<AttributeSummaryDto[]>("/attribute");
    return data
  },

};
