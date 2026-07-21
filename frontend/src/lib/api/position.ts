
import { ChangePositionStatusDto, CreatePositionDto, PositionDto, PositionStatus, PositionSummaryDto, UpdatePositionDto } from "@/types/position";
import { api } from "../api";

export const positionsApi = {
  list: async (status?: PositionStatus): Promise<PositionSummaryDto[]> => {
    const { data } = await api.get<PositionSummaryDto[]>("/position", {
      params: status ? { status } : undefined,
    });
    return data;
  },
  myList: async (status?: PositionStatus): Promise<PositionSummaryDto[]> => {
    const { data } = await api.get<PositionSummaryDto[]>("/position/me", {
      params: status ? { status } : undefined,
    });
    return data;
  },
  getById: async (id: string): Promise<PositionDto> => {
    const { data } = await api.get<PositionDto>(`/position/${id}`);
    return data;
  },
  create: async (dto: CreatePositionDto): Promise<PositionDto> => {
    const { data } = await api.post<PositionDto>("/position", dto);
    return data;
  },
  update: async (id: string, dto: UpdatePositionDto): Promise<PositionDto> => {
    const { data } = await api.put<PositionDto>(`/position/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/position/${id}`);
  },
  changeStatus: async (id: string, dto: ChangePositionStatusDto): Promise<PositionDto> => {
    const { data } = await api.patch<PositionDto>(`/position/${id}/status`, dto);
    return data;
  },
};