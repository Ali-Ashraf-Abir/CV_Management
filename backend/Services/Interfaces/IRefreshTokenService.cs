namespace backend.Services.Interfaces;
public interface IRefreshTokenService
{
    string GenerateRefreshToken();
    string HashRefreshToken(string token);
}