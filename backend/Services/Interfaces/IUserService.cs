using backend.Dtos;

namespace backend.Services.Interfaces;

public interface IUserService
{
    Task<UserResponseDto> GetUserAsync(Guid userId);
}