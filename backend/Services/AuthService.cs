namespace backend.Services;

using backend.Configuration;
using backend.Data;
using backend.Dtos;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;

public class AuthService(ApplicationDbContext _db, IPasswordHasher<User> passwordHasher, IJwtService _jwtService, IRefreshTokenService _refreshTokenService, IImageService _imageService) : IAuthService
{

    public async Task<ResponseRegisterDto> RegisterUser(RegisterDto dto)
    {
        if (dto.Role != Roles.Candidate && dto.Role != Roles.Recruiter)
        {
            throw new BadRequestException("Invalid role.");
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
        ImageUploadResultDto? image = null;
        if (dto.ProfileImage != null)
        {
            image = await _imageService.UploadImageAsync(dto.ProfileImage);
        }
        user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);
        if (image != null)
        {

            user.PhotoUrl = image.Url;
            user.PhotoUrlPublicId = image.PublicId;
        }
        try
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new ResponseRegisterDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhotoUrl = image?.Url,
                PhotoUrlPublicId = image?.PublicId,
            };
        }
        catch (DbUpdateException ex)
        {
            if (image != null)
            {
                await _imageService.DeleteImageAsync(image.PublicId);
            }
            if (ex.InnerException is PostgresException pg && pg.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                throw new ConflictException("Email already exists.");
            }
            throw;
        }
    }

    public async Task<LoginResponseDto> LoginUser(LoginDto dto)
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
        var jwt = _jwtService.GenerateToken(user);
        var refreshToken = _refreshTokenService.GenerateRefreshToken();
        var tokenHash = _refreshTokenService.HashRefreshToken(refreshToken);
        var refresh = new RefreshToken
        {
            TokenHash = tokenHash,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            Revoked = false
        };

        _db.RefreshTokens.Add(refresh);
        await _db.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = jwt.AccessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(jwt.ExpiryMinutes),
        };
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenDto dto)
    {
        var hashToken = _refreshTokenService.HashRefreshToken(dto.RefreshToken);
        var result = await _db.RefreshTokens.Include(t => t.User).FirstOrDefaultAsync(t => t.TokenHash == hashToken);
        if (result == null)
        {
            throw new UnauthorizedException("Invalid refresh token.");
        }
        if (result.Revoked)
        {
            throw new UnauthorizedException("Invalid refresh token.");
        }
        if (result.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedException("Invalid refresh token.");
        }
        var jwt = _jwtService.GenerateToken(result.User);
        result.Revoked = true;
        var newRefresh = _refreshTokenService.GenerateRefreshToken();
        var hash = _refreshTokenService.HashRefreshToken(newRefresh);
        _db.RefreshTokens.Add(new RefreshToken
        {
            TokenHash = hash,
            UserId = result.UserId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        });
        await _db.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = jwt.AccessToken,

            RefreshToken = newRefresh,

            ExpiresAt = DateTime.UtcNow.AddMinutes(jwt.ExpiryMinutes)
        };
    }

}