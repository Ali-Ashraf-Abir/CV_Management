using backend.Dtos;

namespace backend.Services.Interfaces;

public interface IAttributeValueService
{
    Task<List<AttributeValueDto>> GetAllAttributesValueByAttributeIdAsync(Guid id);
    Task<AttributeValueDto> GetAttributeValueByIdAsync(Guid id);
    Task<AttributeValueDto> CreateAttributeValueAsync(CreateAttributeValueDto dto);
    Task<AttributeValueDto> UpdateAttributeValueAsync(UpdateAttributeValueDto dto,Guid id);

    Task DeleteAttributeValueAsync(Guid id);
}