using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;


public class UserService(ApplicationDbContext _db): IUserService
{
    public async Task<UserResponseDto> GetUserAsync(Guid userId)
    {
        var result = await _db.Users.FirstOrDefaultAsync(u=>u.Id == userId);
        if(result == null)
        {
            throw new NotFoundException("User Not Found");
        }

        return new UserResponseDto
        {
            Id = result.Id,
            FirstName = result.FirstName,
            LastName = result.LastName,
            PhotoUrl = result.PhotoUrl,
            Email = result.Email,
            Role = result.Role
        };
    }
}