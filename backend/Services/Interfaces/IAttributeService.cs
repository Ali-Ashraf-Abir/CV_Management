using backend.Dtos;

namespace backend.Services.Interfaces;

public interface IAttributeService
{
    Task<List<AttributeListDto>> GetAllAttributeAsync();
    Task<AttributeDto> GetByIdAsync(Guid id);
    Task<AttributeDto> CreateAsync(CreateAttributeDto dto);
    Task<AttributeDto> UpdateAsync(UpdateAttributeDto dto,Guid id);
    Task DeleteAttribute(Guid id);
}