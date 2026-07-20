namespace backend.Services;

using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class UserProfileService(ApplicationDbContext _db, IPasswordHasher<User> passwordHasher, IImageService _imageService) : IUserProfileService
{
    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await GetUserOrThrowAsync(userId);
        return MapToDto(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await GetUserOrThrowAsync(userId);

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<UserProfileDto> UpdateProfilePhotoAsync(Guid userId, IFormFile file)
    {
        var user = await GetUserOrThrowAsync(userId);

        // Keep the old public id so we can clean it up once the new image is safely uploaded.
        var oldPublicId = user.PhotoUrlPublicId;

        var uploadResult = await _imageService.UploadImageAsync(file);

        user.PhotoUrl = uploadResult.Url;
        user.PhotoUrlPublicId = uploadResult.PublicId;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(oldPublicId))
        {
            // Best-effort cleanup; the profile update should not fail if this errors.
            try
            {
                await _imageService.DeleteImageAsync(oldPublicId);
            }
            catch
            {
                // Swallow: a stale image in Cloudinary is not worth failing the request over.
            }
        }

        return MapToDto(user);
    }

    public async Task DeleteProfilePhotoAsync(Guid userId)
    {
        var user = await GetUserOrThrowAsync(userId);

        if (string.IsNullOrWhiteSpace(user.PhotoUrlPublicId))
            return;

        await _imageService.DeleteImageAsync(user.PhotoUrlPublicId);

        user.PhotoUrl = string.Empty;
        user.PhotoUrlPublicId = string.Empty;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await GetUserOrThrowAsync(userId);

        var verifyResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            throw new BadRequestException("Current password is incorrect.");
        }

        var sameAsOld = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.NewPassword);
        if (sameAsOld != PasswordVerificationResult.Failed)
        {
            throw new BadRequestException("New password must be different from the current password.");
        }

        user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    private async Task<User> GetUserOrThrowAsync(Guid userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new NotFoundException("User Not Found");
        }

        return user;
    }

    private static UserProfileDto MapToDto(User user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        Role = user.Role,
        PhotoUrl = user.PhotoUrl,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt
    };
}