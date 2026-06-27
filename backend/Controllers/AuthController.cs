
namespace backend.Controllers;

using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]

public class AuthRoutes(IAuthService authService):ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult>RegisterUser(RegisterDto data)
    {
      await authService.RegisterUser(data);
      return Ok(new { message = "Registration successful." });
    } 
}