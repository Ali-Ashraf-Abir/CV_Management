using backend.Dtos;
using backend.Extensions;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/positions/{positionId:guid}/requirements")]
[Authorize]
[Authorize(Roles = "Recruiter,Administrator")]
public class PositionRequirementsController(IPositionRequirementService _requirementService): ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PositionRequirementDto>>> GetAll(Guid positionId)
    {
        var result = await _requirementService.GetForPositionAsync(positionId);
        return Ok(result);
    }
    [HttpPost]
    public async Task<ActionResult<PositionRequirementDto>> Add(Guid positionId, [FromBody] CreatePositionRequirementDto dto)
    {
        var result = await _requirementService.AddAsync(positionId, User.GetUserId(), User.GetAppRole(), dto);
        return CreatedAtAction(nameof(GetAll), new { positionId }, result);
    }

    [HttpPut("{requirementId:guid}")]
    public async Task<ActionResult<PositionRequirementDto>> Update(Guid positionId, Guid requirementId, [FromBody] UpdatePositionRequirementDto dto)
    {
        var result = await _requirementService.UpdateAsync(positionId, requirementId, User.GetUserId(), User.GetAppRole(), dto);
        return Ok(result);
    }

    [HttpDelete("{requirementId:guid}")]
    public async Task<IActionResult> Delete(Guid positionId, Guid requirementId)
    {
        await _requirementService.DeleteAsync(positionId, requirementId, User.GetUserId(), User.GetAppRole());
        return NoContent();
    }
}