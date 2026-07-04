using System.Security.Claims;
using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/cv/attributes")]
[Authorize]
public class CVAttributeController(ICVAttributeService attributeService)
    : ControllerBase
{
    [HttpPut]
    public async Task<IActionResult> Upsert(
        [FromBody] UpsertCVAttributeDto dto)
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var attribute = await attributeService.UpsertAttributeAsync(
            userId,
            dto);

        return Ok(attribute);
    }

    [HttpDelete("{attributeId:guid}")]
    public async Task<IActionResult> Delete(Guid attributeId)
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        await attributeService.DeleteAttributeAsync(
            userId,
            attributeId);

        return NoContent();
    }
}