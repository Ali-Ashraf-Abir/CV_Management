namespace backend.Services.Interfaces;

using backend.Dtos;
using Microsoft.AspNetCore.Http;

public interface IUserProfileService
{
    Task<UserProfileDto> GetProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<UserProfileDto> UpdateProfilePhotoAsync(Guid userId, IFormFile file);
    Task DeleteProfilePhotoAsync(Guid userId);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}