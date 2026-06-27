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

public class AuthService(ApplicationDbContext _db, IPasswordHasher<User> passwordHasher) : IAuthService
{
     public async  Task RegisterUser(RegisterDto data)
    {
        if (data.Role != Roles.Candidate && data.Role != Roles.Recruiter)
        {
            throw new BadHttpRequestException("Invalid role.");
        }
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = data.FirstName,
            LastName = data.LastName,
            Email = data.Email,
            Role = data.Role,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, data.Password);
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
}