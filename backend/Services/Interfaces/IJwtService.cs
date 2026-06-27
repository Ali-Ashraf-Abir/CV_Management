namespace backend.Services.Interfaces;
using backend.Models;

public interface IJwtService
{
    string GenerateToken(User user);
}