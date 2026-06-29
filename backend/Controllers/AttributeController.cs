using backend.Dtos;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttributeController(IAttributeService attributeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AttributeListDto>>> GetAll()
    {
        var attributes = await attributeService.GetAllAttributeAsync();
        return Ok(attributes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AttributeDto>> GetById(Guid id)
    {
        var attribute = await attributeService.GetByIdAsync(id);
        return Ok(attribute);
    }

    [HttpPost]
    public async Task<ActionResult<AttributeDto>> Create(CreateAttributeDto dto)
    {
        var attribute = await attributeService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = attribute.Id },
            attribute);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AttributeDto>> Update(Guid id,UpdateAttributeDto dto)
    {
 
        var attribute = await attributeService.UpdateAsync(dto,id);
        return Ok(attribute);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await attributeService.DeleteAttribute(id);
        return NoContent();
    }
}