
import { CVAttributeDto, UpsertCVAttributeDto } from "@/types/CV";
import { api } from "../api";

export const cvAttributesApi = {
  upsert: async (dto: UpsertCVAttributeDto): Promise<CVAttributeDto> => {
    const { data } = await api.put<CVAttributeDto>("/cv/attributes", dto);
    return data;
  },
  remove: async (attributeId: string): Promise<void> => {
    await api.delete(`/cv/attributes/${attributeId}`);
  },
};