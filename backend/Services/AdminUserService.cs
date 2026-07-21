using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AdminUserService(ApplicationDbContext _db) : IAdminUserService
{
    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await _db.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                PhotoUrl = u.PhotoUrl,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<UserDto> GetUserByIdAsync(Guid id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new NotFoundException("User Not Found");
        }

        return MapToDto(user);
    }

    public async Task<UserDto> UpdateUserRoleAsync(Guid id, UpdateUserRoleDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new NotFoundException("User Not Found");
        }

        user.Role = dto.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, AdminUpdateUserDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new NotFoundException("User Not Found");
        }

        var emailTaken = await _db.Users
            .AnyAsync(u => u.Id != id && u.Email == dto.Email);
        if (emailTaken)
        {
            throw new ConflictException("Email Is Already In Use");
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.Role = dto.Role;
        user.PhotoUrl = dto.PhotoUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new NotFoundException("User Not Found");
        }

        _db.Remove(user);
        await _db.SaveChangesAsync();
    }

    public async Task<List<UserDto>> UpdateUsersRoleAsync(List<Guid> ids, Roles role)
    {
        var users = await _db.Users.Where(u => ids.Contains(u.Id)).ToListAsync();
        if (users.Count == 0)
        {
            throw new NotFoundException("No Matching Users Found");
        }

        foreach (var user in users)
        {
            user.Role = role;
            user.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return users.Select(MapToDto).ToList();
    }

    public async Task DeleteUsersAsync(List<Guid> ids)
    {
        var users = await _db.Users.Where(u => ids.Contains(u.Id)).ToListAsync();
        if (users.Count == 0)
        {
            throw new NotFoundException("No Matching Users Found");
        }

        _db.RemoveRange(users);
        await _db.SaveChangesAsync();
    }

    private static UserDto MapToDto(Models.User user) => new()
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