using backend.Dtos;

namespace backend.Services.Interfaces;

public interface ICVAttributeService
{
    Task<CVAttributeDto> UpsertAttributeAsync(
        Guid userId,
        UpsertCVAttributeDto dto);

    Task DeleteAttributeAsync(
        Guid userId,
        Guid attributeId);
}