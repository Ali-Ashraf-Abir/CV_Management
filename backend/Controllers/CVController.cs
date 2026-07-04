using System.Security.Claims;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CVController(ICVService cvService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMyCV()
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var cv = await cvService.GetMyCVAsync(userId);

        return Ok(cv);
    }

    [HttpPost]
    public async Task<IActionResult> Create()
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var cv = await cvService.CreateCVAsync(userId);

        return CreatedAtAction(nameof(GetMyCV), cv);
    }
}