
import { CVDto } from "@/types/CV";
import { api } from "../api";

export const cvApi = {
  getMine: async (): Promise<CVDto> => {
    const { data } = await api.get<CVDto>("/cv/me");
    return data;
  },
};