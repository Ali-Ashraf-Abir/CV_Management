using backend.Dtos;
using backend.Enums;
using backend.Extensions;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PositionController(IPositionService _positionService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<List<PositionSummaryDto>>> GetAll(
        [FromQuery] PositionStatus? status)
    {
        var userId = User.GetUserId();
        var role = Enum.Parse<Roles>(User.GetRole());

        var positions = await _positionService.AllPositionsAsync(userId, role, status);

        return Ok(positions);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PositionDto>> GetById(Guid id)
    {
        var position = await _positionService.PositionByIdAsync(id);

        return Ok(position);
    }
    [HttpGet("me")]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<List<PositionSummaryDto>>> GetMyPositions([FromQuery] PositionStatus? status)
    {
        var userId = User.GetUserId();
        var positions = await _positionService.MyPositionsAsync(userId, status);
        return Ok(positions);
    }


    [HttpPost]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<PositionDto>> Create(CreatePositionDto dto)
    {
        var userId = User.GetUserId();

        var position = await _positionService.CreatePositionAsync(dto, userId);

        return CreatedAtAction(nameof(GetById), new { id = position.Id }, position);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<PositionDto>> Update(
        Guid id,
        UpdatePositionDto dto)
    {
        var userId = User.GetUserId();
        var role = User.GetAppRole();
        var position = await _positionService.UpdatePositionAsnyac(dto, id, userId, role);

        return Ok(position);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var role = User.GetAppRole();
        await _positionService.DeletePositionAsync(id,userId,role);

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<PositionDto>> ChangeStatus(
        Guid id,
        [FromBody] ChangePositionStatusDto dto)
    {
        var userId = User.GetUserId();
        var role = Enum.Parse<Roles>(User.GetRole());

        var position = await _positionService.ChangeStatusAsync(
            id,
            userId,
            role,
            dto.Status);

        return Ok(position);
    }
}