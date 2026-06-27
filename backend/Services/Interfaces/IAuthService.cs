using backend.Dtos;

namespace backend.Services.Interfaces;
public interface IAuthService
{
    Task<ResponseRegisterDto> RegisterUser(RegisterDto dto);
    Task<LoginResponseDto> LoginUser(LoginDto dto);
    Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenDto dto);
    }