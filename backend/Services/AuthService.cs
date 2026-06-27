namespace backend.Services;

using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

public class AuthService(ApplicationDbContext _db, IPasswordHasher<User> passwordHasher, IJwtService _jwtService) : IAuthService
{
    public async Task RegisterUser(RegisterDto dto)
    {
        if (dto.Role != Roles.Candidate && dto.Role != Roles.Recruiter)
        {
            throw new BadHttpRequestException("Invalid role.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);

        try
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is PostgresException pg && pg.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                throw new ConflictException("Email already exists.");
            }
            throw;
        }
    }

    public async Task<string> LoginUser(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
        {
            throw new NotFoundException("User Not Found");
        }
        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }
        var token = _jwtService.GenerateToken(user);
        return token;
    }
}