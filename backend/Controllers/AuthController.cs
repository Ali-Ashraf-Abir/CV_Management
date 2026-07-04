
namespace backend.Controllers;

using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]

public class AuthRoutes(IAuthService authService,ICVService cvService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> RegisterUser(RegisterDto data)
    {
        var user = await authService.RegisterUser(data);
        await cvService.CreateCVAsync(user.Id);
        return Ok(user);
    }

    
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await authService.LoginUser(dto);
        Response.Cookies.Append("refreshToken", result.RefreshToken,
               new CookieOptions
               {
                   HttpOnly = true,
                   Secure = true,          // true in production (HTTPS)
                   SameSite = SameSiteMode.Strict,
                   Expires = DateTimeOffset.UtcNow.AddDays(30)
               });
        result.RefreshToken = string.Empty;
        return Ok(result);
    }


    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized();

        var result = await authService.RefreshTokenAsync(
            new RefreshTokenDto
            {
                RefreshToken = refreshToken
            });

        Response.Cookies.Append("refreshToken", result.RefreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(30)
            });

        result.RefreshToken = string.Empty;

        return Ok(result);
    }


}