namespace backend.Services.Interfaces;

using backend.Dtos;
using backend.Models;

public interface IJwtService
{
    JwtResultDto GenerateToken(User user);
}