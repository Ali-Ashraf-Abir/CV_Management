using backend.Dtos;
using backend.Enums;

namespace backend.Services.Interfaces;
public interface IPositionRequirementService
{
    Task<List<PositionRequirementDto>> GetForPositionAsync(Guid positionId);
    Task<PositionRequirementDto> AddAsync(Guid positionId, Guid userId, Roles role, CreatePositionRequirementDto dto);
    Task<PositionRequirementDto> UpdateAsync(Guid positionId, Guid requirementId, Guid userId, Roles role, UpdatePositionRequirementDto dto);
    Task DeleteAsync(Guid positionId, Guid requirementId, Guid userId, Roles role);
}