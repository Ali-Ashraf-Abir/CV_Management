using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttributeController(IAttributeService attributeService) : ControllerBase
{
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<AttributeListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var attributes = await attributeService.GetAllAttributeAsync(search, category, page, pageSize);
        return Ok(attributes);
    }

    [Authorize]
    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetCategories()
    {
        var categories = await attributeService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AttributeDto>> GetById(Guid id)
    {
        var attribute = await attributeService.GetByIdAsync(id);
        return Ok(attribute);
    }

    [HttpPost]
    [Authorize]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<AttributeDto>> Create(CreateAttributeDto dto)
    {
        var attribute = await attributeService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = attribute.Id },
            attribute);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<ActionResult<AttributeDto>> Update(Guid id, UpdateAttributeDto dto)
    {
        var attribute = await attributeService.UpdateAsync(dto, id);
        return Ok(attribute);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await attributeService.DeleteAttribute(id);
        return NoContent();
    }

    [HttpDelete]
    [Authorize]
    [Authorize(Roles = "Recruiter,Administrator")]
    public async Task<IActionResult> DeleteMany([FromBody] List<Guid> ids)
    {
        await attributeService.DeleteAttributes(ids);
        return NoContent();
    }
}