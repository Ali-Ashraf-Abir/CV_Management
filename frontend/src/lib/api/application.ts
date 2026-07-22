import { api } from "../api";
import {
  ApplicantDto,
  ApplicationDto,
  UpdateApplicationStatusDto,
} from "@/types/application";
import { CVDto } from "@/types/CV";

export const applicationsApi = {
  apply: async (positionId: string): Promise<ApplicationDto> => {
    const { data } = await api.post<ApplicationDto>("/applications", { positionId });
    return data;
  },
  myApplications: async (): Promise<ApplicationDto[]> => {
    const { data } = await api.get<ApplicationDto[]>("/applications/mine");
    return data;
  },
  getApplicants: async (positionId: string): Promise<ApplicantDto[]> => {
    const { data } = await api.get<ApplicantDto[]>(`/applications/position/${positionId}`);
    return data;
  },
  updateStatus: async (
    applicationId: string,
    dto: UpdateApplicationStatusDto
  ): Promise<ApplicantDto> => {
    const { data } = await api.patch<ApplicantDto>(`/applications/${applicationId}/status`, dto);
    return data;
  },
  getApplicantCv: async (applicationId: string): Promise<CVDto> => {
    const { data } = await api.get<CVDto>(`/applications/${applicationId}/cv`);
    return data;
  },
};