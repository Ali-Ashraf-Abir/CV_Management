using backend.Dtos;
using backend.Extensions;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/cv/images")]
[Authorize]
public class CVImageController(
    ICVImageService service)
    : ControllerBase
{
    [HttpPost("{attributeId:guid}")]
    public async Task<ActionResult<CVAttributeDto>> UploadImage(
        Guid attributeId,
        IFormFile file)
    {
        var userId = User.GetUserId();

        var result = await service.UploadImageAsync(
            userId,
            attributeId,
            file);

        return Ok(result);
    }

    [HttpDelete("{attributeId:guid}")]
    public async Task<IActionResult> DeleteImage(Guid attributeId)
    {
        var userId = User.GetUserId();

        await service.DeleteImageAsync(
            userId,
            attributeId);

        return NoContent();
    }
}