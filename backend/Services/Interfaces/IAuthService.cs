using backend.Dtos;

namespace backend.Services.Interfaces;
public interface IAuthService
{
    Task RegisterUser(RegisterDto dto);
    Task<string> LoginUser(LoginDto dto);
    }