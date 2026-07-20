namespace backend.Services.Interfaces;

using backend.Dtos;

public interface IAttributeService
{
    Task<AttributeDto> GetByIdAsync(Guid id);
    Task<AttributeDto> CreateAsync(CreateAttributeDto dto);
    Task<AttributeDto> UpdateAsync(UpdateAttributeDto dto, Guid id);
    Task DeleteAttribute(Guid id);
    Task<PagedResultDto<AttributeListDto>> GetAllAttributeAsync(string? search, string? category, int page, int pageSize);
    Task<List<string>> GetCategoriesAsync();
    Task DeleteAttributes(List<Guid> ids);
}