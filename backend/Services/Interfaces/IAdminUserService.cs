using backend.Dtos;
using backend.Enums;

namespace backend.Services.Interfaces;

public interface IAdminUserService
{
    Task<List<UserDto>> GetAllUsersAsync();
    Task<UserDto> GetUserByIdAsync(Guid id);
    Task<UserDto> UpdateUserRoleAsync(Guid id, UpdateUserRoleDto dto);
    Task<UserDto> UpdateUserAsync(Guid id, AdminUpdateUserDto dto);
    Task DeleteUserAsync(Guid id);

    Task<List<UserDto>> UpdateUsersRoleAsync(List<Guid> ids, Roles role);
    Task DeleteUsersAsync(List<Guid> ids);
}