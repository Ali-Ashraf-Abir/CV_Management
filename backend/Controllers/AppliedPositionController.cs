namespace backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos;
using backend.Extensions;
using backend.Services.Interfaces;

[ApiController]
[Route("api/applications")]
[Authorize]
public class ApplicationsController(IApplicationService _applicationService) : ControllerBase
{
    // POST api/applications
    [HttpPost]
    public async Task<IActionResult> Apply([FromBody] ApplyToPositionDto dto)
    {
        var userId = User.GetUserId();
        var result = await _applicationService.ApplyAsync(userId, dto.PositionId);
        return Ok(result);
    }

    // GET api/applications/mine
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = User.GetUserId();
        var result = await _applicationService.GetMyApplicationsAsync(userId);
        return Ok(result);
    }

    // GET api/applications/position/{positionId}
    // Recruiter viewing applicants for a position they own
    [HttpGet("position/{positionId:guid}")]
    public async Task<IActionResult> GetApplicants(Guid positionId)
    {
        var recruiterId = User.GetUserId();
        var result = await _applicationService.GetApplicantsAsync(positionId, recruiterId);
        return Ok(result);
    }

    // PATCH api/applications/{applicationId}/status
    [HttpPatch("{applicationId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid applicationId, [FromBody] UpdateApplicationStatusDto dto)
    {
        var recruiterId = User.GetUserId();
        var result = await _applicationService.UpdateStatusAsync(applicationId, recruiterId, dto.Status);
        return Ok(result);
    }

    // GET api/applications/{applicationId}/cv
    // Recruiter viewing a specific applicant's CV — only reachable for their own positions
    [HttpGet("{applicationId:guid}/cv")]
    public async Task<IActionResult> GetApplicantCv(Guid applicationId)
    {
        var recruiterId = User.GetUserId();
        var result = await _applicationService.GetApplicantCvAsync(applicationId, recruiterId);
        return Ok(result);
    }
}