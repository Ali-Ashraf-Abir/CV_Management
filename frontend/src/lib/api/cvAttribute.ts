
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
  uploadImage: async (attributeId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<CVAttributeDto>(
      `/cv/images/${attributeId}`,
      formData,
      { headers: { "Content-Type": undefined } }
    );
    return res.data;
  },

  deleteImage: async (attributeId: string) => {
    await api.delete(`/cv/images/${attributeId}`);
  },
};