using System.Security.Claims;
using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class UserProfileController : ControllerBase
{
    private readonly IUserProfileService _profileService;

    public UserProfileController(IUserProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var profile = await _profileService.GetProfileAsync(GetUserId());
        return Ok(profile);
    }


    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var profile = await _profileService.UpdateProfileAsync(GetUserId(), dto);
        return Ok(profile);
    }


    [HttpPost("photo")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<ActionResult<UserProfileDto>> UpdateProfilePhoto(IFormFile file)
    {
        var profile = await _profileService.UpdateProfilePhotoAsync(GetUserId(), file);
        return Ok(profile);
    }

    [HttpDelete("photo")]
    public async Task<IActionResult> DeleteProfilePhoto()
    {
        await _profileService.DeleteProfilePhotoAsync(GetUserId());
        return NoContent();
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        await _profileService.ChangePasswordAsync(GetUserId(), dto);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !Guid.TryParse(idClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid or missing user identity.");

        return userId;
    }
}