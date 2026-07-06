using System.Security.Claims;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class CVController(ICVService cvService) : ControllerBase
{
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyCV()
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var cv = await cvService.GetOrCreateMyCVAsync(userId);

        return Ok(cv);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid userId)
    {
        
        var cv = await cvService.CreateCVAsync(userId);

        return CreatedAtAction(nameof(GetMyCV), cv);
    }
}