
import { CreatePositionRequirementDto, PositionRequirementDto, UpdatePositionRequirementDto } from "@/types/position";
import { api } from "../api";

export const positionRequirementsApi = {
  list: async (positionId: string): Promise<PositionRequirementDto[]> => {
    const { data } = await api.get<PositionRequirementDto[]>(
      `/positions/${positionId}/requirements`
    );
    return data;
  },
  add: async (
    positionId: string,
    dto: CreatePositionRequirementDto
  ): Promise<PositionRequirementDto> => {
    const { data } = await api.post<PositionRequirementDto>(
      `/positions/${positionId}/requirements`,
      dto
    );
    return data;
  },
  update: async (
    positionId: string,
    requirementId: string,
    dto: UpdatePositionRequirementDto
  ): Promise<PositionRequirementDto> => {
    const { data } = await api.put<PositionRequirementDto>(
      `/positions/${positionId}/requirements/${requirementId}`,
      dto
    );
    return data;
  },
  remove: async (positionId: string, requirementId: string): Promise<void> => {
    await api.delete(`/positions/${positionId}/requirements/${requirementId}`);
  },
};