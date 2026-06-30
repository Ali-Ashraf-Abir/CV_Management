using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/attribute/{attributeId:guid}/values")]
public class AttributeValueController(IAttributeValueService attributeValueService) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<AttributeValueDto>>> GetAll(Guid attributeId)
    {
        var values = await attributeValueService.GetAllAttributesValueByAttributeIdAsync(attributeId);
        return Ok(values);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<AttributeValueDto>> GetById(Guid id)
    {
        var value = await attributeValueService.GetAttributeValueByIdAsync(id);
        return Ok(value);
    }

    [HttpPost]
    [Authorize]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<AttributeValueDto>> Create(
        Guid attributeId,
        CreateAttributeValueDto dto)
    {
        dto.AttributeId = attributeId;

        var value = await attributeValueService.CreateAttributeValueAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { attributeId, id = value.Id },
            value);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<AttributeValueDto>> Update(
        Guid attributeId,
        Guid id,
        UpdateAttributeValueDto dto)
    {
        var value = await attributeValueService.UpdateAttributeValueAsync(dto, id);
        return Ok(value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid attributeId, Guid id)
    {
        await attributeValueService.DeleteAttributeValueAsync(id);
        return NoContent();
    }
}