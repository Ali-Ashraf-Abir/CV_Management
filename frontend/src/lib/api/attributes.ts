import { AttributeDto, AttributeListDto, AttributeSummaryDto, CreateAttributeDto, PagedResultDto, UpdateAttributeDto } from "@/types/attribute";
import { api } from "../api";


export const attributesApi = {
  list: async (params: {
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category && params.category !== "all") query.set("category", params.category);
    query.set("page", String(params.page ?? 1));
    query.set("pageSize", String(params.pageSize ?? 20));
    const res = await api.get<PagedResultDto<AttributeListDto>>(`/attribute?${query.toString()}`);
    return res.data;
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


  categories: async () => {
    const res = await api.get<string[]>("/attribute/categories");
    return res.data;
  },

  removeMany: async (ids: string[]) => {
    await api.delete("/attribute", { data: ids });
  },
};
