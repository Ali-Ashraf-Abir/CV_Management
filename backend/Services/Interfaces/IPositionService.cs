using backend.Dtos;
using backend.Enums;

namespace backend.Services.Interfaces;

public interface IPositionService{

    Task<PositionDto> PositionByIdAsync(Guid id);
    Task<List<PositionSummaryDto>> AllPositionsAsync(Guid userId, Roles role, PositionStatus? status);
    Task<PositionDto> CreatePositionAsync(CreatePositionDto dto,Guid userId);
    Task<PositionDto> UpdatePositionAsnyac(UpdatePositionDto dto,Guid id);
    Task DeletePositionAsync(Guid id);
    Task<PositionDto> ChangeStatusAsync(Guid id, Guid userId, Roles role, PositionStatus newStatus);

}